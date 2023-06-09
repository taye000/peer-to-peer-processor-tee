"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidationError = void 0;
class RequestValidationError extends Error {
    errors;
    statusCode = 400;
    constructor(errors) {
        super("Request parameters invalid");
        this.errors = errors;
    }
}
exports.RequestValidationError = RequestValidationError;
