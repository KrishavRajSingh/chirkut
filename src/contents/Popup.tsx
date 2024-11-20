import cssText from "data-text:~style.css";
import { useEffect, useState } from "react";
import TabPopup from "~components/TabPopup";
import { useStorage } from "@plasmohq/storage/hook";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
}
  
const Popup = () => {
  const [popup, setPopup] = useState<Boolean>(false);
  const [transcript] = useStorage("transcript");
  // const [showtranscript, setShowTranscript] = useState<Boolean>(true);

  // useEffect(() => {
  //   setShowTranscript(true);
  //   const timer = setTimeout(() => {
  //     setShowTranscript(false);
  //   }, 8000)
  //   return () => clearTimeout(timer);
  // }, [transcript])

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    
    if (request.action === "showButton") {
      if (!popup)
        setPopup(true);
    } else if (request.action === "hideButton") {
      if(popup)
        setPopup(false);
      console.log(request.body);
      
      // setTranscript(request.transcript);
    }
    sendResponse({success: true})
  });
    return (
        <div>
        {popup && <TabPopup />}
        {transcript && <div className="font-mono fixed bottom-28 opacity-70 w-full text-center">
          <span className="bg-gray-950 p-2 rounded-lg text-lg">
            <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text">
              {transcript}
            </span>
          </span></div>}
        {/* {hail} */}
        </div>
    );
}

export default Popup;