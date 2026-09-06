const calculateDailyContribution = (
    value,
    dailyValue
) => {
    if (
        value === undefined ||
        value === null ||
        dailyValue === undefined ||
        dailyValue === null ||
        dailyValue <= 0
    ) {
        return null;
    }

    return Math.round(
        (value / dailyValue) * 100
    );
};


const getMissingNutritionFields = (
    nutrition
) => {
    const requiredFields = [
        "calories",
        "protein",
        "carbohydrates",
        "totalFat",
        "saturatedFat",
        "sugar",
        "fiber",
        "sodium",
    ];

    return requiredFields.filter(
        (field) =>
            nutrition[field] === undefined ||
            nutrition[field] === null
    );
};


/*
 * Direction of "good" for each nutrient - used to decide how a
 * %DV figure should be colored.
 *
 * "lower": less of this is better (sugar, sodium, saturated fat,
 * calories, carbs, total fat). A high %DV is a warning sign.
 *
 * "higher": more of this is better (protein, fiber). A low %DV is
 * simply "not much of a good thing" - it is not itself a health
 * risk the way excess sodium is, so it is never flagged as "high".
 */
const nutrientDirection = {
    calories: "lower",
    protein: "higher",
    carbohydrates: "lower",
    totalFat: "lower",
    saturatedFat: "lower",
    sugar: "lower",
    fiber: "higher",
    sodium: "lower",
};


/*
 * Converts a nutrient's %DV into a good/moderate/high (or
 * good/moderate/low, for "higher is better" nutrients) tier.
 *
 * This is a transparent, deterministic threshold on numbers already
 * computed elsewhere in this file (dailyContribution) - it does not
 * introduce any new claim about the product.
 */
const getNutrientLevel = (field, percentDV) => {
    if (percentDV === null || percentDV === undefined) {
        return null;
    }

    const direction =
        nutrientDirection[field] || "lower";

    if (direction === "lower") {
        if (percentDV <= 33) return "good";
        if (percentDV <= 66) return "moderate";
        return "high";
    }

    if (percentDV >= 66) return "good";
    if (percentDV >= 33) return "moderate";
    return "low";
};


const calculateGoalAlignment = (
    nutrition,
    goal
) => {
    if (!goal || goal === "general") {
        return {
            goal,
            status: "neutral",
            message:
                "No specific nutrition goal was selected.",
        };
    }

    if (goal === "low-sugar") {
        if (
            nutrition.sugar === undefined ||
            nutrition.sugar === null
        ) {
            return {
                goal,
                status: "insufficient-data",
                message:
                    "Sugar information is not available.",
            };
        }

        if (nutrition.sugar <= 5) {
            return {
                goal,
                status: "strong",
                message:
                    "The sugar value is relatively low per serving.",
            };
        }

        if (nutrition.sugar <= 12) {
            return {
                goal,
                status: "moderate",
                message:
                    "The sugar value may fit your goal depending on the rest of your diet.",
            };
        }

        return {
            goal,
            status: "attention",
            message:
                "The sugar value is relatively high per serving for a low-sugar focus.",
        };
    }

    if (goal === "low-sodium") {
        if (
            nutrition.sodium === undefined ||
            nutrition.sodium === null
        ) {
            return {
                goal,
                status: "insufficient-data",
                message:
                    "Sodium information is not available.",
            };
        }

        if (nutrition.sodium <= 140) {
            return {
                goal,
                status: "strong",
                message:
                    "The sodium value is relatively low per serving.",
            };
        }

        if (nutrition.sodium <= 400) {
            return {
                goal,
                status: "moderate",
                message:
                    "The sodium value provides a moderate contribution per serving.",
            };
        }

        return {
            goal,
            status: "attention",
            message:
                "The sodium value is relatively high per serving for a low-sodium focus.",
        };
    }

    if (goal === "high-protein") {
        if (
            nutrition.protein === undefined ||
            nutrition.protein === null
        ) {
            return {
                goal,
                status: "insufficient-data",
                message:
                    "Protein information is not available.",
            };
        }

        if (nutrition.protein >= 15) {
            return {
                goal,
                status: "strong",
                message:
                    "The product provides a relatively high amount of protein per serving.",
            };
        }

        if (nutrition.protein >= 8) {
            return {
                goal,
                status: "moderate",
                message:
                    "The product provides a moderate amount of protein per serving.",
            };
        }

        return {
            goal,
            status: "limited",
            message:
                "The product provides a relatively small amount of protein per serving.",
        };
    }

    if (goal === "high-fiber") {
        if (
            nutrition.fiber === undefined ||
            nutrition.fiber === null
        ) {
            return {
                goal,
                status: "insufficient-data",
                message:
                    "Fiber information is not available.",
            };
        }

        if (nutrition.fiber >= 5) {
            return {
                goal,
                status: "strong",
                message:
                    "The product provides a relatively high amount of fiber per serving.",
            };
        }

        if (nutrition.fiber >= 2.5) {
            return {
                goal,
                status: "moderate",
                message:
                    "The product provides a moderate amount of fiber per serving.",
            };
        }

        return {
            goal,
            status: "limited",
            message:
                "The product provides a relatively small amount of fiber per serving.",
        };
    }

    return {
        goal,
        status: "neutral",
        message:
            "No specific goal assessment is available.",
    };
};


