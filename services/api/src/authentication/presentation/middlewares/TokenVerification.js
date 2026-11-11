
export function authenticateToken(tokenService) {
  return (req, res, next) => {
    try {
      // Extract token from Authorization header.
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Access token is required.",
        });
      }

      const token = authHeader.split(" ")[1];

      // Verify access token.
      const decodedToken = tokenService.verifyAccessToken(token);

      // Attach decoded payload to request.
      req.user = decodedToken;

      // Continue to the next middleware/controller.
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }
  };
}
