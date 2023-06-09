"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const config_1 = require("./config");
const config_2 = require("./config/config");
const middleware_1 = require("./middleware");
const routes_1 = require("./routes");
const main = async () => {
    //connect to db
    await (0, config_1.connectDB)();
    //initialize express
    const app = (0, express_1.default)();
    //configure express middleware
    (0, middleware_1.configureMiddleware)(app);
    //set up routes
    (0, routes_1.configureRoutes)(app);
    //start server
    const httpServer = (0, http_1.createServer)(app);
    httpServer.listen(config_2.config.PORT || 5000, () => {
        console.log(`Server started at port ${config_2.config.PORT}`, httpServer.address());
    });
};
main();
