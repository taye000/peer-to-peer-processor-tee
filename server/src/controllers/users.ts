import { Request, Response } from "express";
import User from "../models/users";
import validator from "validator";
import { config } from "../config";
import { sign } from "jsonwebtoken";

//create a new user
export const signUp = async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email.trim()) {
    return res.status(400).json({ email: "email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ email: "Please enter a valid email" });
  }
  if (!password.trim()) {
    return res.status(400).json({ password: "Password is required" });
  }

  try {
    //check if user email already exist in db
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ email: "User email already exists" });

    //create new user
    const createUser = await User.create({
      email,
      password,
    });
    //save user
    let newUser = await createUser.save();

    // sign in the new user
    if (!newUser) {
      return res.status(404).json({ msg: "User Not Found", success: false });
    }
    //payload for generating jwt token
    const payload = {
      id: newUser.id,
      email: newUser.email,
    };
    //generate token
    const token = sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_SECRET_EXPIRY,
    });

    //cookie session
    req.session = {
      jwt: token,
    };

    res
      .status(201)
      .json({
        success: true,
        msg: "New User Created Successfully.",
        newUser,
        cookie: req.session?.jwt,
      });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

//create a new admin user
export const adminSignUp = async (req: any, res: any) => {
  const { email, phoneNumber, password } = req.body;

  if (!email.trim()) {
    return res.status(400).json({ email: "email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ email: "Please enter a valid email" });
  }
  if (!phoneNumber) {
    return res.status(400).json({ phoneNumber: "Phone Number is required" });
  }
  if (!password.trim()) {
    return res.status(400).json({ password: "Password is required" });
  }

  try {
    //check if user email already exist in db
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ email: "User email already exists" });

    //check if user phone number already exist in db
    const phoneNoExists = await User.findOne({ phoneNumber });
    if (phoneNoExists) {
      return res
        .status(400)
        .json({ phoneNumber: "User phone Number already exists" });
    }

    //create new user
    const createUser = await User.create({
      email,
      phoneNumber,
      password,
      is_admin: true,
    });
    //save user
    let newUser = await createUser.save();

    res
      .status(201)
      .json({
        success: true,
        msg: "New Admin User Created Successfully. Please Login to continue.",
        newUser,
      });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

//get a user by id
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
