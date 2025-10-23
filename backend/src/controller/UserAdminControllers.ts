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