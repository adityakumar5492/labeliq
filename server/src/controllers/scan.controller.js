const scanService = require("../services/scan.service");

const createScan = async (req, res, next) => {
    try {
        const {
            productId,
            inputType,
            assessment,
        } = req.body;

        const scan = await scanService.createScan({
            userId: req.user.id,
            productId,
            inputType,
            assessment,
        });

        res.status(201).json({
            success: true,
            message: "Scan saved successfully",
            data: scan,
        });
    } catch (error) {
        next(error);
    }
};

const getUserScans = async (req, res, next) => {
    try {
        const scans = await scanService.getUserScans(
            req.user.id
        );

        res.status(200).json({
            success: true,
            count: scans.length,
            data: scans,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createScan,
    getUserScans,
};