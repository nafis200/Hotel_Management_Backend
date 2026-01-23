
import { PrismaPg } from "@prisma/adapter-pg";
import config from "../app/config";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

(async () => {
  try {
    await prisma.$executeRaw`SET statement_timeout = 60000`; 
    console.log("Statement timeout set to 60 seconds");
  } catch (error) {
    console.error("Failed to set statement timeout:", error);
  }
})();

export default prisma;
