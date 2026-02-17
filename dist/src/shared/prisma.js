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
const adapter_pg_1 = require("@prisma/adapter-pg");
const config_1 = __importDefault(require("../app/config"));
const client_1 = require("@prisma/client");
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: config_1.default.databaseUrl,
});
const prisma = new client_1.PrismaClient({
    adapter,
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.$executeRaw `SET statement_timeout = 60000`;
        console.log("Statement timeout set to 60 seconds");
    }
    catch (error) {
        console.error("Failed to set statement timeout:", error);
    }
}))();
exports.default = prisma;
