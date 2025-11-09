import { PlatformManagerController } from '../src/controller/PlatformManagerControllers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { describe, it, expect, beforeAll } from '@jest/globals';

import { db } from '../src/db/client';
 

// Mock or setup a test database connection
const testDb: NodePgDatabase = db as NodePgDatabase; // Replace with your test DB setup

describe('Platform Manager Announcements', () => {
  let ctrl: PlatformManagerController;
  beforeAll(() => {
    ctrl = new PlatformManagerController(testDb);
  });

  it('should send an announcement to all users', async () => {
    const message = 'System maintenance at midnight.';
    const result = await ctrl.sendAnnouncementToAllUsers({ message });
    expect(result).toHaveProperty('deliveredCount');
    expect(typeof result.deliveredCount).toBe('number');
    expect(result.deliveredCount).toBeGreaterThanOrEqual(0);

    // Check latest announcement snapshot
    const latest = ctrl.getLatestAnnouncementSnapshot();
    expect(latest).toBeTruthy();
    expect(latest?.message).toBe(message);
    expect(typeof latest?.createdAt).toBe('string');
  });

  it('should throw error for empty message', async () => {
    await expect(ctrl.sendAnnouncementToAllUsers({ message: '' })).rejects.toThrow('Message cannot be empty');
  });
});
