"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomCode = void 0;
const crypto_1 = require("crypto");
const randomCode = async (length = 6) => {
    try {
        const bytes = await (0, crypto_1.randomBytes)(Math.ceil(length / 2));
        const code = bytes.toString("hex").slice(0, length);
        return code;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.randomCode = randomCode;
