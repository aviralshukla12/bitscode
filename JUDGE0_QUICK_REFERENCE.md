# Judge0 - Quick Reference for Python, JavaScript, C++, TypeScript

## Language IDs

| Language | ID | Import |
|----------|----|----|
| Python | `71` | `LANGUAGES.PYTHON` |
| JavaScript | `63` | `LANGUAGES.JAVASCRIPT` |
| C++ | `54` | `LANGUAGES.CPP` |
| TypeScript | `91` | `LANGUAGES.TYPESCRIPT` |

## Quick Import

```javascript
import { 
  LANGUAGES, 
  executeCode, 
  submitBatch, 
  pollBatchResults,
  getLanguageId,
  getSupportedLanguages 
} from "./libs/judge0.js";
```

## Execute Single Code

### Python
```javascript
const result = await executeCode(
  "print('Hello World')", 
  LANGUAGES.PYTHON
);
console.log(result.stdout); // "Hello World\n"
```

### JavaScript
```javascript
const result = await executeCode(
  "console.log('Hello World')", 
  LANGUAGES.JAVASCRIPT
);
console.log(result.stdout); // "Hello World\n"
```

### C++
```javascript
const result = await executeCode(
  `#include <iostream>
   using namespace std;
   int main() { cout << "Hello World" << endl; return 0; }`,
  LANGUAGES.CPP
);
console.log(result.stdout); // "Hello World\n"
```

### TypeScript
```javascript
const result = await executeCode(
  "console.log('Hello World')", 
  LANGUAGES.TYPESCRIPT
);
console.log(result.stdout); // "Hello World\n"
```

## Batch Execution

```javascript
const submissions = [
  { 
    source_Code: "print(input() * 2)", 
    language_Id: LANGUAGES.PYTHON, 
    stdin: "5" 
  },
  { 
    source_Code: "console.log(parseInt(require('fs').readFileSync(0, 'utf-8')) * 2)", 
    language_Id: LANGUAGES.JAVASCRIPT, 
    stdin: "10" 
  }
];

const tokens = await submitBatch(submissions);
const results = await pollBatchResults(tokens);

results.forEach((result, i) => {
  console.log(`Test ${i + 1}:`);
  console.log(`  Output: ${result.stdout}`);
  console.log(`  Status: ${result.status.description}`);
  console.log(`  Time: ${result.time}s`);
});
```

## Result Object Structure

```javascript
{
  stdout: "output here",
  stderr: "error here or null",
  compile_output: "compilation error or null",
  status: { 
    id: 3, 
    description: "Accepted" 
  },
  time: "0.05",
  memory: "15360",
  exit_code: 0,
  language_id: 71
}
```

## Helper Functions

### Get Language ID from Name
```javascript
getLanguageId("Python")      // → 71
getLanguageId("JavaScript")  // → 63
getLanguageId("C++")         // → 54
getLanguageId("TypeScript")  // → 91
```

### Check if Language is Supported
```javascript
isPrimarySupportedLanguage(71)  // → true
isPrimarySupportedLanguage(1)   // → false (C is not in primary)
```

### Get All Supported Languages
```javascript
getSupportedLanguages()
// → { 
//   Python: 71,
//   JavaScript: 63,
//   TypeScript: 91,
//   'C++': 54 
// }
```

## Error Handling

```javascript
try {
  const result = await executeCode(
    "print('Hello')", 
    LANGUAGES.PYTHON,
    "", // stdin
    15  // timeout in seconds
  );
  
  if (result.stderr) {
    console.error("Runtime Error:", result.stderr);
  } else if (result.compile_output) {
    console.error("Compile Error:", result.compile_output);
  } else {
    console.log("Output:", result.stdout);
  }
} catch (error) {
  console.error("Execution Error:", error.message);
}
```

## Common Status Codes

| ID | Status | Meaning |
|----|--------|---------|
| 1 | In Queue | Waiting to be executed |
| 2 | Processing | Currently executing |
| 3 | Accepted | Executed successfully |
| 4 | Wrong Answer | Output doesn't match expected |
| 5 | Time Limit Exceeded | Took too long |
| 6 | Compilation Error | Failed to compile |
| 7 | Runtime Error | Error during execution |
| 8 | Internal Error | Judge0 server error |

## Code Examples by Language

### Python with Input
```javascript
const code = `
a = int(input())
b = int(input())
print(a + b)
`;

const result = await executeCode(
  code,
  LANGUAGES.PYTHON,
  "5\n3" // stdin: "5\n3"
);
console.log(result.stdout); // "8\n"
```

### JavaScript with Input
```javascript
const code = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let sum = 0;
rl.on('line', (line) => {
  sum += parseInt(line);
});
rl.on('close', () => {
  console.log(sum);
});
`;

const result = await executeCode(
  code,
  LANGUAGES.JAVASCRIPT,
  "5\n3"
);
```

### C++ with Input
```javascript
const code = `
#include <iostream>
using namespace std;
int main() {
  int a, b;
  cin >> a >> b;
  cout << a + b << endl;
  return 0;
}
`;

const result = await executeCode(
  code,
  LANGUAGES.CPP,
  "5 3"
);
console.log(result.stdout); // "8\n"
```

### TypeScript
```javascript
const code = `
const add = (a: number, b: number): number => a + b;
console.log(add(5, 3));
`;

const result = await executeCode(
  code,
  LANGUAGES.TYPESCRIPT,
  ""
);
console.log(result.stdout); // "8\n"
```

## Tips & Tricks

1. **Always handle stdin correctly** - Different languages read input differently
2. **Set appropriate timeouts** - Default is 15 seconds
3. **Check compile_output first** - Syntax errors appear here, not stderr
4. **Use polling for batch** - It's more efficient for multiple submissions
5. **Monitor memory usage** - Large inputs may cause memory limit issues
6. **Test locally first** - Verify logic before sending to Judge0

## Rate Limiting

- Free tier: Check your RapidAPI dashboard for limits
- Each submission counts as 1 request
- Batch submissions count based on number of items

---

**Need help?** Check [JUDGE0_INTEGRATION.md](JUDGE0_INTEGRATION.md) for full documentation.
