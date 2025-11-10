import { CSRRepEntity } from '../src/entities/CSRRepEntity';
import { PinRequestEntity } from '../src/entities/personInNeedrequests';
import { UserEntity } from '../src/entities/userAccount';
import { db } from '../src/db/client';
import { service_typeTable, csr_shortlistTable } from '../src/db/schema/aiodb';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { eq } from 'drizzle-orm';

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

describe('CSR shortlist feature', () => {
  const csrEntity = new CSRRepEntity();
  const userEntity = new UserEntity();
  let pinId: number;
  let csrId: number;
  let serviceTypeId: number;
  let requestId: number;

  beforeAll(async () => {
    // create PIN user
    const pinName = `pin_short_${randomSuffix()}`;
    await userEntity.createUserFunc(pinName, 'pinpass', 2);
    const pin = await userEntity.getUserByUsername(pinName);
    if (!pin) throw new Error('failed to create pin');
    pinId = pin.id;

    // create CSR user
    const csrName = `csr_short_${randomSuffix()}`;
    await userEntity.createUserFunc(csrName, 'csrpass', 3);
    const csr = await userEntity.getUserByUsername(csrName);
    if (!csr) throw new Error('failed to create csr');
    csrId = csr.id;

    // create service type
    const [stype] = await db.insert(service_typeTable).values({ name: `SType_${randomSuffix()}` }).returning();
    serviceTypeId = stype.id;

    // create a PIN request
    const created = await PinRequestEntity.createRequest({ pin_id: pinId, title: 'Shortlist me', categoryID: serviceTypeId, message: 'Need help' });
    requestId = created.id;
  });

  afterAll(async () => {
    // cleanup: remove shortlist entry, delete request, users, service type
    try { await db.delete(csr_shortlistTable).where(eq(csr_shortlistTable.csr_id, csrId)).execute(); } catch (e) {}
    try { await PinRequestEntity.deleteRequest(requestId); } catch (e) {}
    try { await userEntity.deleteUser(pinId); } catch (e) {}
    try { await userEntity.deleteUser(csrId); } catch (e) {}
    try { await db.delete(service_typeTable).where(eq(service_typeTable.id, serviceTypeId)).execute(); } catch (e) {}
  });

  it('CSR can add a request to shortlist and it appears in their shortlist', async () => {
    // add to shortlist
    const addRes = await CSRRepEntity.addToShortlist(csrId, requestId);
    expect(addRes).toBeTruthy();

    // fetch shortlist and expect the created request to be present
    const shortlist = await CSRRepEntity.getShortlist(csrId);
    const found = shortlist.find((r: any) => r.requestId === requestId && r.title === 'Shortlist me');
    expect(found).toBeDefined();
  });

  it('CSR can remove a request from shortlist', async () => {
    // remove
    await CSRRepEntity.removeFromShortlist(csrId, requestId);
    const shortlist = await CSRRepEntity.getShortlist(csrId);
    const found = shortlist.find((r: any) => r.requestId === requestId);
    expect(found).toBeUndefined();
  });
});
