import { useRef, useEffect, useState, useContext } from "react";
import "./App.scss";
import userProfile from "./assets/userprofile.jpg";
import ReactGoogleSlides from "react-google-slides";
import axios from "axios";
import { MutatingDots } from 'react-loader-spinner'
import Avatar from "./components/avatar/Avatar";
import RealtimeChat from "./components/realtimeChat/RealtimeChat";
import { AvatarContext } from "./context/AvatarContext";
import Modal from "./components/modal/Modal";
import cogoToast from 'cogo-toast-react-17-fix';
import { TOAST_MESSAGES } from "./constants/CommonConstants";
import Quiz from "./components/quiz/Quiz";

const App = () => {
  const [subjects, setSubjects] = useState([]);
  const [avatars, setAvatars] = useState([])
  const [avatarImages, setAvatarImages] = useState({})
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [slidesLink, setSlidesLink] = useState(
    "https://docs.google.com/presentation/d/14MYxUdP9iHuxCl_KvygR345BpEBd-0JMNO3YwtODHS_k/edit" // Default presentation link
  );
  const [slide_automation_time, setSlideAutomationTime] = useState(100000);
  const [loader, setLoader] = useState(false);
  const [showPresentationContainer, setShowPresentationContainer] = useState(false)
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState()
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizData, setQuizData] = useState();
  const { setAvatarSpeechText, currentAvatar, setCurrentAvatar, 
    setPreviousAvatar, currentSlide, setCurrentSlide, 
    setSlideScripts, isSubjectContainerDisabled, 
    setIsSubjectContainerDisabled, selectedAvatarSynthesizer, 
    setSelectedAvatarSynthesizer, isSessionResumed, setIsSessionResumed,
    slideScripts, isSessionEnded, setIsSessionEnded
  } = useContext(AvatarContext)

  /**
   * Side effect to fetch avatar, subjects and quiz data from backend
   */
  useEffect(() => {
    // Function to fetch subjects
    const fetchSubjects = async () => {
      const response = await axios.get("http://127.0.0.1:8000/subjects")
      setSubjects(response.data) // Assuming the response data is the array of subjects
      // cogoToast.success(TOAST_MESSAGES.SUCCESS_SUBJECTS_FETCHED);
    };

    // Function to fetch avatars
    const fetchAvatars = async () => {
      const response = await axios.get("http://127.0.0.1:8000/avatar");
      setAvatars(response.data);
      // cogoToast.success(TOAST_MESSAGES.SUCCESS_AVATARS_FETCHED);
    };

    fetchSubjects();
    fetchAvatars();
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
          .replace(/\.[^/.]+$/, "")
        const imageModule = await avatarFiles[path]()
        images[imageName] = imageModule.default
      }
      setAvatarImages(images)
    };
    loadImages();
  }, []);

  /**
   * Side effect for opening the quiz modal
   */
  useEffect(() => {
    if(isSessionEnded) {
      setIsQuizOpen(true)
      setShowPresentationContainer(false)
    }
  },[isSessionEnded])


  /**
   * Function to fetch quiz data
   */
  const getQuizData = async () => {
      const response = await axios.get(`http://127.0.0.1:8000/generation/quiz`);
      if(response.data) {
          setQuizData(response.data)
      }
  }
  

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
      const baseUrl = "http://127.0.0.1:8000/generation/slide-and-script"
      const name = currentAvatar.avatarName;
      const subject = selectedSubject;
      const url = `${baseUrl}/${name}/${subject}`
      console.log(url);
      setIsLiveChat(true)

      setLoader(true)
      const response = await axios.get(url, {
        sessionData: "some data if required",
      });

      setLoader(false)
      setShowPresentationContainer(true)

      if (response.data) {

        // cogoToast.success(TOAST_MESSAGES.SUCCESS_AVATAR_SCRIPT)
        const { avatarSpeakingScript, slideUrl } = response.data
        console.log(response.data);

        if (slideUrl) {
          setSlidesLink(slideUrl);
        } else {
          console.error("Presentation URL not found in the response")
        }

        if(avatarSpeakingScript) {
          setCurrentSlide(1)
          setSlideScripts(avatarSpeakingScript)
          setAvatarSpeechText(avatarSpeakingScript[0].slide)
        }
        setIsSubjectContainerDisabled(true)
        getQuizData()
      }
    } catch (error) {
      setLoader(false)
      setIsSubjectContainerDisabled(false)
      // cogoToast.error(TOAST_MESSAGES.ERROR_AVATAR_SCRIPT)
      console.error("Error starting session:", error)
    }
  };

  /**
   * Function to handle stop session
   */
  const handleStopSession = () => {
    handleStopSpeaking()
    selectedAvatarSynthesizer.close()
    setSelectedAvatarSynthesizer(null) 
    setShowPresentationContainer(false)
    setIsLiveChat(false)
    setIsSessionResumed(false)
  }

  /**
   * Function to handle stop speaking 
   */
  const handleStopSpeaking = () => {
    selectedAvatarSynthesizer.stopSpeakingAsync().then(
      console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
    ).catch((error) => {
        selectedAvatarSynthesizer.close()
        setSelectedAvatarSynthesizer(null) 
    });
  }

  /**
   * Function to handle restart session
   */
  const handleResumeSession = async () => {
    const response = await axios.post(`http://127.0.0.1:8000/generation/script-character-change/${currentAvatar.avatarName}`, {
      ...{slideScripts}
    });

    if(response.data){
      // cogoToast.success(TOAST_MESSAGES.SUCCESS_AVATAR_SCRIPT)
      setSlideScripts(response.data.avatarSpeakingScript)
      setAvatarSpeechText(response.data.avatarSpeakingScript[currentSlide-1].slide)
      setIsSessionResumed(false)
    } 
  }

  /**
   * 
   * Function to handle avatar select
   * 
   * @param {*} avatar 
   */
  const handleAvatarClick = (avatar) => {
    if(currentAvatar !== null && showPresentationContainer){
      setIsModalOpen(true)
      setTempAvatar(avatar)
    } else{
       // setPreviousAvatar(currentAvatar)
      setCurrentAvatar(avatar)
      if(!isLiveChat) setIsLiveChat(true)
      console.log("Selected Avatar:", avatar)
    }
  };

  /**
   * Function to handle subject click
   * 
   * @param {*} subject 
   */
  const handleSubjectClick = (subject) => {
    if(!isSubjectContainerDisabled) {
      setSelectedSubject(subject)
      console.log("Selected subject:", subject)
    }
  };

  /**
   * Function to accept avatar change inside modal
   */
  const acceptAvatarChange = () => {
     setPreviousAvatar(currentAvatar)
     setCurrentAvatar(tempAvatar)
     setIsModalOpen(false)
  }

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
                  style={{cursor: showPresentationContainer ? "not-allowed" : "pointer"}}
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
            {!showPresentationContainer && <button
              onClick={handleStartSession}
              className="generateContentButton start"
            >
              Start Session
            </button>}

            {isSessionResumed && <button className="generateContentButton restart" onClick={handleResumeSession}>Resume Session</button>}

            {(showPresentationContainer && !isSessionResumed ) && <div>
                <button onClick={handleStopSession} className="generateContentButton stop">Stop Session</button>
              </div>}
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

          {showPresentationContainer && <RealtimeChat/>}

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h4>Are you sure you want to switch avatar?</h4>
            <div className="modalButtonGroup">
              <button className="accept" onClick={acceptAvatarChange}>Yes</button>
              <button className="reject" onClick={() => setIsModalOpen(false)}>No</button>
            </div>
          </Modal>

          <Quiz isQuizOpen={isQuizOpen} onQuizClose={() => setIsQuizOpen(false)} quizData={quizData}/>
        </div>
      </div>
    </div>
  );
};

export default App;
