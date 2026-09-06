const { spawn } = require("child_process");
const path = require("path");

const getPythonPath = () => {
    return path.join(
        __dirname,
        "../../../ai/venv/Scripts/python.exe"
    );
};


const runPythonScript = ({
    scriptPath,
    input,
}) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(
            getPythonPath(),
            [scriptPath, JSON.stringify(input)]
        );

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on(
            "data",
            (data) => {
                output += data.toString();
            }
        );

        pythonProcess.stderr.on(
            "data",
            (data) => {
                errorOutput += data.toString();
            }
        );

        pythonProcess.on(
            "close",
            (code) => {
                if (code !== 0) {
                    return reject(
                        new Error(
                            errorOutput ||
                                "Python process failed"
                        )
                    );
                }

                try {
                    const result =
                        JSON.parse(output);

                    resolve(result);
                } catch (error) {
                    console.error(
                        "Python output:",
                        output
                    );

                    reject(
                        new Error(
                            "Invalid response from Python"
                        )
                    );
                }
            }
        );

        pythonProcess.on(
            "error",
            (error) => {
                reject(error);
            }
        );
    });
};


const runRag = ({
    question = null,
    product = null,
    userPreferences = null,
    nutritionAnalysis = null,
    evidenceOnly = false,
} = {}) => {
    const scriptPath = path.join(
        __dirname,
        "../../../ai/rag/api.py"
    );

    return runPythonScript({
        scriptPath,
        input: {
            question,
            product,
            userPreferences,
            nutritionAnalysis,
            evidenceOnly,
        },
    });
};


const runExtraction = ({
    imageBuffer,
    mimeType,
} = {}) => {
    return new Promise((resolve, reject) => {
        if (!imageBuffer) {
            return reject(
                new Error("Image is required.")
            );
        }

        const scriptPath = path.join(
            __dirname,
            "../../../ai/extraction/extract.py"
        );

        const input = JSON.stringify({
            imageBase64:
                imageBuffer.toString("base64"),
            mimeType,
        });

        const pythonProcess = spawn(
            getPythonPath(),
            [scriptPath]
        );

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on(
            "data",
            (data) => {
                output += data.toString();
            }
        );

        pythonProcess.stderr.on(
            "data",
            (data) => {
                errorOutput += data.toString();
            }
        );

        pythonProcess.on(
            "close",
            (code) => {
                // Temporary: surface stderr debug output (from
                // DEBUG_EXTRACTION=1 in extract.py) even on success,
                // so it's visible in the server console. Safe to
                // remove once the root cause is confirmed.
                if (errorOutput) {
                    console.error(
                        "Python extraction stderr:\n" +
                            errorOutput
                    );
                }

                if (code !== 0) {
                    return reject(
                        new Error(
                            errorOutput ||
                                "Python extraction failed"
                        )
                    );
                }

                try {
                    const result =
                        JSON.parse(output);

                    resolve(result);
                } catch (error) {
                    console.error(
                        "Python extraction output:",
                        output
                    );

                    reject(
                        new Error(
                            "Invalid extraction response from Python"
                        )
                    );
                }
            }
        );

        pythonProcess.on(
            "error",
            (error) => {
                reject(error);
            }
        );

        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();
    });
};


module.exports = {
    runRag,
    runExtraction,
};