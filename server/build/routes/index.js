"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
const configureRoutes = (app) => {
    app.get("/", async (_req, res) => {
        res.send({ message: "Peer2Peer!" });
    });
    app.use("/api/users", require("./api/users"));
    app.use("/api/admin", require("./api/admin"));
    app.use("/api/transactions", require("./api/transactions"));
};
exports.configureRoutes = configureRoutes;
