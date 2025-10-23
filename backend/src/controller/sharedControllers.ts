import { is } from "drizzle-orm";
import { UserEntity } from "../entities/userAccount"
import { useraccountData } from "../shared/dataClasses";



export class LoginController{
  private userEntity = new UserEntity()
  public async login(username: string, password: string
  ): Promise<useraccountData | "suspended" | null> {
    return await this.userEntity.login(username, password);
  }
}
export class UpdateUserController {
  private userEntity = new UserEntity()
  public async updateUserInfo(id: number, username: string, roleid: number, issuspended: boolean) {
    return await this.userEntity.updateUser(id, username, roleid, issuspended);
  }
}


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