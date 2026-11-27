import bcrypt from "bcrypt";

export class PasswordService {

  async compare(plainPassword, hashedPassword) {
    return await bcrypt.compare(
      plainPassword,
      hashedPassword
    );
  }
}