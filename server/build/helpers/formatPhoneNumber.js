"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = void 0;
const google_libphonenumber_1 = require("google-libphonenumber");
const phoneNumberUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
const formatPhoneNumber = (phoneNumber, countryCode) => {
    const parsedNumber = phoneNumberUtil.parse(phoneNumber, countryCode);
    return phoneNumberUtil.format(parsedNumber, google_libphonenumber_1.PhoneNumberFormat.E164);
};
exports.formatPhoneNumber = formatPhoneNumber;
