import { useState } from "react"
let recognition: any;
function OptionsIndex() {
  const [data, setData] = useState("")
    recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("Speech recognition started");
  };

  recognition.onresult = (event: any) => {
    const last = event.results.length - 1;
    const command = event.results[last][0].transcript.toLowerCase();
    
    if (command.includes("hey bunny")) {
      console.log("Command: ", command);     
    }
  };
  return (
    <div>
      <h1>
        Welcome to your <a href="https://www.plasmo.com">Plasmo</a> Extension!
      </h1>
      <h2>This is the Option UI page!</h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
    </div>
  )
}

export default OptionsIndex