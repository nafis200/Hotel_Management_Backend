import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
//   env: process.env.NODE_ENV,
//   port: process.env.PORT,
//   NODE_ENV: process.env.NODE_ENV,
//   GOOGLE_DRIVE_FOLDER_ID:process.env.GOOGLE_DRIVE_FOLDER_ID,
//   GOOGLE_SERVICE_ACCOUNT_BASE64:process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
//   googleDrive: {
//     folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     redirectUri: process.env.REDIRECT_URL,
//     refreshToken: process.env.REFRESH_TOKEN,
//   },
 env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_secret: process.env.RESET_PASS_TOKEN,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
        register_verify_token: process.env.REGISTER_VERIFY_TOKEN
    },
    reset_pass_link: process.env.RESET_PASS_LINK,
    registration_link: process.env.VERIFY_REGISTRATION_LINK,
    emailSender: {
        email: process.env.EMAIL,
        app_pass: process.env.APP_PASS
    },
  databaseUrl: process.env.DATABASE_URL,
  googleclientid:process.env.GOOGLE_CLIENT_ID,
  googlesecret:process.env.GOOGLE_CLIENT_SECRET,
  googlecallbackurl:process.env.GOOGLE_CALLBACK_URL
};
