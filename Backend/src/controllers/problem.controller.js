import axios from "axios";
import { db } from "../libs/db.js";

// Configuration
const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const POLL_INTERVAL = 2000; // Wait 2 seconds between checks
const MAX_ATTEMPTS = 10;    // Give up after 20 seconds (10 * 2s)

// Helper: Map standard language names to Judge0 IDs
const getLanguageId = (langName) => {
    const map = {
        "javascript": 63, // Node.js
        "python": 71,     // Python 3
        "cpp": 54,        // C++ (GCC 9.2.0)
        "java": 62        // Java (OpenJDK 13.0.1)
    };
    return map[langName.toLowerCase()] || null;
};

// Helper: Securely encode strings to Base64 to prevent JSON errors
const encode = (str) => Buffer.from(str).toString('base64');
const decode = (str) => Buffer.from(str, 'base64').toString('utf-8');

const createProblem = async (req, res) => {
    // 1. Destructure data from the Frontend
    const { 
        title, 
        description, 
        difficulty, 
        tags, 
        examples, 
        constraints, 
        testcases,
        codeSnippets,
        referenceSolutions
    } = req.body;

    // 2. Security Check
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ 
            success: false,
            error: "Forbidden: Admins only" 
        });
    }

    try {
        console.log(`[START] Validating problem: "${title}"`);

        // LOOP: Validate the solution for EVERY language provided
        for (const [language, sourceCode] of Object.entries(referenceSolutions)) {
            
            const langId = getLanguageId(language);
            if (!langId) throw new Error(`Unsupported language: ${language}`);

            // --- STEP A: PREPARE BATCH ---
            const batchSubmissions = testcases.map((tc) => ({
                language_id: langId,
                source_code: encode(sourceCode),
                stdin: encode(tc.input),
                expected_output: encode(tc.output)
            }));

            // --- STEP B: SEND TO JUDGE0 ---
            console.log(`[JUDGE0] Submitting ${batchSubmissions.length} cases for ${language}...`);
            
            const submitResponse = await axios.post(
                `${JUDGE0_API}/submissions/batch?base64_encoded=true`,
                { submissions: batchSubmissions },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    }
                }
            );

            const tokens = submitResponse.data.map(s => s.token).join(',');

            // --- STEP C: POLLING LOOP (WAIT FOR RESULTS) ---
            let attempts = 0;
            let results = [];
            let isProcessing = true;

            while (isProcessing && attempts < MAX_ATTEMPTS) {
                attempts++;
                await new Promise(r => setTimeout(r, POLL_INTERVAL));

                const checkResponse = await axios.get(
                    `${JUDGE0_API}/submissions/batch?tokens=${tokens}&base64_encoded=true&fields=status,stderr,compile_output`,
                    {
                        headers: {
                            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                        }
                    }
                );

                const data = checkResponse.data.submissions;
                const stillWorking = data.some(s => s.status.id === 1 || s.status.id === 2);

                if (!stillWorking) {
                    isProcessing = false;
                    results = data;
                } else {
                    console.log(`[JUDGE0] Attempt ${attempts}: Still processing...`);
                }
            }

            if (isProcessing) {
                return res.status(504).json({ 
                    success: false,
                    error: "Judge0 timed out. Try again." 
                });
            }

            // --- STEP D: ANALYZE RESULTS ---
            const failedCase = results.find(s => s.status.id !== 3);

            if (failedCase) {
                const errorMsg = failedCase.stderr ? decode(failedCase.stderr) : 
                                 failedCase.compile_output ? decode(failedCase.compile_output) : 
                                 "Output mismatch";

                return res.status(400).json({
                    success: false,
                    error: `Validation Failed for ${language}`,
                    details: {
                        status: failedCase.status.description,
                        error_log: errorMsg
                    }
                });
            }
        }

        // --- STEP E: SAVE TO DB ---
        console.log(`[DB] Verification successful. Saving problem...`);
        
        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags: JSON.stringify(tags),
                examples,
                constraints,
                testcases,
                referenceSolutions,
                codeSnippets,
                userId: req.user.id
            }
        });

        res.status(201).json({ 
            success: true,
            message: "Problem Verified & Created", 
            problem: newProblem 
        });

    } catch (err) {
        console.error("Create Problem Error:", err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

const getAllProblems = async (req, res) => {
    try {
        const problems = await db.problem.findMany({
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        });

        if (!problems || problems.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Problems not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        });

    } catch (error) {
        console.log("Error while fetching problems:", error);
        return res.status(500).json({
            success: false,
            error: "Error while fetching problems"
        });
    }
};

const getProblemById = async (req, res) => { 
    const { id } = req.params;

    try {
        const problem = await db.problem.findUnique({
            where: {
                id,
            },
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: "Problem not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            problem,
        });
    } catch (error) {
        console.log("Error while fetching problem by id:", error);
        return res.status(500).json({
            success: false,
            error: "Error while fetching Problem by id"
        });
    }
};

const updateProblemById = async (req, res) => {
    const { id } = req.params;
     
    try {
        const updateProblem = await db.problem.update({
            where: {
                id,            
            },
            data: {
                title: req.body.title,
                description: req.body.description,
                difficulty: req.body.difficulty,
                tags: req.body.tags ? JSON.stringify(req.body.tags) : undefined,
                examples: req.body.examples,
                constraints: req.body.constraints,
                testcases: req.body.testcases,
                referenceSolutions: req.body.referenceSolutions,
                codeSnippets: req.body.codeSnippets,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updateProblem,
        });

    } catch (error) {
        console.log("Error while updating problem:", error);
        return res.status(500).json({
            success: false,
            error: "Error while updating problem"
        });
    }
};

const deleteProblemById = async (req, res) => {
    const { id } = req.params;

    try {
        const problem = await db.problem.findUnique({
            where: {
                id,
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: "Problem not found"   
            });
        }

        await db.problem.delete({ where: { id } });

        res.status(200).json({
            success: true,
            message: "Problem deleted successfully",
        });

    } catch (error) {
        console.log("Error while deleting problem:", error);
        return res.status(500).json({
            success: false,
            error: "Error while deleting the problem"
        });
    }
};

const getSolvedProblemsByUser = async (req, res) => {
    try {
        const problems = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Solved problems fetched successfully",
            problems
        });

    } catch (error) {
        console.log("Error while fetching solved problems:", error);
        res.status(500).json({
            success: false,
            error: "Error while fetching solved problems"
        });
    }
};

export { 
    createProblem, 
    getAllProblems, 
    getProblemById, 
    updateProblemById, 
    deleteProblemById, 
    getSolvedProblemsByUser 
};