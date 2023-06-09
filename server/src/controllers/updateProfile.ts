import { Request, Response } from "express";
import User from "../models/users";
import validator from "validator";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config";

//init cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
});
//init multer with cloudinary storage
export const upload = multer({ storage: cloudinaryStorage });

//update profile photo controller
export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.currentUser?.id);
    if (!user) {
      res.status(401).json({ msg: "Unauthorized access" });
    }
    const photo = req?.file?.path;
    await User.findByIdAndUpdate(req?.userId, {
      photo,
    });
    res
      .status(200)
      .json({ success: true, msg: "Profile photo updated successfully" });
  } catch (error) {
    res.send({ msg: "Error uploading photo" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, email, phoneNumber, photo, location } = req.body;
  try {
    const user = await User.findById(req.currentUser?.id).select(
      "-password -passwordReset -otp -createdAt -updatedAt -__v"
    );
    if (!user) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }

    let updatedFields: any = {};

    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (photo) updatedFields.photo = photo;
    if (location) updatedFields.location = location;
    //check if user name is valid
    if (email && !validator.isEmail(email)) {
      return res.send({ msg: "Please provide a valid email" });
    }

    //check if email is already taken by another user
    const isEmailTaken = await User.findOne({ email });

    if (isEmailTaken && isEmailTaken.email !== req?.currentUser?.email) {
      return res.send({ msg: "Email is already taken." });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req?.currentUser?.id,
      updatedFields,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      response: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({ msg: "error updating profile", error });
  }
};
