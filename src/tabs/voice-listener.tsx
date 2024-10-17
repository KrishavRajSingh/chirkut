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

  const processTranscript = useCallback(async (transcript: string) => {
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
    } else if (lowerTranscript.includes("search")) {
      const searchQuery = lowerTranscript.replace("search", "").trim();
      sendToBackground({ name: "searchYoutube", body: searchQuery });
    } else {
      const prompt = lowerTranscript.replace("ask gemini", "").trim();
      sendToBackground({ name: "askGemini", body: prompt });
    }   
    if(recognitionRef.current) {
      recognitionRef.current.stop();
      const res = await sendToBackground({ name: "activateVoiceCommands", body: { voiceActivates: false } });
      console.log(res.success, 'yay');
      if(res.success)
        setListening(false);

    }
  }, [listening]);

  const handleSpeechResult = useCallback(async (event: SpeechRecognitionEvent) => {
    const currentTranscript = event.results[event.results.length - 1][0].transcript;
    console.log(currentTranscript);
    if(currentTranscript.includes('chirkut')) {
      console.log(103);
      
      const res =  await sendToBackground({ name: "activateVoiceCommands", body: {voiceActivated: true} });
      if(res.success)
        setListening(true);
      console.log("chirkut enabled", res);
      
    }
    setStatus(currentTranscript);
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    } 

    timeoutRef.current = setTimeout(() => {
      console.log('processTranscript');
      if(listening)
        processTranscript(currentTranscript);
    }, 2000);
  }, [processTranscript, listening]);

  useEffect(() => {
    // if(!listening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        recognitionRef.current.start();
        setListening(false);
        console.log(138);
        
        sendToBackground({ name: "activateVoiceCommands", body: {voiceActivated: false} });
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