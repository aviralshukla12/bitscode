import{db} from "../libs/db.js";
export const getAllSubmissions =  async (req , res) => {
    try{
        const userId = req.user.id;

        const submission  = await db.submission.findMany({
            where :{
                userId:userId
            }
        })
        res.status(200).json({
            success : true,
            message : "Submissions fetched successfully",
            submission,
        })
    }
    catch(error){
        console.log(error)
       res.status(500).json({
           message : "Error while fetching submissions"
       })
        
    }
}

export const getSubmissionsForProblem=  async (req , res) => {
    try{
        const userId = req.user.id;
    const problemId = req.params.id;

    const submission  = await db.submission.findMany({
        where :{
            userId:userId,
            problemId:problemId
        }
    })
    
    res.status(200).json({
        success : true,
        message : "Submissions fetched successfully",
        submission,
    })

    }
    catch(error){
         console.log(error)
         res.status(500).json({
             message : "Error while fetching submissions",
             submissions
         })

    }
}

export const getAllSubmissionsForProblem=  async (req , res) => {
    try{
        const problemId = req.params.problemId;
        const submissions  = await db.submission.count({
            where  :{
                problemId:problemId
            }
        })
        res.status(200).json({
            success : true,
            message : "Submissions fetched successfully",
           count :  submissions,
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            message : "Error while fetching submissions",
            submissions
        })
    }
}