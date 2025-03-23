import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, Play, Settings } from 'lucide-react';
import './styles/index.css';

function Chat() {
  // State for chat messages
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to IDMS ERP Assistant! Ask me anything about the IDMS ERP system. You can also ask questions in Hindi / आप हिंदी में भी प्रश्न पूछ सकते हैं!' }
  ]);
  
  // State for input
  const [input, setInput] = useState('');
  
  // State for video and audio settings
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoPath, setVideoPath] = useState('./avatar.mp4');
  const [videoPathInput, setVideoPathInput] = useState('./avatar.mp4');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  
  // API Keys (in a real app, these should be stored securely)
  const [groqApiKey, setGroqApiKey] = useState('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');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('sk_1c81bf77e698a4f602bf716e92d7397d8402484f08804871');
  
  // Refs
  const chatContainerRef = useRef(null);
  const videoRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Stop any ongoing speech recognition
      stopSpeechRecognition();
    };
  }, []);
  
  // Function to detect language (simplified version)
  const detectLanguage = (text) => {
    // Basic detection based on characters
    const hindiPattern = /[\u0900-\u097F]/; // Unicode range for Hindi
    if (hindiPattern.test(text)) {
      return 'hi';
    }
    return 'en';
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Process special commands
    if (userMessage.toLowerCase() === 'test audio') {
      handleAudioTest();
      return;
    }
    
    if (userMessage.toLowerCase() === 'test hindi') {
      handleHindiTest();
      return;
    }
    
    if (userMessage.toLowerCase() === 'test video') {
      handleVideoTest();
      return;
    }
    
    if (userMessage.toLowerCase() === 'novideo') {
      setVideoEnabled(false);
      setMessages(prev => [...prev, { role: 'system', content: 'Video playback disabled' }]);
      return;
    }
    
    if (userMessage.toLowerCase() === 'video') {
      setVideoEnabled(true);
      setMessages(prev => [...prev, { role: 'system', content: 'Video playback enabled' }]);
      return;
    }
    
    if (userMessage.toLowerCase() === 'listen') {
      startSpeechRecognition();
      return;
    }
    
    if (userMessage.toLowerCase() === 'stop listening' || userMessage.toLowerCase() === 'बंद करो' || userMessage.toLowerCase() === 'रुको') {
      stopSpeechRecognition();
      return;
    }
    
    // Process regular message
    await processUserInput(userMessage);
  };
  
  // Process user input and get response
  const processUserInput = async (userInput) => {
    setIsProcessing(true);
    
    try {
      // Detect language
      const language = detectLanguage(userInput);
      setDetectedLanguage(language);
      
      // Start video if enabled
      if (videoEnabled && videoRef.current) {
        startVideo();
      }
      
      // Mock API call - in a real app, you would call your backend
      const response = await mockApiCall(userInput, language);
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text,
        language: response.language 
      }]);
      
      // Speak text if audio is enabled
      if (audioEnabled) {
        await speakText(response.text, response.language);
      }
      
    } catch (error) {
      console.error("Error processing input:", error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Sorry, I encountered an error generating a response about the IDMS ERP system.' 
      }]);
    } finally {
      // Stop video after processing is done
      if (videoRef.current && isVideoPlaying) {
        stopVideo();
      }
      setIsProcessing(false);
    }
  };
  
  // Start video playback
  const startVideo = () => {
    if (videoRef.current) {
      // Reset video to beginning for consistent animation
      videoRef.current.currentTime = 0;
      videoRef.current.play()
        .then(() => {
          setIsVideoPlaying(true);
        })
        .catch(err => {
          console.error("Video play error:", err);
        });
    }
  };
  
  // Stop video playback
  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };
  
  // Mock API call to simulate backend processing
  const mockApiCall = async (userInput, language) => {
    // In a real app, this would call your backend API that interfaces with Groq
    console.log("Processing with Groq API key:", groqApiKey);
    console.log("Using ElevenLabs API key:", elevenLabsApiKey);
    console.log("Detected language:", language);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample IDMS knowledge responses - in a real app, this would come from your backend
    const responses = {
      en: [
        "IDMS ERP includes modules for financial management, inventory control, sales, purchasing, and GST compliance. Would you like more information about a specific module?",
        "The GST module in IDMS ERP helps with automatic tax calculation, GSTR filing, and maintaining compliance with Indian tax regulations. It supports both goods and services tax scenarios.",
        "To generate financial reports in IDMS ERP, navigate to the Reports section in the Finance module. You can select from pre-configured reports or create custom reports based on your requirements.",
        "Inventory management in IDMS ERP supports multiple warehouses, batch tracking, and real-time stock updates. The system automatically calculates reorder points based on your configured parameters."
      ],
      hi: [
        "IDMS ERP में वित्तीय प्रबंधन, इन्वेंटरी नियंत्रण, बिक्री, खरीद और GST अनुपालन के लिए मॉड्यूल शामिल हैं। क्या आप किसी विशिष्ट मॉड्यूल के बारे में अधिक जानकारी चाहते हैं?",
        "IDMS ERP में GST मॉड्यूल स्वचालित कर गणना, GSTR फाइलिंग और भारतीय कर नियमों के अनुपालन में मदद करता है। यह वस्तुओं और सेवाओं दोनों के कर परिदृश्यों का समर्थन करता है।",
        "IDMS ERP में वित्तीय रिपोर्ट जनरेट करने के लिए, वित्त मॉड्यूल में रिपोर्ट्स सेक्शन पर नेविगेट करें। आप पूर्व-कॉन्फ़िगर रिपोर्ट चुन सकते हैं या अपनी आवश्यकताओं के अनुसार कस्टम रिपोर्ट बना सकते हैं।",
        "IDMS ERP में इन्वेंटरी प्रबंधन कई गोदामों, बैच ट्रैकिंग और रीयल-टाइम स्टॉक अपडेट का समर्थन करता है। सिस्टम आपके कॉन्फ़िगर किए गए पैरामीटर के आधार पर पुनः ऑर्डर बिंदुओं की स्वचालित रूप से गणना करता है।"
      ]
    };
    
    // Choose a response based on input and language
    let responseText = "";
    const langResponses = responses[language] || responses.en;
    
    if (userInput.toLowerCase().includes("gst") || userInput.toLowerCase().includes("जीएसटी")) {
      responseText = langResponses[1];
    } else if (userInput.toLowerCase().includes("report") || userInput.toLowerCase().includes("financial") || 
               userInput.toLowerCase().includes("रिपोर्ट") || userInput.toLowerCase().includes("वित्तीय")) {
      responseText = langResponses[2];
    } else if (userInput.toLowerCase().includes("inventory") || userInput.toLowerCase().includes("stock") ||
               userInput.toLowerCase().includes("इन्वेंटरी") || userInput.toLowerCase().includes("स्टॉक")) {
      responseText = langResponses[3];
    } else {
      responseText = langResponses[0];
    }
    
    return {
      text: responseText,
      language: language,
      speech_success: true
    };
  };
  
  // Text-to-speech function with language support
 // Improve the speakText function with better Hindi voice selection
