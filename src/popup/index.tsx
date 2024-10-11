import CustomBrowser from "~components/CustomBrowser"
import { Main } from "~components/main"
import MapPopup from "~components/MapPopup"
import "leaflet/dist/leaflet.css";

function IndexPopup() {
  return <>
    <MapPopup location="patna"/>
    <div>halllooooo</div>
    <button onClick={()=>chrome.tabs.update({url: "https://www.maitilabs.org/"})}>hi</button>
    <a href="https://www.maitilabs.org/">click</a>
    <iframe src=" http://localhost:1947" width={500} height={600}></iframe>
    <iframe sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
src="https://www.maitilabs.org"></iframe>
    {/* <CustomBrowser/> */}
  </>
}

export default IndexPopup
