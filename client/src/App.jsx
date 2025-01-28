import { useRef, useEffect, useState } from 'react'
import './App.scss'
import profile from "./assets/profile.jpg"
import userProfile from "./assets/userprofile.jpg"
import send from "./assets/send.png"
import ReactGoogleSlides from "react-google-slides";
import axios from "axios";


const App = () => {

  const [subjects, setSubjects] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [avatarImages, setAvatarImages] = useState({});
  const [chatHistory, setChatHistory] = useState([
    { type: "system", message: "Hi, how can I assist you?" },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const videoRef = useRef(null);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [videoUrl, setVideoUrl] = useState(""); // State for the video URL
  const [slidesLink, setSlidesLink] = useState(
    "https://docs.google.com/presentation/d/14MYxUdP9iHuxCl_KvygR345BpEBd-0JMNO3YwtODHS_k/edit" // Default presentation link
  );
  const[slide_automation_time,setSlideAutomationTime] = useState(6000)

  useEffect(() => {
    const video = videoRef.current;

    // Start video muted, then unmute programmatically
    video.muted = true;
    video.play().then(() => {
      video.muted = true;
    }).catch(error => {
      console.log("Autoplay failed:", error);
    });
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
        const response = await axios.get("http://127.0.0.1:8000/subjects");
        setSubjects(response.data); // Assuming the response data is the array of subjects
    };

    fetchSubjects();
  },[])

  useEffect(() => {
    const fetchAvatars = async () => {
      const response = await axios.get("http://127.0.0.1:8000/avatar");
      setAvatars(response.data); 
    }

    fetchAvatars();
  },[])

  useEffect(() => {
    const avatarFiles = import.meta.glob('./assets/avatars/*.png'); 
    console.log(avatarFiles)
    const images = {};
    const loadImages = async () => {
      for (const path in avatarFiles) {
        const imageName = path.replace('./assets/avatars/', '').replace(/\.[^/.]+$/, ''); 
        const imageModule = await avatarFiles[path](); 
        images[imageName] = imageModule.default;
      }
      setAvatarImages(images);
    };
    loadImages();
  }, []);

  const handleStartSession = async () => {
    try {
      if (!selectedAvatar || !selectedSubject) {
        alert("Please select both an avatar and a subject before starting the session.");
        return;
      }
      const baseUrl = "http://127.0.0.1:8000/generate/google-slide";
      const name = selectedAvatar;
      const subject = selectedSubject;
      const url = `${baseUrl}/${name}/${subject}`;
      console.log(url);
  
      const response = await axios.get(url, {
        sessionData: "some data if required",
      });
  
      if (response.data) {
        const { videoUrl, slideUrl, slideAutomationTime } = response.data;
        console.log(response.data);
  
        if (videoUrl) {
          setVideoUrl(videoUrl); 
          setSlideAutomationTime(slideAutomationTime);
        } else {
          console.error("Video URL not found in the response");
        }
  
        if (slideUrl) {
          setSlidesLink(slideUrl);
        } else {
          console.error("Presentation URL not found in the response");
        }
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };
  

  const handleSend = async () => {
    if (!userMessage.trim()) return;

    // Add user's message to chat history
    setChatHistory((prev) => [...prev, { type: "user", message: userMessage }]);

    try {
      // Send user's message to the API
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        message: userMessage,
      });

      // Add system's response to chat history
      setChatHistory((prev) => [
        ...prev,
        { type: "system", message: response.data.reply },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "system", message: "Sorry, something went wrong. Please try again later." },
      ]);
    } finally {
      setUserMessage("");
    }
  };

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar); 
    console.log("Selected Avatar:", avatar);
  };
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject); 
    console.log("Selected subject:", subject);
  };

  return (
    <div className='aiAvatarApp'>
      <div className='aiAvatarAppMainContainer'>
        <div className='aiAvatarAppMenu'>
        <div className="aiAvatarSelectionContainer">
        <div className="aiAvatarDisplay">
            {avatars.slice(0, 5).map((avatar, index) => {
              const avatarImage = avatarImages[`${avatar}Profile`];
              return (
                <div
                  key={index}
                  className={`aiAvatar${selectedAvatar === avatar ?' selectedAvatar' : ''}`}
                  onClick={() => handleAvatarClick(avatar)}
                >
                  <img src={avatarImage} alt={avatar} />
                </div>
              );
            })}
          </div>
          <div className="aiAvatarLoadMore">+1</div>
      </div>
          <div className="subjects-container">
            <h2>Select the Below available:</h2>
            <div className="subjects">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className={`subject ${selectedSubject === subject ?'Selected' : ''}`} // Highlight selected subject
                  onClick={() => handleSubjectClick(subject)} // Set selected subject on click
                >
                  <div className="subject-header">
                    <span className="star-icon">★</span>
                    <span className="subject-title">{subject}</span>
                    <span className="arrow-icon">⇧A</span>
                  </div>
                  <p className="subject-detail">10th CBSE.</p>
                </div>
              ))}
            </div>
          </div>
          <div className="aiAvatarSelectedAvatar">
            <video ref={videoRef} src={videoUrl} autoPlay muted={false}>
                Your browser does not support the video tag.
            </video>
          </div>

        </div>
        <div className='aiAvatarAppChatAndPresentationContainer'>
          <div className="generateContent">
          <button
            onClick={() => handleStartSession()}
            className="generateContentButton"
          >
            Start Session
          </button>
          </div>
          <div className="aiAvatarUserprofile">
              <img src={userProfile} alt="avatar" />
          </div>

          <div className="aiAvatarPresentationView">
            <ReactGoogleSlides
              width={650}
              height={450}
              slidesLink={slidesLink}
              slideDuration={slide_automation_time}
              position={1}
              showControls
              loop
            />
          </div>

          <div className="aiAvatarChatInterface">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={chat.type === "system" ? "aiAvatarSystemChat" : "aiAvatarUserChat"}
            >
              {chat.message}
            </div>
          ))}
          </div>
          <div className="chatInput">
            <input
              type="text"
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend(); // Send message on Enter key
              }}
            />
            <div className="sendButton" onClick={handleSend}>
              <img src={send} alt="Send" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
