"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const config_1 = require("./config");
const connectDB = async () => {
    (0, mongoose_1.set)("strictQuery", false);
    (0, mongoose_1.connect)(config_1.config.mongoDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .catch((err) => console.log(err.message));
    const db = mongoose_1.connection;
    db.on("error", () => console.error("error connecting to db"));
    db.once("open", () => console.log("Connected to DB"));
};
exports.connectDB = connectDB;
