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
import { fileUploader } from "../../helper/fileUploader";


const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userInfo = await AuthServices.registerUser(req.body);

    sendResponse(res, {
      success: true,
      status: httpStatus.CREATED,
      message: "User registered successfully",
      data: userInfo,
    });
  }
);



export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, token } = req.query;


    if (!email || !token) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email and token are required");
    }


    const result = await AuthServices.verifyEmailService(token as string);



    setAuthCookie(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    res.redirect("https://www.google.com/search?q=vjudge&oq=&gs_lcrp=EgZjaHJvbWUqCQgEECMYJxjqAjIJCAAQIxgnGOoCMgkIARAjGCcY6gIyCQgCECMYJxjqAjIJCAMQIxgnGOoCMgkIBBAjGCcY6gIyCQgFECMYJxjqAjIJCAYQIxgnGOoCMgkIBxAuGCcY6gLSAQkzNDIyajBqMTWoAgiwAgHxBRYBsPTx72yT8QUWAbD08e9skw&sourceid=chrome&ie=UTF-8");

    // it must be reddireect login
  }
);

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
const ChangePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

   

    

    await AuthServices.ChangePassword(
      oldPassword,
      newPassword,
      req.user as JwtPayload,
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


const forgotPassword = catchAsync(async (req: Request, res: Response) => {

    await AuthServices.forgotPassword(req.body);

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Check your email!",
        data: null
    })
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {

    const token = req.headers.authorization || "";

    await AuthServices.resetPassword(token, req.body);

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Password Reset!",
        data: null
    })
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const result = await AuthServices.getAllUsers();

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "All users fetched successfully",
        data: result
    });

});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await AuthServices.getSingleUser(Number(id));

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "User fetched successfully",
        data: result
    });

});


const deleteUser = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await AuthServices.deleteUser(Number(id));

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "User deleted successfully",
        data: result
    });

});


const uploadImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const files = req.files as Express.Multer.File[];

    console.log("Body Data:", req.body);
    console.log("Uploaded Files:", files);

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const result = await fileUploader.uploadToCloudinary(file);
        return {
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: result?.secure_url
        };
      })
    );

    sendResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Images Uploaded Successfully",
      data: uploadedFiles
    });
  }
);


export const AuthControllers = {
  registerUser,
  credentialsLogin,
  getNewAccessToken,
  logout,
  ChangePassword,
  googleCallbackController,
  forgotPassword,
  resetPassword,
  verifyEmail,
  deleteUser,
  getSingleUser,
  getAllUsers,
  uploadImages 
};
