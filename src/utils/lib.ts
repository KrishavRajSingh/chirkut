type ScrollDirection = 'up' | 'down';
type Switchdirection = 'next' | 'previous';

const switchTab = (direction: Switchdirection) => {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
        if(tabs.length <= 1) return;

        const activeTabIndex = tabs.findIndex(tab => tab.active);
        const nextTabIndex = direction === 'next' ? (activeTabIndex + 1) % tabs.length : (activeTabIndex - 1 + tabs.length) % tabs.length;

        chrome.tabs.update(tabs[nextTabIndex].id!, {active: true});
    })
};

export const nextTab = () => switchTab('next');
export const previousTab = () => switchTab('previous');
  
const scrollPage = async (direction: ScrollDirection, pixels?: number | "max"): Promise<void> => {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab.id) return;
    
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: (direction: ScrollDirection, pixels: number | "max") => {
            pixels = pixels === "max" ? (document.body.scrollHeight || document.scrollingElement.scrollHeight) : pixels || window.innerHeight;
            window.scrollBy({
                top: direction === 'up' ? -pixels : pixels,
                behavior: 'smooth'
            });
          },
          args: [direction, pixels ?? 0]
        });
      } catch (error) {
        console.error(`Error scrolling ${direction}:`, error);
        throw error;
      }
};

export const scrollUp = (pixels?: number | "max") => scrollPage('up', pixels);
export const scrollDown = (pixels?: number | "max") => scrollPage('down', pixels);

export const closeTab = async(): Promise<void> => {
  try{
    const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
    if(activeTab.id)
      await chrome.tabs.remove(activeTab.id);
  }catch (error) {
    console.error("Error closing tab", error);
    throw error;
  }
}

// Define a more precise type for the response
type GeminiResponse = {
  function: 'nextTab' | 'previousTab' | 'scrollUp' | 'scrollDown' | 'closeTab' 
  | 'openWebsite';
  parameters?: { [key: string]: any };
};

// Define the executeCommand function with the appropriate types
export const executeCommand = async (response: GeminiResponse): Promise<void> => {
  try {
    let notifyUser = true;
    switch (response.function) {
      case 'nextTab':
        nextTab();
        break;
      case 'previousTab':
        previousTab();
        break;
      case 'scrollUp':
        await scrollUp(response.parameters?.fullPage ? 'max' : response.parameters?.pixels);
        break;
      case 'scrollDown':
        await scrollDown(response.parameters?.fullPage ? 'max' : response.parameters?.pixels);
        break;
      case 'closeTab':
        await closeTab();
        break;
      case 'openWebsite':
        if (response.parameters?.url) {
            chrome.tabs.create({ url: response.parameters.url });
        }
        break;
      default:
        console.warn(`Unknown function: ${response.function}`);
        notifyUser = false;
    }
    chrome.tts.speak("done");
  } catch (error) {
    console.error(`Error executing command: ${response.function}`, error);
  }
};
