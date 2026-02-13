/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { AuthServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import ApiError from "../../errors/ApiError";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "User Logged In Successfully",
      data: loginInfo,
    });
  },
);
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No refresh token recieved from cookies",
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string,
    );

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "New Access Token Retrived Successfully",
      data: tokenInfo,
    });
  },
);
const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "User Logged Out Successfully",
      data: null,
    });
  },
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = {
      id: "google_123456",
      email: "test@gmail.com",
      role: "user",
    };

    await AuthServices.resetPassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  },
);
const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }
    const user = req.user;

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
    }

    const tokenInfo = createUserTokens(user);

    setAuthCookie(res, tokenInfo);
    res.redirect(
      "https://www.google.com/search?q=programming+hero+level+2&rlz=1C1BNSD_enBD1125BD1126&sourceid=chrome&ie=UTF-8",
    );
  },
);

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  googleCallbackController,
};
