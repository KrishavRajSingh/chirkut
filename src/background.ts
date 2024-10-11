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
    }
  });