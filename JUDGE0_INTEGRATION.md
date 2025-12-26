# Judge0 RapidAPI Integration Guide

This project uses **Judge0** via **RapidAPI** to execute code across multiple programming languages.

## 📋 What is Judge0?

Judge0 is an open-source online code execution platform that supports 60+ programming languages. Through RapidAPI, you can submit code and get execution results with detailed information about runtime, memory usage, compile errors, and output.

## ✅ Setup Instructions

### 1. Get Your RapidAPI Key

1. Visit [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up for a free RapidAPI account (if you don't have one)
3. Subscribe to the Judge0 API (free tier available)
4. Copy your API key from the dashboard

### 2. Configure Environment Variables

1. Create or update your `.env` file in the `Backend` directory:

```env
# Judge0 RapidAPI Configuration
JUDGE0_RAPID_API_KEY=your_api_key_here
```

2. Restart your server for changes to take effect

### 3. Dependencies

The following packages are already installed:
- `axios` - For making HTTP requests to Judge0
- `express` - Web framework
- `@prisma/client` - Database ORM

## 🚀 How It Works

### File Structure

```
src/
├── libs/
│   └── judge0.js          # Judge0 API integration
├── controllers/
│   └── executeCode.controller.js  # Code execution handler
└── routes/
    └── executeCode.routes.js      # API routes
```

### Main Functions

#### `submitBatch(submissions)`
Submits multiple code submissions to Judge0 for batch execution.

**Parameters:**
```javascript
submissions: [{
  source_Code: string,  // The actual code
  language_Id: number,  // Judge0 language ID
  stdin: string         // Input for the code
}]
```

**Returns:** Array of tokens for tracking execution

#### `pollBatchResults(tokens, maxWaitTime)`
Polls Judge0 for the results of submitted code executions.

**Parameters:**
- `tokens` - Array of submission tokens
- `maxWaitTime` - Maximum wait time in milliseconds (default: 30000ms)

**Returns:** Array of execution results with status, output, memory, time, etc.

#### `getLanguageName(languageId)`
Converts a Judge0 language ID to human-readable language name.

### Supported Languages

Judge0 supports 60+ languages including:
- Python (21)
- JavaScript/Node.js (63)
- Java (62)
- C++ (54)
- C (48)
- C# (51)
- Go (60)
- Rust (73)
- TypeScript (74)
- PHP (68)
- Ruby (71)
- Swift (83)
- Kotlin (78)
- And many more...

Full list available in `src/libs/judge0.js`

## 📝 API Endpoint

### Execute Code

**Endpoint:** `POST /api/v1/execute-code`

**Request Body:**
```json
{
  "source_Code": "print('Hello World')",
  "language_Id": 71,
  "stdin": [],
  "expected_Output": ["Hello World"],
  "problem_Id": "123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code executed successfully",
  "submission": {
    "id": "sub_123",
    "userId": "user_123",
    "problemId": "123",
    "status": "Accepted",
    "language": "Python",
    "testCases": [
      {
        "testCase": 1,
        "passed": true,
        "stdout": "Hello World",
        "expected": "Hello World",
        "status": "Accepted",
        "time": "0.05 s",
        "memory": "15360 KB"
      }
    ]
  }
}
```

## 🔧 Usage Example

### Basic Code Execution

```javascript
import { executeCode } from "./libs/judge0.js";

// Execute Python code
const result = await executeCode(
  "print('Hello, World!')",
  71, // Python language ID
  "", // stdin
  15  // timeout in seconds
);

console.log(result);
// Returns: { status, stdout, stderr, memory, time, ... }
```

### Batch Code Execution

```javascript
import { submitBatch, pollBatchResults } from "./libs/judge0.js";

// Submit multiple test cases
const tokens = await submitBatch([
  {
    source_Code: "print(input())",
    language_Id: 71,
    stdin: "test1"
  },
  {
    source_Code: "print(input())",
    language_Id: 71,
    stdin: "test2"
  }
]);

// Poll for results
const results = await pollBatchResults(tokens);
console.log(results);
```

## 🌐 Judge0 Language IDs

Common language IDs:
| Language | ID |
|----------|-----|
| Python | 71 |
| JavaScript (Node.js) | 63 |
| Java | 62 |
| C++ | 54 |
| C | 48 |
| C# | 51 |
| Go | 60 |
| Rust | 73 |
| TypeScript | 74 |
| PHP | 68 |
| Ruby | 71 |

For a complete list, see the `languageMap` in `src/libs/judge0.js`

## 🐛 Error Handling

The code execution includes comprehensive error handling:

- **Submission Errors**: If code fails to submit to Judge0
- **Timeout Errors**: If execution takes longer than 30 seconds
- **Compilation Errors**: Captured and returned with stderr
- **Runtime Errors**: Captured and returned in the response

All errors are logged and returned in the API response with appropriate HTTP status codes.

## ⏱️ Execution Limits

- **Timeout**: 30 seconds for all test cases combined
- **Memory**: 256 MB
- **CPU Time Limit**: 15 seconds per submission

## 📊 Result Structure

Each test case result includes:
```javascript
{
  testCase: number,          // Test case number
  passed: boolean,           // Whether output matches expected
  stdout: string,            // Program output
  expected: string,          // Expected output
  stderr: string | null,     // Error output (if any)
  compile_output: string | null, // Compilation errors (if any)
  status: string,            // Status description (e.g., "Accepted")
  memory: string | undefined, // Memory used (e.g., "15360 KB")
  time: string | undefined   // Execution time (e.g., "0.05 s")
}
```

## 🔐 Security Notes

- **API Key**: Keep your RapidAPI key secret. Never commit it to version control.
- **Rate Limiting**: The free tier has rate limits. Monitor your usage on RapidAPI dashboard.
- **Code Injection**: Always validate user input before passing to Judge0.
- **Timeout Protection**: Always set reasonable timeout limits.

## 📚 Additional Resources

- [Judge0 Official Documentation](https://ce.judge0.com/)
- [RapidAPI Judge0 Page](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Judge0 GitHub Repository](https://github.com/judge0/judge0)

## 🆘 Troubleshooting

### "API Key not found" Error
- Check that `JUDGE0_RAPID_API_KEY` is set in your `.env` file
- Verify you've subscribed to Judge0 on RapidAPI
- Restart the server after adding the key

### "Code execution timeout"
- The code took longer than 30 seconds to run
- Check for infinite loops or inefficient algorithms
- Increase `maxWaitTime` parameter if needed

### "Compilation error"
- Check the `compile_output` field in the response for details
- Verify the correct language ID is being used
- Check syntax in the submitted code

### Rate Limit Issues
- You've exceeded your RapidAPI quota
- Check your usage on the RapidAPI dashboard
- Upgrade your plan if necessary

---

**Last Updated:** December 24, 2025
