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

const scrollPage = async (direction: ScrollDirection, pixels?: number): Promise<void> => {
    try{
        const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
        if(!activeTab.id) return;
        
        const scrollAmount = pixels || 100;
        const scrollScript = `window.scrollBy({top: ${direction === 'up' ? -scrollAmount : scrollAmount}, behavior: 'smooth'})`;

        await chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            func:   (scrollScript) => {
                eval(scrollScript);
            },
            args: [scrollScript]
        })
    }catch(err){
        console.error(`Error scrolling ${direction} direction`, err);
        throw err;
    }
};

export const scrollUp = (pixels?: number) => scrollPage('up', pixels);
export const scrollDown = (pixels?: number) => scrollPage('down', pixels);