const calculateGrade = (
    nutrition,
    flags,
    missingData
) => {
    /*
     * This is a transparent product heuristic.
     * It is not a medical or clinical score.
     */

    if (missingData.length >= 5) {
        return {
            grade: null,
            score: null,
            confidence: "low",
        };
    }

    let score = 100;

    if (
        nutrition.sugar !== undefined &&
        nutrition.sugar !== null
    ) {
        if (nutrition.sugar >= 15) {
            score -= 20;
        } else if (nutrition.sugar >= 10) {
            score -= 10;
        }
    }

    if (
        nutrition.sodium !== undefined &&
        nutrition.sodium !== null
    ) {
        if (nutrition.sodium >= 600) {
            score -= 20;
        } else if (nutrition.sodium >= 400) {
            score -= 10;
        }
    }

    if (
        nutrition.saturatedFat !== undefined &&
        nutrition.saturatedFat !== null
    ) {
        if (nutrition.saturatedFat >= 5) {
            score -= 15;
        } else if (
            nutrition.saturatedFat >= 3
        ) {
            score -= 7;
        }
    }

    if (
        nutrition.fiber !== undefined &&
        nutrition.fiber !== null &&
        nutrition.fiber >= 3
    ) {
        score += 5;
    }

    if (
        nutrition.protein !== undefined &&
        nutrition.protein !== null &&
        nutrition.protein >= 10
    ) {
        score += 5;
    }

    score = Math.max(
        0,
        Math.min(100, score)
    );

    let grade;

    if (score >= 85) {
        grade = "A";
    } else if (score >= 70) {
        grade = "B";
    } else if (score >= 55) {
        grade = "C";
    } else if (score >= 40) {
        grade = "D";
    } else {
        grade = "E";
    }

    return {
        grade,
        score,
        confidence:
            missingData.length === 0
                ? "high"
                : "moderate",
    };
};


const determineAssessment = ({
    grade,
    goalAlignment,
    missingData,
}) => {
    if (
        !grade ||
        missingData.length >= 5
    ) {
        return "insufficient-data";
    }

    if (
        goalAlignment?.status ===
        "attention"
    ) {
        return "occasional";
    }

    if (
        grade === "A" ||
        grade === "B"
    ) {
        return "everyday";
    }

    if (grade === "C") {
        return "regular";
    }

    return "occasional";
};


