import { Request, Response } from "express";
import User from "../models/users";
import { randomCode } from "../utils/common";
import { formatPhoneNumber, mailer, sms } from "../helpers";

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ msg: "User not exist." });
  }
  try {
    //generate reset code
    const code = await randomCode();

    const updatedUser = await User.findByIdAndUpdate(
      user?.id,
      {
        passwordReset: { is_changed: true },
        otp: code,
      },
      { new: true }
    );
    console.log(code);

    let message = `Your password reset code from P2P is: ${code}.`;
    //send code via email
    await mailer(message, email);

    if (user.phoneNumber) {
      let phone = formatPhoneNumber(user.phoneNumber, "KE");
      console.log("phone", phone);

      //send otp via sms
      await sms(phone, message);
    }
    return res.status(201).json({
      success: true,
      msg: "Password reset code successfully sent to your email & phone.",
      user: updatedUser,
    });
  } catch (error: any) {
    return res.status(409).json({ error: error.message });
  }
};
