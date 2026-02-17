import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import { generateToken, verifyToken } from "./jwt";
import ApiError from "../errors/ApiError";
import config from "../config";
import prisma from "../../shared/prisma";

/**
 * 🔥 Fake in-memory users (NO DB)
 */
const users = [
  {
    id: "1",
    email: "test@example.com",
    password: "hashed_password_here",
    role: "user",
    isActive: "ACTIVE", // ACTIVE | BLOCKED | INACTIVE
    isDeleted: false,
  },
  {
    id: "2",
    email: "admin@example.com",
    password: "hashed_password_here",
    role: "admin",
    isActive: "ACTIVE",
    isDeleted: false,
  },
];

/**
 * =========================
 * CREATE ACCESS + REFRESH TOKEN
 * =========================
 */
export const createUserTokens = (user: any) => {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as string,
    config.jwt.reset_pass_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};


export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    config.jwt.refresh_token_secret as string
  ) as JwtPayload;

 
  const isUserExist = await prisma.user.findUnique({
    where: { email: verifiedRefreshToken.email },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  if (
    isUserExist.status === "BLOCKED"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.status}`
    );
  }

  if (isUserExist.status === "DELETED") {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is deleted");
  }

  const jwtPayload = {
    userId: isUserExist.id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return accessToken;
};
