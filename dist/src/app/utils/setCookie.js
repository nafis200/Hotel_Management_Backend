"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const isProduction = process.env.NODE_ENV === "production";
const setAuthCookie = (res, tokenInfo) => {
    console.log("setAuthCookie - Setting cookies with tokenInfo:", !!tokenInfo.accessToken, !!tokenInfo.refreshToken);
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // true in prod (HTTPS required)
        sameSite: (isProduction ? "none" : "lax"), // none allows cross-site in prod
        path: "/",
    };
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }));
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 30 * 24 * 60 * 60 * 1000 }));
    }
};
exports.setAuthCookie = setAuthCookie;
