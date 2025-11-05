import { UserEntity } from "../entities/userAccount";
import { db } from "../db/client";
import { useraccountTable } from "../db/schema/aiodb";
import { eq } from "drizzle-orm";

export class ViewUserAccountController {
    private userAccount : UserEntity;

    constructor() {
        this.userAccount = new UserEntity();
    }

    public async getAllUserAccounts() {
    return await this.userAccount.getAllUserAccounts();
  }
  }

export class UpdateUserController {
  private userEntity = new UserEntity()
  public async updateUserInfo(id: number, username: string, roleid: number, issuspended: boolean, actor: string) {
    // Get current user info to compare suspension status
    const users = await this.userEntity.getAllUserAccounts();
    const user = users.find(u => u.id === id);
    const prevSuspended = user ? user.isSuspended : undefined;
    const result = await this.userEntity.updateUser(id, username, roleid, issuspended);
    return result;
  }
  public async deleteUserById(id: number, actor: string) {
    // Get username for logging
    const users = await this.userEntity.getAllUserAccounts();
    const user = users.find(u => u.id === id);
    const username = user ? user.username : `id:${id}`;
    const result = await this.userEntity.deleteUser(id);
    return result;
  }
}



//Create Accounts
export class CreateUserController {
  private userEntity = new UserEntity()

  public async createUserFunc(
    username: string,
    password: string,
    roleid: number,
    actor: string
  ) {
    const result = await this.userEntity.createUserFunc(username, password, roleid);
    return result;
  }

 
}


// ROLES
export class RoleController {
  private roleEntity = new UserEntity();

  async createRole(label: string, actor: string) {
    const result = await this.roleEntity.createRole(label);
    return result;
  }

  async deleteRole(id: number, actor: string) {
    // Get role label for logging
    const roles = await this.roleEntity.searchRoles("");
    const role = roles.find(r => r.id === id);
    const roleLabel = role ? role.label : `id:${id}`;
    const result = await this.roleEntity.deleteRole(id);
    return result;
  }

  async setRoleSuspended(id: number, issuspended: boolean, actor: string) {
    const result = await this.roleEntity.setRoleSuspended(id, issuspended);
    if (result) {
      // Get role label for logging
      const roles = await this.roleEntity.searchRoles("");
      const role = roles.find(r => r.id === id);
      const roleLabel = role ? role.label : `id:${id}`;
    }
    return result;
  }

  // Search roles by label
  async searchRoles(keyword: string) {
    return await this.roleEntity.searchRoles(keyword);
  }
}
//Search User Controller

export class SearchUserController {
  private userAccount = new UserEntity();

  public async searchUsers(keyword: string) {
    return await this.userAccount.searchUsers(keyword);
  }

  public async searchAndFilterUsers(params: { keyword?: string, role?: string, status?: string }) {
    return await this.userAccount.searchAndFilterUsers(params);
  }
}



// Export user accounts as CSV
export class ExportUserAccountController {
  private userAccount = new UserEntity();
  public async exportUserAccountsCSV() {
    return await this.userAccount.exportUserAccountsCSV();
  }
}

// Password Reset Request Controller
export class PasswordResetRequestController {
  private userEntity = new UserEntity();

  // User submits a password reset request (accepts username)
  public async submitPasswordResetRequest(username: string, newPassword: string) {
    // Look up userId from username
    const user = await db.select().from(useraccountTable).where(eq(useraccountTable.username, username)).limit(1);
    if (!user || user.length === 0) {
      return { success: false, status: 404, error: "User not found" };
    }
    const userId = user[0].id;
    const request = await this.userEntity.createPasswordResetRequest(userId, username, newPassword);
    if (request) {
      return { success: true, status: 200, request };
    } else {
      return { success: false, status: 500, error: "Failed to submit request" };
    }
  }

  // Admin fetches all password reset requests (optionally filter by status)
  public async getPasswordResetRequests(status?: string) {
    return await this.userEntity.getPasswordResetRequests(status);
  }

  // Admin approves a password reset request
  public async approvePasswordResetRequest(requestId: number, adminId: number,  adminName: string, note: string) {
    return await this.userEntity.approvePasswordResetRequest(requestId, adminId, adminName, note);
  }

  // Admin rejects a password reset request
  public async rejectPasswordResetRequest(requestId: number, adminId: number,  adminName: string, note: string) {
    return await this.userEntity.rejectPasswordResetRequest(requestId, adminId, adminName, note);
  }
}

