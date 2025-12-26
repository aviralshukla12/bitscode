// Quick Reference: Using Judge0 with Python, JavaScript, C++, TypeScript

import {
  LANGUAGES,
  getLanguageId,
  getSupportedLanguages,
  submitBatch,
  pollBatchResults,
  executeCode,
} from "./judge0.js";

// ===== LANGUAGE CONSTANTS =====
// LANGUAGES.PYTHON = 71
// LANGUAGES.JAVASCRIPT = 63
// LANGUAGES.CPP = 54
// LANGUAGES.TYPESCRIPT = 91

// ===== EXAMPLE 1: Execute Python Code =====
async function examplePython() {
  const pythonCode = `
def add(a, b):
    return a + b

result = add(5, 3)
print(result)
  `;

  try {
    const result = await executeCode(
      pythonCode,
      LANGUAGES.PYTHON,
      "", // stdin
      15 // timeout in seconds
    );

    console.log("Python Output:", result.stdout);
    // Expected: 8
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// ===== EXAMPLE 2: Execute JavaScript Code =====
async function exampleJavaScript() {
  const jsCode = `
function add(a, b) {
    return a + b;
}

const result = add(5, 3);
console.log(result);
  `;

  try {
    const result = await executeCode(
      jsCode,
      LANGUAGES.JAVASCRIPT,
      "", // stdin
      15
    );

    console.log("JavaScript Output:", result.stdout);
    // Expected: 8
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// ===== EXAMPLE 3: Execute C++ Code =====
async function exampleCPP() {
  const cppCode = `
#include <iostream>
using namespace std;

int main() {
    int a = 5, b = 3;
    cout << a + b << endl;
    return 0;
}
  `;

  try {
    const result = await executeCode(
      cppCode,
      LANGUAGES.CPP,
      "", // stdin
      15
    );

    console.log("C++ Output:", result.stdout);
    // Expected: 8
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// ===== EXAMPLE 4: Execute TypeScript Code =====
async function exampleTypeScript() {
  const tsCode = `
function add(a: number, b: number): number {
    return a + b;
}

const result: number = add(5, 3);
console.log(result);
  `;

  try {
    const result = await executeCode(
      tsCode,
      LANGUAGES.TYPESCRIPT,
      "", // stdin
      15
    );

    console.log("TypeScript Output:", result.stdout);
    // Expected: 8
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// ===== EXAMPLE 5: Batch Execution with Multiple Test Cases =====
async function exampleBatchExecution() {
  const pythonCode = `
n = int(input())
print(n * 2)
  `;

  const testCases = [
    { source_Code: pythonCode, language_Id: LANGUAGES.PYTHON, stdin: "5" },
    { source_Code: pythonCode, language_Id: LANGUAGES.PYTHON, stdin: "10" },
    { source_Code: pythonCode, language_Id: LANGUAGES.PYTHON, stdin: "15" },
  ];

  try {
    const tokens = await submitBatch(testCases);
    const results = await pollBatchResults(tokens);

    results.forEach((result, index) => {
      console.log(`Test Case ${index + 1}:`);
      console.log(`  Output: ${result.stdout}`);
      console.log(`  Status: ${result.status.description}`);
      console.log(`  Time: ${result.time}s`);
      console.log(`  Memory: ${result.memory} KB`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// ===== EXAMPLE 6: Using Language ID from Name =====
async function exampleLanguageIdFromName() {
  const languageName = "Python";
  const languageId = getLanguageId(languageName);

  console.log(`Language: ${languageName} -> ID: ${languageId}`);
  // Output: Language: Python -> ID: 71
}

// ===== EXAMPLE 7: Get All Supported Languages =====
function exampleGetSupportedLanguages() {
  const languages = getSupportedLanguages();
  console.log("Supported Languages:");
  console.log(languages);
  // Output: {
  //   Python: 71,
  //   JavaScript: 63,
  //   TypeScript: 91,
  //   'C++': 54
  // }
}

// ===== LANGUAGE IDS FOR REFERENCE =====
/*
Primary Language IDs:
  Python      → 71
  JavaScript  → 63
  C++         → 54
  TypeScript  → 91

Alternative IDs (if needed):
  Python:
    - 141: Python
    - 142: Python3
    - 248: Python
    - 255-261: Python specific versions

  JavaScript:
    - 12: JavaScript
    - 93: JavaScript
    - 230: JavaScript (Node.js)
    - 247: JavaScript (Node.js)

  C++:
    - 2: C++
    - 244: C++
    - 250: C++ (GCC)
    - 252: C++ (Clang 7.0.1)
    - 254: C++ (GCC 8.3.0)

  TypeScript:
    - 27: TypeScript
    - 197: TypeScript
    - 241: TypeScript
*/

export {
  examplePython,
  exampleJavaScript,
  exampleCPP,
  exampleTypeScript,
  exampleBatchExecution,
  exampleLanguageIdFromName,
  exampleGetSupportedLanguages,
};
