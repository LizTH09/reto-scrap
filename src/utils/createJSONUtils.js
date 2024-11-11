const fs = require("fs").promises;

const writeProductsToFile = async (categoryUrl, products, filePath) => {
  try {
    const isFileExists = await fileExists(filePath);
    let data = [];

    if (!isFileExists) {
      data = [{ category: categoryUrl, quantity: products.length, products }];
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return;
    }

    const existingData = JSON.parse(await fs.readFile(filePath, "utf-8"));

    const categoryIndex = existingData.findIndex(
      (item) => item.url === categoryUrl
    );

    if (categoryIndex !== -1) {
      existingData[categoryIndex].products =
        existingData[categoryIndex].products.concat(products);
    } else {
      existingData.push({ category: categoryUrl, quantity: products.length ,products });
    }

    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error("Error al escribir en el archivo JSON:", error);
  }
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath); 
    return true; 
  } catch (error) {
    return false;
  }
};

module.exports = {
  writeProductsToFile,
};
