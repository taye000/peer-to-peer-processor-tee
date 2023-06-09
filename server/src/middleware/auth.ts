import { Request, Response, NextFunction } from "express";
import { verify, JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { config } from "../config";
import { UserPayload } from "../@types";
import User from "../models/users";

// Validate auth token
export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = (req.headers.authorization as string)?.split(" ")[1];
  const accessToken = token;

  if (!accessToken || accessToken === "undefined") {
    return res.status(401).json({ msg: "Unauthorised access", success: false });
  }
  try {
    const payload = verify(accessToken, config.JWT_SECRET) as UserPayload;

    req.currentUser = payload;

    if (!req.currentUser) {
      return res.status(401).json({ msg: "Invalid Token", success: false });
    }
    next();
  } catch (error: any) {
    return res.status(500).json({ msg: "Internal auth error", error });
  }
};

//validate admin token
export const validateAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = (req.headers.authorization as string)?.split(" ")[1];

  const accessToken = token;

  if (!accessToken) {
    return res.status(401).json({ msg: "Unauthorised access", success: false });
  }
  try {
    const payload = verify(accessToken, config.JWT_SECRET) as UserPayload;

    req.userId = payload?.user || payload.email;
    req.userRole = payload?.is_admin;
    next();
  } catch (error: any) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError
    ) {
      return res.status(401).json({ msg: "Invalid Token", success: false });
    }
    console.error("Internal auth error");
    return res.status(500).json({ msg: "Internal auth error", error });
  }
};

// validate admin user
export const validateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.currentUser?.id);
  if (!user) {
    return res.status(404).json({ msg: "User Not Found", success: false });
  }
  if (user.is_admin) {
    return next();
  } else {
    return res.status(401).json({ msg: "Unauthorised access", success: false });
  }
};
