import { askGemini } from "~services/geminiService";
import { prompt } from "./prompts";
import { speak } from "./voiceControlLib";
import { googleAiOverViewSelector, googleTopSectionSelector } from "./selectors";
import type { GeminiResponse } from "./types";

type ScrollDirection = 'up' | 'down';
type Switchdirection = 'next' | 'previous';

const switchTab = (direction: Switchdirection) => {
    try{
      chrome.tabs.query({currentWindow: true}, (tabs) => {
          if(tabs.length <= 1) return;
  
          const activeTabIndex = tabs.findIndex(tab => tab.active);
          const nextTabIndex = direction === 'next' ? (activeTabIndex + 1) % tabs.length : (activeTabIndex - 1 + tabs.length) % tabs.length;
  
          chrome.tabs.update(tabs[nextTabIndex].id!, {active: true});
      })
    } catch(error){
      console.error("Error switching tab", error);
    }
};

export const nextTab = () => switchTab('next');
export const previousTab = () => switchTab('previous');
  
const scrollPage = async (direction: ScrollDirection, pixels?: number | "max"): Promise<void> => {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true });
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
        // throw error;
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

async function analyzeContent(content, structure, command) {
  const response = await askGemini(prompt(content, command));
  return response;
}

export const readScreen = async (command) => {
    try{
      const [activeTab] = await chrome.tabs.query({ active: true });
      if (!activeTab.id) return;

      const [screenData] = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: async() => {
            function extractMainContent() {
              const mainElements: HTMLElement[] = [
                  document.querySelector('main'),
                  document.querySelector('article'),
                  document.querySelector('#content'),
                  document.querySelector('.content'),
                  document.body
              ].filter(Boolean) as HTMLElement[];
            
              const mainContent = mainElements[0] || document.body;
            
              return {
                  title: document.title,
                  url: window.location.href,
                  content: mainContent.innerText.trim()
              };
            }
            
            // Function to extract structured content
            function extractStructuredContent() {
              const headings: HTMLElement[] = Array.from(document.querySelectorAll('h1, h2, h3'));
              return headings.map(heading => ({
                  level: parseInt(heading.tagName.charAt(1)),
                  text: heading.innerText.trim(),
                  id: heading.id || null
              }));
            }

            const content = extractMainContent();
            const structure = extractStructuredContent();
            // console.log("hua", structure);
            return {content, structure};
          }
      });
      // console.log("yayayya", screenData.result.content, screenData.result.structure);
      const analysis = await analyzeContent(screenData.result.content, screenData.result.structure, command);
      // chrome.tts.speak(analysis, {rate: 0.8});
      chrome.tabs.sendMessage(activeTab.id, {action: "showModal", message: analysis});
      chrome.tts.speak(analysis, {
        onEvent: async (event) => {
          // console.log('Event:', event);
          if (event.type === 'end') {
              try{
                const res = await chrome.runtime.sendMessage({type: 'restartListening'});
                console.log("listening restarted:", res.success);
                
              }catch(err){
                console.error("Error restarting listeing", err);
              }
          }
        }, voiceName: "Samantha"
      });
      
      // console.log("ye dekh bkl", analysis.summary);
      // await chrome.runtime.sendMessage({type: 'resumeListening', listening: true});
    }catch (error) {
      console.error("Error reading screen", error);
      // throw error;
    }
}

const CLICKABLE_ELEMENTS = {
  LINK: 'a',
  BUTTON: 'button, [role="button"]',
  INPUT: 'input',
  MEDIA: 'video, audio',
  INTERACTIVE: '[role="tab"], [role="menuitem"], [role="option"], [role="link"], [role="checkbox"], [role="radio"]'
};

