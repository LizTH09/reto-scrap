const { elementExist, pressNextButton } = require("./navigationUtils");
const { waitForSelector } = require("./pupperterUtils");

const collectProductsFromPage = async (page) => {
  let products = [];
  let exist = true;
  try {
    do {
      products = products.concat(await getProductsData(page));
      exist = await elementExist(page, ".page-control.next");
      if (exist) await pressNextButton(page, ".page-control.next");
    } while (exist);

    return products;
  } catch (error) {
    return products;
  }
};

const getProductsData = async (page) => {
    const selectorData = ".showcase-grid > div > .Showcase__content";
    await waitForSelector(page, selectorData);
  
    return await page.evaluate((selectorData) => {
      const productElements = document.querySelectorAll(selectorData);
  
      //Se desestructura para converitr de NodeList a un array de Node Elements
      return [...productElements].map((product) => ({
        name: product.querySelector(".Showcase__name")?.innerText || "Sin nombre",
        seller:
          product.querySelector(".Showcase__SellerName")?.innerText ||
          "Sin vendedor",
        price:
          product.querySelector(".Showcase__salePrice")?.innerText ||
          "Sin precio",
      }));
    }, selectorData);
  };
  
  const getTextContentFromSelector = async (page, selector) => {
    await waitForSelector(page, selector);
    return await page.evaluate(
      (selector) =>
        [...document.querySelectorAll(selector)].map((el) => el.innerText.trim()),
      selector
    );
  };

  module.exports = {
    getProductsData,
    getTextContentFromSelector,
    collectProductsFromPage
  }