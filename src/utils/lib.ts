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


function parseGeminiResponse(response) {
  // Regular expression to match JSON content within triple backticks
  const jsonRegex = /```json\s*(\{[\s\S]*?(```|[^`])*\})\s*```/;

  const match = response.match(jsonRegex);

  if (match && match[1]) {
    try {
      // Parse the extracted JSON string
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    console.error("No valid JSON found in the response");
    return null;
  }
}
// Function to send content to Gemini for analysis
async function analyzeContent(content, structure, command) {
  console.log("content", content.content, command);
  
//   const prompt = `
// Analyze the following webpage content and structure:

// Title: ${content.title}
// URL: ${content.url}

// Content:
// ${content.content}

// Structure:
// ${JSON.stringify(structure, null, 2)}

// Please provide:
// 1. A brief summary of the page (2-3 sentences)
// 2. Main topics or sections (up to 5)
// 3. Any key points or important information
// 4. Suggestions for relevant sections the user might want to explore

// Return your analysis as a JSON object with the following structure:
// {
//   "summary": "string",
//   "mainTopics": ["string"],
//   "keyPoints": ["string"],
//   "suggestedSections": [
//       {
//           "title": "string",
//           "reason": "string"
//       }
//   ]
// }
// `;

console.log('main');

const prompt2 = `
You are an AI assistant helping a blind user understand the content of a webpage. You will receive structured data extracted from the webpage, including the URL, main content and user command. Your task is to analyze this data and provide the content information based on user's command. Always prioritize the user's full command first carefully understand the user's needs and pay attention what the user is asking for. If the user does not provide a clear command, you should provide the most relevant content information based on the url in a concise manner.

Extracte data:
{
  "url": ${content.url},
  "mainText": ${content.content},
  "userCommand": ${command}
}

Based on the URL and content, determine the type of website (e.g., YouTube, Google Search, Wikipedia, news article, etc.) and provide content present in the website. Sometimes the user can ask for a specific content he wants to find, like 'what are the music videos on this pages' or 'which videos has most views' or 'Price of an item that the user searched for etc., in these cases analyze the whole page and then answer to the point. Here are some guidelines if the user has not specified what to return:

1. For YouTube (url contains "youtube.com"):
  - Focus only on video titles and channel names, if the user specifies other things like views and time in the userCommand then return that.
  - If it's a specific video page, describe the video title, channel and view count
  - If the title is long try to shorten it.

2. For Google Search (url contains "google.com" and "/search"):
  - Focusing on the titles until and unless user specifies what it wants.
  - Mention any featured snippets or special search features (e.g., "People also ask").
  - If possible, identify the search query from the URL and mention it.

3. For Wikipedia (url contains "wikipedia.org"):
  - Provide a brief overview of the main topic.
  - Mention key sections or headings.
  - If it's the main page, describe any featured articles or current events.

4. For news articles:
  - Summarize the headline and main points of the article.
  - Mention the source and publication date if available.
  - If it's a news homepage, mention top headlines or sections.

5. For social media sites (e.g., Twitter, Facebook, LinkedIn):
  - Describe the type of page (personal profile, company page, news feed, etc.).
  - Mention any trending topics or important updates.

6. For e-commerce sites (e.g., Amazon, eBay):
  - If it's a product page, describe the product name, price, and key features.
  - If it's a category page, mention the category and top products.

7. For other websites:
  - Provide a general overview of the page's purpose and main content.
  - Highlight any important headings or sections.

Always prioritize the most relevant information for the user's understanding of the page. Keep your response concise and focused on the key elements that define the website type. Keep the response concise and don't use any formatting.

EXAMPLE INPUT:
{
  "url": "https://www.youtube.com/",
  "mainText": ["How to code like a pro, 22M, 3 years ago", "Summer Mix 2024 (1M views), 3 days ago", "Tujhe dekha toh ye jana sanam Song, 100k, 6 mkonths ago"...]",
  "userCommand": "what music videos are present on my screen?"
}

EXAMPLE OUTPUT:
Based on the YouTube page you're viewing, here are the trending music videos:
• Summer Mix 2024
• Tujhe dekha toh ye jana sanam Song
[rest of the response...]

{
  "url": "https://www.youtube.com/",
  "mainText": ["How to code like a pro, 22M, 3 years ago", "Summer Mix 2024 (1M views), 3 months ago", "Tujhe dekha toh ye jana sanam Song, 100k, 6 days ago"...]",
  "userCommand": "recently uploaded videos on my screen?"
}

EXAMPLE OUTPUT:
Based on the YouTube page you're viewing, here are the trending music videos:
• Tujhe dekha toh ye jana sanam Song, 6 days ago
• Summer Mix 2024, 3 months ago
[rest of the response...]

{
  "url": "https://www.youtube.com/",
  "mainText": ["How to code like a pro, 22M, 3 years ago", "Summer Mix 2024 (1M views), 3 days ago", "Tujhe dekha toh ye jana sanam Song, 100k, 6 months ago"...]",
  "userCommand": "most viewed videos on my screen?"
}

EXAMPLE OUTPUT:
Based on the YouTube page you're viewing, here are the trending music videos:
• How to code like a pro (22M views)
• Summer Mix 2024 (1M views)
[rest of the response...]


Remember, the user is blind, so focus on the content rather than visual elements. Use the URL to provide context, but rely primarily on the extracted content for your summary. You must return what the user is asking for.
`;
  // This is a placeholder for the actual API call to Gemini
  // You'll need to implement the actual API call based on your setup
  const response = await askGemini(prompt(content, command));
  // console.log("response", parseGeminiResponse(response));
  
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
                  content: mainContent.innerText.trim().substring(0, 5000) // Limit to 5000 characters
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
          console.log('Event:', event);
          if (event.type === 'end') {
            // Speech finished, now send the message
            // chrome.runtime.sendMessage({action: 'handleListening'}, async() => {
              // console.log('Message sent after speech ended');
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

// async function readSection(sectionId) {
//   const section = document.getElementById(sectionId);
//   if (!section) {
//       return { error: "Section not found" };
//   }

//   const sectionContent = section.innerText.trim().substring(0, 2000); // Limit to 2000 characters

//   const prompt = `
// Analyze the following section content:

// ${sectionContent}

// Please provide:
// 1. A brief summary of the section (1-2 sentences)
// 2. Key points or important information (up to 3)

// Return your analysis as a JSON object with the following structure:
// {
//   "summary": "string",
//   "keyPoints": ["string"]
// }
// `;

//   const analysis = await callGeminiAPI(prompt);
  
//   return {
//       sectionId: sectionId,
//       sectionHeading: section.querySelector('h1, h2, h3, h4, h5, h6')?.innerText || "Unnamed Section",
//       ...JSON.parse(analysis)
//   };
// }

const ClickedElement = async (elements, message, url) => {
  console.log(elements, message, url, "hhhhhh");
  
  // const prompt = `
  //   You are an AI assistant helping a blind user interact with a webpage. You have previously described the page content to the user. Now, you will receive the user's voice command along with a list of clickable elements on the page. Your task is to interpret the user's intent and identify the most likely element they want to interact with.

  //   This is the data extracted from user's current webpage:
  //   {
  //     "userCommand": ${message},
  //     "pageUrl": ${url},
  //     "clickableElements": ${elements}
  //   }

  // Guidelines for interpreting commands:

  // 1. YouTube:
  //   - "Play [video name]" or "Watch [video name]" should match to the closest video title.
  //   - "Go to channel [name]" should match to channel links.
  //   - "Click [text]" should match buttons or links with that text.

  // 2. Google Search:
  //   - "Open [result name]" or "Go to [result name]" should match the closest search result link.
  //   - "Show more" or "Expand" might refer to "People also ask" expandable sections.

  // 3. Wikipedia:
  //   - "Go to section [name]" should match section headings.
  //   - "Read about [topic]" should match links to other Wikipedia pages.

  // 4. News sites:
  //   - "Read article [title]" should match article links.
  //   - "Open [section name]" should match section links.

  // 5. General:
  //   - "Click [text]" or "Press [text]" should match buttons or links with that text.
  //   - "Back" should be interpreted as going to the previous page.
  //   - "Home" should be interpreted as going to the website's homepage.

  // Always consider partial matches and synonyms. The user may not remember or pronounce names exactly.

  // If you find a match, respond with:
  // "Matching element found: [element details]. Confidence: [High/Medium/Low]"

  // If no good match is found, respond with:
  // "No clear match found. Possible interpretations: [list of 2-3 closest matches or suggestions]"

  // If the command is unclear, respond with:
  // "Command unclear. Did you mean to [possible interpretation]?"

  // Remember, accuracy is crucial as the user cannot visually confirm selections.
  // `;
  const prompt = `
  You are a voice navigation assistant. You will receive:
1. An array of clickable elements, each containing:
   - elementText: The visible text of the element
   - type: The element type (link or button)
   - url: The destination URL (may be empty in case of button)
   - ariaLabel: The aria-label of the element
2. A voice command from the user

Your task is to:
1. Find the most closely matching clickable element for the user's voice command, use aria-label first then go for text.
2. Return ONLY a JSON object in this exact format:
{
  "elementText": <text contained inside the element>,
  "type": <link | button>
}

Rules for matching:
- Use fuzzy matching to account for slight differences between spoken words and text
- Consider partial matches (e.g., "go home" should match "Home")
- Ignore case when matching
- For time stamps or complex text, match the semantic meaning
- If no good match is found, return matched: false and confidence: 0
- If multiple matches exist, choose the one with highest confidence
- Consider common voice command patterns (e.g., "click on X", "go to X", "open X")
- The match must be from the input clickableItems

Example Input:
Voice command: "take me to downloads page"
Elements: [The array of elements you provided]

Example Output:
{
  "elementText": "shorts",
  "type": "button"
}

This is the extracted data:
{
     "userCommand": ${message},
    "pageUrl": ${url},
   "clickableElements": ${JSON.stringify(elements)}
  }
  
`;
  const prompt2 = `
  You are an AI assistant helping a blind user interact with a webpage. You have previously described the page content to the user. Now, you will receive the user's voice command along with a list of clickable elements on the page. Your task is to interpret the user's intent and identify the most likely element they want to interact with.

  This is the extracted data:
{
  "userCommand": "${message}",
  "pageUrl": "${url}",
  "clickableElements": ${JSON.stringify(elements)}
}

Guidelines for interpreting commands:

1. Button Interactions:
   - If the user mentions a button by name, match it to the button's text, aria-label, or title.
   - If the user says "Click the [icon name] button", match it to buttons with that icon name.
   - For commands like "Submit", "Send", or "Search", look for buttons with matching or similar functionality.
   - If the user mentions a specific action (e.g., "Play", "Pause", "Next"), look for buttons with matching functionality, even if they don't have text.

2. YouTube:
   - "Play [video name]" or "Watch [video name]" should match to the closest video title.
   - "Go to channel [name]" should match to channel links.
   - For playback controls, match to buttons with appropriate icon names or aria-labels (e.g., "play", "pause", "next").

3. Google Search:
   - "Open [result name]" or "Go to [result name]" should match the closest search result link.
   - "Show more" or "Expand" might refer to "People also ask" expandable sections.

4. Wikipedia:
   - "Go to section [name]" should match section headings.
   - "Read about [topic]" should match links to other Wikipedia pages.

5. News sites:
   - "Read article [title]" should match article links.
   - "Open [section name]" should match section links.

6. General:
   - "Click [text]" or "Press [text]" should match buttons or links with that text, aria-label, or title.
   - "Back" should be interpreted as going to the previous page.
   - "Home" should be interpreted as going to the website's homepage.

Always consider partial matches and synonyms. The user may not remember or pronounce names exactly.

If you find a match, respond with:
"Matching element found: [element details]. Confidence: [High/Medium/Low]"

If no good match is found, respond with:
"No clear match found. Possible interpretations: [list of 2-3 closest matches or suggestions]"

If the command is unclear, respond with:
"Command unclear. Did you mean to [possible interpretation]?"

Remember, accuracy is crucial as the user cannot visually confirm selections.`;
  const response = await askGemini(prompt);
  return response.includes("`")?parseGeminiResponse(response):response;
};
export const clickElement = async (message) => {
  try{
    const [activeTab] = await chrome.tabs.query({active: true});
    if(!activeTab.id) return;

    const [screenData] = await chrome.scripting.executeScript({
      target: {tabId: activeTab.id},
      func: ()=>{
          const links = Array.from(document.querySelectorAll('a')).filter(link=>link.innerText.trim()).map(a=>({
              type: 'link',
              text: a.innerText.trim(),
              url: a.href,
              ariaLabel: a.ariaLabel
          }))

          const buttons = Array.from(document.querySelectorAll('button')).filter(b=>b.innerText.trim()).map(b => ({
            type: 'button',
            text: b.innerText.trim(),
            button: b.ariaLabel
          }));

          return {links, buttons};
      }
    });
    const element = await ClickedElement([ ...screenData.result.links, ...screenData.result.buttons ], message, activeTab.url);

    await chrome.scripting.executeScript({
      target: {tabId: activeTab.id},
      func: (element) => {
        console.log(element);
        const [elementToBeClicked] = Array.from(document.querySelectorAll(element.type==='link'? 'a': 'button')).filter(el=>el.innerText.trim().includes(element.elementText));
        console.log(elementToBeClicked, 'ye');
        if(elementToBeClicked)
        elementToBeClicked.click();
        // console.log('dbane me mja aya');
        
      },
      args: [element]
    })
    console.log(element, "siska hi kuch krdo");
    
  } catch(err){
    console.error("Error while clicking element", err)
  }
}

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