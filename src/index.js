const { scrapData } = require("./scraper/scraper");

(async () => {
  try {
    await scrapData();
  } catch (error) {
    console.error("Hubo un error en el proceso de scraping:", error);
  }
})();