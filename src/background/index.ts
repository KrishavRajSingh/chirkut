import { askGemini } from "~services/geminiService";
import { placePrompt } from "~utils/prompts";

  let id;
chrome.runtime.onInstalled.addListener(async () => {
  console.log('installed');
  chrome.contextMenus.create({
    id: "baap",
    title: "Chirkut",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "findMeaning",
    title: "Find Meaning",
    parentId: "baap",
    contexts: ["selection"]
  })

  chrome.contextMenus.create({
    id: "askChirkut",
    title: "Ask Chirkut",
    parentId: "baap",
    contexts: ["selection"]
  })

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
  if (info.menuItemId === "findMeaning" && info.selectionText) {
    console.log(info.selectionText);
    
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${info.selectionText}`);
      const data = await response.json();
      
      const meaning = data[0]?.meanings[0]?.definitions[0]?.definition || "Meaning not found";
      // const meaning = await askGemini(info.selectionText);
      // Send the meaning back to the content script to display
      chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (meaning) => {
              alert(`Meaning: ${meaning}`);
          },
          args: [meaning]
      });
  } else if(info.menuItemId === "askChirkut"){
    const meaning = await askGemini(info.selectionText);
      // Send the meaning back to the content script to display
      chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (meaning) => {
              alert(`Meaning: ${meaning}`);
          },
          args: [meaning]
      });
  }
});

// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//   if(changeInfo.status === 'complete' && !tab.url.startsWith("chrome://")){
//     if(tabId === Number(id))
//       return;
//     const text = await chrome.scripting.executeScript({
//       target: {tabId},
//       func: () => {
//         const text = document.body.innerText;
//         return text;
//       }
//     });
//     console.log(text[0].result);
  
//     const places = await askGemini
//     (placePrompt(text[0].result));
//     console.log(places);

//   }
// })
