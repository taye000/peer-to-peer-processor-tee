"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sms = void 0;
const africastalking_ts_1 = require("africastalking-ts");
const client = new africastalking_ts_1.Client({
    apiKey: process.env.AFRICASTALKING_APIKEY,
    username: process.env.AFRICASTALKING_USERNAME,
});
const sms = async (phoneNumber, message) => {
    client
        .sendSms({
        to: [phoneNumber],
        message,
    })
        .then((response) => console.log("sms sent", response))
        .catch((error) => console.error("error sending sms", error.message));
};
exports.sms = sms;
