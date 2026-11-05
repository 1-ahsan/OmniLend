export class LoginUser {
  constructor({
    authRepository,
    passwordService,
    tokenService,
  }) {
    this.authRepository = authRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {

    // 1. Find user by email
    const user = await this.authRepository.findByEmail(email);

    // 2. Check whether user exists
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 3. Check account status
    if (!user.isActive()) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // 4. Verify password
    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // 5. Generate access token
    const accessToken = this.tokenService.generateAccessToken({
      id: user.id,
      tenantId: user.tenantId,
      accountType: user.accountType,
    });

    // 6. Update last login timestamp
    await this.authRepository.updateLastLogin(user.id);

    // 7. Return authenticated user
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        tenantId: user.tenantId,
        employeeId: user.employeeId,
      },
    };
  }
}