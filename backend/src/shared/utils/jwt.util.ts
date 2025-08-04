import jwt from "jsonwebtoken";

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};