const analyzeNutrition = (
    nutrition = {},
    goal = "general"
) => {
    const dailyValues = {
        calories: 2000,
        protein: 50,
        carbohydrates: 275,
        totalFat: 78,
        saturatedFat: 20,
        fiber: 28,
        sodium: 2300,
        sugar: 50,
    };

    const contribution = {};

    for (const field of Object.keys(
        dailyValues
    )) {
        if (
            nutrition[field] !== undefined &&
            nutrition[field] !== null
        ) {
            contribution[field] =
                calculateDailyContribution(
                    nutrition[field],
                    dailyValues[field]
                );
        }
    }

    const nutrientLevels = {};

    for (const field of Object.keys(
        dailyValues
    )) {
        if (
            contribution[field] !== undefined &&
            contribution[field] !== null
        ) {
            nutrientLevels[field] =
                getNutrientLevel(
                    field,
                    contribution[field]
                );
        }
    }

    const flags = [];

    if (
        nutrition.sugar !== undefined &&
        nutrition.sugar >= 15
    ) {
        flags.push({
            nutrient: "sugar",
            level: "high",
            message:
                "This product contains a relatively high amount of sugar per serving.",
        });
    }

    if (
        nutrition.sodium !== undefined &&
        nutrition.sodium >= 600
    ) {
        flags.push({
            nutrient: "sodium",
            level: "high",
            message:
                "This product contains a relatively high amount of sodium per serving.",
        });
    }

    if (
        nutrition.saturatedFat !==
            undefined &&
        nutrition.saturatedFat >= 5
    ) {
        flags.push({
            nutrient: "saturatedFat",
            level: "high",
            message:
                "This product contains a relatively high amount of saturated fat per serving.",
        });
    }

    const missingData =
        getMissingNutritionFields(
            nutrition
        );

    const goalAlignment =
        calculateGoalAlignment(
            nutrition,
            goal
        );

    const gradeResult =
        calculateGrade(
            nutrition,
            flags,
            missingData
        );

    const assessment =
        determineAssessment({
            grade: gradeResult.grade,
            goalAlignment,
            missingData,
        });

    const reasons = [];

    if (flags.length > 0) {
        reasons.push(
            ...flags.map(
                (flag) =>
                    flag.message
            )
        );
    }

    if (
        goalAlignment?.message &&
        goal !== "general"
    ) {
        reasons.push(
            goalAlignment.message
        );
    }

    if (missingData.length > 0) {
        reasons.push(
            `${missingData.length} nutrition field(s) were not provided.`
        );
    }

    return {
        dailyContribution: contribution,

        nutrientLevels,

        flags,

        missingData,

        grade: gradeResult.grade,

        score: gradeResult.score,

        confidence:
            gradeResult.confidence,

        assessment,

        goalAlignment,

        reasons,
    };
};


/*
 * Comparison weights.
 *
 * The weights decide how important each nutrition
 * metric is when comparing two products.
 *
 * All weights add up to 100.
 *
 * General:
 * Balanced nutrition comparison.
 *
 * Goal-specific:
 * The selected user goal gets the strongest weight.
 */
const comparisonWeights = {
    general: {
        calories: 10,
        protein: 15,
        carbohydrates: 7,
        totalFat: 8,
        saturatedFat: 15,
        sugar: 20,
        fiber: 10,
        sodium: 15,
    },

    "low-sugar": {
        calories: 10,
        protein: 10,
        carbohydrates: 5,
        totalFat: 5,
        saturatedFat: 15,
        sugar: 40,
        fiber: 5,
        sodium: 10,
    },

    "low-sodium": {
        calories: 10,
        protein: 10,
        carbohydrates: 5,
        totalFat: 5,
        saturatedFat: 15,
        sugar: 10,
        fiber: 5,
        sodium: 40,
    },

    "high-protein": {
        calories: 10,
        protein: 40,
        carbohydrates: 5,
        totalFat: 5,
        saturatedFat: 10,
        sugar: 10,
        fiber: 10,
        sodium: 10,
    },

    "high-fiber": {
        calories: 10,
        protein: 15,
        carbohydrates: 5,
        totalFat: 5,
        saturatedFat: 10,
        sugar: 10,
        fiber: 40,
        sodium: 5,
    },
};


/*
 * Defines whether a higher or lower value is
 * considered better for comparison.
 */
const comparisonDirection = {
    calories: "lower",
    protein: "higher",
    carbohydrates: "lower",
    totalFat: "lower",
    saturatedFat: "lower",
    sugar: "lower",
    fiber: "higher",
    sodium: "lower",
};


