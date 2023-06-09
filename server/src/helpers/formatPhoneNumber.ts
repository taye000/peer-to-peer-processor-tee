import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string
): string => {
  const parsedNumber = phoneNumberUtil.parse(phoneNumber, countryCode);
  return phoneNumberUtil.format(parsedNumber, PhoneNumberFormat.E164);
};
