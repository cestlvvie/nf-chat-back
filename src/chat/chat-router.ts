import { Router } from "express";
import multer from 'multer';
import { authMiddleware } from "../middlewares/auth-middleware";
import CloudStorageService from "../services/cloud-storage-service";
import ChatService from "./chat-service";
import { chatModel } from "./models/chat";
import { messageModel } from "./models/message";
import SocketEventService from "../websockets/events/chatEvents";


const upload = multer({ dest: 'uploads/' });
const chatRouter = Router();

const chatService = new ChatService();
const cloudStorageService = new CloudStorageService();


chatRouter.post("/:id/sendText", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const { user } = req;
  const message = await chatService.sendTextMessage((user as any).id, id, text);
  await SocketEventService.getInstance().fireMessageEvent(id, message);
  res.send("success");
});

chatRouter.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const chat = await chatModel.findById(id);
  const messages = await messageModel.find({ chat: chat?.id });
  res.json({ chat, messages });
});

chatRouter.post('/:id/sendFile', authMiddleware, upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const fileUrl = await cloudStorageService.uploadFile(file.path);
    await chatService.sendFileMessage((user as any).id, id, fileUrl);
    res.send('success');
  } catch (error) {
    res.status(500).send('Error uploading file.');
  }
});

chatRouter.post("/createchat", authMiddleware, async (req, res) => {
  const { participants } = req.body;
  const chat = await chatService.createChat(participants);
  res.json(chat);
});

export default chatRouter;
