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


 
