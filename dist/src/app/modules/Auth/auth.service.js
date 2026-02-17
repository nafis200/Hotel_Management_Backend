"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const userTokens_1 = require("../../utils/userTokens");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const config_1 = __importDefault(require("../../config"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const jwtHelper_1 = require("../../helper/jwtHelper");
const emailSender_1 = __importDefault(require("../../utils/emailSender"));
const bcrypt = __importStar(require("bcrypt"));
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = payload;
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (isUserExist) {
        throw new Error("User already exists with this email");
    }
    const hashedPassword = yield bcrypt.hash(password, 12);
    const result = yield prisma_1.default.user.create({
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
    const resetPassToken = jwtHelper_1.jwtHelpers.generateToken({ email: result.email, role: result.role }, config_1.default.jwt.register_verify_token, config_1.default.jwt.refresh_token_expires_in);
    const resetPassLink = config_1.default.registration_link + `?email=${result.email}&token=${resetPassToken}`;
    yield (0, emailSender_1.default)(result.email, `
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
`, "Verify email for websites");
    return result;
});
const verifyEmailService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = jwtHelper_1.jwtHelpers.verifyToken(token, process.env.REGISTER_VERIFY_TOKEN);
    if (!payload) {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "Token is invalid!");
    }
    console.log(payload, "verified payload");
    const user = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.verified) {
        return { alreadyVerified: true, user };
    }
    const result = yield prisma_1.default.user.update({
        where: { email: payload.email },
        data: { verified: true },
    });
    const userTokens = (0, userTokens_1.createUserTokens)(payload);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: result,
    };
});
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email does not exist");
    }
    if (isUserExist.status === "BLOCKED") {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "User is blocked");
    }
    if (isUserExist.status === "DELETED") {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "User is deleted");
    }
    if (isUserExist.verified === false) {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "Verify your email");
    }
    const isPasswordMatched = yield bcrypt.compare(password, isUserExist.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, "Incorrect Password");
    }
    const userTokens = (0, userTokens_1.createUserTokens)(isUserExist);
    const { password: pass } = isUserExist, rest = __rest(isUserExist, ["password"]);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
const ChangePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = decodedToken.userId;
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.status === "BLOCKED") {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "User is blocked");
    }
    if (user.status === "DELETED") {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "User is deleted");
    }
    const isOldPasswordMatch = yield bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new ApiError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password does not match");
    }
    const hashedPassword = yield bcrypt.hash(newPassword, 10);
    yield prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    return {
        message: "Password reset successful",
    };
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const resetPassToken = jwtHelper_1.jwtHelpers.generateToken({ email: userData.email, role: userData.role }, config_1.default.jwt.reset_pass_secret, config_1.default.jwt.reset_pass_token_expires_in);
    const resetPassLink = config_1.default.reset_pass_link + `?email=${userData.email}&token=${resetPassToken}`;
    //console.log(resetPassToken)
    yield (0, emailSender_1.default)(userData.email, `
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
        `, "reset password link");
    //console.log(resetPassLink)
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ token, payload });
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isValidToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.reset_pass_secret);
    if (!isValidToken) {
        throw new ApiError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden!");
    }
    // hash password
    const password = yield bcrypt.hash(payload.password, 12);
    yield prisma_1.default.user.update({
        where: {
            email: payload.id,
        },
        data: {
            password,
        },
    });
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.user.findMany();
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    return user;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const deletedUser = yield prisma_1.default.user.delete({
        where: { id },
    });
    return deletedUser;
});
exports.AuthServices = {
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
