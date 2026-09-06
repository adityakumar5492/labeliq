const Product = require("../models/product.model");

const createProduct = async (productData) => {
    return await Product.create(productData);
};

const getProducts = async () => {
    return await Product.find().sort({
        createdAt: -1,
    });
};

const getProductById = async (productId) => {
    return await Product.findById(productId);
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
};