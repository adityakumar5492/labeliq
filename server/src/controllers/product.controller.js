const productService = require("../services/product.service");

const {
    runExtraction,
} = require("../services/python.service");

const {
    analyzeNutrition,
    compareNutrition,
} = require("../services/nutrition.service");


// Create a new product
const createProduct = async (req, res, next) => {
    try {
        const product =
            await productService.createProduct(
                req.body
            );

        res.status(201).json({
            success: true,
            message:
                "Product created successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
};


// Extract product information from image
const extractProduct = async (
    req,
    res,
    next
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Product label image is required.",
            });
        }

        const result =
            await runExtraction({
                imageBuffer:
                    req.file.buffer,
                mimeType:
                    req.file.mimetype,
            });


        /*
         * runExtraction() returns the JSON
         * produced by the Python extraction script.
         *
         * If Gemini/Python reports a failure,
         * do not incorrectly return success: true.
         */
        if (
            result &&
            result.success === false
        ) {
            return res.status(502).json({
                success: false,
                message:
                    result.message ||
                    "Product information extraction failed.",
            });
        }


        res.status(200).json({
            success: true,
            message:
                "Product information extracted successfully.",
            data: result?.data || result,
        });
    } catch (error) {
        next(error);
    }
};


// Get all products
const getProducts = async (req, res, next) => {
    try {
        const products =
            await productService.getProducts();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};


// Get product by ID
const getProductById = async (
    req,
    res,
    next
) => {
    try {
        const product =
            await productService.getProductById(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};


// Compare two products
const compareProducts = async (
    req,
    res,
    next
) => {
    try {
        const {
            productId1,
            productId2,
        } = req.params;


        /*
         * The same product cannot be compared
         * with itself.
         */
        if (
            productId1 === productId2
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select two different products.",
            });
        }


        /*
         * Fetch both products in parallel.
         */
        const [
            product1,
            product2,
        ] = await Promise.all([
            productService.getProductById(
                productId1
            ),
            productService.getProductById(
                productId2
            ),
        ]);


        if (
            !product1 ||
            !product2
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "One or both products not found.",
            });
        }


        /*
         * The user's selected goal determines
         * how the comparison should be weighted.
         *
         * Example:
         * low-sugar -> sugar gets highest priority
         * high-protein -> protein gets highest priority
         */
        const goal =
            req.user?.preferences?.goal ||
            "general";


        /*
         * Keep the existing single-product
         * nutrition analysis.
         *
         * This remains the source of:
         * - grade
         * - score
         * - assessment
         * - flags
         * - goal alignment
         */
        const analysis1 =
            analyzeNutrition(
                product1.nutrition || {},
                goal
            );

        const analysis2 =
            analyzeNutrition(
                product2.nutrition || {},
                goal
            );


        /*
         * New deterministic comparison engine.
         *
         * It compares the actual nutrition
         * metrics instead of simply comparing
         * the existing product grades.
         */
        const comparisonResult =
            compareNutrition({
                nutrition1:
                    product1.nutrition || {},

                nutrition2:
                    product2.nutrition || {},

                goal,
            });


        /*
         * Convert the comparison engine's
         * product1/product2 winner into the
         * actual MongoDB product ID.
         *
         * This makes the frontend able to
         * identify the winning product directly.
         */
        let winner = null;

        if (
            comparisonResult.winner ===
            "product1"
        ) {
            winner =
                product1._id.toString();
        } else if (
            comparisonResult.winner ===
            "product2"
        ) {
            winner =
                product2._id.toString();
        } else if (
            comparisonResult.winner ===
            "tie"
        ) {
            winner = "tie";
        }


        /*
         * Build a user-friendly comparison
         * message.
         */
        let reason =
            comparisonResult.message;


        if (
            winner &&
            winner !== "tie" &&
            comparisonResult.reasons?.length
        ) {
            reason =
                comparisonResult.reasons
                    .map(
                        (item) =>
                            item.message
                    )
                    .join(" ");
        }


        res.status(200).json({
            success: true,

            data: {
                goal,

                products: [
                    {
                        id: product1._id,
                        name: product1.name,
                        brand: product1.brand,
                        servingSize:
                            product1.servingSize,
                        nutrition:
                            product1.nutrition,
                        analysis: analysis1,
                    },

                    {
                        id: product2._id,
                        name: product2.name,
                        brand: product2.brand,
                        servingSize:
                            product2.servingSize,
                        nutrition:
                            product2.nutrition,
                        analysis: analysis2,
                    },
                ],

                comparison: {
                    winner,

                    /*
                     * Comparison-specific scores.
                     *
                     * These are different from the
                     * individual product grades/scores.
                     */
                    product1Score:
                        comparisonResult.product1Score,

                    product2Score:
                        comparisonResult.product2Score,

                    confidence:
                        comparisonResult.confidence,

                    scoreDifference:
                        comparisonResult.scoreDifference,

                    reason,

                    /*
                     * Strongest advantages of
                     * the winning product.
                     */
                    advantages:
                        comparisonResult.advantages,

                    /*
                     * Important tradeoffs.
                     *
                     * Example:
                     * Product 2 wins overall but
                     * Product 1 has more protein.
                     */
                    tradeoffs:
                        comparisonResult.tradeoffs,

                    /*
                     * Detailed metric-by-metric
                     * comparison for the UI.
                     */
                    metrics:
                        comparisonResult.metrics,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createProduct,
    extractProduct,
    getProducts,
    getProductById,
    compareProducts,
};