/*
 * Nutrition fields used for comparison.
 */
const comparisonNutritionFields = [
    "calories",
    "protein",
    "carbohydrates",
    "totalFat",
    "saturatedFat",
    "sugar",
    "fiber",
    "sodium",
];


/*
 * Converts package/serving units into a common
 * base unit.
 *
 * Supported:
 * g  -> g
 * kg -> g
 * ml -> ml
 * l  -> ml
 * piece -> piece
 */
const convertToBaseUnit = (
    value,
    unit
) => {
    const numericValue = Number(value);

    if (
        value === undefined ||
        value === null ||
        !unit ||
        !Number.isFinite(numericValue) ||
        numericValue < 0
    ) {
        return null;
    }

    switch (unit) {
        case "g":
            return {
                value: numericValue,
                unit: "g",
            };

        case "kg":
            return {
                value: numericValue * 1000,
                unit: "g",
            };

        case "ml":
            return {
                value: numericValue,
                unit: "ml",
            };

        case "l":
            return {
                value: numericValue * 1000,
                unit: "ml",
            };

        case "piece":
            return {
                value: numericValue,
                unit: "piece",
            };

        default:
            return null;
    }
};


/*
 * Normalizes nutrition values to a common basis.
 *
 * Weight products:
 *     per serving -> per 100g
 *
 * Liquid products:
 *     per serving -> per 100ml
 *
 * Piece-based products:
 *     normalization is not possible unless the
 *     serving itself has a compatible measurable unit.
 *
 * Nutrition stored in Product is assumed to be
 * per serving.
 */
const normalizeNutritionPer100 = (
    nutrition = {},
    servingSize
) => {
    if (!servingSize) {
        return null;
    }

    const serving = convertToBaseUnit(
        servingSize.value,
        servingSize.unit
    );

    if (
        !serving ||
        serving.value <= 0
    ) {
        return null;
    }

    if (
        serving.unit !== "g" &&
        serving.unit !== "ml"
    ) {
        return null;
    }

    const targetUnit = serving.unit;
    const targetAmount = 100;

    const normalized = {};

    for (const field of comparisonNutritionFields) {
        if (
            nutrition[field] === undefined ||
            nutrition[field] === null
        ) {
            continue;
        }

        const numericValue =
            Number(nutrition[field]);

        if (!Number.isFinite(numericValue)) {
            continue;
        }

        normalized[field] =
            Number(
                (
                    numericValue /
                    serving.value *
                    targetAmount
                ).toFixed(2)
            );
    }

    return {
        nutrition: normalized,
        basis:
            targetUnit === "g"
                ? "per 100g"
                : "per 100ml",
        unit: targetUnit,
    };
};


/*
 * Creates the nutrition data that should be used
 * for a comparison.
 *
 * If both products can be normalized to the same
 * basis, normalized values are used.
 *
 * Otherwise, the original per-serving values are
 * used to avoid making unsupported conversions.
 */
const prepareComparisonNutrition = ({
    nutrition1 = {},
    nutrition2 = {},
    servingSize1,
    servingSize2,
} = {}) => {
    const normalized1 =
        normalizeNutritionPer100(
            nutrition1,
            servingSize1
        );

    const normalized2 =
        normalizeNutritionPer100(
            nutrition2,
            servingSize2
        );

    if (
        normalized1 &&
        normalized2 &&
        normalized1.unit ===
            normalized2.unit
    ) {
        return {
            nutrition1:
                normalized1.nutrition,
            nutrition2:
                normalized2.nutrition,
            basis: normalized1.basis,
            normalized: true,
        };
    }

    return {
        nutrition1,
        nutrition2,
        basis: "per serving",
        normalized: false,
    };
};


/*
 * Converts a metric comparison into a
 * percentage advantage.
 *
 * The result is capped at 100% so that very
 * large differences do not completely dominate
 * the entire comparison.
 */
