import jwt from "jsonwebtoken";

export class TokenService {

  constructor() {
    this.secret = process.env.JWT_SECRET;

    if (!this.secret) {
      throw new Error("JWT_SECRET is not configured");
    }
  }

  generateAccessToken(payload) {
    return jwt.sign(
      payload,
      this.secret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        issuer: "omnilend-api",
        audience: "omnilend",
      }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(
      token,
      this.secret,
      {
        issuer: "omnilend-api",
        audience: "omnilend",
      }
    );
  }
}