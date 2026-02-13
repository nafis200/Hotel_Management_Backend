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
  databaseUrl: process.env.DATABASE_URL,
  googleclientid:process.env.GOOGLE_CLIENT_ID,
  googlesecret:process.env.GOOGLE_CLIENT_SECRET,
  googlecallbackurl:process.env.GOOGLE_CALLBACK_URL
};
