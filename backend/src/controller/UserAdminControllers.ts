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