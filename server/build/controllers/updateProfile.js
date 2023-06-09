"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.updateProfilePhoto = exports.upload = void 0;
const users_1 = __importDefault(require("../models/users"));
const validator_1 = __importDefault(require("validator"));
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const config_1 = require("../config");
//init cloudinary storage
const cloudinaryStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: config_1.cloudinary,
});
//init multer with cloudinary storage
exports.upload = (0, multer_1.default)({ storage: cloudinaryStorage });
//update profile photo controller
const updateProfilePhoto = async (req, res) => {
    try {
        const user = await users_1.default.findById(req.currentUser?.id);
        if (!user) {
            res.status(401).json({ msg: "Unauthorized access" });
        }
        const photo = req?.file?.path;
        await users_1.default.findByIdAndUpdate(req?.userId, {
            photo,
        });
        res
            .status(200)
            .json({ success: true, msg: "Profile photo updated successfully" });
    }
    catch (error) {
        res.send({ msg: "Error uploading photo" });
    }
};
exports.updateProfilePhoto = updateProfilePhoto;
const updateProfile = async (req, res) => {
    const { name, email, phoneNumber, photo, location } = req.body;
    try {
        const user = await users_1.default.findById(req.currentUser?.id).select("-password -passwordReset -otp -createdAt -updatedAt -__v");
        if (!user) {
            return res.status(401).json({ msg: "Unauthorized access" });
        }
        let updatedFields = {};
        if (name)
            updatedFields.name = name;
        if (email)
            updatedFields.email = email;
        if (phoneNumber)
            updatedFields.phoneNumber = phoneNumber;
        if (photo)
            updatedFields.photo = photo;
        if (location)
            updatedFields.location = location;
        //check if user name is valid
        if (email && !validator_1.default.isEmail(email)) {
            return res.send({ msg: "Please provide a valid email" });
        }
        //check if email is already taken by another user
        const isEmailTaken = await users_1.default.findOne({ email });
        if (isEmailTaken && isEmailTaken.email !== req?.currentUser?.email) {
            return res.send({ msg: "Email is already taken." });
        }
        const updatedUser = await users_1.default.findByIdAndUpdate(req?.currentUser?.id, updatedFields, { new: true });
        return res.status(200).json({
            success: true,
            msg: "Profile updated successfully",
            response: updatedUser,
        });
    }
    catch (error) {
        return res.status(500).json({ msg: "error updating profile", error });
    }
};
exports.updateProfile = updateProfile;
