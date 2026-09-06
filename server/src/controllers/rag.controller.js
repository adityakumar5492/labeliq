const pythonService = require("../services/python.service");
const nutritionService = require("../services/nutrition.service");

const askRag = async (req, res, next) => {
    try {
        const {
            question,
            product,
            userPreferences,
        } = req.body;

        if (
            question !== undefined &&
            (
                typeof question !== "string" ||
                !question.trim()
            )
        ) {
            const error = new Error(
                "Question must be a non-empty string"
            );

            error.statusCode = 400;
            throw error;
        }

        if (
            product !== undefined &&
            (
                typeof product !== "object" ||
                product === null
            )
        ) {
            const error = new Error(
                "Product must be an object"
            );

            error.statusCode = 400;
            throw error;
        }

        if (
            !question &&
            !product
        ) {
            const error = new Error(
                "Question or product information is required"
            );

            error.statusCode = 400;
            throw error;
        }

        let nutritionAnalysis = null;

        /*
         * Product analysis flow:
         *
         * Calculate the deterministic LabelIQ assessment
         * before sending the product to Gemini.
         *
         * Gemini explains this result but does not
         * calculate or override it.
         */
        if (product) {
            const goal =
                req.user?.preferences?.goal ||
                userPreferences?.goal ||
                "general";

            nutritionAnalysis =
                nutritionService.analyzeNutrition(
                    product.nutrition || {},
                    goal
                );
        }

        const result =
            await pythonService.runRag({
                question:
                    question?.trim() || null,

                product:
                    product || null,

                userPreferences:
                    userPreferences || null,

                nutritionAnalysis,
            });

        if (!result.success) {
            const error = new Error(
                result.message ||
                    "RAG request failed"
            );

            error.statusCode = 500;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                question:
                    result.question || null,

                answer: result.answer,

                nutritionAnalysis,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    askRag,
};