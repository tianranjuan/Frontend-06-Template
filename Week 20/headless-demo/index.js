const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://baidu.com');
  const input = await page.$("input");
  console.log(input.asElement());
  await browser.close();
})();