import os
import requests
import tempfile
import time
import speech_recognition as sr
from idms_knowledge_base import IDMSKnowledgeBase
import threading
import cv2  # OpenCV for video playback
import pyttsx3
from langdetect import detect
from gtts import gTTS
import pygame

# Modified chatbot with IDMS ERP Knowledge, Speech Recognition, and Multilingual Support
class IDMSERPChatbot:
    def __init__(self, groq_api_key, video_path=None):
        self.groq_api_key = groq_api_key
        self.speech_recognizer = sr.Recognizer()
        self.listening = False
        
        # Initialize IDMS ERP knowledge base
        self.knowledge_base = IDMSKnowledgeBase()
        
        # Initialize video player
        self.video_player = CustomVideoPlayer()
        if video_path:
            self.video_player.set_video(video_path)
        
        # Initialize TTS engine for English
        try:
            self.tts_engine = pyttsx3.init()
            # Test if the engine works
            self.tts_engine.say("Initializing IDMS ERP Assistant")
            self.tts_engine.runAndWait()
            
            # Configure voice
            voices = self.tts_engine.getProperty('voices')
            print(f"Available voices: {len(voices)}")
            if len(voices) > 1:
                self.tts_engine.setProperty('voice', voices[1].id)  # Usually female voice
            self.tts_engine.setProperty('rate', 150)  # Speaking rate
            self.tts_engine.setProperty('volume', 1.0)  # Max volume
            print("TTS engine initialized successfully")
        except Exception as e:
            print(f"Error initializing TTS engine: {str(e)}")
        
        # Initialize pygame mixer for multilingual audio playback
        pygame.mixer.init()
    
    def detect_language(self, text):
        """Detect the language of the input text."""
        try:
            language = detect(text)
            print(f"Detected language: {language}")
            return language
        except Exception as e:
            print(f"Language detection error: {e}")
            return "en"  # Default to English if detection fails
    
    def text_to_speech(self, text, language):
        """Convert text to speech and play it using appropriate TTS engine based on language."""
        # For English, use pyttsx3 for better performance
        if language == "en":
            try:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
                return True
            except Exception as e:
                print(f"Error with English TTS: {str(e)}")
                # Fall back to gTTS if pyttsx3 fails
        
        # For non-English languages or as fallback, use gTTS
        try:
            # Map language codes to gTTS compatible codes if needed
            language_map = {
                "hi": "hi",  # Hindi
                "en": "en",  # English
                "fr": "fr",  # French
                "es": "es",  # Spanish
                # Add more mappings as needed
            }
            
            # Use mapped language or fallback to English
            tts_lang = language_map.get(language, "en")
            print(f"Using gTTS with language: {tts_lang}")
            
            # Create a temporary file
            temp_dir = tempfile.gettempdir()
            temp_file = os.path.join(temp_dir, "response.mp3")
            
            # Shorten very long texts to avoid TTS issues
            if len(text) > 500:
                shortened_text = text[:497] + "..."
                print("Text shortened for TTS")
            else:
                shortened_text = text
                
            tts = gTTS(text=shortened_text, lang=tts_lang, slow=False)
            tts.save(temp_file)
            
            # Play the audio
            pygame.mixer.music.load(temp_file)
            pygame.mixer.music.play()
            
            # Wait for audio to finish playing
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
                
            return True
                
        except Exception as e:
            print(f"Error in multilingual text-to-speech: {e}")
            return False
    
    def generate_text_response(self, user_input):
        """Get text response from Groq API with IDMS ERP context and language awareness"""
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # Detect language of user input
        language = self.detect_language(user_input)
        
        # Create a system prompt that includes the IDMS ERP knowledge and language awareness
        system_message = f"""You are a multilingual IDMS ERP system expert assistant. Your purpose is to help users understand and use the IDMS ERP system effectively. Always respond in the same language as the user's query.
        
Use the following knowledge base to answer user questions:

{self.knowledge_base.idms_knowledge}

Focus on providing accurate, helpful information about the IDMS ERP system. If a user asks about something not covered in your knowledge base, you can provide general ERP guidance but make it clear that it may not be specific to IDMS.

For GST-related questions, be especially precise and reference the appropriate sections of the IDMS system.

IMPORTANT: If the user asks in Hindi or any other non-English language, respond in that same language. Make sure your responses in non-English languages are properly formatted and coherent.
"""
        
        data = {
            "model": "llama3-8b-8192",  # Use Groq's LLaMA3 model
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_input}
            ],
            "temperature": 0.3,  # Lower temperature for more factual responses
            "max_tokens": 800
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            result = response.json()
            return result["choices"][0]["message"]["content"], language
        
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            return "I'm sorry, I encountered an error generating a response about the IDMS ERP system.", language
    
    def start_speech_recognition(self, callback=None):
        """Start listening for speech input"""
        self.listening = True
        print("Starting speech recognition. Speak now...")
        
        # Indicate that we're listening - in English by default
        self.text_to_speech("I'm listening. Please speak your question.", "en")
        
        # Start listening in a separate thread to avoid blocking
        self.listen_thread = threading.Thread(target=self._listen_for_speech, args=(callback,))
        self.listen_thread.daemon = True
        self.listen_thread.start()
    
    def stop_speech_recognition(self):
        """Stop listening for speech input"""
        self.listening = False
        print("Stopping speech recognition.")
    
    def _listen_for_speech(self, callback=None):
        """Listen for speech and convert to text"""
        while self.listening:
            try:
                with sr.Microphone() as source:
                    print("Adjusting for ambient noise...")
                    self.speech_recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    print("Listening...")
                    audio = self.speech_recognizer.listen(source, timeout=5, phrase_time_limit=10)
                
                try:
                    print("Recognizing speech...")
                    # Using Google Speech Recognition service
                    user_input = self.speech_recognizer.recognize_google(audio)
                    print(f"Recognized: {user_input}")
                    
                    if not self.listening:
                        break
                    
                    # Detect language of spoken input
                    language = self.detect_language(user_input)
                    
                    # If recognized text includes stop commands
                    if user_input.lower() in ["stop listening", "stop", "exit", "quit", "बंद करो", "रुको"]:
                        stop_msg = "Speech recognition stopped."
                        if language == "hi":
                            stop_msg = "आवाज पहचानना बंद किया गया है।"
                        self.text_to_speech(stop_msg, language)
                        self.listening = False
                        break
                    
                    # If there's a callback function, call it with the recognized text
                    if callback:
                        callback(user_input)
                    else:
                        # Process the input directly
                        response = self.process_input(user_input)
                
                except sr.UnknownValueError:
                    print("Could not understand audio")
                except sr.RequestError as e:
                    print(f"Error with speech recognition service: {e}")
                    self.text_to_speech("There was an error with the speech recognition service.", "en")
                    self.listening = False
            
            except Exception as e:
                print(f"Error in speech recognition: {e}")
                time.sleep(1)  # Prevent CPU spike if continuous errors
    
    def process_input(self, user_input, use_video=True):
        """Process user input and respond with video and speech in the detected language"""
        # 1. Generate text response with IDMS ERP knowledge and get detected language
        text_response, language = self.generate_text_response(user_input)
        print(f"IDMS Bot ({language}): {text_response}")
        
        # 2. Play video while speaking if video is enabled
        if use_video and self.video_player.video_path:
            try:
                # Start the video
                video_started = self.video_player.play_video()
                if not video_started:
                    print("Failed to start video playback")
            except Exception as e:
                print(f"Error starting video: {str(e)}")
        
        # 3. Speak the text in the detected language
        speech_success = self.text_to_speech(text_response, language)
        if not speech_success:
            print(f"WARNING: Speech synthesis failed for language: {language}. Check your audio settings and libraries.")
        
        # 4. Stop video after speaking is done
        if use_video and self.video_player.playing:
            self.video_player.stop_video()
        
        return {
            "text": text_response,
            "language": language,
            "speech_success": speech_success
        }
    
    def set_video(self, video_path):
        """Set the video to be used"""
        return self.video_player.set_video(video_path)


