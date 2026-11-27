export class IAuthRepository {
  async findByEmail(email) {
    throw new Error("Method findByEmail() must be implemented");
  }

  async updateLastLogin(userId) {
    throw new Error("Method updateLastLogin() must be implemented");
  }
}