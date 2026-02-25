import { Response } from "express";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

const isProduction = process.env.NODE_ENV === "production";

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    console.log("setAuthCookie - Setting cookies with tokenInfo:", !!tokenInfo.accessToken, !!tokenInfo.refreshToken);

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,           // true in prod (HTTPS required)
        sameSite: (isProduction ? "none" : "lax") as "none" | "lax",  // none allows cross-site in prod
        path: "/",
    };

    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
    }
}