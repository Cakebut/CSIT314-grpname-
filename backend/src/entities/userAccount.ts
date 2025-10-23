

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
}

 