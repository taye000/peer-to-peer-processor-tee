"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.adminSignUp = exports.signUp = void 0;
const users_1 = __importDefault(require("../models/users"));
const validator_1 = __importDefault(require("validator"));
const config_1 = require("../config");
const jsonwebtoken_1 = require("jsonwebtoken");
//create a new user
const signUp = async (req, res) => {
    const { email, password } = req.body;
    if (!email.trim()) {
        return res.status(400).json({ email: "email is required" });
    }
    if (!validator_1.default.isEmail(email)) {
        return res.status(400).json({ email: "Please enter a valid email" });
    }
    if (!password.trim()) {
        return res.status(400).json({ password: "Password is required" });
    }
    try {
        //check if user email already exist in db
        const emailExists = await users_1.default.findOne({ email });
        if (emailExists)
            return res.status(400).json({ email: "User email already exists" });
        //create new user
        const createUser = await users_1.default.create({
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
        const token = (0, jsonwebtoken_1.sign)(payload, config_1.config.JWT_SECRET, {
            expiresIn: config_1.config.JWT_SECRET_EXPIRY,
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.signUp = signUp;
//create a new admin user
const adminSignUp = async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    if (!email.trim()) {
        return res.status(400).json({ email: "email is required" });
    }
    if (!validator_1.default.isEmail(email)) {
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
        const emailExists = await users_1.default.findOne({ email });
        if (emailExists)
            return res.status(400).json({ email: "User email already exists" });
        //check if user phone number already exist in db
        const phoneNoExists = await users_1.default.findOne({ phoneNumber });
        if (phoneNoExists) {
            return res
                .status(400)
                .json({ phoneNumber: "User phone Number already exists" });
        }
        //create new user
        const createUser = await users_1.default.create({
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.adminSignUp = adminSignUp;
//get a user by id
const getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await users_1.default.findById(userId);
        if (user) {
            res.status(200).json({ user });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserById = getUserById;
