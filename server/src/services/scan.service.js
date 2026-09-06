const Scan = require("../models/scan.model");
const Product = require("../models/product.model");

const createScan = async ({
    userId,
    productId,
    inputType,
    assessment,
}) => {
    const product = await Product.findById(productId);

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    return await Scan.create({
        user: userId,
        product: productId,
        inputType,
        assessment,
    });
};

const getUserScans = async (userId) => {
    return await Scan.find({
        user: userId,
    })
        .populate("product")
        .sort({
            createdAt: -1,
        });
};

module.exports = {
    createScan,
    getUserScans,
};