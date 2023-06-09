"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordReset = void 0;
const users_1 = __importDefault(require("../models/users"));
const common_1 = require("../utils/common");
const helpers_1 = require("../helpers");
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await users_1.default.findOne({ email });
    if (!user) {
        return res.status(400).json({ msg: "User not exist." });
    }
    try {
        //generate reset code
        const code = await (0, common_1.randomCode)();
        const updatedUser = await users_1.default.findByIdAndUpdate(user?.id, {
            passwordReset: { is_changed: true },
            otp: code,
        }, { new: true });
        console.log(code);
        let message = `Your password reset code from P2P is: ${code}.`;
        //send code via email
        await (0, helpers_1.mailer)(message, email);
        if (user.phoneNumber) {
            let phone = (0, helpers_1.formatPhoneNumber)(user.phoneNumber, "KE");
            console.log("phone", phone);
            //send otp via sms
            await (0, helpers_1.sms)(phone, message);
        }
        return res.status(201).json({
            success: true,
            msg: "Password reset code successfully sent to your email & phone.",
            user: updatedUser,
        });
    }
    catch (error) {
        return res.status(409).json({ error: error.message });
    }
};
exports.requestPasswordReset = requestPasswordReset;