# Custom video player handler
class CustomVideoPlayer:
    def __init__(self):
        self.video_path = None
        self.playing = False
        self.video_thread = None
        self.stop_event = threading.Event()
        
    def set_video(self, video_path):
        """Set the video file to be played"""
        if os.path.exists(video_path):
            self.video_path = video_path
            print(f"Video set: {video_path}")
            return True
        else:
            print(f"Error: Video file not found at {video_path}")
            return False
    
    def play_video(self):
        """Start playing the video in a separate thread"""
        if not self.video_path:
            print("No video file set. Use set_video() first.")
            return False
        
        if self.playing:
            print("Video is already playing")
            return False
            
        # Reset stop event
        self.stop_event.clear()
        self.playing = True
        
        # Start video playback in a separate thread
        self.video_thread = threading.Thread(target=self._play_video_thread)
        self.video_thread.daemon = True
        self.video_thread.start()
        
        return True
    
    def stop_video(self):
        """Stop the video playback"""
        if not self.playing:
            return
            
        self.stop_event.set()
        if self.video_thread and self.video_thread.is_alive():
            self.video_thread.join(timeout=1.0)
        
        self.playing = False
        cv2.destroyAllWindows()
        print("Video playback stopped")
    
    def _play_video_thread(self):
        """Thread function to play the video"""
        try:
            cap = cv2.VideoCapture(self.video_path)
            if not cap.isOpened():
                print(f"Error: Could not open video file {self.video_path}")
                self.playing = False
                return
            
            # Create a named window
            window_name = "IDMS Assistant"
            cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            delay = int(1000 / fps) if fps > 0 else 33  # in milliseconds
            
            while cap.isOpened() and not self.stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    # If video reaches the end, loop it
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                
                cv2.imshow(window_name, frame)
                
                # Check for user quit (q key) or stop event
                key = cv2.waitKey(delay) & 0xFF
                if key == ord('q') or self.stop_event.is_set():
                    break
            
            cap.release()
            cv2.destroyAllWindows()
            
        except Exception as e:
            print(f"Error in video playback: {str(e)}")
        finally:
            self.playing = False


