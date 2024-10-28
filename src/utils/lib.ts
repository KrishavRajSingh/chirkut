import { askGemini } from "~services/geminiService";
import { prompt } from "./prompts";

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

// Define a more precise type for the response
type GeminiResponse = {
  function: 'nextTab' | 'previousTab' | 'scrollUp' | 'scrollDown' | 'closeTab' 
  | 'openWebsite' | 'readScreen' | 'readSection' | 'clickElement' | 'controlMedia';
  parameters?: { [key: string]: any };
};

// Function to send content to Gemini for analysis
async function analyzeContent(content, structure, command) {

// const prompt2 = `
// You are an AI assistant helping a blind user understand the content of a webpage. You will receive structured data extracted from the webpage, including the URL, main content and user command. Your task is to analyze this data and provide the content information based on user's command. Always prioritize the user's full command first carefully understand the user's needs and pay attention what the user is asking for. If the user does not provide a clear command, you should provide the most relevant content information based on the url in a concise manner.

// Extracte data:
// {
//   "url": ${content.url},
//   "mainText": ${content.content},
//   "userCommand": ${command}
// }

// Based on the URL and content, determine the type of website (e.g., YouTube, Google Search, Wikipedia, news article, etc.) and provide content present in the website. Sometimes the user can ask for a specific content he wants to find, like 'what are the music videos on this pages' or 'which videos has most views' or 'Price of an item that the user searched for etc., in these cases analyze the whole page and then answer to the point. Here are some guidelines if the user has not specified what to return:

// 1. For YouTube (url contains "youtube.com"):
//   - Focus only on video titles and channel names, if the user specifies other things like views and time in the userCommand then return that.
//   - If it's a specific video page, describe the video title, channel and view count
//   - If the title is long try to shorten it.

// 2. For Google Search (url contains "google.com" and "/search"):
//   - Focusing on the titles until and unless user specifies what it wants.
//   - Mention any featured snippets or special search features (e.g., "People also ask").
//   - If possible, identify the search query from the URL and mention it.

// 3. For Wikipedia (url contains "wikipedia.org"):
//   - Provide a brief overview of the main topic.
//   - Mention key sections or headings.
//   - If it's the main page, describe any featured articles or current events.

// 4. For news articles:
//   - Summarize the headline and main points of the article.
//   - Mention the source and publication date if available.
//   - If it's a news homepage, mention top headlines or sections.

// 5. For social media sites (e.g., Twitter, Facebook, LinkedIn):
//   - Describe the type of page (personal profile, company page, news feed, etc.).
//   - Mention any trending topics or important updates.

// 6. For e-commerce sites (e.g., Amazon, eBay):
//   - If it's a product page, describe the product name, price, and key features.
//   - If it's a category page, mention the category and top products.

// 7. For other websites:
//   - Provide a general overview of the page's purpose and main content.
//   - Highlight any important headings or sections.

// Always prioritize the most relevant information for the user's understanding of the page. Keep your response concise and focused on the key elements that define the website type. Keep the response concise and don't use any formatting.

// EXAMPLE INPUT:
// {
//   "url": "https://www.youtube.com/",
//   "mainText": ["How to code like a pro, 22M, 3 years ago", "Summer Mix 2024 (1M views), 3 days ago", "Tujhe dekha toh ye jana sanam Song, 100k, 6 mkonths ago"...]",
//   "userCommand": "what music videos are present on my screen?"
// }

// EXAMPLE OUTPUT:
// Based on the YouTube page you're viewing, here are the trending music videos:
// • Summer Mix 2024
// • Tujhe dekha toh ye jana sanam Song
// [rest of the response...]

// {
//   "url": "https://www.youtube.com/",
//   "mainText": ["How to code like a pro, 22M, 3 years ago", "Summer Mix 2024 (1M views), 3 months ago", "Tujhe dekha toh ye jana sanam Song, 100k, 6 days ago"...]",
//   "userCommand": "recently uploaded videos on my screen?"
// }

// EXAMPLE OUTPUT:
// Based on the YouTube page you're viewing, here are the trending music videos:
// • Tujhe dekha toh ye jana sanam Song, 6 days ago
// • Summer Mix 2024, 3 months ago
// [rest of the response...]

// {
//   "url": "https://www.youtube.com/",
//   "mainText": ["How to code like a pro, 22M, 3 years ago", "Summer Mix 2024 (1M views), 3 days ago", "Tujhe dekha toh ye jana sanam Song, 100k, 6 months ago"...]",
//   "userCommand": "most viewed videos on my screen?"
// }

// EXAMPLE OUTPUT:
// Based on the YouTube page you're viewing, here are the trending music videos:
// • How to code like a pro (22M views)
// • Summer Mix 2024 (1M views)
// [rest of the response...]


// Remember, the user is blind, so focus on the content rather than visual elements. Use the URL to provide context, but rely primarily on the extracted content for your summary. You must return what the user is asking for.
// `;

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

            // function extractLinks() {
            //   const headings: HTMLElement[] = Array.from(document.querySelectorAll('a'));
            //   return headings.map(heading => ({
            //       level: parseInt(heading.tagName.charAt(1)),
            //       text: heading.innerText.trim(),
            //       id: heading.id || null
            //   }));
            // }


            const content = extractMainContent();
            const structure = extractStructuredContent();
            // const links = extractLinks();
            console.log("hua", structure);
            return {content, structure};
            // const analysis = await analyzeContent(content, structure);
            // console.log("gemini swara", analysis)
            // chrome.tts.speak(analysis.summary);
        
            // return {
            //     pageTitle: content.title,
            //     pageUrl: content.url,
            //     ...analysis
            // };
          }
      });
      console.log("yayayya", screenData.result.content, screenData.result.structure);
      const analysis = await analyzeContent(screenData.result.content, screenData.result.structure, command);
      // chrome.tts.speak(analysis, {rate: 0.8});
      chrome.tts.speak(analysis, {
        onEvent: async (event) => {
          // console.log('Event:', event);
          if (event.type === 'end') {
              console.log(await chrome.runtime.sendMessage({type: 'restartListening'}));
            // });
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
    console.log('hi1');
    
    const [videoPaused] = await chrome.scripting.executeScript({
      target: {tabId: activeTabId},
      func: async(message)=>{
        console.log('hi2', message);
        const video =  document.querySelector("video");
        console.log(video);
        if(message==='pause')
          await video.pause();
        else{
          video.muted = true;
          await video.play();
        }
        console.log("video ha pause", video.paused);
        if(video.paused === true || video.paused === null){
          video.muted = true;
          video.play();
        }
        return {playing: !video.paused};
      },
      args: [message]
    })
    console.log("videoPaused", videoPaused);
    
    if(!videoPaused.result.playing)
      chrome.tts.speak("Press Space Bar to play the video");
  } catch(err){
    console.error(err);
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
            chrome.tabs.create({ url: response.parameters.url });
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
      default:
        console.warn(`Unknown function: ${response.function}`);
        notifyUser = false;
    }
    // chrome.tts.speak("done");
  } catch (error) {
    console.error(`Error executing command: ${response.function}`, error);
  }
};