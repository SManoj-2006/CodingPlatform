import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";


/**
 * Create a new tutoring session, provision its video call and messaging channel, and respond with the created session.
 *
 * Creates a Session document with the provided problem and difficulty, generates a unique callId, provisions a video call and a chat channel associated with that call, and returns the created session in the response.
 *
 * Responds with:
 * - 201: { session } on success
 * - 400: { message } when `problem` or `difficulty` is missing from the request body
 * - 500: { message: "Internal Server Error" } on unexpected failures
 */
export async function createSession(req,res) {
    try {
        const {problem,difficulty} = req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        if(!problem || !difficulty){
            return res.status(400).json({message:"Problem and difficulty are requiresd"});
        }

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

        const session =  await Session.create({problem,difficulty,host:userId,callId});

        await streamClient.video.call("default",callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom:{problem,difficulty,sessionId:session._id.toString()},
            },
        });

        const channel = chatClient.channel("messaging",callId,{
            name:`${problem} Session`,
            created_by_id:clerkId,
            members:[clerkId],
        });

        await channel.create();

        res.status(201).json({session});

    } catch (error) {
        console.log("Error in createSession controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
/**
 * Retrieve the most recent active sessions and send them in the HTTP response.
 *
 * Populates `host` and `participant` with `name`, `profileImage`, `email`, and `clerkId`, sorts by creation date descending, and limits the result to 20 sessions. The response JSON contains an object with a `sessions` array.
 */
export async function getActiveSessions(_,res) {
    try {
        const sessions = await Session.find({status:"active"})
        .populate("host","name profileImage email clerkId")
        .populate("participant","name profileImage email clerkId")
        .sort({createdAt : -1})
        .limit(20);

        res.status(200).json({sessions});
    } catch (error) {
        console.log("Error in getActiveSessions controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
  }        
}
/**
 * Retrieve up to 20 most recent sessions with status "completed" that involve the requesting user.
 *
 * Expects req.user._id to contain the requesting user's ID. Responds with a JSON object `{ sessions }`
 * on success or an HTTP error status on failure.
 *
 * @param {import('express').Request} req - Express request; must include `user._id` identifying the requester.
 * @param {import('express').Response} res - Express response.
 */
export async function getMyRecentSessions(req,res) {
    try {
        const userId = req.user._id

        const sessions = await Session.find({
            status:"completed",
            $or: [{host:userId},{participant:userId}]
        })
        .sort({createdAt : -1})
        .limit(20);

        res.status(200).json({sessions});
    } catch (error) {
        console.log("Error in getMyRecentSessions controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
/**
 * Retrieve a session by its ID and return it with populated host and participant fields.
 *
 * Looks up the session specified by req.params.id, populates the host (name, email, profileImage, clerkId)
 * and participant (name, email, profileImage, clerId) references, and sends an HTTP response:
 * - 200 with the session when found
 * - 404 when no session exists for the given ID
 * - 500 on unexpected errors
 */
export async function getSessionById(req,res) {
    try {
        const {id} = req.params

        const session = await Session.findById(id)
        .populate("host","name email profileImage clerkId")
        .populate("participant","name email profileImage clerId")

        if(!session ){
            return res.status(404).json({message:"Session not found"})
        }

        res.status(200).json({session});
    } catch (error) {
        console.log("Error in getSessionById controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
/**
 * Add the requesting user as the participant of a session and join its chat channel.
 *
 * Expects req.params.id (session ID) and req.user with `_id` (user ID) and `clerkId`.
 * If the session exists and has no participant, sets the session's participant to the user,
 * saves the session, and adds the user's `clerkId` to the session's messaging channel.
 *
 * @param {import('express').Request} req - HTTP request; requires params.id and user.{_id, clerkId}.
 * @param {import('express').Response} res - HTTP response used to send status and JSON:
 *   - 200: { session } on success,
 *   - 404: { message } if session not found or already has a participant,
 *   - 500: { message } on internal server error.
 */
export async function joinSession(req,res) {
    try {
        const id = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = Session.findById(id);

        if(!session ){
            return res.status(404).json({message:"Session not found"})
        }
         if(session.participant){
            return res.status(404).json({message:"Session is full"})
        }


        session.participant = userId

        await session.save();

        const channel = chatClient.channel("messaging",session.callId)

        await channel.addMembers([clerkId])
        
        res.status(200).json({session})
    } catch (error) {
        console.log("Error in joinSession controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
/**
 * End a session and remove its associated video call and chat channel.
 *
 * Finds the session by ID, verifies the requester is the host, ensures the session
 * is not already completed, deletes the Stream video call and chat channel, marks
 * the session as completed, and saves the session.
 *
 * Responds with 404 if the session does not exist, 403 if the requester is not the host,
 * 400 if the session is already completed, and 200 on successful completion.
 *
 * @param {import('express').Request} req - Express request; expects `req.params.id` (session ID) and `req.user._id` (requester's user ID).
 * @param {import('express').Response} res - Express response used to send HTTP status and JSON payloads.
 */
export async function endSession(req,res) {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);
        
        if(!session ){
            return res.status(404).json({message:"Session not found"})
        }

        if(session.host.toString() !== userId.toString() ){
            return res.status(403).json({message:"Only the host can end the session"})
        }

        if(session.status === "completed"){
            return res.status(400).json({message:"Session is already completed"});
        }
        
        // delete stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({ hard: true });

        // delete stream chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        session.status = "completed"

        await session.save();


         res.status(200).json({ session, message: "Session ended successfully" });
    } catch (error) {
        console.log("Error in endSession controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}