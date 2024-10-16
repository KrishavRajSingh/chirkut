import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { scrollDown } from "~utils/lib";
const storage = new Storage()  ;
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    
    if(req.body.voiceActivated) {
      const tab = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tab[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: "showButton" });
      }
    } else {
      const tab = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log("hiding");
      
      const activeTab = tab[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: "hideButton" });
      }
    }
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   const activeTab = tabs[0];
    //   if (activeTab && activeTab.id) {
    //     chrome.tabs.sendMessage(activeTab.id, { action: "showButton" });
    //   }
    // })
    res.send({ success: true });
}

export default handler;