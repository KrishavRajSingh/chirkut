import cssText from "data-text:~style.css";
import { useEffect, useState } from "react";
import { X } from "lucide-react"; 
import { sendToBackground } from "@plasmohq/messaging";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
}

const Modal = () => {
  const [modal, setModal] = useState<string | null>(null);
    useEffect(() => {
        const showModalListener = async(request, sender, sendResponse) => {
          if(request.action === "showModal"){
            setModal(request.message);
          }
          sendResponse({success: true});
        };
        chrome.runtime.onMessage.addListener(showModalListener);
        return () => chrome.runtime.onMessage.removeListener(showModalListener);
    }, [])

    return (
      (modal && <div className="fixed inset-3 flex justify-center items-center p-2">
        <div className="relative group max-w-xl ">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-lg blur opacity-30 group-hover:opacity-80  duration-300"></div>
          <div className="duration-300 group-hover:-translate-y-1 relative rounded-lg">
            <div className="bg-gray-900 rounded-lg flex sticky top-0 justify-between items-center border-b text-gray-300 p-2">
              <h3 className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text text-xl font-bold">Chirkut Says:</h3>
              <button onClick={async() => {
                if(modal)
                  setModal(null);
                await sendToBackground({ name: "stopSpeaking"});
              }} className="hover:bg-gray-600 text-gray-300"><X/></button>
            </div>
            <p className="bg-gray-900 rounded-lg text-gray-300 overflow-x-clip overflow-y-auto max-h-96 whitespace-pre-line text-lg p-2">{modal.trim()}</p>
          </div>
        </div>
      </div>)
    )
}

export default Modal;
  // return (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 p-4">
  //     <div className="relative w-full max-w-2xl rounded-lg bg-gray-900 shadow-xl">
  //       {/* <div className="absolute inset-0 rounded-lg opacity-50"><MovingGradient/></div> */}
  //       <div className="relative z-10">
  //         <div className="flex items-center justify-between rounded-t border-b border-gray-600 p-4 md:p-5">
  //           <h3 className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
  //             Chirkut
  //           </h3>
  //           <button
  //             onClick={() => setModal(null)}
  //             className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-600 hover:text-white"
  //           >
  //             <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
  //               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
  //             </svg>
  //             <span className="sr-only">Close modal</span>
  //           </button>
  //         </div>
  //         <div className="space-y-4 p-4 md:p-5">
  //           <ul className="list-inside list-item space-y-2">
  //             {sections.map((section, index) => (
  //               <li key={index} className="text-lg text-gray-300 transition-colors duration-200 hover:text-cyan-400">
  //                 {section}
  //               </li>
  //             ))}
  //           </ul>
  //         </div>
  //         <div className="flex items-center justify-end rounded-b border-t border-gray-600 p-4 md:p-5">
  //           <button
  //             onClick={() => setModal(null)}
  //             className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-5 py-2.5 text-center text-sm font-medium text-white transition-all duration-300 hover:bg-gradient-to-bl hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300"
  //           >
  //             Close
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )