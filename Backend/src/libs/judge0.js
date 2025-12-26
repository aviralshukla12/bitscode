import axios from "axios";

const JUDGE0_API_HOST = "judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_RAPID_API_KEY;
const JUDGE0_BASE_URL = `https://${JUDGE0_API_HOST}`;

// ===== SUPPORTED LANGUAGES (LATEST VERSIONS) =====
export const LANGUAGES = {
  PYTHON: 261, // Python 3.11.0 (Latest)
  JAVASCRIPT: 247, // JavaScript (Node.js) (Latest)
  CPP: 254, // C++ (GCC 8.3.0) (Latest)
  TYPESCRIPT: 91, // TypeScript (Latest)
};

// Language ID mappings for Judge0 - Optimized for 4 languages
const languageMap = {
  // Primary Languages (Latest Versions)
  261: "Python (3.11.0)",
  247: "JavaScript (Node.js)",
  254: "C++ (GCC 8.3.0)",
  91: "TypeScript",

  // Alternative Python versions
  141: "Python",
  142: "Python3",
  248: "Python",
  255: "Python (3.5.2)",
  256: "Python (3.6.1)",
  257: "Python (3.7.1)",
  258: "Python (3.8.1)",
  259: "Python (3.9.1)",
  260: "Python (3.10.0)",

  // Alternative JavaScript versions
  12: "JavaScript",
  63: "JavaScript (Node.js)",
  93: "JavaScript",
  230: "JavaScript (Node.js)",

  // Alternative C++ versions
  2: "C++",
  54: "C++ (GCC)",
  61: "C++",
  226: "C++ (Clang)",
  244: "C++",
  250: "C++ (GCC)",
  252: "C++ (Clang 7.0.1)",
  253: "C (GCC 8.3.0)",

  // Alternative TypeScript versions
  27: "TypeScript",
  197: "TypeScript",
  241: "TypeScript",
};

// Get language name from ID
export const getLanguageName = (languageId) => {
  return languageMap[languageId] || "Unknown";
};

// ===== LANGUAGE HELPER FUNCTIONS =====
/**
 * Get language ID from language name
 * @param {string} languageName - Language name (e.g., "Python", "JavaScript", "C++", "TypeScript")
 * @returns {number} Language ID
 */
export const getLanguageId = (languageName) => {
  const normalizedName = languageName.toLowerCase().trim();

  if (normalizedName.includes("python")) return LANGUAGES.PYTHON;
  if (
    normalizedName.includes("javascript") ||
    normalizedName.includes("js") ||
    normalizedName === "node"
  )
    return LANGUAGES.JAVASCRIPT;
  if (normalizedName.includes("typescript") || normalizedName.includes("ts"))
    return LANGUAGES.TYPESCRIPT;
  if (normalizedName.includes("c++") || normalizedName.includes("cpp"))
    return LANGUAGES.CPP;

  return null;
};

/**
 * Check if a language is one of the primary supported languages
 * @param {number} languageId - Language ID
 * @returns {boolean}
 */
export const isPrimarySupportedLanguage = (languageId) => {
  return Object.values(LANGUAGES).includes(languageId);
};

/**
 * Get all supported language information
 * @returns {object} Map of language names to IDs
 */
export const getSupportedLanguages = () => {
  return {
    Python: LANGUAGES.PYTHON,
    JavaScript: LANGUAGES.JAVASCRIPT,
    TypeScript: LANGUAGES.TYPESCRIPT,
    "C++": LANGUAGES.CPP,
  };
};

// Create axios instance with RapidAPI headers
const judge0Client = axios.create({
  baseURL: JUDGE0_BASE_URL,
  headers: {
    "x-rapidapi-key": JUDGE0_API_KEY,
    "x-rapidapi-host": JUDGE0_API_HOST,
    "Content-Type": "application/json",
  },
});

// Submit a batch of submissions
export const submitBatch = async (submissions) => {
  try {
    const response = await judge0Client.post("/submissions/batch", {
      submissions: submissions.map((sub) => ({
        source_code: sub.source_Code,
        language_id: sub.language_Id,
        stdin: sub.stdin,
      })),
    });

    return response.data.map((result) => result.token);
  } catch (error) {
    console.error("Error submitting batch to Judge0:", error.message);
    throw new Error(`Failed to submit code batch: ${error.message}`);
  }
};

// Poll for batch results
export const pollBatchResults = async (tokens, maxWaitTime = 30000) => {
  const startTime = Date.now();
  const pollInterval = 1000; // 1 second between polls

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await judge0Client.get(
        `/submissions/batch?tokens=${tokens.join(",")}`
      );

      const submissions = response.data.submissions;

      // Check if all submissions are done (not in processing status)
      const allDone = submissions.every(
        (sub) => sub.status.id !== 1 && sub.status.id !== 2
      );

      if (allDone) {
        return submissions;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error("Error polling results from Judge0:", error.message);
      throw new Error(`Failed to poll Judge0 results: ${error.message}`);
    }
  }

  throw new Error("Code execution timeout - took longer than 30 seconds");
};

// Submit single code execution (alternative method)
export const executeCode = async (
  sourceCode,
  languageId,
  stdin = "",
  timeout = 15
) => {
  try {
    const response = await judge0Client.post("/submissions", {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin,
      cpu_time_limit: timeout,
      memory_limit: 262144, // 256MB
    });

    const token = response.data.token;

    // Poll for result
    return await pollSingleResult(token);
  } catch (error) {
    console.error("Error executing code:", error.message);
    throw new Error(`Failed to execute code: ${error.message}`);
  }
};

// Poll for single result
const pollSingleResult = async (token, maxWaitTime = 30000) => {
  const startTime = Date.now();
  const pollInterval = 1000;

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await judge0Client.get(`/submissions/${token}`);
      const submission = response.data;

      // Status IDs: 1 = In Queue, 2 = Processing, 3+ = Done
      if (submission.status.id !== 1 && submission.status.id !== 2) {
        return submission;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error("Error polling result:", error.message);
      throw new Error(`Failed to get execution result: ${error.message}`);
    }
  }

  throw new Error("Code execution timeout");
};

// Get available languages
export const getLanguages = async () => {
  try {
    const response = await judge0Client.get("/languages");
    return response.data;
  } catch (error) {
    console.error("Error fetching languages:", error.message);
    throw new Error(`Failed to fetch languages: ${error.message}`);
  }
};

export default {
  // Main functions
  submitBatch,
  pollBatchResults,
  executeCode,
  getLanguages,
  
  // Language utilities
  getLanguageName,
  getLanguageId,
  isPrimarySupportedLanguage,
  getSupportedLanguages,
  
  // Language constants
  LANGUAGES,
};
