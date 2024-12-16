import cloudinary from "../lib/cloudinary.js";
import { responseAPI } from "../lib/utils.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        responseAPI(res,200,filteredUsers)
    } catch (error) {
        responseAPI(res,500,"Internal Server error")
    }
}

export const getMessages = async (req,res) => {
    try {
        const {id:userToChatId } = req.param;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })
        responseAPI(res,200,messages)
    } catch (error) {
        responseAPI(res,500,"Internal Server error")
    }
}

export const sendMessage = async (req,res) => {
    try {
        const {text,image} = req.body;
        const {id:receiverId } = req.param;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }


        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        // TODO: realtime socket.io

        responseAPI(res,200,newMessage)
    } catch (error) {
        responseAPI(res,500,"Internal Server error")
    }
}