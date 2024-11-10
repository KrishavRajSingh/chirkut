import type { PlasmoMessaging } from "@plasmohq/messaging";
import { askGemini } from "~services/geminiService";
import { clickElement, executeCommand, readScreen } from "~utils/lib";
import { PromptTemplate } from "~utils/prompts";
type GeminiResponse = {
    function: 'nextTab' | 'previousTab' | 'scrollUp' | 'scrollDown' | 'closeTab' | 'openWebsite';
    parameters?: { [key: string]: any };
  };

  
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try{
        const message = req.body;
        console.log("Gemini message received", message);
        const geminiResponse: GeminiResponse = JSON.parse(await askGemini(PromptTemplate(message)));
        console.log("answer from gemini", geminiResponse);
        await executeCommand(geminiResponse);
        // const resp = await readScreen(message);
        // chrome.tts.speak('done');
        res.send({ success: true, data: message });

    } catch (error) {
        console.error("Error in handling gemini command", error);
    }
}

export default handler;
