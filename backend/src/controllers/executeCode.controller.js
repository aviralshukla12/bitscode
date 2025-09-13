import { submitBatch } from "../libs/judge0.libs.js";
import {db} from "../libs/db.js";



export const executeCode =  async(req , res) => {
    try{
        
        const {source_Code , language_id , stdin , expected_Outputs , problemId} = req.body;

        const userId = req.user.id;

        //validate tes cases  // mtlb jo test a rha hai wo proper array ke formt me hai ya nhi
        if(
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_Outputs) ||
            expected_Outputs.length !== stdin.length
        ){
            return res.status(400).json({
                    error:"Invalid or Missing Test Cases"
            })
        }

        //2 . Prepare each test Cases for judge0 batch submission

            const ubmission = stdin.map((input) => ({
                source_Code,
                language_id,
                stdin : input,
              
            }));

    //3 Send this batch of submission to judge0 

    const submitResponse =  await submitBatch(submission);

    const token  = submitResponse.map((res) => res.token);

    //4  Poll judge0 for result  of all submitted test cases;
    const results = await pollBatchResults(token);
   console.log("Results---------------->" , results);

   // analyze test case results
   let allPassed = true;

   const detailedResults = results.map((result , i) =>{
    const stdout =  result.stdout?.trim();
    const expected_Output = expected_Outputs[i]?.trim();

    const passed  = stdout === expected_Output;

    if(!passed) allPassed =  false;

    return {
        testCase:i+1,
        passed,
        expected:expected_Output,
        stderr:result.stderr || null,
        compileOutput:result.compile_output || null,
        status:result.status.desciption,
        memory:result.memory ? `${result.memory} KB` : undefined,
        time:result.time ? `${result.time} s` : undefined 
         

    }
    // console.log(`Testcase #${i+1}`);
    // console.log(`Input for testcaes #${i+1} : ${stdin[i]}`);
    // console.log(`Expeced output for testcses #${i+1} : ${expected_Output}`);
    // console.log(`Matched testcase #${i+1} : ${passed}`)




    
   })
console.log(detailedResults)

// store submission summarry
const submission= await db.submission.create({
    data  :{
        userId,
        problemId,
        sourceCode : source_Code,
        language:getLanguageName(language_id),
        stdin:stdin.join("\n"),
        stdout:JSON.stringify(detailedResults.map((r)=>r.stdout)),
        stderr:detailedResults.some((r)=> r.stderr)
        ? JSON.stringify(detailedResults.map((r) => r.sterr))
        : null,
        compileOutput : detailedResults.some((r)=> r.compile_output)
        ? JSON.stringify(detailedResults.map((r) => r.compile_output))
        : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory:detailedResults.some((r)=> r.memory)
        ? JSON.stringify(detailedResults.map((r) => r.memory))
        : null,
        time:detailedResults.some((r)=> r.time)
        ? JSON.stringify(detailedResults.map((r) => r.time))
        : null

    }
});

//iF ALL PASSED  =  true mark problem as solved for the current user
if(allPassed){
    await db.problemSolved.upsert({
        where  : {
            userId_problemId : {
                userId,
                problemId
            }
        },
        update:{},
        create:{
            userId, problemId
        }
    })
}
// 8 .Save individual test cases results using detailed result
const testCaseResults  =detailedResults.map((result) => ({
    submisionId:submission.id,
    testCase : result.testCase,
    passed  :result.passed,
    stdout  :result.passed,
    expectted: result.expected,
    stderr: result.stderr,
    compileOutput  :result.compileOutput,
    status : result.status,
    memory : result.memory,
    time : result.time,

}))
await db.testCaseResult.createMany({
    data:testCaseResults
})

const submissionWithTestCases = await  db.submission.findUnique({
    where :  {
        id : submission.id,
    },
    include  :{
        testCases:true
    }
})
//

   res.status(200).josn({
    success  : true,
    message  : "Code Executed Successfully",
   })

    //


    }
    catch(error){

    }
}