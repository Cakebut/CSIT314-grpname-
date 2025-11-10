import { UserEntity } from '../src/entities/userAccount';
import { PinRequestEntity } from '../src/entities/personInNeedrequests';
import { db } from '../src/db/client';
import { service_typeTable } from '../src/db/schema/aiodb';
import { PersonInNeedControllers } from '../src/controller/PersonInNeedControllers';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { eq } from 'drizzle-orm';

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

describe('PIN - Requests history download', () => {
  const userEntity = new UserEntity();
  const controller = new PersonInNeedControllers();
  let pinId: number;
  let serviceTypeId: number;
  let createdRequestId: number | null = null;

  beforeAll(async () => {
    // create a PIN user
    const username = `pin_history_${randomSuffix()}`;
    await userEntity.createUserFunc(username, 'testpass', 2);
    const u = await userEntity.getUserByUsername(username);
    if (!u) throw new Error('Failed to create PIN user for tests');
    pinId = u.id;

    // create a service type to satisfy FK
    const [stype] = await db.insert(service_typeTable).values({ name: `TestService_${randomSuffix()}` }).returning();
    serviceTypeId = stype.id;
  });

  afterAll(async () => {
    // cleanup: delete created request (if exists), delete pin user and service type
    if (createdRequestId) {
      try { await PinRequestEntity.deleteRequest(createdRequestId); } catch (e) { /* ignore */ }
    }
    try { await db.delete(service_typeTable).where(eq(service_typeTable.id, serviceTypeId)); } catch (e) { /* ignore */ }
    try { await userEntity.deleteUser(pinId); } catch (e) { /* ignore */ }
  });

  it('returns empty string when PIN has no history', async () => {
    const csv = await controller.getRequestsHistoryCSVByPinId(pinId);
    expect(csv).toBe('');
  });

  it('returns CSV with headers and rows when PIN has past requests', async () => {
    // create a request
    const created = await PinRequestEntity.createRequest({
      pin_id: pinId,
      title: 'Test history request',
      categoryID: serviceTypeId,
      message: 'please help',
    });
    createdRequestId = created.id;

    const csv = await controller.getRequestsHistoryCSVByPinId(pinId);
    expect(typeof csv).toBe('string');
    expect(csv.length).toBeGreaterThan(0);
    // expect header line and at least one data line
    const lines = csv.split('\n');
    expect(lines[0].toLowerCase()).toContain('id');
    expect(lines.length).toBeGreaterThan(1);
    // the title should appear somewhere in the CSV
    expect(csv).toContain('Test history request');
  });
});