const calculateMetricAdvantage = (
    value1,
    value2,
    direction
) => {
    const number1 = Number(value1);
    const number2 = Number(value2);

    if (
        !Number.isFinite(number1) ||
        !Number.isFinite(number2)
    ) {
        return {
            winner: null,
            advantage: 0,
        };
    }

    if (number1 === number2) {
        return {
            winner: "tie",
            advantage: 0,
        };
    }

    const larger = Math.max(
        Math.abs(number1),
        Math.abs(number2)
    );

    if (larger <= 0) {
        return {
            winner: "tie",
            advantage: 0,
        };
    }

    let winner;

    if (direction === "higher") {
        winner =
            number1 > number2
                ? "product1"
                : "product2";
    } else {
        winner =
            number1 < number2
                ? "product1"
                : "product2";
    }

    const betterValue =
        winner === "product1"
            ? number1
            : number2;

    const worseValue =
        winner === "product1"
            ? number2
            : number1;

    const advantage =
        Math.min(
            1,
            Math.abs(
                betterValue -
                    worseValue
            ) / larger
        );

    return {
        winner,
        advantage,
    };
};


/*
 * Creates a human-readable reason for
 * a comparison advantage.
 */
const createComparisonReason = ({
    nutrient,
    value1,
    value2,
    winner,
}) => {
    const labels = {
        calories: "calories",
        protein: "protein",
        carbohydrates: "carbohydrates",
        totalFat: "total fat",
        saturatedFat: "saturated fat",
        sugar: "sugar",
        fiber: "fiber",
        sodium: "sodium",
    };

    const label =
        labels[nutrient] || nutrient;

    const number1 = Number(value1);
    const number2 = Number(value2);

    if (
        !Number.isFinite(number1) ||
        !Number.isFinite(number2) ||
        winner === "tie"
    ) {
        return null;
    }

    const betterValue =
        winner === "product1"
            ? number1
            : number2;

    const worseValue =
        winner === "product1"
            ? number2
            : number1;

    const difference =
        Math.abs(
            betterValue -
                worseValue
        );

    const percentage =
        worseValue !== 0
            ? Math.round(
                  (difference /
                      Math.abs(
                          worseValue
                      )) *
                      100
              )
            : null;

    const direction =
        comparisonDirection[
            nutrient
        ];

    const comparisonText =
        direction === "higher"
            ? "more"
            : "less";

    const percentageText =
        percentage !== null
            ? `${percentage}%`
            : `${Number(
                  difference.toFixed(2)
              )}`;

    return {
        nutrient,
        winner,
        message:
            `${
                winner === "product1"
                    ? "Product 1"
                    : "Product 2"
            } has ${percentageText} ${comparisonText} ${label}.`,
        difference: Number(
            difference.toFixed(2)
        ),
    };
};


/*
 * Compares two products using nutrition data
 * and the user's selected goal.
 *
 * This is deterministic.
 * Gemini is not used to choose the winner.
 *
 * When serving sizes are supplied and both
 * products use compatible g/ml units, comparison
 * is normalized to a common per-100 basis.
 */
