import type { PlasmoMessaging } from "@plasmohq/messaging";
// import { Storage } from "@plasmohq/storage";

// const storage = new Storage()  ;
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const tabs = await chrome.tabs.query({});
  
    if(req.body.voiceActivated) {
      tabs.forEach(async (tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "showButton" });
        chrome.tts.speak('hmm', {voiceName: "Bells"});
        console.log("hi");
      })
    } else {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "hideButton" });
      })
    }
    res.send({ success: true });
}

export default handler;