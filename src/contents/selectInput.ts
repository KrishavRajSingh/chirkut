document.addEventListener('focus', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if the focused element is an input, textarea, or contenteditable
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true'
    ) {
      // Assign a unique identifier to the input element
      if (!target.dataset.chirkutId) {
        target.dataset.chirkutId = `chirkut-input-${Date.now()}`;
      }
    }
  }, true);
  
  // Message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message received', message);   
    
    if (message.action === "getActiveInputInfo") {
      // Find the currently focused input element
      const activeInput = document.activeElement as HTMLElement;
      
      if (
        activeInput && 
        (activeInput.tagName === 'INPUT' || 
         activeInput.tagName === 'TEXTAREA' || 
         activeInput.contentEditable === 'true')
      ) {
        sendResponse({ 
          inputElementId: activeInput.dataset.chirkutId 
        });
      }
    }
    
    if (message.action === "insertResponse") {
      // Find the input element by its unique ID
      // console.log("inserted", message);
      
      const targetInput = document.querySelector(`[data-chirkut-id="${message.inputElementId}"]`) as HTMLInputElement;
      console.log(targetInput, "tr");
      
      if (targetInput) {
        // Insert the response
        console.log("inserted", message.response);
        
        targetInput.innerText = message.response;
        
        // Dispatch input event to trigger any listeners
        const event = new Event('input', { bubbles: true });
        targetInput.dispatchEvent(event);
      }
    }
    
    // Required for async sendResponse
    return true;
  });