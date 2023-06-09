"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrentUser = exports.verifyUserLoginByOTP = exports.adminLogin = exports.signin = exports.login = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const users_1 = __importDefault(require("../models/users"));
const utils_1 = require("../utils");
const config_1 = require("../config/config");
const helpers_1 = require("../helpers");
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email.trim()) {
        return res.status(400).json({ msg: "Email is required" });
    }
    if (!password.trim()) {
        return res.status(400).json({ msg: "Password is required" });
    }
    const user = await users_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ msg: "Email Not Found", success: false });
    }
    try {
        //check password
        const passwordMatch = await utils_1.PasswordManager.compare(user.password, password);
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Password Incorrect" });
        }
        //generate otp
        const otp = await (0, utils_1.randomCode)();
        //update user otp
        const updatedUser = await users_1.default.findByIdAndUpdate(user?.id, {
            passwordReset: { is_changed: true },
            otp: otp,
        }, { new: true });
        //save user
        await user.save();
        let message = `Your OTP from P2P is: ${otp}.`;
        //send otp via email
        (0, helpers_1.mailer)(message, user.email);
        if (user.phoneNumber) {
            let phone = (0, helpers_1.formatPhoneNumber)(user.phoneNumber, "KE");
            //send otp via sms
            (0, helpers_1.sms)(phone, message);
        }
        res.status(200).json({
            otp,
            success: true,
            msg: "Successful accessed your account, use OTP sent to your email & phone to proceed.",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error", success: false });
    }
};
exports.login = login;
const signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email.trim()) {
        return res.status(400).json({ msg: "Email is required" });
    }
    if (!password.trim()) {
        return res.status(400).json({ msg: "Password is required" });
    }
    const user = await users_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ msg: "Email Not Found", success: false });
    }
    try {
        //check password
        const passwordMatch = await utils_1.PasswordManager.compare(user.password, password);
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Password Incorrect" });
        }
        //payload for generating jwt token
        const payload = {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };
        //generate token
        const token = (0, jsonwebtoken_1.sign)(payload, config_1.config.JWT_SECRET, {
            expiresIn: config_1.config.JWT_SECRET_EXPIRY,
        });
        //cookie session
        req.session = {
            jwt: token,
        };
        res.status(200).send({
            success: true,
            msg: "User signed in successfully",
            cookie: req.session?.jwt,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error", success: false });
    }
};
exports.signin = signin;
// admin login
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email.trim()) {
        return res.status(400).json({ msg: "Email is required" });
    }
    if (!password.trim()) {
        return res.status(400).json({ msg: "Password is required" });
    }
    const user = await users_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ msg: "Email Not Found", success: false });
    }
    if (!user?.is_admin) {
        return res
            .status(401)
            .json({ msg: "Unauthorised access.", success: false });
    }
    try {
        //check password
        const passwordMatch = await utils_1.PasswordManager.compare(user.password, password);
        if (!passwordMatch) {
            return res.status(401).json({ msg: "Password Incorrect" });
        }
        //generate otp
        const otp = await (0, utils_1.randomCode)();
        //update user otp
        const updatedUser = await users_1.default.findByIdAndUpdate(user?.id, {
            passwordReset: { is_changed: true },
            otp: otp,
        }, { new: true });
        let message = `Your OTP from P2P is: ${otp}`;
        //send otp via email
        (0, helpers_1.mailer)(message, user.email);
        if (user.phoneNumber) {
            let phone = (0, helpers_1.formatPhoneNumber)(user.phoneNumber, "KE");
            //send otp via sms
            (0, helpers_1.sms)(phone, message);
        }
        res.status(200).json({
            success: true,
            msg: "Successful accessed your account, use OTP sent to your email & phone to proceed.",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error", success: false });
    }
};
exports.adminLogin = adminLogin;
// Verify user login by otp
const verifyUserLoginByOTP = async (req, res) => {
    const { otp } = req.body;
    if (!otp.trim()) {
        return res.status(400).json({ msg: "OTP is required" });
    }
    try {
        //check if otp matches the user otp
        const user = await users_1.default.findOne({ otp });
        if (!user) {
            return res.status(400).json({ msg: "OTP does not match" });
        }
        //payload for generating jwt token
        const payload = {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };
        //generate token
        const token = (0, jsonwebtoken_1.sign)(payload, config_1.config.JWT_SECRET, {
            expiresIn: config_1.config.JWT_SECRET_EXPIRY,
        });
        //cookie session
        req.session = {
            jwt: token,
        };
        res.status(200).send({
            success: true,
            msg: "User signed in successfully",
            cookie: req.session?.jwt,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error", success: false });
    }
};
exports.verifyUserLoginByOTP = verifyUserLoginByOTP;
// get the current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await users_1.default.findById(req.currentUser?.id).select("-password -passwordReset -otp -createdAt -updatedAt -__v");
        if (!user) {
            return res.status(404).json({ msg: "User Not Found", success: false });
        }
        return res
            .status(200)
            .json({ msg: "Found current user.", success: true, user });
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal server error" });
    }
};
exports.getCurrentUser = getCurrentUser;
// sign out of the system
const logout = async (req, res) => {
    req.session = null;
    res.status(200).json({ success: true, msg: "Sign out successful." });
};
exports.logout = logout;
