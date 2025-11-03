// User Entity Class
import { useraccountTable, roleTable } from "../db/schema/aiodb";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, ilike, is } from "drizzle-orm";
import { db } from "../index";
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
      console.error(err)
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
  async exportUserAccountsCSV(actor: string): Promise<string> {
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
  // Log the export activity
  try {
    const { createAuditLog } = require('./auditLog');
    await createAuditLog({
      actor,
      action: 'export user data',
      target: actor,
      details: `Exported ${users.length} user accounts as CSV.`
    });
  } catch (err) {
    // Logging failure should not block export
    console.error('Audit log failed for exportUserAccountsCSV:', err);
  }
  const csv = [headers.join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
  return csv;
}
}

