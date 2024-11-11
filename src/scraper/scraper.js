const { launchBrowser, waitForSelector } = require("../utils/pupperterUtils");
const { URL_FOR_SCRAP } = require("../config/config");

const openMenu = async (page, selector) => {
  await waitForSelector(page, selector);
  await page.click(selector);
  console.log("MY_LOG: EFECTUANDO SCRAP");
};

const getProductsData = async (page) => {
  return await page.evaluate(() => {
    const productElements = document.querySelectorAll(
      ".showcase-grid > div > .Showcase__content"
    );

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
  });
};

const getTextContentFromSelector = async (page, selector) => {
  await waitForSelector(page, selector);
  return await page.evaluate(
    (selector) =>
      [...document.querySelectorAll(selector)].map((el) => el.innerText.trim()),
    selector
  );
};

const formatCategories = async (categories) => {
  return await Promise.all(
    categories.map(async (category) =>
      category
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ /g, "-")
    )
  );
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

const scrapCategoryPage = async (page, categoriesUrl) => {
  let allProducts = []
  for (const url of categoriesUrl) {
    if (url === "supermercado" || url === "marcas-aliadas") continue;
    try {
      const fullUrl = `${URL_FOR_SCRAP}${url}`;
      const currentUrl = await navigateToUrl(page, fullUrl);

      const products = await collectProductsFromPage(page);

      allProducts = allProducts.concat(products)
    } catch (error) {
      console.error(`Error al navegar a ${url}:`, error);
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
