import { Application } from "express";

export const configureRoutes = (app: Application) => {
  app.get("/", async (_req, res) => {
    res.send({ message: "Peer2Peer!" });
  });
  app.use("/api/users", require("./api/users"));
  app.use("/api/admin", require("./api/admin"));
  app.use("/api/transactions", require("./api/transactions"));
};
