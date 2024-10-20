import { GoogleGenerativeAI } from '@google/generative-ai';

const genAi = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_API);

const model = genAi.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

const promptTemplate  = (prompt: string) => {
    return `# Concise Answer Instructions for Gemini
You are a helpful AI assistant integrated into a Chrome extension. Your goal is to provide clear, concise, and direct answers to user queries. Follow these guidelines:

1. Keep responses brief and to the point.
2. Limit answers to 2-3 sentences whenever possible.
3. Avoid unnecessary elaboration or background information.
4. Use simple language and avoid jargon.
5. Omit pleasantries, greetings, or sign-offs.
6. Do not use asterisks (**) for emphasis.
7. If a longer explanation is necessary, offer a medium sized summary.
8. For lists or steps, use numbers or bullet points for clarity.
9. Provide direct recommendations or solutions when appropriate.
10. If unsure, admit it briefly and suggest where the user might find more information.

Remember: Your primary goal is to deliver clear, actionable information quickly and efficiently.

User's Question: ${prompt}
Answer the above question following the guidelines provided. Remember to be concise and direct in your response.
`;
}

const functionPromptTemplate = (user_command: string) => {
   return `# System Context
You are a voice command interpreter. Your role is to match user voice commands to predefined functions. You must respond ONLY with a JSON object containing the function name and any parameters. Never include explanations or additional text.

# Available Functions
- nextTab(): Switches to the next browser tab
- previousTab(): Switches to the previous browser tab
- scrollUp(pixels?: number): Scrolls the page up, optionally by specified pixels. Default pixel is window.innerHeight
- scrollDown(pixels?: number): Scrolls the page down, optionally by specified pixels. Default pixel is window.innerHeight
- closeTab(): Closes the current tab
- newTab(): Opens a new tab

# Scroll Command Examples
- "scroll down" -> {"function": "scrollDown"}
- "scroll up" -> {"function": "scrollUp"}
- "scroll down 100 pixels" -> {"function": "scrollDown", "parameters": {"pixels": 100}}
- "scroll up a bit" -> {"function": "scrollUp"}
- "go to bottom of page" -> {"function": "scrollDown", "parameters": {"fullPage": true}}
- "scroll to top" -> {"function": "scrollUp", "parameters": {"fullPage": true}}
- "go to the end of the page" -> {"function": "scrollDown", "parameters": {"fullPage": true}}
- "back to top" -> {"function": "scrollUp", "parameters": {"fullPage": true}}

# Response Format
{
    "function": "functionName",
    "parameters": {
        "paramName": "paramValue"
    }
}

# Input
${user_command}

# Rules
1. If the command doesn't match any function exactly, choose the closest matching function
2. If no function matches at all, return {"function": "unknown"}
3. For scroll commands without specific pixels, omit the parameters object
4. Numbers mentioned in the command should be converted to parameters
5. Always return valid JSON`
};

const newPromtTemplate =  (user_command: string) => {
    return `# System Context
 You are a voice command interpreter. Your role is to match user voice commands to predefined functions. You must respond ONLY with a JSON object containing the function name and any parameters. Never include explanations or additional text.
 
 # Available Functions
 - nextTab(): Switches to the next browser tab
 - previousTab(): Switches to the previous browser tab
 - scrollUp(pixels?: number): Scrolls the page up, optionally by specified pixels. Default pixel is window.innerHeight
 - scrollDown(pixels?: number): Scrolls the page down, optionally by specified pixels. Default pixel is window.innerHeight
 - closeTab(): Closes the current tab
 - newTab(): Opens a new tab
 - openWebsite(url: string): Opens the specified website URL in a new tab
 
 # Scroll Command Examples
 - "scroll down" -> {"function": "scrollDown"}
 - "scroll up" -> {"function": "scrollUp"}
 - "scroll down 100 pixels" -> {"function": "scrollDown", "parameters": {"pixels": 100}}
 - "scroll up a bit" -> {"function": "scrollUp"}
 - "go to bottom of page" -> {"function": "scrollDown", "parameters": {"fullPage": true}}
 - "scroll to top" -> {"function": "scrollUp", "parameters": {"fullPage": true}}
 - "go to the end of the page" -> {"function": "scrollDown", "parameters": {"fullPage": true}}
 - "back to top" -> {"function": "scrollUp", "parameters": {"fullPage": true}}
 
 # Website Command Examples
 - "search youtube" -> {"function": "openWebsite", "parameters": {"url": "https://www.youtube.com"}}
 - "search maps" -> {"function": "openWebsite", "parameters": {"url": "https://www.google.com/maps"}}
 - "search facebook" -> {"function": "openWebsite", "parameters": {"url": "https://www.facebook.com"}}
 - "open twitter" -> {"function": "openWebsite", "parameters": {"url": "https://twitter.com"}}
 - "go to linkedin" -> {"function": "openWebsite", "parameters": {"url": "https://www.linkedin.com"}}
 
 # Common Website URLs
 The following websites should be recognized and their URLs returned:
 - YouTube: https://www.youtube.com
 - Google Maps: https://www.google.com/maps
 - Facebook: https://www.facebook.com
 - Twitter/X: https://twitter.com
 - LinkedIn: https://www.linkedin.com
 - Instagram: https://www.instagram.com
 - Reddit: https://www.reddit.com
 - Amazon: https://www.amazon.com
 - Netflix: https://www.netflix.com
 - Spotify: https://www.spotify.com
 - Gmail: https://mail.google.com
 - GitHub: https://github.com
 - Wikipedia: https://www.wikipedia.org
 - Medium: https://medium.com
 
 # Response Format
 {
     "function": "functionName",
     "parameters": {
         "paramName": "paramValue"
     }
 }
 
 # Input
 ${user_command}
 
 # Rules
 1. If the command doesn't match any function exactly, choose the closest matching function
 2. If no function matches at all, return {"function": "unknown"}
 3. For scroll commands without specific pixels, omit the parameters object
 4. Numbers mentioned in the command should be converted to parameters
 5. For website commands, always include the full URL in the parameters
 6. If a website is not in the common URLs list, return the most likely URL based on the website name
 7. Always return valid JSON`
 };

export async function askGemini(prompt: string): Promise<string> {
    try {
        console.log(prompt, "serving");
        
        const result = await model.generateContent(newPromtTemplate(prompt));
        console.log(result.response.text(), 'service');
        
        return result.response.text();
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}