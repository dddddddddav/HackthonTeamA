"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const request = require('request');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
function getAvailability(dateFrom, dateTo) {
    return __awaiter(this, void 0, void 0, function* () {
        let payload = {
            "origin": "TPE",
            "destination": "HND",
            "dateFrom": moment(dateFrom).format('YYYYMMDD'), "dateTo": moment(dateTo).format('YYYYMMDD'),
            "iOneWay": "false", "iFlightOnly": "0",
            "iAdult": 1,
            "iChild": 0,
            "iInfant": 0, "BoardingClass": "",
            "CurrencyCode": "TWD",
            "strPromoCode": "", "SearchType": "FARE", "iOther": 0, "otherType": "", "strIpAddress": ""
        };
        let url = "https://book.flypeach.com/WebService/B2cService.asmx/GetAvailability";
        return new Promise((resolve, reject) => {
            request.post(url, { json: payload }, (err, res, data) => {
                if (err) {
                    return reject({
                        statusCode: 500,
                        statusMessage: err.message
                    });
                }
                if (!data) {
                    return reject({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage
                    });
                }
                resolve(data);
            });
        });
    });
}
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        let data = yield getAvailability(new Date(2016, 10, 17), new Date(2016, 10, 18));
        let html = data.d;
        let out = path.join(__dirname, `out_${Date.now()}.html`);
        fs.writeFileSync(out, html);
    }
    catch (e) {
        console.log('error => ', e);
    }
}))();
//# sourceMappingURL=flypeach.js.map