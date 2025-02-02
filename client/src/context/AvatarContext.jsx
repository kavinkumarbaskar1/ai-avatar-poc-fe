import { createContext, useEffect, useRef, useState } from "react";

export const AvatarContext = createContext();

/**
 * Avatar provider for text, hand raise
 * 
 * 
 * @param {*} children
 * @returns 
 */
export const AvatarProvider = ({ children }) => {
  const [avatarSpeechText, setAvatarSpeechText] = useState("");
  const [isHandRaise, setIsHandRaise] = useState(false);
  const [selectedAvatarSynthesizer, setSelectedAvatarSynthesizer] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState()
  const [previousAvatar, setPreviousAvatar] = useState()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [slides, setSlides] = useState()
  const isHandRaiseRef = useRef(isHandRaise);

  useEffect(() => {
    isHandRaiseRef.current = isHandRaise
  },[isHandRaise])

  const updateIsHandRaise= (value) => {
    isHandRaiseRef.current = value; // Instantly updates ref
    setIsHandRaise(value); // Triggers re-render asynchronously
    console.log("Instant value:", isHandRaiseRef.current);
  };
 

  return (
    <AvatarContext.Provider value={{ 
        avatarSpeechText, setAvatarSpeechText, 
        isHandRaise, setIsHandRaise, 
        selectedAvatarSynthesizer, setSelectedAvatarSynthesizer, 
        currentAvatar, setCurrentAvatar,
        previousAvatar, setPreviousAvatar,
        currentSlide, setCurrentSlide,
        slides, setSlides,
        isHandRaiseRef, updateIsHandRaise}}>
      {children}
    </AvatarContext.Provider>
  );
};
