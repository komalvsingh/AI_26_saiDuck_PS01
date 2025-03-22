import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Settings, X, RefreshCw } from 'lucide-react';
import './index.css'; // We'll include styles inline for this example

function App() {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatarType, setAvatarType] = useState('3d'); // '2d' or '3d'
  const [audioPlayer, setAudioPlayer] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const avatarVideoRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition and audio player
  useEffect(() => {
    // Initialize audio player
    const audio = new Audio();
    audio.onended = () => {
      // Restart speech recognition when audio finishes if it was active
      if (listening && recognitionRef.current) {
        recognitionRef.current.start();
      }
    };
    setAudioPlayer(audio);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech recognized:", transcript);
        setInput(transcript);
        // Auto-send the recognized speech
        sendMessage(transcript);
      };
      
      recognition.onend = () => {
        // Only restart if still in listening mode and not during playback
        if (listening && !audioPlayer.paused) {
          recognition.start();
        }
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          // Restart on no-speech error if still listening
          if (listening) {
            setTimeout(() => recognition.start(), 100);
          }
        } else {
          setListening(false);
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      console.error("Speech recognition not supported in this browser");
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, []);

  // API call to backend service
  const sendMessage = async (text) => {
    // Stop listening while processing
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    
    try {
      // In a real app, this would be an API call to your Python backend
      const response = await mockApiCall(text);
      
      // Add bot response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text,
        avatar: response.avatarType === '2d' ? response.avatarPath : null,
        avatarUrl: response.avatarType === '3d' ? response.avatarUrl : null,
        avatarType: response.avatarType
      }]);
      
      // Play speech if not muted
      if (!muted && response.speechSuccess) {
        playSpeech(response.text, response.audioUrl);
      } else if (listening && recognitionRef.current) {
        // If muted but listening, restart recognition
        setTimeout(() => recognitionRef.current.start(), 500);
      }

      // Load 3D avatar if available
      if (response.avatarType === '3d' && response.avatarUrl) {
        loadAvatar(response.avatarUrl);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: "Sorry, I encountered an error processing your request."
      }]);
      
      // Restart recognition if it was active
      if (listening && recognitionRef.current) {
        setTimeout(() => recognitionRef.current.start(), 500);
      }
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  // Play speech audio
  const playSpeech = (text, audioUrl) => {
    if (!audioPlayer) return;
    
    // For demonstration, we'll use a real speech API
    // In a real app, you would use the audioUrl from your backend
    // This is using the browser's TTS as a fallback
    if (audioUrl) {
      audioPlayer.src = audioUrl;
      audioPlayer.play().catch(err => {
        console.error("Error playing audio:", err);
        useBrowserTTS(text);
      });
    } else {
      useBrowserTTS(text);
    }
  };

  // Fallback to browser TTS if audio URL is not available
  const useBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.error("Browser doesn't support speech synthesis");
    }
  };

  // Load 3D avatar
  const loadAvatar = (url) => {
    // In a real app, this would load the 3D avatar video
    // For now, we'll simulate with a local video or file
    console.log("Loading 3D avatar:", url);
    
    // Generate a real URL instead of example.com
    // For testing, we'll use a placeholder video URL
    const realVideoUrl = url.includes('example.com') 
      ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' // Sample video
      : url;
    
    // Update avatar video element
    if (avatarVideoRef.current) {
      avatarVideoRef.current.src = realVideoUrl;
      avatarVideoRef.current.load();
      avatarVideoRef.current.play().catch(e => {
        console.error("Error playing avatar video:", e);
      });
    }
  };

  // Mock API response (simulates your Python backend)
  const mockApiCall = async (text) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Test commands
    if (text.toLowerCase() === 'test audio') {
      const audioUrl = 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav'; // Sample audio
      
      return {
        text: "This is an audio test for the IDMS ERP Assistant. If you can hear this message, your audio is working correctly.",
        avatarPath: '/api/placeholder/80/80', // Placeholder for 2D avatar
        avatarType: '2d',
        speechSuccess: true,
        audioUrl: audioUrl
      };
    }
    
    // Generate avatar URL based on type
    const avatar2D = 'https://api.dicebear.com/7.x/bottts/png?seed=idms-assistant';
    // Use a real video URL for 3D avatar testing
    const avatar3D = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    
    // Sample responses based on keywords in the query
    if (text.toLowerCase().includes('gst')) {
      return {
        text: "The IDMS ERP system has comprehensive GST handling capabilities. You can configure GST rates, manage GSTR reports, and generate e-invoices directly from the system. Would you like me to explain a specific GST feature?",
        avatarPath: avatarType === '2d' ? avatar2D : null,
        avatarUrl: avatarType === '3d' ? avatar3D : null,
        avatarType: avatarType,
        speechSuccess: true,
        audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav' // Sample audio
      };
    }
    
    // Default response
    return {
      text: "I'm your IDMS ERP Assistant. I can help you with questions about the IDMS system, its modules, or GST integration. What would you like to know about?",
      avatarPath: avatarType === '2d' ? avatar2D : null,
      avatarUrl: avatarType === '3d' ? avatar3D : null,
      avatarType: avatarType,
      speechSuccess: true,
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav' // Sample audio
    };
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      return;
    }
    
    try {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        recognitionRef.current.start();
        setListening(true);
      }
    } catch (error) {
      console.error("Error toggling speech recognition:", error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };

  // Render avatar based on type
  const renderAvatar = (message) => {
    if (message.role === 'user') {
      return (
        <div className="avatar user-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/png?seed=user" alt="User" />
        </div>
      );
    } else if (message.role === 'assistant') {
      if (message.avatarType === '3d') {
        return (
          <div className="avatar bot-avatar">
            <video 
              ref={avatarVideoRef}
              width="80" 
              height="80" 
              autoPlay 
              loop
              className="avatar-3d"
            >
              <source src={message.avatarUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <span className="avatar-3d-badge">3D</span>
          </div>
        );
      } else {
        return (
          <div className="avatar bot-avatar">
            <img 
              src={message.avatar || "https://api.dicebear.com/7.x/bottts/png?seed=idms-assistant"} 
              alt="Assistant" 
            />
          </div>
        );
      }
    } else {
      // System message
      return (
        <div className="avatar system-avatar">
          <RefreshCw size={24} />
        </div>
      );
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <header className="header">
          <h1>IDMS ERP Assistant</h1>
          <div className="header-controls">
            <button 
              className={`control-button ${muted ? 'active' : ''}`}
              onClick={() => setMuted(!muted)}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              className="control-button"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
        
        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-avatar">
                {avatarType === '3d' ? (
                  <video
                    ref={avatarVideoRef}
                    width="120" 
                    height="120" 
                    autoPlay 
                    loop
                    className="welcome-avatar-3d"
                  >
                    <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src="https://api.dicebear.com/7.x/bottts/png?seed=idms-assistant" alt="IDMS Assistant" />
                )}
              </div>
              <h2>Welcome to IDMS ERP Assistant</h2>
              <p>
                Ask me anything about the IDMS ERP system, its modules, or GST integration. 
                You can also try these commands:
              </p>
              <div className="sample-queries">
                <button onClick={() => sendMessage("What can you help me with?")}>
                  What can you help me with?
                </button>
                <button onClick={() => sendMessage("How does GST work in IDMS?")}>
                  How does GST work in IDMS?
                </button>
                <button onClick={() => sendMessage("Tell me about the IDMS modules")}>
                  Tell me about the IDMS modules
                </button>
                <button onClick={() => sendMessage("test audio")}>
                  Test audio
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : message.role === 'assistant' ? 'bot-message' : 'system-message'}`}
              >
                {renderAvatar(message)}
                <div className="message-content">
                  <p>{message.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message bot-message">
              <div className="avatar bot-avatar">
                <img src="https://api.dicebear.com/7.x/bottts/png?seed=idms-assistant" alt="Assistant" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="input-container" onSubmit={handleSubmit}>
          <button 
            type="button" 
            className={`mic-button ${listening ? 'listening' : ''}`}
            onClick={toggleListening}
            title={listening ? "Stop listening" : "Start listening"}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening..." : "Type your message..."}
            disabled={listening || loading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!input.trim() || loading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
      
      {settingsOpen && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="close-button" onClick={() => setSettingsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="settings-body">
              <div className="settings-group">
                <h3>Avatar Type</h3>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="avatarType" 
                      value="2d"
                      checked={avatarType === '2d'}
                      onChange={() => setAvatarType('2d')}
                    />
                    2D Avatars
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="avatarType" 
                      value="3d"
                      checked={avatarType === '3d'} 
                      onChange={() => setAvatarType('3d')}
                    />
                    3D Avatars (when available)
                  </label>
                </div>
              </div>
              <div className="settings-group">
                <h3>Audio</h3>
                <div className="toggle-setting">
                  <label>Text-to-Speech</label>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={!muted} 
                      onChange={() => setMuted(!muted)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <button 
                  className="test-audio-button"
                  onClick={() => sendMessage("test audio")}
                >
                  Test Audio
                </button>
              </div>
              <div className="settings-group">
                <h3>Speech Recognition</h3>
                <div className="toggle-setting">
                  <label>Enable Speech Recognition</label>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={listening} 
                      onChange={toggleListening}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="settings-note">
                  {recognitionRef.current ? 
                    "Click the microphone button to start or stop speech recognition." : 
                    "Speech recognition is not available in your browser."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS styles for the avatar-3d video element */}
      <style jsx>{`
        .avatar-3d {
          border-radius: 50%;
          object-fit: cover;
          background-color: #f0f0f0;
        }
        
        .welcome-avatar-3d {
          border-radius: 50%;
          object-fit: cover;
          background-color: #f0f0f0;
          margin-bottom: 20px;
        }
        
        .avatar-3d-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background-color: #4285f4;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default App;