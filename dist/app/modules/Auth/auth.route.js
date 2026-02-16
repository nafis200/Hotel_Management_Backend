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
exports.AuthRoutes = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("./auth.controller");
const fileUploader_1 = require("../../helper/fileUploader");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.AuthControllers.registerUser);
router.get("/verify-email", auth_controller_1.AuthControllers.verifyEmail);
router.post("/login", auth_controller_1.AuthControllers.credentialsLogin);
router.post("/refresh-token", auth_controller_1.AuthControllers.getNewAccessToken);
router.post("/logout", auth_controller_1.AuthControllers.logout);
router.post("/change-password", (0, auth_1.default)("USER", "ADMIN"), auth_controller_1.AuthControllers.ChangePassword);
router.post("/forgot-password", auth_controller_1.AuthControllers.forgotPassword);
router.post("/reset-password", auth_controller_1.AuthControllers.resetPassword);
router.get("/google", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirect = req.query.redirect || "/";
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect,
    })(req, res, next);
}));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), auth_controller_1.AuthControllers.googleCallbackController);
router.get("/", auth_controller_1.AuthControllers.getAllUsers);
router.get("/:id", auth_controller_1.AuthControllers.getSingleUser);
router.delete("/:id", auth_controller_1.AuthControllers.deleteUser);
router.post("/image", fileUploader_1.fileUploader.upload.array("files"), auth_controller_1.AuthControllers.uploadImages);
exports.AuthRoutes = router;
