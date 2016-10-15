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

declare class Result {
    date: string;
    weekDay: string;
    price: number;
    currencyCode: string;
}

async function eat(dateFrom: Date | moment.Moment, dateTo: Date | moment.Moment): Promise<Result[]> {
    //因為格式不確定所以指定為 any (即一般 json 物件)
    let data: any = await getAvailability(dateFrom, dateTo);

    let html = data.d;

    // console.log(html);
    // let out = path.join(__dirname, `out_${Date.now()}.html`);
    // fs.writeFileSync(out, html);

    let $ = cheerio.load(html);

    let results: Result[] = [];

    $(".showdateselect").each((i, elem) => {
        //抽出日期 - 星期
        let dayString = $(elem).find(".flighttimeSelect").first().clone().children().remove().end().text();

        //切出日期
        let date = new RegExp("\\d{1,2}\\/\\d{1,2}").exec(dayString)[0];

        //切出星期
        let weekDay = new RegExp("\\(.{3}\\)").exec(dayString)[0].replace(/\(|\)/g, '');

        //抽出價錢
        let priceString = $(elem).find('.price').first().text().replace(/\s/g, '');

        //切出幣別
        let currencyCode = priceString.split('$')[0];

        //切出價錢
        let price = parseFloat(priceString.replace(new RegExp(`${currencyCode}|\\$|,|~`, 'g'), ''));

        results.push({
            date, weekDay, currencyCode, price
        });

    });

    return results;
};

export default async function (dateFrom: Date | moment.Moment = moment().add(1, 'day'), dateTo: Date | moment.Moment = moment().add(2, "day")) {
    let results = await eat(dateFrom, dateTo);
    console.log(results);
    //TODO: 模組主邏輯處理 (資料庫部分)
};