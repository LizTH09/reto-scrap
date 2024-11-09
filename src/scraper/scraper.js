const { launchBrowser, waitForSelector } = require("../utils/pupperterUtils");
const { URL_FOR_SCRAP } = require("../config/config");

const openMenu = async (page, selector) => {
  await waitForSelector(page, selector);
  await page.click(selector);
  console.log("MY_LOG: EFECTUANDO SCRAP");
};

const getTextContentFromSelector = async (page, selector) => {
  await waitForSelector(page, selector);
  return page.evaluate((selector) => 
    [...document.querySelectorAll(selector)].map((el) => el.innerText.trim())
  , selector);
};

const formatCategories = async (categories) => {
  return Promise.all(categories.map(async (category) => 
    category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, "-")
  ));
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

const getProductsData = async (page) => {
  return page.evaluate(() => {
    const productElements = document.querySelectorAll(".showcase-grid > div > .Showcase__content");
    return [...productElements].map((product) => ({
      name: product.querySelector(".Showcase__name")?.innerText || "Sin nombre",
      seller: product.querySelector(".Showcase__SellerName")?.innerText || "Sin vendedor",
      price: product.querySelector(".Showcase__salePrice")?.innerText || "Sin precio",
    }));
  });
};

const collectProductsFromPage = async (page) => {
  const products = [];
  const newProducts = await getProductsData(page);
  if (newProducts.length) products.push(...newProducts);
  return products;
};

const scrapeCategoryPage = async (page, categoriesUrl) => {
  for (const url of categoriesUrl) {
    if (url === "supermercado" || url === "marcas-aliadas") continue;
    try {
      const fullUrl = `${URL_FOR_SCRAP}${url}`;
      const currentUrl = await navigateToUrl(page, fullUrl);
      console.log("MY_LOG: Estamos en: ", currentUrl);
      const products = await collectProductsFromPage(page);
      console.log("MY_LOG: Productos encontrados:", products);
    } catch (error) {
      console.error(`Error al navegar a ${url}:`, error);
    }
  }
};

const scrapeCategories = async (page) => {
  const categorySelector = 'span[data-section="categories"]';
  const menuSelectorForWait = "#menu-button-desktop";
  try {
    await openMenu(page, menuSelectorForWait);
    const categories = await getTextContentFromSelector(page, categorySelector);
    const categoriesUrl = await formatCategories(categories);
    await scrapeCategoryPage(page, categoriesUrl);
  } catch (error) {
    console.error("Error durante el scraping:", error);
    throw error;
  }
};

const scrapeData = async () => {
  const { browser, page } = await launchBrowser();
  try {
    await page.goto(URL_FOR_SCRAP);
    await scrapeCategories(page);
  } catch (error) {
    console.error("Error durante el scraping:", error);
    throw error;
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeData };