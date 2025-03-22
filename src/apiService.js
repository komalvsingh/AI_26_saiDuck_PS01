const API_BASE_URL = 'http://localhost:5000'; // Adjust to your Python backend URL
// Main API service for the IDMS ERP Chatbot
export const ChatbotService = {
  // Send message to backend
  sendMessage: async (message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Toggle speech recognition
  toggleSpeechRecognition: async (enable) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/speech/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enable }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
      throw error;
    }
  },
  
  // Test audio
  testAudio: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/speech/test`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error testing audio:', error);
      throw error;
    }
  },
  
  // Set avatar type (2D or 3D)
  setAvatarType: async (type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/avatar/type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error setting avatar type:', error);
      throw error;
    }
  },
  
  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },
  
  // Clear chat history
  clearChatHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/clear`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  },
  
  // Set user preferences
  setUserPreferences: async (preferences) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error setting user preferences:', error);
      throw error;
    }
  },
  
  // Get user preferences
  getUserPreferences: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  },
  
  // Upload file to backend (for document processing, etc.)
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  // Get ERP data
  getERPData: async (module, query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/erp/${module}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting ERP data for module ${module}:`, error);
      throw error;
    }
  },
  
  // Get feedback on chatbot response
  provideFeedback: async (messageId, rating, comments) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, rating, comments }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error providing feedback:', error);
      throw error;
    }
  },
  
  // Get avatar customization options
  getAvatarOptions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/avatar/options`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting avatar options:', error);
      throw error;
    }
  }
};

export default ChatbotService;