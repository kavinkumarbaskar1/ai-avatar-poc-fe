import { useState } from 'react'
import './App.scss'
import profile from "./assets/profile.jpg"
import userProfile from "./assets/userprofile.jpg"
import send from "./assets/send.png"

function App() {

  return (
    <div className='aiAvatarApp'>
      <div className='aiAvatarAppMainContainer'>
        <div className='aiAvatarAppMenu'>
          <div className="aiAvatarSelectionContainer">
            <div className="aiAvatar">
              <img src={profile} alt="avatar" />
            </div>
            <div className="aiAvatar">
              <img src={profile} alt="avatar" />
            </div>
            <div className="aiAvatar">
              <img src={profile} alt="avatar" />
            </div>

            <div className="aiAvatarLoadMore">
              +1
            </div>
          </div>

          <div class="subjects-container">
            <h2>Select the Below available:</h2>
            <div class="subjects">
              <div class="subject">
                <div class="subject-header">
                  <span class="star-icon">★</span>
                  <span class="subject-title">Physics</span>
                  <span class="arrow-icon">⇧A</span>
                </div>
                <p class="subject-detail">10th CBSE.</p>
              </div>
              <div class="subject">
                <div class="subject-header">
                  <span class="star-icon">★</span>
                  <span class="subject-title">Chemistry</span>
                  <span class="arrow-icon">⇧A</span>
                </div>
                <p class="subject-detail">9th State Board</p>
              </div>
              <div class="subject">
                <div class="subject-header">
                  <span class="star-icon">★</span>
                  <span class="subject-title">Maths</span>
                  <span class="arrow-icon">⇧A</span>
                </div>
                <p class="subject-detail">12th NCSE</p>
              </div>
              <div class="subject">
                <div class="subject-header">
                  <span class="star-icon">★</span>
                  <span class="subject-title">DSA</span>
                  <span class="arrow-icon">⇧A</span>
                </div>
                <p class="subject-detail">zero to hero</p>
              </div>
              <div class="subject">
                <div class="subject-header">
                  <span class="star-icon">★</span>
                  <span class="subject-title">LLM</span>
                  <span class="arrow-icon">⇧A</span>
                </div>
                <p class="subject-detail">101</p>
              </div>
            </div>
          </div>


          <div className="aiAvatarSelectedAvatar">
              <img src={profile} alt="avatar" />
          </div>

        </div>
        <div className='aiAvatarAppChatAndPresentationContainer'>
          <div className="aiAvatarUserprofile">
              <img src={userProfile} alt="avatar" />
          </div>

          <div className="aiAvatarPresentationView">
            Hi
          </div>

          <div className="aiAvatarChatInterface">
            <div className='aiAvatarSystemChat'>
               Hi, how can i assist you?
            </div>

            <div className='aiAvatarUserChat'>
                Help me with Physics
            </div>
            <div className='aiAvatarSystemChat'>
               Hi, how can i assist you?
            </div>

            <div className='aiAvatarUserChat'>
                Help me with Physics
            </div>

            <div className='aiAvatarSystemChat'>
               Hi, how can i assist you?
            </div>

            <div className='aiAvatarUserChat'>
                Help me with Physics
            </div>
          </div>
          <div className="chatInput">
            <input type="text" />

            <div className="sendButton">
              <img src={send} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
