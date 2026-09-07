# LabelIQ

LabelIQ is a full-stack food label intelligence platform that helps users understand nutrition and ingredient information from food products. It extracts label data, analyzes nutrition values, provides deterministic grading, and gives evidence-based ingredient insights.

## 🚀 Live Demo

https://labeliq-pink.vercel.app/

## 📂 GitHub

https://github.com/adityakumar5492/labeliq

## ✨ Features

### 🔍 Food Label Analysis
- Upload food-label images for automatic data extraction
- Extract product name, brand, serving size, nutrition values, and ingredients
- Review and edit extracted information before saving
- Handles unclear or missing label information without inventing values

### 🥗 Nutrition Analysis
- Deterministic nutrition scoring and grading
- Grades products from **A to E**
- Consumption assessment:
  - Everyday
  - Regular
  - Occasional
  - Insufficient Data
- Calculates daily contribution of nutrients
- Supports nutrition labels based on:
  - Per serving
  - Per 100g
  - Per 100ml
  - Per piece

### 📦 Serving & Package Analysis
- Converts nutrition values according to serving size
- Calculates nutrition for the complete package
- Calculates servings per package
- Supports different package units such as g, kg, ml, l, and pieces
- Multi-serving nutrition analysis

### 🧪 Ingredient Insights
- Provides insights for individual ingredients
- Uses a basic RAG system with trusted-source evidence
- Explains ingredient purpose and potential concerns
- Keeps evidence separate from unsupported assumptions

### ⚖️ Product Comparison
- Compare two food products
- Compare calories, protein, carbohydrates, fats, saturated fat, sugar, fiber, and sodium
- Shows which product performs better for individual nutrients

### 📜 Scan History
- Stores previously analyzed products
- Displays scan date, product information, and assessment
- Quickly open previous product analyses

### 👤 User Features
- User registration and login
- User profile
- Personalized food preferences
- Preference-based nutrition analysis

### 📱 Responsive UI
- Responsive design for desktop, tablet, and mobile
- Clean and minimal interface
- Easy-to-understand nutrition information

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- Lucide Icons
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer

### AI & Data Processing
- Python
- Basic RAG
- Image-based food label extraction
- Trusted-source ingredient evidence

### Deployment
- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## 🏗️ Architecture

```text
React Frontend
      ↓
Node.js / Express Backend
      ↓
MongoDB
      ↓
Python
      ↓
AI / RAG / Extraction
