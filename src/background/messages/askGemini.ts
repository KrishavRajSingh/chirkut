import type { PlasmoMessaging } from "@plasmohq/messaging";
import { askGemini } from "~services/geminiService";
import { executeCommand } from "~utils/lib";
type GeminiResponse = {
    function: 'nextTab' | 'previousTab' | 'scrollUp' | 'scrollDown' | 'closeTab' | 'openWebsite';
    parameters?: { [key: string]: any };
  };
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try{
        const message = req.body;
        console.log("Gemini message received", message);
        const geminiResponse: GeminiResponse = JSON.parse(await askGemini(message));
        console.log("answer from gemini", geminiResponse);
        // chrome.runtime.sendMessage({request});
        await executeCommand(geminiResponse);
        // chrome.tts.speak('done');
        res.send({ success: true, data: geminiResponse });

    } catch (error) {
        console.error("Error in handling gemini command");
        throw error;
    }
}

export default handler;
