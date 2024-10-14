import { askGemini } from "~services/geminiService";

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