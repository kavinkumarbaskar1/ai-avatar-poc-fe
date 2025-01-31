import { createContext, useState } from "react";

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
 

  return (
    <AvatarContext.Provider value={{ 
        avatarSpeechText, setAvatarSpeechText, 
        isHandRaise, setIsHandRaise, 
        selectedAvatarSynthesizer, setSelectedAvatarSynthesizer, 
        currentAvatar, setCurrentAvatar,
        previousAvatar, setPreviousAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};
