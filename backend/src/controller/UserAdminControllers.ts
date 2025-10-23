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

  public async createUserfuunc1(
    username: string,
    password: string,
    roleid: number
  ) {
    const obj = await this.userEntity.createUserfunc2(username, password, roleid)
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
}


