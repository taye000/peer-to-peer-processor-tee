import { JwtPayload } from "jsonwebtoken";

export interface IUser {
  id?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  photo?: string;
  location?: string;
  account_type?: string;
  is_admin?: boolean;
  is_active?: string;
  otp?: string;
  passwordReset?: {
    is_changed: boolean;
  };
}

export interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  phoneNumber?: string;
  name?: string;
  is_active?: boolean;
  is_admin?: boolean;
}
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
