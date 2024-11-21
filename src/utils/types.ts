export type GeminiResponse = {
    function: 'nextTab' | 'previousTab' | 'scrollUp' | 'scrollDown' | 'closeTab' 
    | 'openWebsite' | 'readScreen' | 'readSection' | 'clickElement' | 'controlMedia' | 'askGoogle';
    parameters?: { [key: string]: any };
  };