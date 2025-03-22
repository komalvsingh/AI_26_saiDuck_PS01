import os
import requests
from PIL import Image
import tempfile
import time
import json
import pyttsx3
import platform
import speech_recognition as sr
from idms_knowledge_base import IDMSKnowledgeBase
import base64
import threading

# Alternative TTS option if pyttsx3 fails
try:
    from gtts import gTTS
    from io import BytesIO
    import pygame
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

# Add ElevenLabs API for better speech synthesis
class ElevenLabsTTS:
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_url = "https://api.elevenlabs.io/v1"
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default voice ID - Rachel
        self.available = self._check_api_key()
    
    def _check_api_key(self):
        """Check if the API key is valid"""
        try:
            headers = {
                "xi-api-key": self.api_key
            }
            response = requests.get(f"{self.api_url}/voices", headers=headers)
            if response.status_code == 200:
                print("ElevenLabs API initialized successfully")
                # Get available voices
                voices = response.json().get("voices", [])
                if voices:
                    print(f"Available ElevenLabs voices: {len(voices)}")
                    for voice in voices[:3]:  # Show first 3 voices
                        print(f"- {voice.get('name')} (ID: {voice.get('voice_id')})")
                return True
            else:
                print(f"ElevenLabs API error: {response.status_code}")
                return False
        except Exception as e:
            print(f"Error initializing ElevenLabs API: {str(e)}")
            return False
    
    def set_voice(self, voice_id):
        """Set the voice to use"""
        self.voice_id = voice_id
    
    def generate_speech(self, text):
        """Generate speech from text using ElevenLabs API"""
        if not self.available:
            return None, "ElevenLabs API not available"
        
        try:
            headers = {
                "xi-api-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
            
            response = requests.post(
                f"{self.api_url}/text-to-speech/{self.voice_id}/stream",
                json=data,
                headers=headers
            )
            
            if response.status_code == 200:
                # Create a temporary file for the audio
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                temp_file.write(response.content)
                temp_file.close()
                return temp_file.name, None
            else:
                error_msg = f"ElevenLabs API error: {response.status_code}"
                print(error_msg)
                return None, error_msg
                
        except Exception as e:
            error_msg = f"Error generating speech: {str(e)}"
            print(error_msg)
            return None, error_msg


# Enhanced 3D Avatar Handler with animation control
class AnimatedAvatarHandler:
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.api_url = "https://api.d-id.com"
        self.currently_talking = False
        self.avatar_gender = "female"  # Default gender
        self.avatar_type = "talking-head"  # Default type: talking-head or presenter
    
    def set_avatar_gender(self, gender):
        """Set avatar gender to 'male' or 'female'"""
        if gender.lower() in ["male", "female"]:
            self.avatar_gender = gender.lower()
            print(f"Avatar gender set to: {self.avatar_gender}")
            return True
        else:
            print("Invalid gender. Use 'male' or 'female'.")
            return False
    
    def set_avatar_type(self, avatar_type):
        """Set avatar type to 'talking-head' or 'presenter'"""
        if avatar_type.lower() in ["talking-head", "presenter"]:
            self.avatar_type = avatar_type.lower()
            print(f"Avatar type set to: {self.avatar_type}")
            return True
        else:
            print("Invalid avatar type. Use 'talking-head' or 'presenter'.")
            return False
    
    def get_avatar_source_url(self):
        """Get the appropriate source URL based on gender and type"""
        # Default avatars from D-ID
        if self.avatar_type == "presenter":
            if self.avatar_gender == "female":
                return "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
            else:
                return "https://create-images-results.d-id.com/DefaultPresenters/William_m/image.jpeg"
        else:  # talking-head
            if self.avatar_gender == "female":
                return "https://create-images-results.d-id.com/DefaultTalkingHeads/anna/image.jpeg"
            else:
                return "https://create-images-results.d-id.com/DefaultTalkingHeads/james/image.jpeg"
    
    def create_talking_avatar(self, text, voice_id=None):
        """Create a talking avatar with the provided text"""
        self.currently_talking = True
        
        try:
            headers = {
                "Authorization": f"Basic {self.api_key}" if self.api_key else 
                                "Basic " + base64.b64encode(b"a29tYWx2c2luZ2gxMTExQGdtYWlsLmNvbQ:RLT_XSNBLYNcaZkZJB4H5").decode(),
                "Content-Type": "application/json"
            }
            
            # Prepare request data
            data = {
                "script": {
                    "type": "text",
                    "input": text,
                    "provider": {
                        "type": "elevenlabs",
                        "voice_id": voice_id or "21m00Tcm4TlvDq8ikWAM"  # Default to Rachel if not specified
                    }
                },
                "source_url": self.get_avatar_source_url(),
                "config": {
                    "stitch": True,  # For smoother animations
                }
            }
            
            # Add animation control for presenter type
            if self.avatar_type == "presenter":
                data["config"]["presenter_config"] = {
                    "crop": {
                        "type": "none"
                    }
                }
            
            # Make request to D-ID API
            endpoint = f"{self.api_url}/talks"
            
            # In a real implementation, uncomment this
            # response = requests.post(endpoint, json=data, headers=headers)
            # if response.status_code in [200, 201]:
            #     result = response.json()
            #     return {"id": result.get("id"), "status": "created"}
            
            # For demonstration, simulate a successful response
            print("3D Animated Avatar generation requested")
            return {"id": f"simulated-avatar-{time.time()}", "status": "created"}
            
        except Exception as e:
            print(f"Error generating animated avatar: {str(e)}")
            self.currently_talking = False
            return None
    
    def check_avatar_status(self, avatar_id):
        """Check the status of an avatar generation request"""
        try:
            # In real implementation, uncomment this
            # endpoint = f"{self.api_url}/talks/{avatar_id}"
            # headers = {"Authorization": f"Basic {self.api_key}"}
            # response = requests.get(endpoint, headers=headers)
            # if response.status_code == 200:
            #     return response.json()
            
            # For demonstration, simulate a ready status
            return {"status": "ready", "result_url": f"https://example.com/{avatar_id}.mp4"}
            
        except Exception as e:
            print(f"Error checking avatar status: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    def display_neutral_pose(self):
        """Return avatar to neutral pose when not speaking"""
        if not self.currently_talking:
            return  # Already in neutral pose
            
        try:
            # In real implementation with a WebSocket connection to avatar renderer:
            # 1. Send a command to reset the avatar's animation state
            # 2. Set facial expression to neutral
            # 3. Reset any ongoing animation sequences
            
            # For demonstration purposes:
            print("Avatar returned to neutral pose")
            
            # Create a neutral pose avatar image for display
            neutral_avatar_path = self.generate_neutral_pose_image()
            if neutral_avatar_path:
                try:
                    img = Image.open(neutral_avatar_path)
                    img.show()  # Shows the neutral avatar image
                except Exception as e:
                    print(f"Error displaying neutral avatar: {e}")
                finally:
                    self.currently_talking = False
            
            return neutral_avatar_path
            
        except Exception as e:
            print(f"Error setting neutral pose: {str(e)}")
            self.currently_talking = False
            return None
    
    def generate_neutral_pose_image(self):
        """Generate a neutral pose image for the avatar"""
        # For demonstration purposes, generate a static image
        # In a real implementation, you would use the actual avatar with a neutral expression
        
        try:
            # Use DiceBear API for a static avatar (fallback for demo)
            avatar_style = "bottts" if self.avatar_gender == "male" else "lorelei"
            seed = f"idms-avatar-{self.avatar_gender}"
            
            url = f"https://api.dicebear.com/7.x/{avatar_style}/png"
            params = {"seed": seed, "mood": "neutral"}
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                # Save the avatar image to a temporary file
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
                temp_file.write(response.content)
                temp_file.close()
                return temp_file.name
                
        except Exception as e:
            print(f"Error generating neutral pose image: {str(e)}")
        
        return None
    
    def play_talking_animation(self, avatar_url):
        """Play the talking animation and return to neutral pose when done"""
        if not avatar_url:
            print("No avatar URL provided")
            return False
            
        try:
            # In a real implementation:
            # 1. Use a video player component to display the animation
            # 2. Monitor when the video ends
            # 3. Set up an event handler for video completion
            
            # For demonstration purposes, simulate video playing
            video_duration = 5  # Simulate 5 second video
            print(f"Playing avatar animation at: {avatar_url}")
            print(f"Animation will play for {video_duration} seconds")
            
            # Wait for "video" to complete
            time.sleep(video_duration)
            
            # Return to neutral pose
            self.display_neutral_pose()
            return True
            
        except Exception as e:
            print(f"Error playing talking animation: {str(e)}")
            self.currently_talking = False
            return False


# Modified chatbot with IDMS ERP Knowledge, Speech Recognition, and Enhanced 3D Avatars
class IDMSERPChatbot:
    def __init__(self, groq_api_key, elevenlabs_api_key=None, did_api_key=None):
        self.groq_api_key = groq_api_key
        self.elevenlabs_api_key = elevenlabs_api_key
        self.did_api_key = did_api_key
        self.use_alternative_tts = False
        self.speech_recognizer = sr.Recognizer()
        self.listening = False
        
        # Initialize IDMS ERP knowledge base
        self.knowledge_base = IDMSKnowledgeBase()
        
        # Initialize ElevenLabs TTS if API key is provided
        self.elevenlabs_tts = None
        if elevenlabs_api_key:
            self.elevenlabs_tts = ElevenLabsTTS(elevenlabs_api_key)
            # If ElevenLabs is available, use it as the primary TTS method
            if self.elevenlabs_tts.available:
                print("ElevenLabs will be used as the primary TTS method")
        
        # Initialize animated avatar handler
        self.avatar_handler = AnimatedAvatarHandler(did_api_key)
        
        # Initialize primary TTS engine (pyttsx3) as fallback
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
            print("Fallback TTS engine initialized successfully")
        except Exception as e:
            print(f"Error initializing fallback TTS engine: {str(e)}")
            print("Will try alternative TTS method if available")
            self.use_alternative_tts = True
            
            # Initialize pygame for alternative audio playback if gtts is available
            if GTTS_AVAILABLE:
                try:
                    pygame.init()
                    pygame.mixer.init()
                    print("Alternative TTS engine initialized")
                except Exception as e:
                    print(f"Error initializing pygame for audio: {str(e)}")
    
    def generate_text_response(self, user_input):
        """Get text response from Groq API with IDMS ERP context"""
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # Create a system prompt that includes the IDMS ERP knowledge
        system_message = f"""You are an IDMS ERP system expert assistant. Your purpose is to help users understand and use the IDMS ERP system effectively.
        
Use the following knowledge base to answer user questions:

{self.knowledge_base.idms_knowledge}

Focus on providing accurate, helpful information about the IDMS ERP system. If a user asks about something not covered in your knowledge base, you can provide general ERP guidance but make it clear that it may not be specific to IDMS.

For GST-related questions, be especially precise and reference the appropriate sections of the IDMS system.
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
            return result["choices"][0]["message"]["content"]
        
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            return "I'm sorry, I encountered an error generating a response about the IDMS ERP system."
    
    def speak_text(self, text):
        """Speak text using the available TTS method (ElevenLabs preferred)"""
        # Skip very long texts to avoid TTS issues
        if len(text) > 500:
            shortened_text = text[:497] + "..."
            print("Text shortened for TTS")
        else:
            shortened_text = text
        
        # Try ElevenLabs first if available
        if self.elevenlabs_tts and self.elevenlabs_tts.available:
            try:
                print("Using ElevenLabs TTS")
                audio_file, error = self.elevenlabs_tts.generate_speech(shortened_text)
                if audio_file:
                    # Play the audio with pygame
                    pygame.mixer.init()
                    pygame.mixer.music.load(audio_file)
                    pygame.mixer.music.play()
                    while pygame.mixer.music.get_busy():
                        pygame.time.Clock().tick(10)
                    
                    # Clean up
                    pygame.mixer.music.unload()
                    os.remove(audio_file)
                    return True
                else:
                    print(f"ElevenLabs error: {error}")
                    print("Falling back to other TTS methods")
            except Exception as e:
                print(f"Error with ElevenLabs TTS: {str(e)}")
                print("Falling back to other TTS methods")
            
        # Try primary method (pyttsx3)
        if not self.use_alternative_tts:
            try:
                print("Using primary TTS (pyttsx3)")
                self.tts_engine.say(shortened_text)
                self.tts_engine.runAndWait()
                return True
            except Exception as e:
                print(f"Error with primary TTS: {str(e)}")
                self.use_alternative_tts = True
                print("Switching to alternative TTS")
        
        # Try alternative method (gTTS + pygame)
        if self.use_alternative_tts and GTTS_AVAILABLE:
            try:
                print("Using alternative TTS (gTTS)")
                # Create a temporary file for the audio
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                temp_file.close()
                
                # Generate and save the speech
                tts = gTTS(text=shortened_text, lang='en')
                tts.save(temp_file.name)
                
                # Play the audio
                pygame.mixer.music.load(temp_file.name)
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)
                
                # Clean up
                pygame.mixer.music.unload()
                os.remove(temp_file.name)
                return True
            except Exception as e:
                print(f"Error with alternative TTS: {str(e)}")
        
        if self.use_alternative_tts and not GTTS_AVAILABLE:
            print("Alternative TTS not available. Install gTTS and pygame for backup TTS.")
        
        return False
    
    def start_speech_recognition(self, callback=None):
        """Start listening for speech input"""
        self.listening = True
        print("Starting speech recognition. Speak now...")
        
        # Indicate that we're listening
        self.speak_text("I'm listening. Please speak your question.")
        
        # Start listening in a separate thread to avoid blocking
        import threading
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
                    
                    # If recognized text includes stop commands
                    if user_input.lower() in ["stop listening", "stop", "exit", "quit"]:
                        self.speak_text("Speech recognition stopped.")
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
                    # Optional: prompt user that speech wasn't understood
                    # self.speak_text("Sorry, I didn't catch that. Please try again.")
                except sr.RequestError as e:
                    print(f"Error with speech recognition service: {e}")
                    self.speak_text("There was an error with the speech recognition service.")
                    self.listening = False
            
            except Exception as e:
                print(f"Error in speech recognition: {e}")
                time.sleep(1)  # Prevent CPU spike if continuous errors
    
    def process_input(self, user_input, use_animated_avatar=True):
        """Process user input and respond with animated avatar and speech"""
        # 1. Generate text response with IDMS ERP knowledge
        text_response = self.generate_text_response(user_input)
        print(f"IDMS Bot: {text_response}")
        
        # 2. Generate and display animated talking avatar
        avatar_result = None
        avatar_file = None
        animation_started = False
        avatar_status = None
        
        if use_animated_avatar:
            try:
                # Start the animation - avatar should begin speaking
                voice_id = self.elevenlabs_tts.voice_id if self.elevenlabs_tts else None
                avatar_result = self.avatar_handler.create_talking_avatar(text_response, voice_id)
                
                if avatar_result and "id" in avatar_result:
                    avatar_id = avatar_result["id"]
                    print(f"Animated Avatar requested with ID: {avatar_id}")
                    
                    # Check status until ready
                    max_retries = 10
                    for i in range(max_retries):
                        avatar_status = self.avatar_handler.check_avatar_status(avatar_id)
                        if avatar_status and avatar_status.get("status") == "ready":
                            avatar_url = avatar_status.get("result_url")
                            print(f"Avatar animation ready: {avatar_url}")
                            
                            # Start a separate thread to play the animation while speaking
                            def play_animation_and_return_to_neutral():
                                animation_success = self.avatar_handler.play_talking_animation(avatar_url)
                                if not animation_success:
                                    # If animation fails, manually set to neutral pose
                                    self.avatar_handler.display_neutral_pose()
                            
                            # Start animation in separate thread
                            animation_thread = threading.Thread(target=play_animation_and_return_to_neutral)
                            animation_thread.daemon = True
                            animation_thread.start()
                            animation_started = True
                            break
                        
                        # Wait before checking again
                        time.sleep(0.5)
                    
                    if not animation_started:
                        print("Animation not ready after max retries, using fallback")
                
            except Exception as e:
                print(f"Error with animated avatar: {str(e)}")
        
        # Fall back to static avatar if animation failed or wasn't requested
        if not animation_started:
            # Generate a static avatar as fallback
            avatar_file = self.avatar_handler.generate_neutral_pose_image()
            if avatar_file:
                try:
                    img = Image.open(avatar_file)
                    img.show()  # Shows the static avatar image
                except Exception as e:
                    print(f"Error displaying static avatar: {e}")
        
        # 3. Speak the text (ElevenLabs will be tried first if available)
        # Note: In a real implementation, the audio would be synced with the avatar animation
        # For this demo, they may run separately
        speech_success = self.speak_text(text_response)
        if not speech_success:
            print("WARNING: Speech synthesis failed. Check your audio settings and libraries.")
        
        # 4. Make sure avatar returns to neutral pose after speaking
        if animation_started:
            # The animation thread will handle returning to neutral pose
            pass
        else:
            # For static avatar, simulate returning to neutral after speaking
            time.sleep(0.5)  # Small delay
            print("Avatar returned to neutral pose")
        
        return {
            "text": text_response,
            "avatar_path": avatar_file,
            "avatar_type": "animated" if animation_started else "static",
            "avatar_url": avatar_status.get("result_url") if animation_started and avatar_status else None,
            "speech_success": speech_success
        }
    
    def set_avatar_gender(self, gender):
        """Set the avatar gender"""
        return self.avatar_handler.set_avatar_gender(gender)
    
    def set_avatar_type(self, avatar_type):
        """Set the avatar type"""
        return self.avatar_handler.set_avatar_type(avatar_type)


# Example usage
def main():
    # Audio troubleshooting at startup
    print("\n--- Audio System Diagnostics ---")
    print(f"Operating System: {platform.system()} {platform.release()}")
    
    # Test pyttsx3
    print("\nTesting primary TTS (pyttsx3):")
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
        print("Test completed. If you didn't hear anything, check your system audio settings.")
    except Exception as e:
        print(f"pyttsx3 test failed: {str(e)}")
    
    # Test alternative TTS if available
    if GTTS_AVAILABLE:
        print("\nAlternative TTS (gTTS) is available as backup")
    else:
        print("\nAlternative TTS not available. Consider installing gTTS and pygame:")
        print("pip install gTTS pygame")
    
    # Test speech recognition
    print("\nTesting speech recognition (SpeechRecognition package):")
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
    
    # Your API keys
    groq_api_key = "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"  # Replace with your actual Groq API key
    elevenlabs_api_key = "sk_1c81bf77e698a4f602bf716e92d7397d8402484f08804871"  # Your ElevenLabs API key
    did_api_key = None  # Your D-ID API key if available
    
    # Create IDMS ERP chatbot with animated avatar integration
    chatbot = IDMSERPChatbot(groq_api_key, elevenlabs_api_key, did_api_key)
    
    print("IDMS ERP Assistant is ready! Type 'exit' to quit.")
    print("Type 'test audio' to run an audio test.")
    print("Type 'listen' to start speech recognition mode.")
    print("Type 'stop listening' to exit speech recognition mode.")
    print("Type 'male' or 'female' to set avatar gender.")
    print("Type 'talking-head' or 'presenter' to set avatar type.")
    print("Type 'static' to use static avatars or 'animated' to use animated avatars.")
    print("Ask any questions about the IDMS ERP system, its modules, or GST integration.")
    
    use_animated_avatar = True  # Default to animated avatars if available
    
    while True:
        user_input = input("You: ")
        
        if user_input.lower() == "exit":
            break
        elif user_input.lower() == "test audio":
            print("Running audio test...")
            chatbot.speak_text("This is an audio test for the IDMS ERP Assistant with talking avatar integration. If you can hear this message, your audio is working correctly.")
            continue
        elif user_input.lower() == "static":
            use_animated_avatar = False
            print("Switched to static avatars")
            continue
        elif user_input.lower() == "animated":
            use_animated_avatar = True
            print("Switched to animated avatars (when available)")
            continue
        elif user_input.lower() in ["male", "female"]:
            chatbot.set_avatar_gender(user_input.lower())
            continue
        elif user_input.lower() in ["talking-head", "presenter"]:
            chatbot.set_avatar_type(user_input.lower())
            continue
        elif user_input.lower() == "listen":
            print("Starting speech recognition mode...")
            # Define a callback function to process recognized speech
            def speech_callback(text):
                print(f"You said: {text}")
                if text.lower() in ["stop listening", "stop", "exit", "quit"]:
                    chatbot.stop_speech_recognition()
                    return
                
                response = chatbot.process_input(text, use_animated_avatar)
                
                # Clean up the temporary avatar file if it exists
                try:
                    if response.get('avatar_path') and os.path.exists(response['avatar_path']):
                        os.remove(response['avatar_path'])
                except Exception as e:
                    print(f"Error removing temporary file: {e}")
            
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
        response = chatbot.process_input(user_input, use_animated_avatar)
        
        # Clean up the temporary avatar file if it exists
        try:
            if response.get('avatar_path') and os.path.exists(response['avatar_path']):
                os.remove(response['avatar_path'])
        except Exception as e:
            print(f"Error removing temporary file: {e}")


if __name__ == "__main__":
    main()