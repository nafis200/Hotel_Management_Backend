import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";

import { AuthControllers } from "./auth.controller";
import { fileUploader } from "../../helper/fileUploader";

const router = Router();

router.post("/register", AuthControllers.registerUser);

router.get("/verify-email", AuthControllers.verifyEmail);

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);

router.post("/change-password", AuthControllers.ChangePassword);

router.post("/forgot-password", AuthControllers.forgotPassword);

router.post("/reset-password", AuthControllers.resetPassword);

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  },
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthControllers.googleCallbackController,
);

router.get("/", AuthControllers.getAllUsers);

router.get("/:id", AuthControllers.getSingleUser);

router.delete("/:id", AuthControllers.deleteUser);

router.post(
  "/image",
  fileUploader.upload.array("files"),
  AuthControllers.uploadImages,
);

export const AuthRoutes = router;
