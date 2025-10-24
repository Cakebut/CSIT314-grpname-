import { UserEntity } from "../entities/userAccount";

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
  public async updateUserInfo(id: number, username: string, roleid: number, issuspended: boolean) {
    return await this.userEntity.updateUser(id, username, roleid, issuspended);
  }
  public async deleteUserById(id: number) {
    return await this.userEntity.deleteUser(id);
  }
}



//Create Accounts
export class CreateUserController {
  private userEntity = new UserEntity()

  public async createUserFunc(
    username: string,
    password: string,
    roleid: number
  ) {
    const obj = await this.userEntity.createUserFunc(username, password, roleid)
    return obj
  }

 
}


// ROLES
export class RoleController {
  private roleEntity = new UserEntity();

  async createRole(label: string) {
    return await this.roleEntity.createRole(label);
  }

  async deleteRole(id: number) {
    return await this.roleEntity.deleteRole(id);
  }

  async setRoleSuspended(id: number, issuspended: boolean) {
    return await this.roleEntity.setRoleSuspended(id, issuspended);
  }

  // Search roles by label
  async searchRoles(keyword: string) {
    return await this.roleEntity.searchRoles(keyword);
  }
}

export class SearchUserController {
  private userAccount = new UserEntity();

  public async searchUsers(keyword: string) {
    return await this.userAccount.searchUsers(keyword);
  }

  public async searchAndFilterUsers(params: { keyword?: string, role?: string, status?: string }) {
    return await this.userAccount.searchAndFilterUsers(params);
  }
}


