import type { PlasmoMessaging } from "@plasmohq/messaging";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    chrome.tabs.create({ url: "https://www.youtube.com" });
  res.send({ success: true });
}

export default handler;