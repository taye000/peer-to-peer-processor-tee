"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const requestValidationError_1 = require("../errors/requestValidationError");
const validateRequest = async (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new requestValidationError_1.RequestValidationError(errors.array());
    }
    next();
};
exports.validateRequest = validateRequest;
