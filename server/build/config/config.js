"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// import dotenv from "dotenv";
// dotenv.config();
require("dotenv").config();
exports.config = {
    mongoDbUri: process.env.MONGODBURI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_EXPIRY: 3600000, //expires in 1 hour
};
