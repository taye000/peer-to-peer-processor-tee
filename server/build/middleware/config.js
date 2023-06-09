"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const xss = require("xss-clean");
const configureMiddleware = (app) => {
    //initialize express
    app.use(express_1.default.json());
    //mongodb sanitize
    app.use((0, express_mongo_sanitize_1.default)());
    //cookie parser
    app.use((0, cookie_parser_1.default)());
    //form parser middleware
    app.use(express_1.default.urlencoded({ extended: true }));
    //enable cors
    app.use((0, cors_1.default)());
    //cookie session
    app.use((0, cookie_session_1.default)({
        signed: true,
        secure: false,
        keys: ["key1", "key2"],
        maxAge: 24 * 60 * 60 * 1000, //24 hours
    }));
    //prevent xss attacks
    app.use(xss());
    //prevent http param polution
    app.use((0, hpp_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 10 * 60 * 1000,
        max: 100, //limit each ip address to 100 requests per windowMs
    }));
};
exports.configureMiddleware = configureMiddleware;
