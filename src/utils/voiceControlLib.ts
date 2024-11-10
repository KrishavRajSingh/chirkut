export const speak = (message) => {
    chrome.tts.speak(message, {voiceName: "Samantha"});
}

export const stopSpeaking = () => {
    chrome.tts.isSpeaking((speaking) => {
        if(speaking)
            chrome.tts.stop();
    })
}