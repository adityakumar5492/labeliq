const express = require("express");

const {
    createProduct,
    extractProduct,
    getProducts,
    getProductById,
    compareProducts,
} = require("../controllers/product.controller");

const validateProduct = require("../middleware/validateProduct");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
    "/extract",
    protect,
    upload.single("image"),
    extractProduct
);

router.post(
    "/",
    protect,
    validateProduct,
    createProduct
);

router.get("/", getProducts);

router.get(
    "/compare/:productId1/:productId2",
    protect,
    compareProducts
);

router.get("/:id", getProductById);

module.exports = router;