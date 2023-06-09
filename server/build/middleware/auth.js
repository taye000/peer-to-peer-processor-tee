"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdmin = exports.validateAdminToken = exports.validateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const users_1 = __importDefault(require("../models/users"));
// Validate auth token
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const accessToken = token;
    if (!accessToken || accessToken === "undefined") {
        return res.status(401).json({ msg: "Unauthorised access", success: false });
    }
    try {
        const payload = (0, jsonwebtoken_1.verify)(accessToken, config_1.config.JWT_SECRET);
        req.currentUser = payload;
        if (!req.currentUser) {
            return res.status(401).json({ msg: "Invalid Token", success: false });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal auth error", error });
    }
};
exports.validateToken = validateToken;
//validate admin token
const validateAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const accessToken = token;
    if (!accessToken) {
        return res.status(401).json({ msg: "Unauthorised access", success: false });
    }
    try {
        const payload = (0, jsonwebtoken_1.verify)(accessToken, config_1.config.JWT_SECRET);
        req.userId = payload?.user || payload.email;
        req.userRole = payload?.is_admin;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.JsonWebTokenError ||
            error instanceof jsonwebtoken_1.TokenExpiredError) {
            return res.status(401).json({ msg: "Invalid Token", success: false });
        }
        console.error("Internal auth error");
        return res.status(500).json({ msg: "Internal auth error", error });
    }
};
exports.validateAdminToken = validateAdminToken;
// validate admin user
const validateAdmin = async (req, res, next) => {
    const user = await users_1.default.findById(req.currentUser?.id);
    if (!user) {
        return res.status(404).json({ msg: "User Not Found", success: false });
    }
    if (user.is_admin) {
        return next();
    }
    else {
        return res.status(401).json({ msg: "Unauthorised access", success: false });
    }
};
exports.validateAdmin = validateAdmin;
