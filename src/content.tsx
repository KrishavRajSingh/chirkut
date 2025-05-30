import { useState, useEffect, useCallback, useRef } from "react"
// import MapPopup from "./components/MapPopup";
import "leaflet/dist/leaflet.css";
import MapComponent from "~components/MapComponent";
import cssText from "data-text:style.css"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Define interfaces for the Web Speech API
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

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}


const CustomButton = () => {
  const [listening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [lon, setLon] = useState(0);
  const [lat, setLat] = useState(0);
  
  function updateMap(location: string){
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          console.log(data[0].lat, data[0].lon);
          const lat = data[0].lat;
          setLat(lat);
          const lon = data[0].lon;
          setLon(lon);
          setShowMap(true);
        }
      });
  }

  const processTranscript = useCallback( async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes("next tab")) {
      console.log('Sending message to switch tab');
      chrome.runtime.sendMessage({ action: "switchToNextTab" }, (response) => {
        if (recognitionRef.current && response) {
          recognitionRef.current.stop();
        }
      });
      
    } else if (lowerTranscript.startsWith("search")) {
      const searchQuery = transcript.slice(6).trim();
      
      if (searchQuery) {
        console.log('Sending message to open new tab', searchQuery);
        
        // Send the search query
        chrome.runtime.sendMessage({ action: "searchInNewTab", payload: searchQuery }, (response) => {
          console.log(response);
          
          // Stop listening once the search action is triggered
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          // setIsListening(false);
        });
      }
    } else if (lowerTranscript.includes("where is")){
      const place = lowerTranscript.slice(8).trim();

      updateMap(place);
      if(recognitionRef.current){
        recognitionRef.current.stop();
      }
      console.log(place);
      
    } else {
      console.log(process.env.PLASMO_PUBLIC_GEMINI_API, "ko");
      
      // const res = await askGemini(lowerTranscript);
      chrome.runtime.sendMessage({action: "askGemini", prompt: lowerTranscript}, (response) => {
          console.log(response);
          let utterance = new SpeechSynthesisUtterance(response);
          speechSynthesis.speak(utterance);

          // Stop listening once the search action is triggered
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
      });
      // console.log(res, 'hi');
      
    }
  }, []);
  
  const handleSpeechResult = useCallback((event: SpeechRecognitionEvent) => {
    const currentTranscript = event.results[event.results.length - 1][0].transcript;
    setTranscript(currentTranscript);
    console.log(currentTranscript, 'hi');
    
    // chrome.runtime.sendMessage({ action: "updateTranscript", transcript: currentTranscript });
    // chrome.runtime.onMessage()
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      processTranscript(currentTranscript);
    }, 2000);
  }, [processTranscript]);

  useEffect(() => {
    if (listening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = handleSpeechResult;
      
      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current.start();
    } else if (recognitionRef.current) {
      
      recognitionRef.current.stop();
      console.log(128);
    }

    return () => {
      if (recognitionRef.current) {
        // recognitionRef.current.stop();
        console.log(136);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [listening, handleSpeechResult]);
  
  return (
    <div style={{color: "yellow", position: "fixed", bottom: "1rem", right: "1rem"}}>
      {showMap && 
      <div style={{display: "flex"}}>
        <MapComponent lon={lon} lat={lat} setShowMap={setShowMap}/>
      </div>}
      <p>{transcript}</p>
      <button
        style={{ height: "3rem" }}
        onClick={() => setIsListening(!listening)}>
        {listening ? "Listening" : "Click to Listen"}
      </button>
    </div>
  )
}


export default CustomButton;