import { UserEntity } from "../entities/userAccount";
import { AuditLogController } from "./AuditLogController";
const auditLogController = new AuditLogController();

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
    if (result) {
      let action = "update user";
      if (typeof prevSuspended === "boolean" && prevSuspended !== issuspended) {
        action = issuspended ? "suspend user" : "activate user";
      }
      await auditLogController.createAuditLog(
        actor,
        action,
        username,
        `roleid: ${roleid}, issuspended: ${issuspended}`
      );
    }
    return result;
  }
  public async deleteUserById(id: number, actor: string) {
    // Get username for logging
    const users = await this.userEntity.getAllUserAccounts();
    const user = users.find(u => u.id === id);
    const username = user ? user.username : `id:${id}`;
    const result = await this.userEntity.deleteUser(id);
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "delete user",
        username,
        `id: ${id}`
      );
    }
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
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "create user",
        username,
        `roleid: ${roleid}`
      );
    }
    return result;
  }

 
}


// ROLES
export class RoleController {
  private roleEntity = new UserEntity();

  async createRole(label: string, actor: string) {
    const result = await this.roleEntity.createRole(label);
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "create role",
        label,
        `Role created.`
      );
    }
    return result;
  }

  async deleteRole(id: number, actor: string) {
    // Get role label for logging
    const roles = await this.roleEntity.searchRoles("");
    const role = roles.find(r => r.id === id);
    const roleLabel = role ? role.label : `id:${id}`;
    const result = await this.roleEntity.deleteRole(id);
    if (result) {
      await auditLogController.createAuditLog(
        actor,
        "delete role",
        roleLabel,
        `Role deleted.`
      );
    }
    return result;
  }

  async setRoleSuspended(id: number, issuspended: boolean, actor: string) {
    const result = await this.roleEntity.setRoleSuspended(id, issuspended);
    if (result) {
      // Get role label for logging
      const roles = await this.roleEntity.searchRoles("");
      const role = roles.find(r => r.id === id);
      const roleLabel = role ? role.label : `id:${id}`;
      await auditLogController.createAuditLog(
        actor,
        issuspended ? "suspend role" : "activate role",
        roleLabel,
        `id: ${id}, issuspended: ${issuspended}`
      );
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
  public async exportUserAccountsCSV(actor: string) {
    return await this.userAccount.exportUserAccountsCSV(actor);
  }
}

