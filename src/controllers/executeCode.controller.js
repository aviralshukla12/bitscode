import { db } from "../libs/db.js";

import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.js";

const executeCode = async (req, res) => {
  try {
    const {
      source_Code,
      language_Id,
      stdin,
      expected_Output,
      problem_Id,
    } = req.body;

    const userId = req.user.id;
    const problemId = problem_Id;

    //Validate the testCases
    if (
      !Array.isArray(stdin) ||
      !Array.isArray(expected_Output) ||
      stdin.length !== expected_Output.length
    ) {
      return res.status(400).json({ error: "Invalid testCases" });
    }

    const submissions = stdin.map((input) => ({
      source_Code,
      language_Id,
      stdin: input,
    }));

    // Submit the batch
    const tokens = await submitBatch(submissions);

    // Poll for result all submitted test cases
    const results = await pollBatchResults(tokens);

    console.log("Result --------->", results);
    // Analyze the test case result
    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_Output[i]?.trim();
      const passed = stdout === expected_output;
      if (!passed) allPassed = false;
      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    console.log("detailedResults", detailedResults);

    // Store the submission summary
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_Code,
        language: getLanguageName(language_Id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compile_output)
          ? JSON.stringify(detailedResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    // If All passed = true mark problem as solved for the current user
    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // Save individual test case results using detailedResult
    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Code executed successfully",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.log("Error executing code", error);
    res.status(500).json({ error: "Failed to execute code" });
  }
};

export { executeCode };