"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaWrapper = void 0;
const mpesa_node_1 = __importDefault(require("mpesa-node"));
class MpesaWrapper {
    consumerKey;
    consumerSecret;
    shortCode;
    initiatorName;
    lipaNaMpesaShortCode;
    lipaNaMpesaShortPass;
    mpesa;
    constructor({ consumerKey, consumerSecret, shortCode, initiatorName, lipaNaMpesaShortCode, lipaNaMpesaShortPass, }) {
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.shortCode = shortCode;
        this.initiatorName = initiatorName;
        this.lipaNaMpesaShortCode = lipaNaMpesaShortCode;
        this.lipaNaMpesaShortPass = lipaNaMpesaShortPass;
        this.mpesa = new mpesa_node_1.default({
            consumerKey: this.consumerKey,
            consumerSecret: this.consumerSecret,
            shortCode: this.shortCode,
            initiatorName: this.initiatorName,
            lipaNaMpesaShortCode: this.lipaNaMpesaShortCode,
            lipaNaMpesaShortPass: this.lipaNaMpesaShortPass,
        });
    }
    /**
     * It enables user to be to initial mpesa STK push process with phone numnber and specified amount
     * @param stkData This is a request body composed of {
     * phone:  string;
     * amount: string;
     * callbackURl: string;
     * accountNumber: string;
     * }
     * @returns
     */
    async stkPush(stkData) {
        const response = await this.mpesa
            .lipaNaMpesaOnline(stkData.phone, parseFloat(stkData.amount), stkData.callbackUrl, stkData.accountNumber)
            .catch((err) => {
            console.log(err);
            return err["response"];
        });
        // console.log(`stkPush response: ${stkData.accountNumber}` + (JSON.stringify(response.data)));
        const data = {
            checkoutId: response.data.CheckoutRequestID,
            accountNumber: stkData.accountNumber,
            type: "income",
            amount: stkData.amount,
            phone: stkData.phone,
        };
        if (!data["checkoutId"]) {
            return {
                error: "Failed to initiate STK push",
            };
        }
        console.log("data: " + JSON.stringify(data));
        return data; // return data to be saved in the database
    }
    /**
   * Recieves a response from mpesa and returns a response object
   * @param stkPayload
   * @returns
   */
    receivePayloadFromCallbackUrl = async (stkPayload) => {
        const resultDesc = stkPayload["Body"]["stkCallback"]["ResultDesc"].toString();
        console.log("resultDesc: " + resultDesc);
        const status = resultDesc.search(/]/)
            ? resultDesc.substr(resultDesc.search(/]/) + 1)
            : resultDesc;
        const checkoutId = stkPayload["Body"]["stkCallback"]["CheckoutRequestID"];
        let message = null;
        switch (status) {
            case "DS timeout":
                message = `Request failed. M-Pesa didn't respond. Try again in 5 seconds.`;
                break;
            case "SMSC ACK timeout":
                message =
                    "Request failed. You did not respond, may be your phone is not reachable.";
                break;
            case "Request cancelled by user":
                message = "Request cancelled. You cancelled request. Try again.";
                break;
            case "The balance is insufficient for the transaction":
                message = "The balance is insufficient for the transaction. Try again.";
                break;
            case "The service request is processed successfully.":
                message = "Request successful. Transaction has been processed.";
                break;
            default:
                break;
        }
        if (!status.includes("successful")) {
            return {
                data: null,
            };
        }
        const data = stkPayload["Body"]["stkCallback"]["CallbackMetadata"]["Item"];
        return {
            amount: data.find((a) => a.Name === "Amount").Value,
            phone: data.find((a) => a.Name === "PhoneNumber").Value,
            transactionId: data.find((a) => a.Name === "MpesaReceiptNumber").Value,
            checkoutId,
            moreData: data,
        };
    };
}
exports.MpesaWrapper = MpesaWrapper;
