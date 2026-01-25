/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import ApiError from "../../errors/ApiError";

/**
 * 🔥 Fake in-memory user store (NO DATABASE)
 */
interface IUser {
  id: string;
  email: string;
  password: string;
  role: string;
}

const users: IUser[] = [
  {
    id: "1",
    email: "test@example.com",
    password: bcryptjs.hashSync("123456", 10),
    role: "user",
  },
  {
    id: "2",
    email: "admin@example.com",
    password: bcryptjs.hashSync("admin123", 10),
    role: "admin",
  },
];

/**
 * =====================
 * LOGIN
 * =====================
 */
const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = users.find((u) => u.email === email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password
  );

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  const userTokens = createUserTokens(isUserExist);

  // remove password before sending
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...rest } = isUserExist;

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

/**
 * =====================
 * REFRESH TOKEN
 * =====================
 */
const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

/**
 * =====================
 * RESET PASSWORD
 * =====================
 */
const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = users.find((u) => u.id === decodedToken.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user.password
  );

  if (!isOldPasswordMatch) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Old Password does not match"
    );
  }

  user.password = await bcryptjs.hash(
    newPassword,
    Number("10")
  );

  return {
    message: "Password reset successful",
  };
};

/**
 * =====================
 * EXPORT
 * =====================
 */
export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
