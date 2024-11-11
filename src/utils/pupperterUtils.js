const puppeteer = require("puppeteer");

const launchBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  page.on("console", (msg) => {
    const text = msg.text();

    if (text.startsWith("MY_LOG:")) {
      console.log(">>>>> ", text);
    }
  });

  return { browser, page };
};

const waitForSelector = async (page, selector) => {
  if (!page || typeof page.waitForSelector !== "function") {
    throw new Error('El objeto "page" no es una instancia válida de Puppeteer');
  }

  await page.waitForSelector(selector, { visible: true });
};

module.exports = {
  launchBrowser,
  waitForSelector,
};
