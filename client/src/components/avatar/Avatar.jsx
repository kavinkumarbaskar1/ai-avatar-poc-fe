import "./Avatar.scss";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { createAvatarSynthesizer, createWebRTCConnection } from "../../Utility";
import { useState, useEffect, useContext } from "react";
import { useRef } from "react";
import { AvatarContext } from "../../context/AvatarContext";
import cogoToast from 'cogo-toast-react-17-fix';
import { TOAST_MESSAGES } from "../../constants/CommonConstants";

/**
 * component : This is avatar character from Azure Speech Service
 * @param {*} isLiveChat 
 * @returns 
 */
const Avatar = ({ isLiveChat }) => {
  const [avatarSynthesizer, setAvatarSynthesizer] = useState(null);
  const [isAvatarActive, setIsAvatarActive] = useState(false)
  const myAvatarVideoEleRef = useRef();
  const myAvatarAudioEleRef = useRef();
  const iceUrl = import.meta.env.VITE_ICE_URL;
  const iceUsername = import.meta.env.VITE_ICE_USERNAME;
  const iceCredential = import.meta.env.VITE_ICE_CREDENTIAL;
  const { avatarSpeechText, setAvatarSpeechText, 
    setSelectedAvatarSynthesizer, currentAvatar, 
    previousAvatar, currentSlide, setCurrentSlide, 
    slideScripts , isHandRaiseRef,
    setIsSessionResumed, isSubjectContainerDisabled,
    setIsSessionEnded
  } = useContext(AvatarContext);

  useEffect(() => {
    if (isLiveChat && isAvatarActive && (previousAvatar !== currentAvatar)){
      restartSession()
    }
    else if (isLiveChat) {
      setIsAvatarActive(true)
      startSession();
    }
  }, [isLiveChat, currentAvatar]);

  useEffect(() => {
    if (avatarSpeechText) {
        speakSelectedText(avatarSpeechText);
    }
  }, [avatarSpeechText]);

  /**
   * Function to handle track
   * 
   * @param {*} event 
   */
  const handleOnTrack = (event) => {
    // Update UI elements
    if (event.track.kind === "video") {
      const mediaPlayer = myAvatarVideoEleRef.current;
      mediaPlayer.id = event.track.kind;
      mediaPlayer.srcObject = event.streams[0];
      mediaPlayer.autoplay = true;
      mediaPlayer.playsInline = true;
      mediaPlayer.addEventListener("play", () => {
        window.requestAnimationFrame(() => {});
      });
    } else {
      const audioPlayer = myAvatarAudioEleRef.current;
      audioPlayer.srcObject = event.streams[0];
      audioPlayer.autoplay = true;
      audioPlayer.playsInline = true;
      audioPlayer.muted = true;
    }
  };

  /**
   * Function to use the text to voiced out the avatar
   * @param {*} text 
   */
  const speakSelectedText = (text) => {
    //Start speaking the text
    const audioPlayer = myAvatarAudioEleRef.current;
    audioPlayer.muted = false;
    avatarSynthesizer
      ?.speakTextAsync(text)
      .then((result) => {
        
        if (result.reason === SpeechSDK.ResultReason.Canceled) {
          let cancellationDetails =
            SpeechSDK.CancellationDetails.fromResult(result);
          console.log(cancellationDetails.reason);
          if (
            cancellationDetails.reason === SpeechSDK.CancellationReason.Error
          ) {
            console.log(cancellationDetails.errorDetails);
          }
        }
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log("[" + (new Date()).toISOString() + "] Speech synthesized to speaker for text [ " + text + " ]. Result ID: " + result.resultId)
          if(currentSlide === slideScripts.length){
            setIsSessionEnded(true)
          }
          if((currentSlide <= slideScripts.length) && (!isHandRaiseRef.current)){
            let tempSlide = currentSlide+1
            setCurrentSlide(tempSlide)
            setAvatarSpeechText(slideScripts[tempSlide-1].slide)
            console.log("Current slide :: " + currentSlide + " ::length -> "+ slideScripts.length);
          }
          
        }
      })
      .catch((error) => {
        avatarSynthesizer.close();
      });

      
  };

  /**
   * Funtion to start avatar session
   */
  const startSession = () => {
    let peerConnection = createWebRTCConnection(
      iceUrl,
      iceUsername,
      iceCredential
    );
    peerConnection.ontrack = handleOnTrack;
    peerConnection.addTransceiver("video", { direction: "sendrecv" });
    peerConnection.addTransceiver("audio", { direction: "sendrecv" });

    let avatarSynthesizer = createAvatarSynthesizer(currentAvatar);
    setAvatarSynthesizer(avatarSynthesizer);
    peerConnection.oniceconnectionstatechange = (e) => {
      if (peerConnection.iceConnectionState === "connected") {
        // cogoToast.success(TOAST_MESSAGES.SUCCESS_AVATAR_CONNECTED);
        console.log("Connected to Azure Avatar service");
      }

      if (
        peerConnection.iceConnectionState === "disconnected" ||
        peerConnection.iceConnectionState === "failed"
      ) {
        // cogoToast.error(TOAST_MESSAGES.ERROR_AVATAR_DISCONNECTED);
        console.log("Azure Avatar service Disconnected");
        console.log("Too many character swtiches attempted within a minute, Switching back to previous avatar.Please try after a minute !")
      }
    };

    avatarSynthesizer
      .startAvatarAsync(peerConnection)
      .then((r) => {
        // cogoToast.success(TOAST_MESSAGES.SUCCESS_AVATAR_STARTED);
        console.log("[" + new Date().toISOString() + "] Avatar started.");
      })
      .catch((error) => {
        // cogoToast.error(TOAST_MESSAGES.ERROR_AVATAR_STOPPED);
        console.log(
          "[" +
            new Date().toISOString() +
            "] Avatar failed to start. Error: " +
            error
        );
      });
      setSelectedAvatarSynthesizer(avatarSynthesizer)  
  };

  /**
   * Function to stop session
   */
  const stopSession = () => {
    avatarSynthesizer.close()
    setSelectedAvatarSynthesizer(null)  
  }

  /**
   * Function to restart session
   */
  const restartSession = () => {
    stopSession()
    startSession(currentAvatar)

    if(previousAvatar && currentAvatar && isSubjectContainerDisabled){
      setIsSessionResumed(true)
    }
  }

  return (
    <div className="container myAvatarContainer">
      <div className="container myAvatarVideoRootDiv d-flex justify-content-around">
        <div className="myAvatarVideo">
          <div id="myAvatarVideo" className="myVideoDiv">
            <video
              className="myAvatarVideoElement"
              ref={myAvatarVideoEleRef}
            ></video>

            <audio ref={myAvatarAudioEleRef}></audio>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Avatar;
