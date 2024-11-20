import { Ear } from "lucide-react";

const TabPopup = () => {
    return (
        <div className="bg-gray-950 fixed right-4 top-4 z-[1000] p-2 rounded-lg flex items-center">
            <svg width="0" height="0">
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" /> 
                    <stop offset="100%" stopColor="#d946ef" /> 
                </linearGradient>
            </svg>
            <div className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text flex items-center gap-1">
                <div className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 w-2 h-2 rounded-full"></div>
                Chirkut
                <Ear
                    style={{
                        stroke: "url(#gradient)"
                    }}
                />
            </div>
        </div>
    );
};

export default TabPopup;
