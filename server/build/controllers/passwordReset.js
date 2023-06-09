"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordReset = void 0;
const users_1 = __importDefault(require("../models/users"));
const passwordReset = async (req, res) => {
    const { code, password, confirmPassword } = req.body;
    try {
        const user = await users_1.default.findOne({ otp: code });
        if (!user) {
            return res.send({ msg: "User Not found." });
        }
        //compare password and confirm password
        if (password !== confirmPassword) {
            return res
                .status(400)
                .json({ msg: "Password & confirm password Do Not Match!" });
        }
        user.password = password;
        user.otp = "";
        user.passwordReset = { is_changed: false };
        //save the updated password to db
        await user.save();
        res.status(201).json({
            success: true,
            msg: "Password reset successfully",
            user,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal server error", success: false, error });
    }
};
exports.passwordReset = passwordReset;
