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
        chrome.tts.speak(`Testing the voice: ${voiceName}`, {
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
