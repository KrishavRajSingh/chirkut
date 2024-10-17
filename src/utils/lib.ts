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
  
const scrollPage = async (direction: ScrollDirection, pixels?: number): Promise<void> => {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab.id) return;
    
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: (direction: ScrollDirection, pixels: number) => {
            pixels = pixels || window.innerHeight;
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

export const scrollUp = (pixels?: number) => scrollPage('up', pixels);
export const scrollDown = (pixels?: number) => scrollPage('down', pixels);

// Define a more precise type for the response
type GeminiResponse = {
  function: 'nextTab' | 'previousTab' | 'scrollUp' | 'scrollDown';
  parameters?: { [key: string]: any };
};

// Define the executeCommand function with the appropriate types
export const executeCommand = async (response: GeminiResponse): Promise<void> => {
  try {
    switch (response.function) {
      case 'nextTab':
        await nextTab();
        break;
      case 'previousTab':
        await previousTab();
        break;
      case 'scrollUp':
        await scrollUp(response.parameters?.pixels);
        break;
      case 'scrollDown':
        await scrollDown(response.parameters?.pixels);
        break;
      default:
        console.error(`Unknown function: ${response.function}`);
    }
  } catch (error) {
    console.error(`Error executing command: ${response.function}`, error);
  }
};
