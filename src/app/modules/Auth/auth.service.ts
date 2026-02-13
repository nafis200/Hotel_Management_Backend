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

  const resetPassToken = jwtHelpers.generateToken(
    { email: result.email, role: result.role },
    config.jwt.register_verify_token as Secret,
    config.jwt.refresh_token_expires_in as string,
  );

  const resetPassLink =
    config.registration_link + `?email=${result.email}&token=${resetPassToken}`;


  await emailSender(
    result.email,
    `
       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fafafa;">
    <p style="font-size: 16px;">Dear User,</p>

    <p style="font-size: 16px;">
        Please verify your registration by clicking the button below:
    </p>

    <p style="text-align: center; margin: 30px 0;">
        <a href="${resetPassLink}" style="text-decoration: none;">
            <button style="
                background-color: #4f46e5;
                color: #fff;
                padding: 12px 25px;
                font-size: 16px;
                font-weight: bold;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            ">
                Verify Email
            </button>
        </a>
    </p>

    <p style="font-size: 14px; color: #666;">
        If you did not request this, please ignore this email.
    </p>

    <p style="font-size: 14px; color: #666;">
        Thanks,<br>
        The Team
    </p>
   </div>
`,
    "Verify email for websites",
  );

  return result;
};

const verifyEmailService = async (token: string) => {
  const payload = jwtHelpers.verifyToken(
    token,
    process.env.REGISTER_VERIFY_TOKEN as Secret,
  );

  if (!payload) {
    throw new ApiError(httpStatus.FORBIDDEN, "Token is invalid!");
  }

  console.log(payload, "verified payload");

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.verified) {
    return { alreadyVerified: true, user };
  }

  const result = await prisma.user.update({
    where: { email: payload.email },
    data: { verified: true },
  });

  const userTokens = createUserTokens(payload);

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: result,
  };
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

  if (isUserExist.verified === false) {
    throw new ApiError(httpStatus.FORBIDDEN, "Verify your email");
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

  const resetPassLink =
    config.reset_pass_link + `?email=${userData.email}&token=${resetPassToken}`;

  //console.log(resetPassToken)

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
    "reset password link",
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

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const getSingleUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

const deleteUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return deletedUser;
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
  ChangePassword,
  forgotPassword,
  registerUser,
  verifyEmailService,
  getAllUsers,
  getSingleUser,
  deleteUser,
};
