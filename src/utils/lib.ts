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

// export const nextTab = () => {
//     chrome.tabs.query({ currentWindow: true }, (tabs) => {
//         if (tabs.length <= 1) return;
//         console.log(tabs.findIndex(tab => tab.active));
        
//         const activeTabIndex = tabs.findIndex(tab => tab.active);
//         const nextTabIndex = (activeTabIndex + 1) % tabs.length;
        
//         chrome.tabs.update(tabs[nextTabIndex].id!, { active: true });
//     });
// }

// export const previousTab = () => {
//     chrome.tabs.query({currentWindow: true}, (tabs) => {
//         if(tabs.length <= 1) return;

//         const activeTabIndex = tabs.findIndex(tab => tab.active);
//         const previousTabIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;

//         chrome.tabs.update(tabs[previousTabIndex].id!, { active: true });
//     })
// }
// function scrollPageFunction(direction: ScrollDirection, pixels: number) {
//     window.scrollBy({
//       top: direction === 'up' ? -pixels : pixels,
//       behavior: 'smooth'
//     });
//   }
  
const scrollPage = async (direction: ScrollDirection, pixels?: number): Promise<void> => {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab.id) return;
    
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: (direction: ScrollDirection, pixels: number) => {
            window.scrollBy({
                top: direction === 'up' ? -pixels : pixels,
                behavior: 'smooth'
            });
          },
          args: [direction, pixels ?? window.innerHeight]
        });
      } catch (error) {
        console.error(`Error scrolling ${direction}:`, error);
        throw error;
      }
};

export const scrollUp = (pixels?: number) => scrollPage('up', pixels);
export const scrollDown = (pixels?: number) => scrollPage('down', pixels);