export const clickElement = async (message) => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true });
    if (!activeTab.id) return;

    // First collect all clickable elements
    const [screenData] = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        const getElementData = (element) => {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && 
            window.getComputedStyle(element).visibility !== 'hidden' &&
            window.getComputedStyle(element).display !== 'none';

          // Create a unique path to the element
          const getXPath = (element) => {
            const idx = (el) => {
              let count = 1;
              for (let sib = el.previousElementSibling; sib; sib = sib.previousElementSibling) {
                if (sib.tagName === el.tagName) count++;
              }
              return count;
            };

            const parts = [];
            for (; element && element.nodeType === Node.ELEMENT_NODE; element = element.parentNode) {
              let part = element.tagName.toLowerCase();
              if (element.id) {
                part += `[@id='${element.id}']`;
              } else {
                const index = idx(element);
                if (index > 1) part += `[${index}]`;
              }
              parts.unshift(part);
            }
            return '/' + parts.join('/');
          };

          // Get all text content, including nested text
          const getAllText = (element) => {
            const texts = [];
            
            // Get direct text
            const directText = element.innerText?.trim() || '';
            if (directText) texts.push(directText);
            
            // Get attribute text
            const attributes = [
              element.getAttribute('aria-label'),
              element.getAttribute('title'),
              element.getAttribute('alt'),
              element.value,
              element.placeholder
            ].filter(Boolean);
            texts.push(...attributes);
            
            // For links, clean up the URL to potentially useful text
            if (element.href) {
              const url = new URL(element.href);
              const pathParts = url.pathname.split('/').filter(Boolean);
              texts.push(...pathParts);
            }

            return texts.join(' ').toLowerCase();
          };

          return {
            type: element.tagName.toLowerCase(),
            xpath: getXPath(element),
            text: getAllText(element),
            isVisible,
            attributes: {
              href: element.href || '',
              ariaLabel: element.getAttribute('aria-label') || '',
              title: element.getAttribute('title') || '',
              role: element.getAttribute('role') || '',
              classes: Array.from(element.classList)
            }
          };
        };

        // Collect all potentially clickable elements
        const elements = Array.from(document.querySelectorAll('a, button, input, [role="button"], [role="link"], [role="tab"], video, audio'))
          .filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
          })
          .map(getElementData);

        return {
          elements,
          url: window.location.href,
          title: document.title
        };
      }
    });

    // Scoring function to find best match
    const findBestMatch = (elements, command, url) => {
      if(command.includes("click")){
        command = command.replace("click", "").trim();
      }
      const searchTerms = command.toLowerCase()
        .replace(/click|press|select|the|on|at/g, '')
        .trim()
        .split(' ')
        .filter(Boolean);

      return elements.map(element => {
        let score = 0;
        const text = element.text;

        // Exact phrase match (highest priority)
        if (text.includes(searchTerms.join(' '))) {
          score += 100;
        }

        // Individual word matches
        searchTerms.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          if (regex.test(text)) {
            score += 20;
          } else if (text.includes(term)) {
            score += 10;
          }
        });

        // Context-based scoring
        if (url.includes('youtube.com')) {
          if (element.attributes.classes.some(c => c.includes('video-title'))) {
            score += 10;
          }
          if (command.toLowerCase().includes('video') && element.type === 'a') {
            score += 5;
          }
        }

        // Boost score based on element type and attributes
        if (element.attributes.ariaLabel && searchTerms.some(term => 
          element.attributes.ariaLabel.toLowerCase().includes(term))) {
          score += 15;
        }

        return {
          ...element,
          score
        };
      }).sort((a, b) => b.score - a.score);
    };

    const matches = findBestMatch(
      screenData.result.elements,
      message,
      screenData.result.url
    );

    // Click the element using XPath (more reliable than selectors)
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: (matches) => {
        if (!matches.length) return;

        const getElementByXPath = (xpath) => {
          return document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
        };

        // Try matches in order until we find one we can click
        for (const match of matches.slice(0, 3)) { // Try top 3 matches
          const element = getElementByXPath(match.xpath) as HTMLElement;
          if (element && element.click) {
            // Visual feedback
            const originalOutline = element.style.outline;
            element.style.outline = '2px solid #007bff';
            
            // Scroll if needed
            const rect = element.getBoundingClientRect();
            const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
            if (!isInViewport) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Click after brief delay
            setTimeout(() => {
              element.style.outline = originalOutline;
              console.log("clicking element", element);
              element.click();
              element.innerText = "ho";
            }, 300);
            
            return true;
          }
        }
      },
      args: [matches]
    });
    speak("Clicked");
  } catch (err) {
    console.error("Error while clicking element", err);
  }
};

