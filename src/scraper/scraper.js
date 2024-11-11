const { launchBrowser } = require("../utils/pupperterUtils");
const { formatCategories } = require("../utils/formatterUtils");
const { openMenu, navigateToUrl } = require("../utils/navigationUtils");
const { getTextContentFromSelector, collectProductsFromPage } = require("../utils/productDataUtils");
const { writeProductsToFile } = require("../utils/createJSONUtils");
const { URL_FOR_SCRAP } = require("../config/config");

const scrapCategoryPage = async (page, categoriesUrl) => {
  let allProducts = [];
  for (const category of categoriesUrl) {
    if (category === "supermercado" || category === "marcas-aliadas") continue;
    try {
      const fullUrl = `${URL_FOR_SCRAP}${category}`;
      await navigateToUrl(page, fullUrl);

      const products = await collectProductsFromPage(page);
      await writeProductsToFile(category, products, "./productos.json");

      allProducts = allProducts.concat(products);
      
    } catch (error) {
      console.error(`Error al navegar a ${category}:`, error);
    }
  }
  console.log("MY_LOG: All Products: ", allProducts);
};

const scrapCategories = async (page) => {
  const categorySelector = 'span[data-section="categories"]';
  const menuSelectorForWait = "#menu-button-desktop";
  try {
    await openMenu(page, menuSelectorForWait);
    const categories = await getTextContentFromSelector(page, categorySelector);
    const categoriesUrl = await formatCategories(categories);
    await scrapCategoryPage(page, categoriesUrl);
  } catch (error) {
    console.error("Error durante el scraping:", error);
    throw error;
  }
};

const scrapData = async () => {
  const { browser, page } = await launchBrowser();
  try {
    await page.goto(URL_FOR_SCRAP);
    await scrapCategories(page);
  } catch (error) {
    console.error("Error durante el scraping:", error);
    throw error;
  } finally {
    await browser.close();
  }
};

module.exports = { scrapData };
