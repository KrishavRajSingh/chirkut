import type { PlasmoMessaging } from "@plasmohq/messaging";
import { nextTab } from "~utils/lib";
import { stopSpeaking } from "~utils/voiceControlLib";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    // chrome.tabs.query({ currentWindow: true }, (tabs) => {
    //     if (tabs.length <= 1) return;
    //     console.log(tabs.findIndex(tab => tab.active));
        
    //     const activeTabIndex = tabs.findIndex(tab => tab.active);
    //     const nextTabIndex = (activeTabIndex + 1) % tabs.length;
        
    //     chrome.tabs.update(tabs[nextTabIndex].id!, { active: true });
    // });
    // res.send({ success: true });
    stopSpeaking();
}

export default handler;