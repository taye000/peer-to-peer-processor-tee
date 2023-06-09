"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const utils_1 = require("../utils");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
        max: 50,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        default: "",
    },
    photo: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    account_type: {
        type: String,
    },
    is_admin: {
        type: Boolean,
        default: false,
    },
    passwordReset: {
        is_changed: {
            type: Boolean,
        },
    },
    otp: {
        type: String,
    },
}, {
    toJSON: {
        virtuals: true,
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
        versionKey: false,
    },
    timestamps: true,
});
//pre save hook to hash password before it is saved to db
UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log("Password Changed");
        const hashedPassword = await utils_1.PasswordManager.toHash(this.get("password"));
        this.set("password", hashedPassword);
    }
    next();
});
//statics
UserSchema.statics.build = (attrs) => {
    return new User(attrs);
};
//creating user model
const User = (0, mongoose_1.model)("users", UserSchema);
exports.default = User;
