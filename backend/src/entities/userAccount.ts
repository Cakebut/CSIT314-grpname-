// User Entity Class
import { useraccountTable, roleTable, passwordResetRequestsTable, auditLogTable } from "../db/schema/aiodb";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, ilike, is } from "drizzle-orm";
import { db } from "../db/client";
import { useraccountData } from "../shared/dataClasses";
 

export class UserEntity {
   

 

// LOGIN FUNCTION
public async login(
    username: string,
    password: string
  ): Promise<useraccountData | "suspended" | null> {
    try {
      const [retrievedUser] = await db
      .select({
        id: useraccountTable.id,
        username: useraccountTable.username,
        rolelabel: roleTable.label,
        password: useraccountTable.password,
        issuspended: useraccountTable.issuspended
      }).from(useraccountTable)
      .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
      .where(and(eq(useraccountTable.username, username), eq(useraccountTable.password, password)))
      .limit(1);

      if (!retrievedUser) { // User account not found
        return null;
      }
      if(retrievedUser.issuspended) { // Account is suspended
        return 'suspended' as any;
      }
      return{
        id:retrievedUser.id,
        username:retrievedUser.username,
        userProfile: retrievedUser.rolelabel ?? "",
        isSuspended:retrievedUser.issuspended
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Login error: ", err.message);
      } else {
        console.error("Login error: ", err);
      }
      return null;
    }

  }



//Create User Account
public async createUserFunc(
    username: string,
    password: string,
    roleid: number
  ): Promise<boolean>  {
    try {
      await db.insert(useraccountTable).values({
        username: username,
        password: password,
        roleid: roleid,
      });
      return true
    } catch (err) {
      console.error("ERROR HELP")
      return false;
    }
  }

  //Get all user accounts
public async getAllUserAccounts(): Promise<useraccountData[]> {
  try{
    const users = await db
    .select({
      id: useraccountTable.id,
      username: useraccountTable.username,
      userProfile: roleTable.label,
      isSuspended: useraccountTable.issuspended
    })
    .from(useraccountTable)
    .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id));
    return users.map(user => ({
      id: user.id,
      username: user.username,
      userProfile: user.userProfile ?? "",
      isSuspended: user.isSuspended
    }as useraccountData));
  }
  catch(err) {
    console.error(err);
    return [];
  }
}

  // Get a single user by username
  public async getUserByUsername(username: string): Promise<{ id: number; username: string } | null> {
    try {
      const [user] = await db
        .select({ id: useraccountTable.id, username: useraccountTable.username })
        .from(useraccountTable)
        .where(eq(useraccountTable.username, username))
        .limit(1);
      return user ?? null;
    } catch (err) {
      console.error('getUserByUsername error:', err);
      return null;
    }
  }



