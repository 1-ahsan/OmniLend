export class AuthController {

  constructor(loginUser) {
    this.loginUser = loginUser;
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const result = await this.loginUser.execute({
        email,
        password,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });

    } catch (error) {

      if (
        error.message === "INVALID_CREDENTIALS"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      next(error);
    }
  };
}