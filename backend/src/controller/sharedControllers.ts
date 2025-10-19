import { UserEntity } from "../entities/userAccount";

// export class LoginController {
//   async login(username: string, password: string) {
//     const userAccount = new UserAccount();
//     const user = await userAccount.login(username, password);

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     return res.status(200).json({ user });
//   }
// }
// export const loginController = new LoginController();

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

  public async getAllUsers() {
    return await this.userEntity.getAllUsers();
  }
}