// Update user info by id
public async updateUser(
  id: number,
  username: string,
  roleid: number,
  issuspended: boolean
): Promise<boolean> {
  try {
    await db.update(useraccountTable)
      .set({ username, roleid, issuspended })
      .where(eq(useraccountTable.id, id));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}


// Delete user by id
public async deleteUser(id: number): Promise<boolean> {
  try {
    const result = await db.delete(useraccountTable).where(eq(useraccountTable.id, id));
  return (result.rowCount ?? 0) > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}


  async createRole(label: string): Promise<boolean> {
    try {
      await db.insert(roleTable).values({ label });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    try {
      const result = await db.delete(roleTable).where(eq(roleTable.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async setRoleSuspended(id: number, issuspended: boolean): Promise<boolean> {
    try {
      await db.update(roleTable).set({ issuspended }).where(eq(roleTable.id, id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // Search roles by label (case-insensitive, partial match)
  async searchRoles(keyword: string): Promise<{ id: number, label: string, issuspended: boolean }[]> {
    try {
      const roles = await db
        .select({ id: roleTable.id, label: roleTable.label, issuspended: roleTable.issuspended })
        .from(roleTable)
        .where(ilike(roleTable.label, `%${keyword}%`));
      return roles;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Search users by username (case-insensitive, partial match)
  async searchUsers(keyword: string): Promise<{ id: number, username: string, userProfile: string, isSuspended: boolean }[]> {
    try {
      const users = await db
        .select({
          id: useraccountTable.id,
          username: useraccountTable.username,
          userProfile: roleTable.label,
          isSuspended: useraccountTable.issuspended
        })
        .from(useraccountTable)
        .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
        .where(ilike(useraccountTable.username, `%${keyword}%`));
      return users.map(user => ({
        id: user.id,
        username: user.username,
        userProfile: user.userProfile ?? "",
        isSuspended: user.isSuspended
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Search and filter users by username, role, and status
  async searchAndFilterUsers({ keyword = '', role = '', status = '' }: { keyword?: string, role?: string, status?: string }): Promise<{ id: number, username: string, userProfile: string, isSuspended: boolean }[]> {
    try {
      let query = db
        .select({
          id: useraccountTable.id,
          username: useraccountTable.username,
          userProfile: roleTable.label,
          isSuspended: useraccountTable.issuspended
        })
        .from(useraccountTable)
        .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id));

      const conditions = [];
      if (keyword) {
        conditions.push(ilike(useraccountTable.username, `%${keyword}%`));
      }
      if (role) {
        conditions.push(ilike(roleTable.label, `%${role}%`));
      }
      if (status) {
        if (status === 'Active') conditions.push(eq(useraccountTable.issuspended, false));
        if (status === 'Suspended') conditions.push(eq(useraccountTable.issuspended, true));
      }
      if (conditions.length > 0) {
        // @ts-ignore
        query = query.where(and(...conditions));
      }
      const users = await query;
      return users.map(user => ({
        id: user.id,
        username: user.username,
        userProfile: user.userProfile ?? "",
        isSuspended: user.isSuspended
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Export all user accounts as CSV
  async exportUserAccountsCSV(): Promise<string> {
    const users = await new UserEntity().getAllUserAccounts();
    const headers = ['ID', 'Username', 'Role', 'Status'];
    function escapeCsv(val: any) {
      if (val == null) return '';
      const str = String(val);
      const needsQuotes = /[",\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    }
    const rows = users.map(u => [
      u.id,
      u.username,
      u.userProfile,
      u.isSuspended ? 'Suspended' : 'Active'
    ]);
    const csvData = [headers.join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
    return csvData;
}



//==================================================
// Password Reset Request Entity Methods
  // Create a new password reset request
  async submitPasswordResetRequest(userId: number, username: string, newPassword: string) {
    try {
      const [request] = await db.insert(passwordResetRequestsTable).values({
        user_id: userId,
        username: username, // Store username in table
        new_password: newPassword, // Store as plain text for now
        status: "Pending",
        requested_at: new Date(),
      }).returning();
      return request;
    } catch (err) {
      console.error("Create password reset request error:", err);
      return null;
    }
  }

  // Fetch all password reset requests (for admin dashboard)
  async getPasswordResetRequests(status?: string) {
    try {
      let requests;
      if (status) {
        requests = await db
          .select({
            id: passwordResetRequestsTable.id,
            user_id: passwordResetRequestsTable.user_id,
            username: passwordResetRequestsTable.username,
            new_password: passwordResetRequestsTable.new_password,
            status: passwordResetRequestsTable.status,
            requested_at: passwordResetRequestsTable.requested_at,
            reviewed_at: passwordResetRequestsTable.reviewed_at,
            reviewed_by: passwordResetRequestsTable.reviewed_by,
            admin_note: passwordResetRequestsTable.admin_note,
            user_role: roleTable.label,
            account_status: useraccountTable.issuspended,
            admin_name: passwordResetRequestsTable.admin_name,
          
          })
          .from(passwordResetRequestsTable)
          .leftJoin(useraccountTable, eq(passwordResetRequestsTable.user_id, useraccountTable.id))
          .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
          .where(eq(passwordResetRequestsTable.status, status));
      } else {
        requests = await db
          .select({
            id: passwordResetRequestsTable.id,
            user_id: passwordResetRequestsTable.user_id,
            username: passwordResetRequestsTable.username,
            new_password: passwordResetRequestsTable.new_password,
            status: passwordResetRequestsTable.status,
            requested_at: passwordResetRequestsTable.requested_at,
            reviewed_at: passwordResetRequestsTable.reviewed_at,
            reviewed_by: passwordResetRequestsTable.reviewed_by,
            admin_note: passwordResetRequestsTable.admin_note,
            user_role: roleTable.label,
            account_status: useraccountTable.issuspended,
            admin_name: passwordResetRequestsTable.admin_name,
          })
          .from(passwordResetRequestsTable)
          .leftJoin(useraccountTable, eq(passwordResetRequestsTable.user_id, useraccountTable.id))
          .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id));
      }
      // Map account_status to 'Active'/'Suspended' for frontend clarity
      return requests.map(r => ({
        ...r,
        account_status: r.account_status ? 'Suspended' : 'Active',
        user_role: r.user_role || '',
      }));
    } catch (err) {
      console.error("Fetch password reset requests error:", err);
      return [];
    }
  }

  // Approve a password reset request
  async approvePasswordResetRequest(requestId: number, adminId: number, adminName: string, note: string) {
    try {
      // 1. Get the request
      const [request] = await db.select().from(passwordResetRequestsTable).where(eq(passwordResetRequestsTable.id, requestId)).limit(1);
      if (!request || request.status !== "Pending") return false;
      // 2. Update user's password
      await db.update(useraccountTable)
        .set({ password: request.new_password })
        .where(eq(useraccountTable.id, request.user_id));
      // 3. Update request status
      await db.update(passwordResetRequestsTable)
        .set({ status: "Approved", reviewed_at: new Date(), reviewed_by: adminId, admin_name: adminName, admin_note: note })
        .where(eq(passwordResetRequestsTable.id, requestId));
      // 4. Log to audit table
      await db.insert(auditLogTable).values({
        actor: adminName,
        action: "Approve Password Reset",
        target: request.username,
        details: note, //`RequestId:${requestId}, Note:${note}`,
        timestamp: new Date(),
      });
      return true;
    } catch (err) {
      console.error("Approve password reset request error:", err);
      return false;
    }
  }

  // Reject a password reset request
  async rejectPasswordResetRequest(requestId: number, adminId: number, adminName: string, note: string) {
    try {
      await db.update(passwordResetRequestsTable)
        .set({ status: "Rejected", reviewed_at: new Date(), reviewed_by: adminId, admin_note: note, admin_name: adminName })
        .where(eq(passwordResetRequestsTable.id, requestId));
      // Log to audit table
      // Get the request to fetch username
      const [request] = await db.select().from(passwordResetRequestsTable).where(eq(passwordResetRequestsTable.id, requestId)).limit(1);
      await db.insert(auditLogTable).values({
        actor: adminName,
        action: "Reject Password Reset",
        target: request.username,
        details: note, //`RequestId:${requestId}, Note:${note}`,
        timestamp: new Date(),
      });
      return true;
    } catch (err) {
      console.error("Reject password reset request error:", err);
      return false;
    }
  }


  // Clear all password reset requests
  async clearAllPasswordResetRequests(): Promise<boolean> {
    try {
      await db.delete(passwordResetRequestsTable);
      return true;
    } catch (err) {
      console.error("Clear all password reset requests error:", err);
      return false;
    }
  }
}

