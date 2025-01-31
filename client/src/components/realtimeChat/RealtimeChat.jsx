import React, { useContext, useState } from 'react'
import "./RealtimeChat.scss"
import { AvatarContext } from '../../context/AvatarContext';

const RealtimeChat = () => {

  const [handState, setHandState] = useState(false); 
  const { setIsHandRaise, selectedAvatarSynthesizer } = useContext(AvatarContext);
  

  /**
   * Function to handle hand raise
   */  
  const handRaise = () => {
    setIsHandRaise(true)
    if(selectedAvatarSynthesizer != null) stopSpeaking()
  }

  /**
   * Function to handle hand down
   */
  const handDown = () => {
    setIsHandRaise(false)
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
    ).catch(log);
  }

  return (
    <div className='realtime-container'>
        <div onClick={toggleHand} className={handState ? "hand raise" : "hand down"}>
          🖐️
        </div>
    </div>
  )
}

export default RealtimeChat