const formatCategories = async (categories) => {
  return await Promise.all(
    categories.map(async (category) =>
      category
        .normalize("NFD") // Elimina los acentos
        .replace(/[\u0300-\u036f]/g, "") // Elimina los caracteres de acentuación
        .toLowerCase() // Convierte a minúsculas
        .replace(/,/g, "-") // Reemplaza las comas por guiones
        .replace(/\s+/g, "-") // Reemplaza los espacios por guiones
        .replace(/-+/g, "-") // Elimina guiones consecutivos (si hay varios)
        .replace(/^-+/, "") // Elimina guiones al principio
        .replace(/-+$/, "") // Elimina guiones al final
    )
  );
};

module.exports = { formatCategories };
