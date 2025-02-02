import { useRef, useEffect, useState, useContext } from "react";
import "./App.scss";
import userProfile from "./assets/userprofile.jpg";
import ReactGoogleSlides from "react-google-slides";
import axios from "axios";
import ChatInterface from "./components/chatInterface/ChatInterface";
import { MutatingDots } from 'react-loader-spinner'
import Avatar from "./components/avatar/Avatar";
import RealtimeChat from "./components/realtimeChat/RealtimeChat";
import { AvatarContext } from "./context/AvatarContext";

const App = () => {
  const [subjects, setSubjects] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [avatarImages, setAvatarImages] = useState({});
  const videoRef = useRef(null);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [videoUrl, setVideoUrl] = useState(""); // State for the video URL
  const [slidesLink, setSlidesLink] = useState(
    "https://docs.google.com/presentation/d/14MYxUdP9iHuxCl_KvygR345BpEBd-0JMNO3YwtODHS_k/edit" // Default presentation link
  );
  const [slide_automation_time, setSlideAutomationTime] = useState(100000);
  const [loader, setLoader] = useState(false);
  const [showPresentationContainer, setShowPresentationContainer] = useState(false)
  const [isLiveChat, setIsLiveChat] = useState(false);
  const { setAvatarSpeechText, currentAvatar, setCurrentAvatar, setPreviousAvatar, currentSlide, setCurrentSlide, slides, setSlides } = useContext(AvatarContext)

  /**
   * Side effect to fetch subjects from backend
   */
  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await axios.get("http://127.0.0.1:8000/subjects");
      setSubjects(response.data); // Assuming the response data is the array of subjects
    };

    fetchSubjects();
  }, []);

  /**
   * Side effect to fetch avatar from backend
   */
  useEffect(() => {
    // const fetchAvatars = async () => {
      // const response = await axios.get("http://127.0.0.1:8000/avatar");
      // setAvatars(response.data);
      setAvatars([
        {
          avatarName: "Lisa",
          avatarVoice: "en-US-AvaMultilingualNeural",
          avatarStyle: "casual-sitting"
        },
        {
          avatarName: "Harry",
          avatarVoice: "en-US-AndrewMultilingualNeural",
          avatarStyle: "youthful"
        },
        {
          avatarName: "Jeff",
          avatarVoice: "en-US-BrandonMultilingualNeural",
          avatarStyle: "formal"
        },
        {
          avatarName: "Max",
          avatarVoice: "en-US-BrianMultilingualNeural",
          avatarStyle: "casual"
        },
        {
          avatarName: "Lori",
          avatarVoice: "en-US-EmmaMultilingualNeural",
          avatarStyle: "formal"
        }
      ])
      // setAvatars(["Lisa", "Harry", "Jeff", "Max", "Lori"])
    // };

    // fetchAvatars();
  }, []);

  /**
   * Side effect to load avatar images
   */
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

  useEffect(() => {

  },[currentSlide])

  

  /**
   * Async Function to handle start session
   */
  const handleStartSession = async () => {
    try {
      if (!currentAvatar || !selectedSubject) {
        alert(
          "Please select both an avatar and a subject before starting the session."
        );
        return;
      }
      const baseUrl = "http://127.0.0.1:8000/generate/google-slide";
      const name = currentAvatar.avatarName;
      const subject = selectedSubject;
      const url = `${baseUrl}/${name}/${subject}`;
      console.log(url);

      setLoader(true)
      const response = await axios.get(url, {
        sessionData: "some data if required",
      });

      setLoader(false)
      setShowPresentationContainer(true)

      const slidesResponse = [
        {
          slide: "Hello all, i'm avatar",
          summary: "summary for slide0 "  
        },
        {
          slide : "Data Science is an interdisciplinary field ",
          summary : "Summary for slide1 Data Science is an interdisciplinary field "
        },
        {
          slide : "Data refers to raw facts, figures, or information collected from various sources. ",
          summary : "Summary for slide2 Data refers to raw facts, figures, or information collected from various sources."
        },
        {
          slide : "Data Collection: Gathering data from sources like surveys, sensors, or databases",
          summary : "Summary for slide3 Data Collection: Gathering data from sources like surveys, sensors, or databases"
        },
        {
          slide : "Predicting house prices: Using historical data on house features ",
          summary : "Summary for slide4 Predicting house prices: Using historical data on house features"
        },
        {
          slide : "Data Science is used in various industries",
          summary : "Summary for slide5 Data Science is used in various industries"
        },
        // {
        //   slide: "Data Science is a powerful tool for solving real-world problems",
        //   summary: "summary for slide6 Data Science is a powerful tool for solving real-world problems"
        // }
      ]


      if (response.data) {
        const { videoUrl, slideUrl, slideAutomationTime } = response.data;
        console.log(response.data);

        // if (videoUrl) {
        //   setVideoUrl(videoUrl);
        //   setSlideAutomationTime(slideAutomationTime);
        // } else {
        //   console.error("Video URL not found in the response");
        // }

        

        if (slideUrl) {
          setSlidesLink(slideUrl);
        } else {
          console.error("Presentation URL not found in the response");
        }
        // setAvatarSpeechText("Hello Abhishek nice to meet you hope you have nice day")

        if(videoUrl) {
          setCurrentSlide(1)
          setSlides(slidesResponse)
          setAvatarSpeechText(slidesResponse[0].slide)
          // setTimeout(() => {
            // setCurrentSlide(currentSlide)
          // }, 2000);
        }
      }
    } catch (error) {
      setLoader(false)
      console.error("Error starting session:", error);
    }
  };

  /**
   * 
   * Function to handle avatar select
   * 
   * @param {*} avatar 
   */
  const handleAvatarClick = (avatar) => {
    setPreviousAvatar(currentAvatar)
    setCurrentAvatar(avatar)
    if(!isLiveChat) setIsLiveChat(true);
    console.log("Selected Avatar:", avatar);
  };

  /**
   * Function to handle subject click
   * 
   * @param {*} subject 
   */
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
                const avatarImage = avatarImages[`${avatar.avatarName}Profile`];
                return (
                  <div
                    key={index}
                    className={`aiAvatar${
                      currentAvatar?.avatarName === avatar.avatarName ? " selectedAvatar" : ""
                    }`}
                    onClick={() => handleAvatarClick(avatar)}
                  >
                    <img src={avatarImage} alt={avatar.avatarName} />
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
            {/* {!showPresentationContainer && <button
              onClick={handleStartSession}
              className="generateContentButton"
            >
              Start Session
            </button>} */}

            <button
              onClick={handleStartSession}
              className="generateContentButton"
            >
              Start Session
            </button>

            {/* <button
              onClick={() => setAvatarSpeechText("Hello Kavya nice to meet you")}
              className="generateContentButton"
            >
              speak Session
            </button> */}

            {/* {showPresentationContainer && <div>
                <button>New Character Assign</button>
                <button>Stop Session</button>
              </div>} */}
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
                width={750}
                height={450}
                slidesLink={slidesLink}
                slideDuration={slide_automation_time}
                position={currentSlide}
                // showControls
                // loop
              /></div>}
          </div>

          <div className="aiAvatarSelectedAvatarContainer">
              <Avatar isLiveChat={isLiveChat}></Avatar>
          </div>

          {/* {showPresentationContainer && <ChatInterface />} */}
          <RealtimeChat/>
        </div>
      </div>
    </div>
  );
};

export default App;
