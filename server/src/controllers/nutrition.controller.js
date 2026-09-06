const Product = require("../models/product.model");
const nutritionService = require("../services/nutrition.service");

const analyzeProductNutrition = async (
    req,
    res,
    next
) => {
    try {
        const { productId } = req.params;

        const product =
            await Product.findById(productId);

        if (!product) {
            const error = new Error(
                "Product not found"
            );

            error.statusCode = 404;
            throw error;
        }

        const goal =
            req.user?.preferences?.goal ||
            "general";

        const requestedServings =
            req.query.servings;

        const servings =
            requestedServings === undefined
                ? 1
                : Number(requestedServings);

        if (
            !Number.isFinite(servings) ||
            servings <= 0
        ) {
            const error = new Error(
                "Servings must be a positive number."
            );

            error.statusCode = 400;
            throw error;
        }

        const servingsPerPackage =
            nutritionService.calculateServingsPerPackage(
                product.servingSize,
                product.packageSize
            );

        const analysis =
            nutritionService.analyzeMultiServingNutrition(
                {
                    nutrition:
                        product.nutrition,
                    servings,
                    goal,
                }
            );

        res.status(200).json({
            success: true,
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    brand: product.brand,
                    servingSize:
                        product.servingSize,
                    packageSize:
                        product.packageSize,
                    servingsPerPackage,
                },

                nutrition:
                    analysis.nutrition,

                servings:
                    analysis.servings,

                analysis:
                    analysis.analysis,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    analyzeProductNutrition,
};