import { sendToBackground } from "@plasmohq/messaging";
import { askGemini } from "~services/geminiService";
import { placePrompt } from "~utils/prompts";

  let id;
chrome.runtime.onInstalled.addListener(async () => {
  console.log('installed');
  chrome.contextMenus.create({
    id: "askChirkut",
    title: "Chirkut",
    contexts: ["selection"]
  });

  const tab = await chrome.tabs.create({ url: "tabs/voice-listener.html", pinned: true });
  id = tab.id;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  // const listenerTabId = id;
  
  if (tabId === Number(id)) {
    const newTab = await chrome.tabs.create({ url: "tabs/voice-listener.html", pinned: true });
    id = newTab.id;
  }
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try{
    if (info.menuItemId === "askChirkut") {
  
      await chrome.tabs.sendMessage(tab.id, { action: "showButton" });
      const response = await chrome.tabs.sendMessage(tab.id, { action: "getActiveInputInfo" });
      const geminiResponse = await askGemini(info.selectionText);

      if(response && response.inputElementId){
        const activeInputElementId = response.inputElementId;
        await chrome.tabs.sendMessage(tab.id, {
          action: "insertResponse",
          response: geminiResponse,
          inputElementId: activeInputElementId
        })
      }else{
        await chrome.tabs.sendMessage(tab.id, {
          action: "showModal",
          message: geminiResponse
        })
      }
      await chrome.tabs.sendMessage(tab.id, { action: "hideButton" });
    }
  } catch (error) {
    console.error("Error handling contextMenus", error);
  }
});