const getActiveTabId = async(): Promise<number> => {
  const [activeTab] = await chrome.tabs.query({active: true});
  return activeTab.id;
}

export const controlMedia = async (message): Promise<void> => {
  try{
    const activeTabId = await getActiveTabId();
    if(!activeTabId) return;
    // console.log('hi1');
    
    const [videoInfo] = await chrome.scripting.executeScript({
      target: {tabId: activeTabId},
      func: async(message)=>{
        // console.log('hi2', message);
        const video =  document.querySelector("video");
        console.log(video);
        if(message==='pause')
          video.pause();
        else{
          // video.muted = true;
          video.play();
        }
        console.log("video ha pause", video.paused);
        if(message == 'play' && video.paused === true || video.paused === null){
          video.muted = true;
          video.play();
        }
        return {muted: video.muted};
      },
      args: [message]
    })
    console.log("videoPaused", videoInfo);
    
    if(videoInfo.result.muted)
      speak("Video muted due to autoplay policy");
  } catch(err){
    console.error(err);
  }
}

export const askGoogle = async(message) => {
  try{
    chrome.tabs.create({ active: false, url: encodeURI("https://www.google.com/search?q=" + message )}, async (tab) => {
      const onUpdatedListener = async (tabId, changeInfo) => {
        
        if(tabId === tab.id && changeInfo.status === "complete"){
          // const selectors = [googleAiOverViewSelector, googleTopSectionSelector];
          
          const [data] = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: (googleAiOverViewSelector, googleTopSectionSelector) => {
              function waitforSelectors(selectors){
                
                return new Promise(resolve => {
                  const results = {};
                  
                  const observer = new MutationObserver(() => {
                    selectors.forEach((selector) => {
                      const element = document.querySelector(selector);
                      if(element)
                        results[selector] = selector === googleAiOverViewSelector ?
                          "--------AI Summary--------\n" +  element.innerText :
                          "--------Top Google Section--------\n" + element.innerText;
                      
                    })
                    if(Object.keys(results).length === selectors.length){
                      observer.disconnect();
                      resolve(results);
                    }
                  });
                  observer.observe(document.body, {childList: true, subtree: true});
                  setTimeout(() => {
                    observer.disconnect();
                    resolve(results);
                  }, 5000);                 
                });
              }
              
              return waitforSelectors([googleAiOverViewSelector, googleTopSectionSelector]);
            },
            args: [googleAiOverViewSelector, googleTopSectionSelector]
          });
          
          const activetabId = await getActiveTabId();
          chrome.tabs.sendMessage(activetabId, { action: "showModal", message: data.result[googleAiOverViewSelector] || data.result[googleTopSectionSelector] });
          chrome.tabs.onUpdated.removeListener(onUpdatedListener);
        }
      }
      chrome.tabs.onUpdated.addListener(onUpdatedListener);
    })
    
    
  }catch(err){
    console.error("Error gettin Real Time data: ", err )
  }
}

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
            chrome.tabs.create({ url: response.parameters.url }).then((tab) => {
              // chrome.tts.speak("Opened website")
              const websiteLoaded = (tabId, tabInfo) => {
                if(tabId === tab.id && tabInfo.status === "complete"){
                  speak("Website loaded");
                  chrome.tabs.onUpdated.removeListener(websiteLoaded);
                }
                
              }
              chrome.tabs.onUpdated.addListener(websiteLoaded);
            });
        }
        break;
      case 'readScreen':
        console.log(response, "readScreen", response.parameters?.message);
        
        await readScreen(response.parameters?.message);
        break;
      case 'clickElement':
        await clickElement(response.parameters?.elementDescription);
        break;
      case 'controlMedia':
        await controlMedia(response.parameters?.message);
        break;
      case 'askGoogle':
        await askGoogle(response.parameters?.message);
        break;
      default:
        console.warn(`Unknown function: ${response.function}`);
        notifyUser = false;
        speak("Unknown command");
    }
    // chrome.tts.speak("done");
  } catch (error) {
    console.error(`Error executing command: ${response.function}`, error);
  }
};