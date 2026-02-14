/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import config from ".";
import prisma from "../../shared/prisma";
import * as bcrypt from "bcrypt";
import { UserRole, UserStatus } from "@prisma/client";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleclientid as string,
      clientSecret: config.googlesecret as string,
      callbackURL: config.googlecallbackurl as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {

        console.log(profile,"profile")

        const email = profile.emails?.[0].value;

        if (!email) {
          return done(null, false, { mesaage: "No email found" });
        }

        let user: any = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        const hashedPassword = await bcrypt.hash("123456", 12);

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email,
              profilePhoto: profile.photos?.[0]?.value || null,
              password: hashedPassword,
              verified: true,
              role: UserRole.USER,
              status: UserStatus.ACTIVE,
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
        }

        return done(null, user);
      } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const idNumber = Number(id);
    const user = await prisma.user.findUnique({
      where: {
        id: idNumber,
      },
    });
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});
