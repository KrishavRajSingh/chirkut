import { useState, useEffect, useRef, useCallback } from "react";
import { sendToBackground } from "@plasmohq/messaging";
import { closeTab, previousTab, scrollDown, scrollUp, nextTab } from "~utils/lib";
import next from "next";
import { set } from "ol/transform";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

const VoiceListener = () => {
  const [status, setStatus] = useState("Initializing voice recognition...")
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // const startRecognizing = async(): Promise<void> => {
  //   if(recognitionRef.current){
  //     const res =  await sendToBackground({ name: "activateVoiceCommands", body: {voiceActivated: true} });
  //     if(res.success)
  //       setListening(true);
  //     console.log("chirkut enabled", res);
  //   }
  // };

  const handleRecognition = async (reckognize: boolean): Promise<void> => {
    const res = await sendToBackground({name: "activateVoiceCommands", body:{  voiceActivated: reckognize } });
    console.log("res", res);
    
    if(res.success)
      setListening(reckognize);
  }

  const processTranscript = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes("next tab")) {
      nextTab();
    } else if (lowerTranscript.includes('previous tab')) {
      previousTab();
    } else if (lowerTranscript.includes("scroll up")) {
      await scrollUp();
    } else if (lowerTranscript.includes("scroll down")) {
      await scrollDown();
    } else if (lowerTranscript.includes("close tab")){
      await closeTab();
    
    } else {
      const prompt = lowerTranscript.trim();
      await sendToBackground({ name: "askGemini", body: prompt });
    }   
    if(recognitionRef.current) {
      await handleRecognition(false);
      recognitionRef.current.stop();
      console.log("aah");
      
      // const res = await sendToBackground({ name: "activateVoiceCommands", body: { voiceActivates: false } });
      // console.log(res.success, 'yay');
      // if(res.success)
      //   setListening(false);

    }
  };

  const handleSpeechResult = async (event: SpeechRecognitionEvent) => {
    const currentTranscript = event.results[event.results.length - 1][0].transcript;
    console.log(currentTranscript);
    if(currentTranscript.includes('chirkut')) {
      console.log(103);
      await handleRecognition(true);
      // const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      // chrome.tabs.sendMessage(activeTab.id!, { action: "speak", text: "Hello"});
      // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      //   chrome.tabs.sendMessage(tabs[0].id, { action: "speak", text: "helllloo" });
      // });
      // let utterance = new SpeechSynthesisUtterance("Yes, I am here. How can I help you?");
      // speechSynthesis.speak(utterance);
      
    }
    setStatus(currentTranscript);
    // if(timeoutRef.current) {
    //   clearTimeout(timeoutRef.current);
    // } 

    // timeoutRef.current = setTimeout(() => {
    //   console.log('processTranscript');
      if(listening)
        processTranscript(currentTranscript);
    // }, 2000);
  };

  useEffect(() => {
    // if(!listening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      // recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        
        recognitionRef.current.start();
        
        // setListening(false);
        // console.log(138);
        
        // sendToBackground({ name: "activateVoiceCommands", body: {voiceActivated: false} });
      }
      recognitionRef.current.start();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [handleSpeechResult])

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0,
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{fontSize: '24px', textAlign: 'center'}}>
        {status}
      </div>
    </div>
  )
}

export default VoiceListener;