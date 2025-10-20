import { is } from "drizzle-orm";
import { UserEntity } from "../entities/userAccount"
import { useraccountData } from "../shared/dataClasses";



export class LoginController{
  private userEntity = new UserEntity()
  public async login(username: string, password: string
  ):Promise<useraccountData |null> {
    return await this.userEntity.login(username, password);
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