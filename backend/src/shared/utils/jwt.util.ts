/**
 * Filename: jwt.util.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-04
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-26
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import jwt from "jsonwebtoken";

// [AI-GENERATED: Claude, 2025-08-04]
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};
