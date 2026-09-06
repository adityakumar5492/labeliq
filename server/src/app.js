const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middleware/error.middleware");
const scanRoutes = require("./routes/scan.routes");
const ragRoutes = require("./routes/rag.routes");
const nutritionRoutes = require("./routes/nutrition.routes");
const ingredientRoutes = require("./routes/ingredient.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LabelIQ API is running",
    });
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/ingredients", ingredientRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;