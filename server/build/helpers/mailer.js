"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailer = async (code, email) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.sendgrid.net",
            port: 465,
            secure: true,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_SMTP_KEY,
            },
        });
        let mailOptions = {
            from: "taylorgitari@gmail.com",
            to: email,
            subject: "account recovery code",
            html: `<!DOCTYPE>
    <html>
    <body>
    <p>Your authentication code is : </p><b>${code}</b>
    </body>
    </html>
`,
        };
        let info = await transporter.sendMail(mailOptions);
        return {
            error: false,
            info,
        };
    }
    catch (error) {
        console.log("Error sending mail", error.message);
    }
};
exports.mailer = mailer;
