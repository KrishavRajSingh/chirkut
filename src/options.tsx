import React, { useEffect, useState } from 'react';

const OptionsPage: React.FC = () => {
    const [voices, setVoices] = useState<chrome.tts.TtsVoice[]>([]);

    // Function to populate voices
    const populateVoices = () => {
        chrome.tts.getVoices((availableVoices) => {
            setVoices(availableVoices);
        });
    };

    // Function to test the selected voice
    const testVoice = (voiceName: string) => {
        chrome.tts.speak(`Based on the YouTube page you're viewing, here are the coding videos:
            • How to code like a pro, 22M views, 3 years ago
            • The Final Project (Landing Page and Chat App with React) | JavaScript JOB READY Free Course (2024), 218 views, 2 days ago
            • Rust Programming Language for JS Devs | Rust VS Javascript, 22K views, 2 months ago
            • Claude has taken control of my computer..., 363K views, 10 hours ago 
            • How is it to work at Microsoft?, 47K views, 5 years ago `, {
            voiceName: voiceName,
        });
    };

    // Populate voices on component mount
    useEffect(() => {
        populateVoices();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Text-to-Speech Voice Tester</h1>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {voices.map((voice) => (
                    <li
                        key={voice.voiceName}
                        onClick={() => testVoice(voice.voiceName)}
                        style={{
                            padding: '10px',
                            border: '1px solid #ccc',
                            marginBottom: '5px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        {voice.voiceName} ({voice.lang})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OptionsPage;
