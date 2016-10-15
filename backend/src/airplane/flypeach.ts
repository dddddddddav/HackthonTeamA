import request = require('request');
import cheerio = require('cheerio');
import fs = require('fs');
import path = require('path');
import moment = require('moment');

async function getAvailability(dateFrom: Date | moment.Moment, dateTo: Date | moment.Moment) {
    let payload = {
        "origin": "TPE", //出發
        "destination": "HND", //目的
        "dateFrom": moment(dateFrom).format('YYYYMMDD'), "dateTo": moment(dateTo).format('YYYYMMDD'), //兩個時間欄位
        "iOneWay": "false", "iFlightOnly": "0",
        "iAdult": 1, //成人票張數 
        "iChild": 0, //兒童票張數 
        "iInfant": 0, "BoardingClass": "",
        "CurrencyCode": "TWD", //幣別 
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
}

(async () => {
    try {
        let data: any = await getAvailability(new Date(2016, 10, 17), new Date(2016, 10, 18));

        let html = data.d;
        let out = path.join(__dirname, `out_${Date.now()}.html`);

        fs.writeFileSync(out, html);
    } catch (e) {
        console.log('error => ', e);
    }
})();