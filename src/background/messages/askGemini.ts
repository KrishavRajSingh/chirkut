import type { PlasmoMessaging } from "@plasmohq/messaging";
import { askGemini } from "~services/geminiService";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const message = req.body;
    console.log("Gemini message received", message);
    const ans = await askGemini(message);
    console.log("answer from gemini", ans);
    res.send({ success: true, data: ans });
}

export default handler;
