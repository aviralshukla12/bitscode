import { Difficulty } from "../generated/prisma/index.js";
import {db} from "../libs/db.js"
import {getJudge0LanguageId,
    pollBatchResults,
    submitBatch,
}from  "../libs/judge0.libs.js"

export const createProblem =  async (req , res) => {
    // going to all the data from req.body
    const { title ,
            description ,
            input , 
            output ,
            constraints , 
            testcases ,
            codeSnippets , 
            referenceSolutions
            } = req.body;

    //going to check USER role once again 
    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            message : "Unauthorized - You can create this resouce"
        })
    }


    //loop through each reference solution for different  languages

    try{
        for(const[language ,  solutionCode] of  Object.entries(referenceSolutions)){
            
            const languageId =  getJudge0LanguageId(language);
            
            if(!language){
                return res.status(400).json({
                    error  : `Language ${language} is not  supported`,
                })
            }
            //
            const submission =  testcases.map(({input  ,output}) => ({
                source_code  :  solutionCode,
                language_id : languageId,
                stdin  :input,
                expected_output  : output,
                
            }));

            const submissionResults = await submitBatch(submission);
            const token = submissionResults.map((res) =>  res.token);
            
            const results  = await pollBatchResults(token);
            

            for(let  i  = 0 ;i  < results.length ; i++){
                const result = results[i];
                if(result.status.id !== 3){
                    return res.status(400).json({
                        error : `Testcase ${i + 1}  failed for language ${language}`,
                    });
                }
        }
    }
    const newProblem = await db.problem.create({
            data  :{
                title,
                description,
               Difficulty,
               tags,
               examples,
               constraints,
               testcases,
               codeSnippets,
                referenceSolutions,
               userId : req.user.id,
            },
    });
    return res.status(201).json({
        success : true,
        message : "Message created Successfully",
        problem : newProblem,

    });
}

    catch(error){
        console.log("Error creating problem" , error)
        res.status(500).json({
            message : "Error creating problem",
        });
    }
    };

 export const getAllProblems =  async (req , res) => { 
    try{
         const problems = await db.problem.findMany({
            include :{
                solvedBy:{
                   where:{
                    userId : req.user.id
                   } 
                }
            }
         });
         if(!problems){
            return res.status(404).json({
                error : "No problem found",
            });
         }
         res.status(200).json({
            success: true,
            message :"Message Fetched Successfully",
            problems,
         });
    }
    catch(error){
        console.log("Error fetching problems" , error)
        res.status(500).json({
            message : "Error While fetching problems",
        });
    }
 }


export const getProblemById =  async (req , res) => {
    const  {id} = req.params;

    try{
        const problem = await db.problem.findUnique({
            where : {
                id,
            },
        });

        if(!problem){
            return res.status(404).json({
                error : "Problem not found",
            })
        }

        return res.status(200).json({
            success : true,
            message : "Message Fetched Successfully",
            problem,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            error : "Error while fetching problem by id",
        })

    }
    
}

export const updateProblem =  async (req , res) => {
     // id
  // id--->problem ( condition)
  // baaki kaam same as create
}

export const deleteProblem =  async (req , res) => {
    
}

export const getSolvedProblemsByUser =  async (req , res) => {
    try{
        const problems = await db.problem.findMany({
            where  :{
                solvedBy : {
                    some :{
                        userId : req.user.id
                    }
                }
            },
            include  :{
                where:{
                    userId  : req.user.id
                }
            }
        })

        res.status(200).json({
            success : true,
            message : "Message Fetched Successfully",
            problems
        })

    }
    catch(error){
        console.error("Error fetching solved problems by user:", error);
        res.status(500).json({
            message : "Error while fetching solved problems by user",
        });

    }
    
}

