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
  const [chatHistory, setChatHistory] = useState([
    { type: "system", message: "Hi, how can I assist you?" },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const videoRef = useRef(null);

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
      // Clear the input field after sending the message
      setUserMessage("");
    }
  };


  return (
    <div className='aiAvatarApp'>
      <div className='aiAvatarAppMainContainer'>
        <div className='aiAvatarAppMenu'>
          <div className="aiAvatarSelectionContainer">
            <div className='aiAvatarDisplay'>
            {avatars.slice(0, 3).map((avatar, index) => (
              <div key={index}className="aiAvatar">
                <img src={profile} alt={avatar} />
              </div>
            ))}
            </div>
            <div className="aiAvatarLoadMore">
              +1
            </div>
          </div>

          <div className="subjects-container">
            <h2>Select the Below available:</h2>
            <div className="subjects">
              {subjects.map((subject, index) => (
                <div key={index} className="subject">
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
            <video ref={videoRef} src="https://stttssvcproduse2.blob.core.windows.net/batchsynthesis-output/b0b9a433f2a4404b94eea270081a660a/3a4d52b7-fdbe-4a0d-b345-04e19f3d11d0/0001.mp4?skoid=0e90ea1b-e7d5-446c-a409-5088e95a73d5&sktid=33e01921-4d64-4f8c-a055-5bdaffd5e33d&skt=2025-01-26T09%3A40%3A27Z&ske=2025-02-01T09%3A45%3A27Z&sks=b&skv=2023-11-03&sv=2023-11-03&st=2025-01-27T04%3A37%3A56Z&se=2025-01-30T04%3A42%3A56Z&sr=b&sp=rl&sig=AtJlpBPliOAKbR50LJOg6iU25x06%2B%2FQejiLj8VM%2FDow%3D" autoPlay muted={false}>
                Your browser does not support the video tag.
            </video>
          </div>

        </div>
        <div className='aiAvatarAppChatAndPresentationContainer'>
          <div className="aiAvatarUserprofile">
              <img src={userProfile} alt="avatar" />
          </div>

          <div className="aiAvatarPresentationView">
            <ReactGoogleSlides
              width={650}
              height={450}
              slidesLink="https://docs.google.com/presentation/d/14MYxUdP9iHuxCl_KvygR35BpEBd-0JMNO3YwtODHS_k/edit"
              slideDuration={5}
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
