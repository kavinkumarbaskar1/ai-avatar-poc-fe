import { useRef, useEffect, useState } from "react";
import "./App.scss";
import userProfile from "./assets/userprofile.jpg";
import ReactGoogleSlides from "react-google-slides";
import axios from "axios";
import ChatInterface from "./components/ChatInterface";
import { MutatingDots } from 'react-loader-spinner'

const App = () => {
  const [subjects, setSubjects] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [avatarImages, setAvatarImages] = useState({});
  const videoRef = useRef(null);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [videoUrl, setVideoUrl] = useState(""); // State for the video URL
  const [slidesLink, setSlidesLink] = useState(
    "https://docs.google.com/presentation/d/14MYxUdP9iHuxCl_KvygR345BpEBd-0JMNO3YwtODHS_k/edit" // Default presentation link
  );
  const [slide_automation_time, setSlideAutomationTime] = useState(6000);
  const [loader, setLoader] = useState(false);
  const [showPresentationContainer, setShowPresentationContainer] = useState(false)


  useEffect(() => {
    const video = videoRef.current;

    // Start video muted, then unmute programmatically
    video.muted = false;
    video
      .play()
      .then(() => {
        video.muted = false;
      })
      .catch((error) => {
        console.log("Autoplay failed:", error);
      });
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await axios.get("http://127.0.0.1:8000/subjects");
      setSubjects(response.data); // Assuming the response data is the array of subjects
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchAvatars = async () => {
      const response = await axios.get("http://127.0.0.1:8000/avatar");
      setAvatars(response.data);
    };

    fetchAvatars();
  }, []);

  useEffect(() => {
    const avatarFiles = import.meta.glob("./assets/avatars/*.png");
    console.log(avatarFiles);
    const images = {};
    const loadImages = async () => {
      for (const path in avatarFiles) {
        const imageName = path
          .replace("./assets/avatars/", "")
          .replace(/\.[^/.]+$/, "");
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
        alert(
          "Please select both an avatar and a subject before starting the session."
        );
        return;
      }
      const baseUrl = "http://127.0.0.1:8000/generate/google-slide";
      const name = selectedAvatar;
      const subject = selectedSubject;
      const url = `${baseUrl}/${name}/${subject}`;
      console.log(url);

      setLoader(true)
      const response = await axios.get(url, {
        sessionData: "some data if required",
      });

      setLoader(false)
      setShowPresentationContainer(true)
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
      setLoader(false)
      console.error("Error starting session:", error);
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
    <div className="aiAvatarApp">
      <div className="aiAvatarAppMainContainer">
        <div className="aiAvatarAppMenu">
          <div className="aiAvatarSelectionContainer">
            <div className="aiAvatarDisplay">
              {avatars.slice(0, 5).map((avatar, index) => {
                const avatarImage = avatarImages[`${avatar}Profile`];
                return (
                  <div
                    key={index}
                    className={`aiAvatar${
                      selectedAvatar === avatar ? " selectedAvatar" : ""
                    }`}
                    onClick={() => handleAvatarClick(avatar)}
                  >
                    <img src={avatarImage} alt={avatar} />
                  </div>
                );
              })}
            </div>
            {/* <div className="aiAvatarLoadMore">+1</div> */}
          </div>
          <div className="subjects-container">
            <h2>Select the Below available:</h2>
            <div className="subjects">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className={`subject ${
                    selectedSubject === subject ? "Selected" : ""
                  }`} // Highlight selected subject
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
          <div className="generateContent">
            {showPresentationContainer === false && <button
              onClick={() => handleStartSession()}
              className="generateContentButton"
            >
              Start Session
            </button>}
          </div>
        </div>
        <div className="aiAvatarAppChatAndPresentationContainer">
          {loader && 
          <div className="loaderWrapper"> 
            <MutatingDots
                visible={true}
                height="100"
                width="100"
                color="#4fa94d"
                secondaryColor="#4fa94d"
                radius="12.5"
                ariaLabel="mutating-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
          </div>
         }
          <div className="headerContainer">
            <div className="aiAvatarUserprofile">
              <img src={userProfile} alt="avatar" />
            </div>
          </div>

          <div className="aiAvatarPresentationView">
            { <div style={{visibility: showPresentationContainer ? "visible" : "hidden",}}>
              <ReactGoogleSlides
                width={850}
                height={550}
                slidesLink={slidesLink}
                slideDuration={slide_automation_time}
                position={1}
                showControls
                loop
              /></div>}
          </div>

          <div className="aiAvatarSelectedAvatarContainer">
            <div className="aiAvatarSelectedAvatar">
              <video ref={videoRef} src={videoUrl} autoPlay muted={false}>
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {showPresentationContainer && <ChatInterface />}
        </div>
      </div>
    </div>
  );
};

export default App;
