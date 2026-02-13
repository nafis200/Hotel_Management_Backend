/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";

import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import ApiError from "../../errors/ApiError";
import config from "../../config";
import prisma from "../../../shared/prisma";
import { UserStatus } from "@prisma/client";
import { jwtHelpers } from "../../helper/jwtHelper";
import emailSender from "./emailSender";
import * as bcrypt from "bcrypt";

interface IUser {
  id: string;
  email: string;
  password: string;
  role: string;
}

const users: IUser[] = [
  {
    id: "1",
    email: "test@gmail.com",
    password: bcryptjs.hashSync("123456", 10),
    role: "user",
  },
  {
    id: "2",
    email: "admin@gmail.com",
    password: bcryptjs.hashSync("123456", 10),
    role: "admin",
  },
];

interface RegisterUserInput {
  name?: string;
  email: string;
  password: string;
}

const registerUser = async (payload: RegisterUserInput) => {
  const { name, email, password } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExist) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      verified: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return result;
};

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  if (isUserExist.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (isUserExist.status === "DELETED") {
    throw new ApiError(httpStatus.FORBIDDEN, "User is deleted");
  }

  const isPasswordMatched = await bcrypt.compare(
    password as string,
    isUserExist.password,
  );

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  const userTokens = createUserTokens(isUserExist);

  const { password: pass, ...rest } = isUserExist;

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const ChangePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const userId = decodedToken.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (user.status === "DELETED") {
    throw new ApiError(httpStatus.FORBIDDEN, "User is deleted");
  }

  const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return {
    message: "Password reset successful",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string,
  );
  //console.log(resetPassToken)

  const resetPassLink =
    config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  await emailSender(
    userData.email,
    `
        <div>
            <p>Dear User,</p>
            <p>Your password reset link 
                <a href=${resetPassLink}>
                    <button>
                        Reset Password
                    </button>
                </a>
            </p>

        </div>
        `,
  );
  //console.log(resetPassLink)
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string },
) => {
  console.log({ token, payload });

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret,
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: {
      email: payload.id,
    },
    data: {
      password,
    },
  });
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
  ChangePassword,
  forgotPassword,
  registerUser,
};
