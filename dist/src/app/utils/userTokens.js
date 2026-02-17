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
exports.createNewAccessTokenWithRefreshToken = exports.createUserTokens = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jwt_1 = require("./jwt");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const config_1 = __importDefault(require("../config"));
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
const createUserTokens = (user) => {
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.reset_pass_token_expires_in);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createUserTokens = createUserTokens;
/**
 * =========================
 * REFRESH TOKEN → NEW ACCESS TOKEN
 * =========================
 */
const createNewAccessTokenWithRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedRefreshToken = (0, jwt_1.verifyToken)(refreshToken, "abcdef");
    // 🔍 find user from array
    const isUserExist = users.find((u) => u.email === verifiedRefreshToken.email);
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    if (isUserExist.isActive === "BLOCKED" ||
        isUserExist.isActive === "INACTIVE") {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new ApiError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    const jwtPayload = {
        userId: isUserExist.id,
        email: isUserExist.email,
        role: isUserExist.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, "abc", "5");
    return accessToken;
});
exports.createNewAccessTokenWithRefreshToken = createNewAccessTokenWithRefreshToken;
