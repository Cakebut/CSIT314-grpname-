

import { UserEntity } from '../src/entities/userAccount';
import z, { infer } from 'zod';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const userAccountDataSchema = z.object({
    id: z.number(),
    username: z.string(),
    userProfile: z.string(),
    isSuspended: z.boolean(),
});

describe('User Admin Password Approval', () => {
    const userEntity = new UserEntity();
    let userId: number;
    let adminId: number;
    const username = 'Bob';
    const oldPassword = 'password';
    const newPassword = 'newpass456';
    const adminUsername = 'AdminUserTest';
    const adminPassword = 'adminpass123';
    const adminNote = 'Approved for test';
    let requestId: number;

    beforeAll(async () => {
        // Clean up if users exist
        const existing = await userEntity.getUserByUsername(username);
        if (existing) {
            await userEntity.deleteUser(existing.id);
        }
        const existingAdmin = await userEntity.getUserByUsername(adminUsername);
        if (existingAdmin) {
            await userEntity.deleteUser(existingAdmin.id);
        }
        // Create normal user
        await userEntity.createUserFunc(username, oldPassword, 2); // roleid 2: normal user
        const user = await userEntity.getUserByUsername(username);
        userId = user!.id;
        // Create admin user
        await userEntity.createUserFunc(adminUsername, adminPassword, 1); // roleid 1: admin
        const admin = await userEntity.getUserByUsername(adminUsername);
        adminId = admin!.id;
    });

    afterAll(async () => {
        // Clean up users
        await userEntity.deleteUser(userId);
        await userEntity.deleteUser(adminId);
    });

    it('should approve password reset and allow login with new password', async () => {
        // User submits password reset request
        const req = await userEntity.submitPasswordResetRequest(userId, username, newPassword);
        expect(req).toBeTruthy();
        if (!req) throw new Error('Password reset request failed');
        requestId = req.id;

        // Admin approves the request
        const approved = await userEntity.approvePasswordResetRequest(requestId, adminId, adminUsername, adminNote);
        expect(approved).toBe(true);

        // User can log in with new password
        const loginResult = await userEntity.login(username, newPassword);
        expect(loginResult).toBeTruthy();
        expect((loginResult as any).username).toBe(username);
    });
});
