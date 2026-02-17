"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = exports.verifyEmail = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const setCookie_1 = require("../../utils/setCookie");
const userTokens_1 = require("../../utils/userTokens");
const auth_service_1 = require("./auth.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const fileUploader_1 = require("../../helper/fileUploader");
const registerUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield auth_service_1.AuthServices.registerUser(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_codes_1.default.CREATED,
        message: "User registered successfully",
        data: userInfo,
    });
}));
exports.verifyEmail = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.query;
    if (!email || !token) {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email and token are required");
    }
    const result = yield auth_service_1.AuthServices.verifyEmailService(token);
    (0, setCookie_1.setAuthCookie)(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
    res.redirect("https://www.google.com/search?q=vjudge&oq=&gs_lcrp=EgZjaHJvbWUqCQgEECMYJxjqAjIJCAAQIxgnGOoCMgkIARAjGCcY6gIyCQgCECMYJxjqAjIJCAMQIxgnGOoCMgkIBBAjGCcY6gIyCQgFECMYJxjqAjIJCAYQIxgnGOoCMgkIBxAuGCcY6gLSAQkzNDIyajBqMTWoAgiwAgHxBRYBsPTx72yT8QUWAbD08e9skw&sourceid=chrome&ie=UTF-8");
    // it must be reddireect login
}));
const credentialsLogin = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInfo = yield auth_service_1.AuthServices.credentialsLogin(req.body);
    (0, setCookie_1.setAuthCookie)(res, loginInfo);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_codes_1.default.OK,
        message: "User Logged In Successfully",
        data: loginInfo,
    });
}));
const getNewAccessToken = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, "No refresh token recieved from cookies");
    }
    const tokenInfo = yield auth_service_1.AuthServices.getNewAccessToken(refreshToken);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_codes_1.default.OK,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    });
}));
const logout = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_codes_1.default.OK,
        message: "User Logged Out Successfully",
        data: null,
    });
}));
const ChangePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    yield auth_service_1.AuthServices.ChangePassword(oldPassword, newPassword, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_codes_1.default.OK,
        message: "Password Changed Successfully",
        data: null,
    });
}));
const googleCallbackController = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let redirectTo = req.query.state ? req.query.state : "";
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    const tokenInfo = (0, userTokens_1.createUserTokens)(user);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    res.redirect("https://www.google.com/search?q=programming+hero+level+2&rlz=1C1BNSD_enBD1125BD1126&sourceid=chrome&ie=UTF-8");
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield auth_service_1.AuthServices.forgotPassword(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_codes_1.default.OK,
        success: true,
        message: "Check your email!",
        data: null
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    yield auth_service_1.AuthServices.resetPassword(token, req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_codes_1.default.OK,
        success: true,
        message: "Password Reset!",
        data: null
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.AuthServices.getAllUsers();
    (0, sendResponse_1.default)(res, {
        status: http_status_codes_1.default.OK,
        success: true,
        message: "All users fetched successfully",
        data: result
    });
}));
const getSingleUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield auth_service_1.AuthServices.getSingleUser(Number(id));
    (0, sendResponse_1.default)(res, {
        status: http_status_codes_1.default.OK,
        success: true,
        message: "User fetched successfully",
        data: result
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield auth_service_1.AuthServices.deleteUser(Number(id));
    (0, sendResponse_1.default)(res, {
        status: http_status_codes_1.default.OK,
        success: true,
        message: "User deleted successfully",
        data: result
    });
}));
const uploadImages = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    console.log("Body Data:", req.body);
    console.log("Uploaded Files:", files);
    const uploadedFiles = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        return {
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: result === null || result === void 0 ? void 0 : result.secure_url
        };
    })));
    (0, sendResponse_1.default)(res, {
        success: true,
        status: http_status_codes_1.default.OK,
        message: "Images Uploaded Successfully",
        data: uploadedFiles
    });
}));
exports.AuthControllers = {
    registerUser,
    credentialsLogin,
    getNewAccessToken,
    logout,
    ChangePassword,
    googleCallbackController,
    forgotPassword,
    resetPassword,
    verifyEmail: exports.verifyEmail,
    deleteUser,
    getSingleUser,
    getAllUsers,
    uploadImages
};
