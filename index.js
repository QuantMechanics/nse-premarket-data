const puppeteer = require('puppeteer');
const { PendingXHR } = require('pending-xhr-puppeteer');
const { Parser } = require('json2csv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: '/root/algo/pre_data.csv',
    header: [
      {id: 'symbol', title: 'symbol'},
      {id: 'previousClose', title: 'previousClose'},
      {id: 'change', title: 'change'},
      {id: 'pChange', title: 'pChange'},
      {id: 'yearHigh', title: 'yearHigh'},
      {id: 'yearLow', title: 'yearLow'},
      {id: 'iep', title: 'iep'},
      {id: 'purpose', title: 'purpose'},
      {id: 'marketCap', title: 'marketCap'},


    ]
  });

const dt = new Date();

let run_date= dt.getDate()+'-'+(dt.getMonth()+1)+'-'+dt.getFullYear();

(async () => {
  const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox']});
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.setRequestInterception(true)
  const pendingXHR = new PendingXHR(page);

  await page.setExtraHTTPHeaders({
    'authority': 'www.nseindia.com',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
    'sec-ch-ua-mobile': '?0',
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'referer': 'https://www.google.com/',
    'accept-language': 'en-US,en;q=0.9'
  });
  page.on('request', async (request) => {
    if (request.resourceType() == 'xhr') {
      await request.abort()
    } else {
      await request.continue()
    }
  })
//   await page.setViewport({ width: 1280, height: 800 })
  await page.goto('https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market',{waitUntil:'domcontentloaded'})
  await page.goto('https://www.nseindia.com/api/market-data-pre-open?key=FO',{waitUntil:'domcontentloaded'})


//   await page.select('#select-pre select', 'FO')
let bodyHTML = await page.evaluate(() => document.body.textContent);

json_data= JSON.parse(bodyHTML)
const fields = ['metadata'];
const opts = { fields };
const parser = new Parser(opts);

final_data=[]

json_data['data'].forEach(element => {
    final_data.push(element['metadata'])
    
});
//  console.log(final_data)


 csvWriter
 .writeRecords(final_data)
 .then(()=> console.log('pre_market_data saved : '+run_date));
//   await page.waitForSelector('#livePreTable')
//   await page.on('response', async (response) => {    
//             data =await response.json();
//             console.log(data)
//     }); 
  // await page.screenshot({ path: 'nytimes.png', fullPage: true })
  
  await browser.close()
})()