const compareNutrition = ({
    nutrition1 = {},
    nutrition2 = {},
    servingSize1,
    servingSize2,
    goal = "general",
} = {}) => {
    const weights =
        comparisonWeights[goal] ||
        comparisonWeights.general;

    const prepared =
        prepareComparisonNutrition({
            nutrition1,
            nutrition2,
            servingSize1,
            servingSize2,
        });

    const comparisonData1 =
        prepared.nutrition1;

    const comparisonData2 =
        prepared.nutrition2;

    const metricResults = [];

    let product1WeightedScore = 0;
    let product2WeightedScore = 0;
    let totalAvailableWeight = 0;

    for (const nutrient of Object.keys(
        weights
    )) {
        const value1 =
            comparisonData1[nutrient];

        const value2 =
            comparisonData2[nutrient];

        if (
            value1 === undefined ||
            value1 === null ||
            value2 === undefined ||
            value2 === null
        ) {
            continue;
        }

        const weight =
            weights[nutrient];

        const result =
            calculateMetricAdvantage(
                value1,
                value2,
                comparisonDirection[
                    nutrient
                ]
            );

        if (!result.winner) {
            continue;
        }

        totalAvailableWeight +=
            weight;

        if (
            result.winner ===
            "product1"
        ) {
            product1WeightedScore +=
                weight *
                result.advantage;
        }

        if (
            result.winner ===
            "product2"
        ) {
            product2WeightedScore +=
                weight *
                result.advantage;
        }

        metricResults.push({
            nutrient,
            weight,
            value1,
            value2,
            winner: result.winner,
            advantage: Math.round(
                result.advantage * 100
            ),
        });
    }

    if (totalAvailableWeight === 0) {
        return {
            winner: null,
            product1Score: null,
            product2Score: null,
            confidence: "low",
            scoreDifference: null,
            reasons: [],
            advantages: [],
            tradeoffs: [],
            metrics: [],
            basis: prepared.basis,
            normalized:
                prepared.normalized,
            message:
                "A clear comparison could not be determined because the products do not have enough comparable nutrition data.",
        };
    }

    /*
     * Normalize the weighted advantage so that
     * Product 1 + Product 2 = 100.
     */
    const totalWeightedScore =
        product1WeightedScore +
        product2WeightedScore;

    let product1Score = 50;
    let product2Score = 50;

    if (totalWeightedScore > 0) {
        product1Score =
            (product1WeightedScore /
                totalWeightedScore) *
            100;

        product2Score =
            (product2WeightedScore /
                totalWeightedScore) *
            100;
    }

    product1Score = Math.round(
        product1Score
    );

    product2Score = Math.round(
        product2Score
    );

    /*
     * Very small differences should not be
     * presented as a strong recommendation.
     */
    const scoreDifference =
        Math.abs(
            product1Score -
                product2Score
        );

    let winner = null;

    if (scoreDifference < 3) {
        winner = "tie";
    } else if (
        product1Score >
        product2Score
    ) {
        winner = "product1";
    } else {
        winner = "product2";
    }

    /*
     * Sort by weighted importance so the UI
     * receives the strongest reasons first.
     */
    const sortedMetrics =
        [...metricResults].sort(
            (a, b) =>
                b.weight *
                    b.advantage -
                a.weight *
                    a.advantage
        );

    const winnerMetrics =
        winner &&
        winner !== "tie"
            ? sortedMetrics.filter(
                  (metric) =>
                      metric.winner ===
                      winner
              )
            : [];

    const losingMetrics =
        winner &&
        winner !== "tie"
            ? sortedMetrics.filter(
                  (metric) =>
                      metric.winner !==
                          winner &&
                      metric.winner !==
                          "tie"
              )
            : [];

    const reasons = [];

    for (const metric of winnerMetrics.slice(
        0,
        4
    )) {
        const reason =
            createComparisonReason({
                nutrient:
                    metric.nutrient,
                value1:
                    metric.value1,
                value2:
                    metric.value2,
                winner:
                    metric.winner,
            });

        if (reason) {
            reasons.push(
                reason
            );
        }
    }

    const tradeoffs = [];

    if (
        winner &&
        winner !== "tie"
    ) {
        for (const metric of losingMetrics.slice(
            0,
            3
        )) {
            const tradeoff =
                createComparisonReason({
                    nutrient:
                        metric.nutrient,
                    value1:
                        metric.value1,
                    value2:
                        metric.value2,
                    winner:
                        metric.winner,
                });

            if (tradeoff) {
                tradeoffs.push(
                    tradeoff
                );
            }
        }
    }

    const comparableMetricCount =
        metricResults.length;

    let confidence = "low";

    if (
        comparableMetricCount >= 6
    ) {
        confidence = "high";
    } else if (
        comparableMetricCount >= 4
    ) {
        confidence = "moderate";
    }

    return {
        winner,

        product1Score,

        product2Score,

        confidence,

        scoreDifference,

        reasons,

        advantages:
            winner &&
            winner !== "tie"
                ? winnerMetrics
                      .slice(0, 4)
                      .map(
                          (metric) =>
                              metric.nutrient
                      )
                : [],

        tradeoffs,

        metrics: metricResults,

        basis: prepared.basis,

        normalized:
            prepared.normalized,

        message:
            winner === "product1"
                ? "Product 1 is the better match based on the selected goal and available nutrition data."
                : winner === "product2"
                  ? "Product 2 is the better match based on the selected goal and available nutrition data."
                  : winner === "tie"
                    ? "The products are very close based on the selected goal and available nutrition data."
                    : "A clear comparison could not be determined.",
    };
};


