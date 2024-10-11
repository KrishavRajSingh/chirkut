import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const CustomBrowser = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const navigate = (newUrl) => {
    setUrl(newUrl);
    setHistory([...history.slice(0, currentIndex + 1), newUrl]);
    setCurrentIndex(currentIndex + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUrl(history[currentIndex - 1]);
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUrl(history[currentIndex + 1]);
    }
  };

  const refresh = () => {
    setUrl(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 bg-gray-100">
        <button onClick={goBack} className="p-1" disabled={currentIndex <= 0}>
          <ArrowLeft size={16} />
        </button>
        <button onClick={goForward} className="p-1" disabled={currentIndex >= history.length - 1}>
          <ArrowRight size={16} />
        </button>
        <button onClick={refresh} className="p-1">
          <RefreshCw size={16} />
        </button>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && navigate(url)}
          className="flex-grow ml-2 p-1 border rounded"
        />
      </div>
      <div className="flex-grow">
        <iframe src={url} className="w-full h-full border-none" />
      </div>
    </div>
  );
};

export default CustomBrowser;