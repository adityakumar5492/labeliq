const express = require("express");

const {
    createScan,
    getUserScans,
} = require("../controllers/scan.controller");

const protect = require("../middleware/auth.middleware");
const validateScan = require("../middleware/validateScan");

const router = express.Router();

router.post(
    "/",
    protect,
    validateScan,
    createScan
);

router.get(
    "/",
    protect,
    getUserScans
);

module.exports = router;