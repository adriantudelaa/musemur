import { Router } from "express";
import { getChatboxQues, getChatboxByQues, getChatboxByMuseum, postChatbox, putChatbox, deleteChatbox } from "../controllers/chatbox.controllers.js";

const router = Router();

router.get("/chatbox", getChatboxQues);
router.post("/chatbox", postChatbox);
router.put("/chatbox", putChatbox);
router.delete("/chatbox", deleteChatbox);
router.post("/chatbox/question", getChatboxByQues);
router.post("/chatbox/museum", getChatboxByMuseum);

export default router;
