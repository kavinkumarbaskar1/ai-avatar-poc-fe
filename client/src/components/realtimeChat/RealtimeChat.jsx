import React, { useContext, useState } from 'react'
import "./RealtimeChat.scss"
import { AvatarContext } from '../../context/AvatarContext';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';


const RealtimeChat = () => {

  const [handState, setHandState] = useState(false); 
  const [isRecording, setIsRecording] = useState(false);
  const [recognizer,setRecognizer] = useState(null);
  const [query, setQuery] = useState('');
  const { updateIsHandRaise , selectedAvatarSynthesizer, setAvatarSpeechText, slides, currentSlide, setSelectedAvatarSynthesizer  } = useContext(AvatarContext);


  /**
   * Function to handle hand raise
   */  
  const handRaise = () => {
    updateIsHandRaise(true)
    if(selectedAvatarSynthesizer != null) stopSpeaking()
  }

  /**
   * Function to handle hand down
   */
  const handDown = () => {
    updateIsHandRaise(false)
    setAvatarSpeechText(slides[currentSlide-1].summary)
  }

  /**
   * Function to handle hand toggle
   */
  const toggleHand = () => {
    if(handState) {
        setHandState(false)
        handDown()
    } else{
        setHandState(true)
        handRaise()
    }
  }

  /**
   * Function to handle stop speaking of avatar
   */
  const stopSpeaking = () => {
    selectedAvatarSynthesizer.stopSpeakingAsync().then(
      console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
    ).catch((error) => {
        selectedAvatarSynthesizer.close()
        setSelectedAvatarSynthesizer(null) 
    });
  }

  /**
   * Function to handle microphone click
   */
  const handleMicrophoneClick = () => {
    if(isRecording) {
      if (recognizer) {
        recognizer.close();
        setIsRecording(false);
        setRecognizer(null);
        // setCurrentSlide
      }
    } else {
      setIsRecording(true);
      //logic for configuring audio for the Text messages
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(import.meta.env.VITE_REACT_APP_COGSVCSUBKEY, import.meta.env.VITE_REACT_APP_COGSVCREGION);
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      setRecognizer(newRecognizer);

      newRecognizer.recognizeOnceAsync(result => {
        setIsRecording(false);  
        setQuery(result?.text);
        setAvatarSpeechText(result?.text)
        // sendQuery(result?.text);
      }, error => {
          setIsRecording(false); 
      });
    }
  };

  return (
    <div className='realtime-container'>
        {handState && 
        <div onClick={handleMicrophoneClick} className={`microphone-icon ${isRecording ? 'recording' : ''}`}>
            <svg width="33" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C10.3 1 9 2.3 9 4V12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12V4C15 2.3 13.7 1 12 1zM19 10V12C19 15.3 16.3 18 13 18H11C7.7 18 5 15.3 5 12V10H3V12C3 16 6 19.1 10 19.9V23H14V19.9C18 19.1 21 16 21 12V10H19z" fill="red"/>
            </svg>
        </div>}
        <div onClick={toggleHand} className={handState ? "hand raise" : "hand down"}>
          🖐️
        </div>
    </div>
  )
}

export default RealtimeChat