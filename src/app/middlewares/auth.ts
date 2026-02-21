import { NextFunction, Request, Response } from "express";

import { Secret } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { jwtHelpers } from "../helper/jwtHelper";
import config from "../config";



const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const headerToken = req.headers.authorization;
            const cookieToken = req.cookies?.accessToken;
            const token = headerToken || cookieToken;

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!")
            }

            const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.jwt_secret as Secret)

            req.user = verifiedUser;

            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!")
            }
            next()
        }
        catch (err: any) {
            console.error("AUTH MIDDLEWARE ERROR:", err.message, err.stack);
            next(err)
        }
    }
};

export default auth;