const speakText = async (text, language) => {
  // Cancel any ongoing speech
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  return new Promise((resolve) => {
    console.log(`Speaking text in ${language}:`, text);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Force wait for voices to be loaded
      let voices = window.speechSynthesis.getVoices();
      
      // If voices array is empty, wait for them to load
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoiceAndSpeak();
        };
      } else {
        setVoiceAndSpeak();
      }
      
      function setVoiceAndSpeak() {
        // Log available voices for debugging
        console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
        
        // Set language
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        
        // For Hindi, try multiple fallbacks
        if (language === 'hi') {
          // Try these in order: exact 'hi-IN', any 'hi' prefix, any Indian voice
          const hindiVoice = 
            voices.find(voice => voice.lang === 'hi-IN') || 
            voices.find(voice => voice.lang.startsWith('hi')) ||
            voices.find(voice => voice.lang.includes('IN'));
          
          if (hindiVoice) {
            console.log("Selected Hindi voice:", hindiVoice.name);
            utterance.voice = hindiVoice;
          } else {
            console.warn("No Hindi voice found, using default");
          }
          
          // Adjust rate and pitch for better Hindi pronunciation
          utterance.rate = 0.9; // Slightly slower for complex phonemes
          utterance.pitch = 1.1; // Slightly higher pitch
        } else {
          // For English, prefer a female voice
          const englishFemaleVoice = voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Female'));
          
          if (englishFemaleVoice) {
            utterance.voice = englishFemaleVoice;
          }
        }
        
        // Set up event handlers
        utterance.onend = () => {
          console.log("Speech ended");
          stopVideo();
          resolve(true);
        };
        
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          stopVideo();
          resolve(false);
        };
        
        // Keep a reference to cancel if needed
        speechSynthesisRef.current = utterance;
        
        // Speak
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.log("Text-to-speech not supported in this browser");
      stopVideo();
      resolve(false);
    }
  });
};
  
  // Handle audio test
  const handleAudioTest = () => {
    const testMessage = "This is an audio test for the IDMS ERP Assistant. If you can hear this message, your audio is working correctly.";
    setMessages(prev => [...prev, { role: 'system', content: 'Running audio test...' }]);
    
    if (audioEnabled) {
      if (videoEnabled) startVideo();
      speakText(testMessage, 'en').then(() => {
        console.log("Audio test completed");
      });
    } else {
      setMessages(prev => [...prev, { role: 'system', content: 'Audio is currently disabled. Enable audio to test.' }]);
    }
  };
  
  // Handle Hindi test
  const handleHindiTest = () => {
    const testMessage = "नमस्ते, यह एक हिंदी ऑडियो परीक्षण है। यदि आप यह संदेश सुन सकते हैं, तो आपका ऑडियो सही काम कर रहा है।";
    setMessages(prev => [...prev, { role: 'system', content: 'Running Hindi audio test...' }]);
    
    if (audioEnabled) {
      if (videoEnabled) startVideo();
      speakText(testMessage, 'hi').then(() => {
        console.log("Hindi audio test completed");
      });
    } else {
      setMessages(prev => [...prev, { role: 'system', content: 'Audio is currently disabled. Enable audio to test.' }]);
    }
  };
  
  // Handle video test
  const handleVideoTest = () => {
    setMessages(prev => [...prev, { role: 'system', content: 'Testing video playback...' }]);
    
    if (!videoEnabled) {
      setMessages(prev => [...prev, { role: 'system', content: 'Video is currently disabled. Enable video to test.' }]);
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsVideoPlaying(false);
          }
          setMessages(prev => [...prev, { role: 'system', content: 'Video test completed.' }]);
        }, 5000);
      }).catch(err => {
        console.error("Video test error:", err);
        setMessages(prev => [...prev, { role: 'system', content: `Video test failed: ${err.message}` }]);
      });
    }
  };
  
  // Start speech recognition
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Speech recognition is not supported in this browser.' 
      }]);
      return;
    }
    
    setIsListening(true);
    setMessages(prev => [...prev, { role: 'system', content: 'I\'m listening. Please speak your question.' }]);
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Try to automatically detect language
    recognition.lang = 'auto';
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Speech recognized:", transcript);
      
      // Detect language
      const detectedLang = detectLanguage(transcript);
      
      if (["stop listening", "stop", "exit", "quit", "बंद करो", "रुको"].includes(transcript.toLowerCase())) {
        stopSpeechRecognition();
        return;
      }
      
      // Add transcript to chat and process
      setMessages(prev => [...prev, { role: 'user', content: transcript }]);
      processUserInput(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Speech recognition error: ${event.error}` 
      }]);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
    
    recognition.start();
    
    // Store recognition object in a ref for cleanup
    window.currentRecognition = recognition;
  };
  
  // Stop speech recognition
  const stopSpeechRecognition = () => {
    setIsListening(false);
    
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      window.currentRecognition = null;
    }
    
    setMessages(prev => [...prev, { 
      role: 'system', 
      content: detectedLanguage === 'hi' ? 'आवाज पहचानना बंद किया गया है।' : 'Speech recognition stopped.' 
    }]);
  };
  
  // Update video path
  const handleUpdateVideoPath = () => {
    setVideoPath(videoPathInput);
    setMessages(prev => [...prev, { 
      role: 'system', 
      content: `Video path updated to: ${videoPathInput}` 
    }]);
    setShowSettings(false);
  };
  
  // Format chat messages with Markdown support
  const formatMessage = (content) => {
    // Very basic markdown-like formatting - in a real app, use a proper Markdown library
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
    
    return { __html: formattedContent };
  };
  
  // Get message bubble style based on language
  const getMessageStyle = (message) => {
    let baseStyle = message.role === 'user' 
      ? 'bg-blue-100 text-blue-800' 
      : message.role === 'system' 
        ? 'bg-gray-100 text-gray-800' 
        : 'bg-gray-200 text-gray-800';
    
    // Add slight color variation for Hindi messages
    if (message.role === 'assistant' && message.language === 'hi') {
      baseStyle = 'bg-indigo-100 text-indigo-800';
    }
    
    return baseStyle;
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">IDMS ERP Assistant</h1>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="p-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Chat area */}
        <div className="flex flex-col bg-white rounded-lg shadow-md w-2/3 overflow-hidden">
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto"
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${
                  message.role === 'user' 
                    ? 'text-right' 
                    : message.role === 'system' 
                      ? 'text-center italic text-gray-500' 
                      : ''
                }`}
              >
                {message.role !== 'system' && (
                  <div className="font-bold mb-1">
                    {message.role === 'user' ? 'You' : 'IDMS Assistant'}
                  </div>
                )}
                <div 
                  className={`inline-block rounded-lg p-3 max-w-[80%] ${getMessageStyle(message)}`}
                  dangerouslySetInnerHTML={formatMessage(message.content)}
                />
              </div>
            ))}
            {isProcessing && (
              <div className="text-center italic text-gray-500">
                Processing your request...
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing || isListening}
                placeholder={isListening ? "Listening..." : "Type your message (English or Hindi)..."}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                className={`p-2 rounded-md ${
                  isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isProcessing || isListening}
                className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                title="Send message"
              >
                <MessageCircle size={20} />
              </button>
            </form>
            
            {/* Control buttons */}
            <div className="flex mt-2 justify-end gap-2">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-1 rounded-md ${
                  audioEnabled ? 'text-blue-500' : 'text-gray-500'
                }`}
                title={audioEnabled ? "Disable audio" : "Enable audio"}
              >
                {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-1 rounded-md ${
                  videoEnabled ? 'text-blue-500' : 'text-gray-500'
                }`}
                title={videoEnabled ? "Disable video" : "Enable video"}
              >
                {videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Video area */}
        <div className="w-1/3 bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            {videoEnabled ? (
              <video
                ref={videoRef}
                src={videoPath}
                className="w-full h-full object-cover"
                loop
                muted={!audioEnabled}
                onError={(e) => {
                  console.error("Video error:", e);
                  setMessages(prev => [...prev, { 
                    role: 'system', 
                    content: `Error loading video: ${e.target.error?.message || 'Unknown error'}` 
                  }]);
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                <VideoOff size={64} className="mx-auto mb-2" />
                <p>Video playback is disabled</p>
              </div>
            )}
          </div>
          
          {/* Video controls */}
          <div className="bg-gray-900 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="font-medium">IDMS Virtual Assistant</div>
              <div className="flex items-center">
                <span className="text-xs mr-2">
                  {detectedLanguage === 'hi' ? 'हिंदी' : 'English'}
                </span>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play().then(() => setIsVideoPlaying(true));
                      } else {
                        videoRef.current.pause();
                        setIsVideoPlaying(false);
                      }
                    }
                  }}
                  disabled={!videoEnabled}
                  className="p-1 text-white disabled:text-gray-500"
                  title="Play/Pause video"
                >
                  <Play size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 w-1/3 max-w-md">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Video Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoPathInput}
                  onChange={(e) => setVideoPathInput(e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  onClick={handleUpdateVideoPath}
                  className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Update
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Groq API Key</label>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ElevenLabs API Key</label>
              <input
                type="password"
                value={elevenLabsApiKey}
                onChange={(e) => setElevenLabsApiKey(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;