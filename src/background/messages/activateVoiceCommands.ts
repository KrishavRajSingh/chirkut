import type { PlasmoMessaging } from "@plasmohq/messaging";
// import { Storage } from "@plasmohq/storage";

// const storage = new Storage()  ;
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const tabs = await chrome.tabs.query({currentWindow: true});
    
    if(req.body.voiceActivated) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "showButton" });
      })
    } else {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "hideButton" });
      })
    }
    res.send({ success: true });
}

export default handler;