import type { PlasmoMessaging } from "@plasmohq/messaging";
import { askGemini } from "~services/geminiService";
import { clickElement, executeCommand, readScreen } from "~utils/lib";
import { PromptTemplate } from "~utils/prompts";
import type { GeminiResponse } from "~utils/types";
  
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try{
        const message = req.body;
        console.log("Gemini message received", message);
        let geminiResponse: GeminiResponse = await askGemini(PromptTemplate(message));
        geminiResponse = typeof geminiResponse === "string" ? JSON.parse(geminiResponse): geminiResponse;
        console.log("answer from gemini", geminiResponse);
        await executeCommand(geminiResponse);
        // getRealTimeData(message);
        // const resp = await readScreen(message);
        // chrome.tts.speak('done');
        res.send({ success: true, data: message });

    } catch (error) {
        console.error("Error in handling gemini command", error);
    }
}

export default handler;