/*
 * Converts package/serving units into a common base unit.
 *
 * Supported conversions:
 * g  -> g
 * kg -> g
 * ml -> ml
 * l  -> ml
 * piece -> piece
 */
const convertPackageUnitToBaseUnit = (
    value,
    unit
) => {
    const numericValue = Number(value);

    if (
        value === undefined ||
        value === null ||
        !unit ||
        !Number.isFinite(numericValue) ||
        numericValue < 0
    ) {
        return null;
    }

    switch (unit) {
        case "g":
            return {
                value: numericValue,
                unit: "g",
            };

        case "kg":
            return {
                value: numericValue * 1000,
                unit: "g",
            };

        case "ml":
            return {
                value: numericValue,
                unit: "ml",
            };

        case "l":
            return {
                value: numericValue * 1000,
                unit: "ml",
            };

        case "piece":
            return {
                value: numericValue,
                unit: "piece",
            };

        default:
            return null;
    }
};


/*
 * Calculates how many servings are contained
 * in the package.
 */
const calculateServingsPerPackage = (
    servingSize,
    packageSize
) => {
    if (
        !servingSize ||
        !packageSize
    ) {
        return null;
    }

    const serving =
        convertPackageUnitToBaseUnit(
            servingSize.value,
            servingSize.unit
        );

    const pack =
        convertPackageUnitToBaseUnit(
            packageSize.value,
            packageSize.unit
        );

    if (
        !serving ||
        !pack ||
        serving.unit !== pack.unit ||
        serving.value <= 0
    ) {
        return null;
    }

    return Math.round(
        (pack.value /
            serving.value) *
            100
    ) / 100;
};


/*
 * Calculates nutrition for multiple servings.
 *
 * Nutrition stored in Product is assumed to be
 * per serving.
 */
const calculateMultiServingNutrition = (
    nutrition = {},
    servings = 1
) => {
    const parsedServings =
        Number(servings);

    if (
        !Number.isFinite(
            parsedServings
        ) ||
        parsedServings <= 0
    ) {
        return null;
    }

    const result = {};

    const nutritionFields = [
        "calories",
        "protein",
        "carbohydrates",
        "totalFat",
        "saturatedFat",
        "sugar",
        "fiber",
        "sodium",
    ];

    for (const field of nutritionFields) {
        if (
            nutrition[field] !==
                undefined &&
            nutrition[field] !== null
        ) {
            const value =
                nutrition[field] *
                parsedServings;

            result[field] =
                Number(
                    value.toFixed(2)
                );
        }
    }

    return result;
};


/*
 * Performs the complete nutrition analysis
 * for a selected number of servings.
 *
 * This keeps analyzeNutrition() as the
 * original single-serving source of truth.
 */
const analyzeMultiServingNutrition = ({
    nutrition = {},
    servings = 1,
    goal = "general",
} = {}) => {
    const parsedServings =
        Number(servings);

    if (
        !Number.isFinite(
            parsedServings
        ) ||
        parsedServings <= 0
    ) {
        return null;
    }

    const multiServingNutrition =
        calculateMultiServingNutrition(
            nutrition,
            parsedServings
        );

    const analysis =
        analyzeNutrition(
            multiServingNutrition,
            goal
        );

    return {
        servings: parsedServings,
        nutrition:
            multiServingNutrition,
        analysis,
    };
};


module.exports = {
    analyzeNutrition,
    calculateDailyContribution,
    getNutrientLevel,
    calculateServingsPerPackage,
    calculateMultiServingNutrition,
    analyzeMultiServingNutrition,
    compareNutrition,
    normalizeNutritionPer100,
};