import { useState, useEffect, useRef } from "react";
import { sendToBackground } from "@plasmohq/messaging";
import { closeTab, previousTab, scrollDown, scrollUp, nextTab } from "~utils/lib";
import "../style.css";
import { MovingGradient } from "~components/MovingGradient";
import { useStorage } from "@plasmohq/storage/hook";

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
  const [transcript, setTranscript] = useStorage("transcript", "");

  const handleRecognition = async (reckognize: boolean): Promise<void> => {
    const res = await sendToBackground({
      name: "activateVoiceCommands",
      body: { 
        voiceActivated: reckognize 
      } 
    });
    
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
    }
  };

  const handleSpeechResult = async (event: SpeechRecognitionEvent) => {
    const currentTranscript = event.results[event.results.length - 1][0].transcript;
    console.log(currentTranscript);
    if(currentTranscript.includes('chirkut')) {
      await handleRecognition(true);
    }
    setStatus(currentTranscript);
    // if(timeoutRef.current) {
    //   clearTimeout(timeoutRef.current);
    // } 

    // timeoutRef.current = setTimeout(() => {
    //   console.log('processTranscript');
    if(listening){
        setTranscript(currentTranscript);
        setTimeout(() => setTranscript(null), 12000)

        processTranscript(currentTranscript);
      }
    // }, 2000);
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "restartListening"){
      // if(recognitionRef.current){
        // console.log("lis", request.listening);
        
        // if(request.listening)
        // recognitionRef.current.stop();
        console.log("yay");
        sendResponse({success: true})
        // else
        recognitionRef.current.stop();
      // }
    }
  })
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
      }

      recognitionRef.current.start();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // setTranscript(null);
    }
  }, [handleSpeechResult])

  return (
    <div
      id="listener-tab"
    style={{
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0
    }}>
      <MovingGradient/>
      <div className="">
        <div className="text-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">This tab is used for listening your voice</div>
        <div className="text-white" style={{fontSize: '24px', textAlign: 'center'}}>
          {status}
        </div>
      </div>
    </div>
  )
}

export default VoiceListener;