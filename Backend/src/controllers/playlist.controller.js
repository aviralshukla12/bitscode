import {db} from "../libs/db.js";

const  createPlayList = async(req , res) => {
    try{
        const  {name , decription} = req.body;
        const userId = req.user.id;

        const playlist =  await db.playlist.create({
            data : {
                name ,
                decription,
                userId,
            },
        });
        res.status(200).json({
            success : true,
            message : "Playlist created successfully",
            playlist,
        });
     }catch(error){
       console.error("Error creating playlist: ", error);
       res.status(500).json({error  : "Failed to create playlist "});
     }
};

const  getPlayAllListDetails  = async (req, res) => { 
    try{
        const   playLists = await db.playlist.findMany({
            where : {
                userId : req.user.id,
            },
            include : {
                problems: {
                    include :{
                        problem :   true, 
                    },
                },
            },
        });
        res.status(200).json({
            success :true,
            message : "Playlist  fetched succeessfully",
            playLists,
        });
    }catch(error) {
        console.error("Error fetching playlist : " , error);
        res.status(500).json({error : "Failed to fetch playlist"});
    }
}

const getPlaylsitDettails  = async( req  , res) => {
     const  {playlistId} = req.params;

     try {
        const playlist  = await db.playLists.findUnique({
            where  :{id :playlistId  , userId  :req.user.id },
            include :{
                problems  :  {
                    include  : {
                        problem : true,
                    },
                },
            },
        });
        if(!playlist) {
            return res.status(404).json({error : "Playlist not found"});
        }
        res.status(200).json({
            success : true,
            message  : "Playlist fetched successfully",
            playlist,
        })
     }
     catch(error){
        console.log("Error fetching playlist" , error);
        res.status(500).json({error : "Failed to fetch playlist"});

     }
}

const addProblemToPlaylist  = async (req , res) => { 
    const  {playlistId} = req.params;
    const  {problemIds} = req.body; // Accept an array of problem Ids;

    try{
        //Ensure problemIds is an Array;
        if(!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({ error : "Invalid or missing problemIds"});
        }
        console.log(
            problemIds.map((problemId) => ({
                playlistId,
                problemId,
            }))
        );
        //create records for each problem in playlist
        const problemInPlaylist  = await db.problemInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
                playListId :playlistId,
                problemId,
            })),
        });

        res.status(200).json({
            success : true,
            message : "Problems added to playlist successfully",
            problemInPlaylist,
        });

    }catch(error){
        console.log("Error adding problem to playlist" , error);
        res.status(500).json({error : "Failed to add problem to playlist"});
    }
}

const deletePlayList =  async(req, res) => {
    const {playListId} = req.params;
    try {
        const deletedPlayList = await db.playlist.delete({
            where :{
                id : playlistId,
            },
        });

        res.status(200).json({
            success : true,
            message : "Playlist deleted successfullty",
            deletedPlayList,
        });
 
    }catch(error){
        console.log("Error deleting playlist " , error);
        res.status(500).json({error : "Failed to delete playlist"});
    }
}

 const removeProblemFromPlaylist = async (req , res) =>  {
    const  {playListId} = req.params;
    const  {problemId}  =  req.body;
    try  {
        if(!Array.isArray(problemId)  || problemIds.length ){
            return res.status(400).json({error:  "Invalid or missing problemIds"});
        }
        //only delete the given probmlemids not all

        const deleteProblem =  await db.problemInPlaylist.deleteMany({
            where : {
                playListId,
                problemId : {
                    in : problemIds,
                },
            },
        });
        res.status(200).json({
            success : true,
            message : "Problem removed from playlist successfully",
            deleteProblem,
        })
    }
    catch(error){
        console.log("Error removing problem from playlist" , error);
        res.status(500).json({error : "Failed to remove problem from playlist"});
    }

 }
  export {createPlayList , getPlayAllListDetails , getPlaylsitDettails , addProblemToPlaylist , deletePlayList , removeProblemFromPlaylist};


