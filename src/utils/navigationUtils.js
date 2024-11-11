const { waitForSelector } = require("./pupperterUtils");

const elementExist = async (page, selector) => {
  try {
    return await page.evaluate((selector) => {
      const element = document.querySelector(selector);

      return element && !element.classList.contains("disabled");
    }, selector);
  } catch (error) {
    console.error(`No se pudo verificar si existe "${selector}":`, error);
    return false;
  }
};

const navigateToUrl = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await waitForSelector(page, ".showcase-grid > div > .Showcase__content");
    return page.url();
  } catch (error) {
    throw new Error(`Error durante la navegación a ${url}: ${error.message}`);
  }
};

const openMenu = async (page, selector) => {
  await waitForSelector(page, selector);
  await page.click(selector);
  console.log("MY_LOG: EFECTUANDO SCRAP");
};


const pressNextButton = async (page, selector) => {
  await waitForSelector(page, selector);
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, selector);

  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      }
      return false;
    },
    {},
    selector
  );

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    page.locator(selector).click(),
  ]);
};

module.exports =  {
  elementExist,
  navigateToUrl,
  openMenu,
  pressNextButton,
};
