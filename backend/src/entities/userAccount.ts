import { usersTable } from "../db/schema/aiodb";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "../index";

export class UserEntity {
  public async createUserfunc2(
    username: string,
    password: string,
    roleid: number
  ): Promise<boolean>  {
    try {
      await db.insert(usersTable).values({
        username: username,
        password: password,
        roleid: roleid,
      });
      return true
    } catch (err) {
      console.error(err)
      return true;
    }
  }
}

// export default class UserAccount {
//   // login method
//   async login(username: string, password: string) {
//     try {
//       const [retrievedUser] = await db
//         .select()
//         .from(usersTable)
//         .where(and(eq(usersTable.username, username), eq(usersTable.password, password)))
//         .limit(1);

//       if (!retrievedUser) { // User account not found
//         return null;
//       }

//       if (retrievedUser.isSuspended) { // Account is suspended
//         return null;
//       }
//       return {
//         id: retrievedUser.id,
//         username: retrievedUser.username,
//         roleid: retrievedUser.roleid
//       } ;
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error("Login error: ", err.message);
//       } else {
//         console.error("Login error: ", err);
//       }
//       return null;
//     }
//   }
// }


