import { askGemini } from "~services/geminiService";
import { Storage } from "@plasmohq/storage"
// interface SpeechRecognitionEvent extends Event {
//   results: SpeechRecognitionResultList;
// }

// interface SpeechRecognitionResultList {
//   [index: number]: SpeechRecognitionResult;
//   length: number;
// }

// interface SpeechRecognitionResult {
//   [index: number]: SpeechRecognitionAlternative;
//   length: number;
//   isFinal: boolean;
// }

// interface SpeechRecognitionAlternative {
//   transcript: string;
//   confidence: number;
// }
// interface SpeechRecognition extends EventTarget {
//   continuous: boolean;
//   interimResults: boolean;
//   onresult: (event: SpeechRecognitionEvent) => void;
//   onend: () => void;
//   start: () => void;
//   stop: () => void;
// }

// declare global {
//   interface Window {
//     SpeechRecognition: {
//       new (): SpeechRecognition;
//     };
//     webkitSpeechRecognition: {
//       new (): SpeechRecognition;
//     };
//   }
// }
const storage = new Storage();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "switchToNextTab") {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        if (tabs.length <= 1) return;
        console.log(tabs.findIndex(tab => tab.active));
        
        const activeTabIndex = tabs.findIndex(tab => tab.active);
        const nextTabIndex = (activeTabIndex + 1) % tabs.length;
        
        chrome.tabs.update(tabs[nextTabIndex].id!, { active: true });
        sendResponse("next")
      });
    } else if(request.action === "searchInNewTab"){
      console.log('creating', request.payload);
      if(request.payload)
      chrome.tabs.create({url: `https://www.google.com/search?q=${request.payload}`});
      sendResponse('searched');
    } else if(request.action === "searchPlace"){
      console.log('searching', request.payload);
      if(request.payload)
      chrome.tabs.create({url: `https://www.google.com/maps/search/${request.payload}`});
      // window.open(`https://www.google.com/maps/search/${request.payload}`);
      sendResponse('searched');
    } else if(request.action === "askGemini"){
      console.log('asking gemini', request.prompt);
      if(request.prompt)
      askGemini(request.prompt).then((response) => {
        console.log(response, 'background');
        sendResponse(response);
      });
    }
  });
  let recognition: any;
  var window = window ?? self;
chrome.runtime.onInstalled.addListener(async () => {
  console.log('installed');
  const tab = await chrome.tabs.create({ url: "tabs/voice-listener.html", pinned: true })
  await storage.set("listenerTabId", tab.id)
  // recognition = new (window as any).webkitSpeechRecognition();
  // recognition.continuous = true;
  // recognition.interimResults = false;

  // recognition.onstart = () => {
  //   console.log("Speech recognition started");
  // };

  // recognition.onresult = (event: any) => {
  //   const last = event.results.length - 1;
  //   const command = event.results[last][0].transcript.toLowerCase();
    
  //   if (command.includes("hey bunny")) {
  //     console.log("Command: ", command);     
  //   }
  // };
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const listenerTabId = await storage.get("listenerTabId")
    console.log(tabId, listenerTabId, "backIndex");
    
    if (tabId === Number(listenerTabId)) {
      const newTab = await chrome.tabs.create({ url: "tabs/voice-listener.html", pinned: true })
      await storage.set("listenerTabId", newTab.id)
    }
  })
