import { db } from "../libs/db.js";
import playlistRoutes from "../routes/playlist.routes";

export const createPlaylist =  async (req , res) => {
    try{
        const {name , description} = req.body;

        const userId =  req.user.id;
        const playlist =  await db.playlist.create({
            data:{
                name,
                description,
                userId
            }
        })
        res.status(200).json({
                success:true,
                message:"Playlist created successfully",
                playlist
        })

    }   
    catch(error){
        console.log("Error while creating playlist" , error);
        res.status(500).json({
            message:"Error while creating playlist"
        })
    } 
}

export const  getAllListDetails =  async (req , res) => {
    try{
        const  playlists = db.user.findMany({
            where:{
                userId:req.user.id
            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }
        });
        res.status(200).json({
            success:true,
            message:"Playlist fetched successfully",
            playlists
        })


    }
    catch(error){
        console.log("Error while fetching playlist" , error);
        res.status(500).json({
            message:"Error while fetching playlist"
        })
    }
}

export const  getPlaylistDetails =  async (req , res) => {
    const playlistId = req.params;
    try{
        const playlist = db.playlist.findUnique({
        where :{
            id : playlistId
        },
        include :{
            problems  :{
                include:{
                    problem :true,
                }
            }
        }
        });
        if(!platlist){
            return res.status(404).json({
                error:"Playlist not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Playlist fetched successfully",
            playlist
        })
    }
    catch(error){
        console.log("Error while fetching playlist" , error);
        res.status(500).json({
            message:"Error while fetching playlist"
        })

    }

}

export const addProblemToPlaylist =  async (req , res) => {
    const {playlistId} = req.params;
    const {problemIds} =  req.body;
   try{
    
    if(!Array.isArray(problemIds) || problemIds.length === 0){
        return res.status(400).json({
            error:"Invalid or Missing Test Cases"
        })
    }

    //Create the record for each    problems in the playlist
    const problemInPlaylist  = await db.problemsInPlaylist.createMany({
        data:problemIds.map((problemId) => ({
            playlistId,
            problemId
        }))
    })
    res.status(201).json({
        success:true,
        message:"Problem added to playlist successfully",
        problemInPlaylist
    })
   }
   catch(error){
    console.log("Error while adding problem to playlist" , error);
    res.status(500).json({
        error:"Error while adding problem to playlist"
    })

   }
}

export const deletePlaylist =  async (req , res) => {
    const playlistId =  req.params;
    try{
        const deletedplaylist = await db.playlist.delete({
            where:{
                id: playlistId
            }
        });

        res.status(200).json({
            success:true,
            message:"Playlist deleted successfully",
            deletedplaylist
        })
    }
    catch(error){
        console.log("Error while deleting playlist" , error.message);
        res.status(500).json({
            error:"Error while deleting playlist"
        })
    }

    
}

export const removeProblemFromPlaylist =  async (req , res) => {
    const {playlistId} = req.params;
    const {problemIds}  = req.body;

    try{
        if(!Array.isArray(problemId) || problemId.length === 0){
            return res.status(400).json({error: "Invalid or Missing Problem Id"});
        }
        const deleteProblem  = await db.problemInPlaylist.deleteMany({
            where : {
                playlistId,
                problemId:{
                    in:problemIds
                }
            }
        })
        res.status(200).json({
            success:true,
            message:"Problem removed from playlist successfully",
            deleteProblem
        })
    }
    catch(error){
        console.log("Error while removing problem from playlist" , error);
        res.status(500).json({
            error:"Error while removing problem from playlist"
        })
    }
}