const { scrapeData } = require("./scraper/scraper");

(async () => {
  try {
    await scrapeData();
  } catch (error) {
    console.error("Hubo un error en el proceso de scraping:", error);
  }
})();