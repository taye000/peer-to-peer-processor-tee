"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserResetPassword = void 0;
const users_1 = __importDefault(require("../models/users"));
const utils_1 = require("../utils");
const currentUserResetPassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await users_1.default.findById(req.currentUser?.id);
    if (!user) {
        return res
            .status(401)
            .json({ success: false, msg: "Unauthorised access." });
    }
    if (!currentPassword.trim()) {
        return res
            .status(400)
            .json({ newPassword: "Current Password is required" });
    }
    if (!newPassword.trim()) {
        return res.status(400).json({ newPassword: "New Password is required" });
    }
    if (!confirmNewPassword.trim()) {
        return res
            .status(400)
            .json({ confirmNewPassword: "confirm New Password is required" });
    }
    const isPasswordCorrect = await utils_1.PasswordManager.compare(user.password, currentPassword);
    if (!isPasswordCorrect) {
        return res
            .status(400)
            .json({ success: false, msg: "Incorrect current password" });
    }
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
            success: false,
            msg: "New password and confirm new password Do Not Match.",
        });
    }
    //compare new password to the old password
    const newPasswordNotSameAsOld = await utils_1.PasswordManager.compare(user.password, newPassword);
    //check if new password is same as old password
    if (newPasswordNotSameAsOld) {
        return res
            .status(400)
            .json({ newPassword: "New Password cannot be same as old password" });
    }
    try {
        user.password = newPassword;
        user.otp = "";
        user.passwordReset = { is_changed: false };
        //save the hashed updated password to db
        await user.save();
        return res
            .status(200)
            .json({ success: true, msg: "Password updated succesfully." });
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal server error" });
    }
};
exports.currentUserResetPassword = currentUserResetPassword;