# Example usage
def main():
    # Audio and multilingual support diagnostics at startup
    print("\n--- Audio and Language System Diagnostics ---")
    
    # Test primary English TTS (pyttsx3)
    print("Testing primary TTS (pyttsx3):")
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        print(f"Available voices: {len(voices)}")
        for i, voice in enumerate(voices):
            print(f"Voice {i}: {voice.name} ({voice.id})")
        
        # Test audio
        print("Attempting to play test audio... (you should hear 'Testing IDMS ERP Assistant')")
        engine.say("Testing IDMS ERP Assistant")
        engine.runAndWait()
        print("pyttsx3 test completed.")
    except Exception as e:
        print(f"pyttsx3 test failed: {str(e)}")
    
    # Test multilingual TTS (gTTS and pygame)
    print("\nTesting multilingual TTS (gTTS and pygame):")
    try:
        # Initialize pygame mixer if not already done
        if not pygame.mixer.get_init():
            pygame.mixer.init()
        
        print("Attempting to play Hindi test audio... (you should hear 'नमस्ते')")
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, "hindi_test.mp3")
        
        hindi_tts = gTTS(text="नमस्ते", lang="hi", slow=False)
        hindi_tts.save(temp_file)
        
        pygame.mixer.music.load(temp_file)
        pygame.mixer.music.play()
        
        # Wait for audio to finish
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
            
        print("gTTS Hindi test completed.")
    except Exception as e:
        print(f"gTTS test failed: {str(e)}")
        print("Make sure you've installed the required packages:")
        print("pip install gTTS pygame langdetect")
    
    # Test language detection
    print("\nTesting language detection:")
    try:
        hindi_text = "नमस्ते कैसे हैं आप"
        english_text = "Hello how are you"
        
        from langdetect import detect
        hindi_lang = detect(hindi_text)
        english_lang = detect(english_text)
        
        print(f"Hindi text detected as: {hindi_lang}")
        print(f"English text detected as: {english_lang}")
        
        if hindi_lang == "hi" and english_lang == "en":
            print("Language detection is working correctly!")
        else:
            print("Language detection might have issues. Please check your langdetect installation.")
    except Exception as e:
        print(f"Language detection test failed: {str(e)}")
    
    # Test speech recognition
    print("\nTesting speech recognition:")
    try:
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("Microphone detected successfully")
            print("SpeechRecognition package is working")
    except Exception as e:
        print(f"Speech recognition test failed: {str(e)}")
        print("Make sure you've installed the required packages:")
        print("pip install SpeechRecognition PyAudio")
    
    print("\n--- End Diagnostics ---\n")
    
    # Your API key
    groq_api_key = "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"  # Replace with your actual Groq API key
    
    # Ask for video file path
    default_video = "./avatar.mp4"  # Default video path
    video_path = input(f"Enter path to your video file (default: {default_video}): ") or default_video
    
    # Create IDMS ERP chatbot with multilingual support
    chatbot = IDMSERPChatbot(groq_api_key, video_path)
    
    print("Multilingual IDMS ERP Assistant is ready! Type 'exit' to quit.")
    print("Type 'test audio' to run an audio test.")
    print("Type 'test hindi' to test Hindi TTS.")
    print("Type 'test video' to test video playback.")
    print("Type 'listen' to start speech recognition mode.")
    print("Type 'stop listening' to exit speech recognition mode.")
    print("Type 'set video' to change the video file.")
    print("Type 'novideo' to disable video or 'video' to enable it.")
    print("Ask any questions about the IDMS ERP system in English or Hindi!")
    print("आप हिंदी में भी प्रश्न पूछ सकते हैं!")
    
    use_video = True  # Default to using video if available
    
    while True:
        user_input = input("You: ")
        
        if user_input.lower() == "exit":
            break
        elif user_input.lower() == "test audio":
            print("Running audio test...")
            chatbot.text_to_speech("This is an audio test for the multilingual IDMS ERP Assistant. If you can hear this message, your audio is working correctly.", "en")
            continue
        elif user_input.lower() == "test hindi":
            print("Testing Hindi audio...")
            chatbot.text_to_speech("नमस्ते, यह एक हिंदी ऑडियो परीक्षण है। यदि आप यह संदेश सुन सकते हैं, तो आपका ऑडियो सही काम कर रहा है।", "hi")
            continue
        elif user_input.lower() == "test video":
            print("Testing video playback...")
            chatbot.video_player.play_video()
            time.sleep(5)  # Play for 5 seconds
            chatbot.video_player.stop_video()
            continue
        elif user_input.lower() == "novideo":
            use_video = False
            print("Video playback disabled")
            continue
        elif user_input.lower() == "video":
            use_video = True
            print("Video playback enabled")
            continue
        elif user_input.lower() == "set video":
            new_path = input("Enter path to your video file: ")
            if chatbot.set_video(new_path):
                print(f"Video set to: {new_path}")
            continue
        elif user_input.lower() == "listen":
            print("Starting speech recognition mode...")
            # Define a callback function to process recognized speech
            def speech_callback(text):
                print(f"You said: {text}")
                language = chatbot.detect_language(text)
                
                if text.lower() in ["stop listening", "stop", "exit", "quit"] or (language == "hi" and text.lower() in ["बंद करो", "रुको"]):
                    chatbot.stop_speech_recognition()
                    return
                
                chatbot.process_input(text, use_video)
            
            # Start listening with the callback
            chatbot.start_speech_recognition(callback=speech_callback)
            
            # Wait for user to stop listening mode
            print("Speech recognition mode active. Type 'stop listening' to exit this mode.")
            while chatbot.listening:
                cmd = input()
                if cmd.lower() in ["stop listening", "stop", "exit", "quit"]:
                    chatbot.stop_speech_recognition()
                    print("Speech recognition stopped.")
                    break
            continue
        elif user_input.lower() == "stop listening":
            chatbot.stop_speech_recognition()
            print("Speech recognition stopped.")
            continue
        
        # Process regular text input
        chatbot.process_input(user_input, use_video)


if __name__ == "__main__":
    main()