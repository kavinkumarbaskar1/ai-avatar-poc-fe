import React, { useContext, useEffect, useState } from "react";
import "./Quiz.scss"; // Import custom CSS
import { AvatarContext } from "../../context/AvatarContext";

/**
 * Quiz Component
 * 
 * @param {*} isQuizOpen 
 * @param {*} onQuizClose
 * @param {*} quizData
 * 
 * @returns 
 */
const Quiz = ({isQuizOpen, onQuizClose, quizData}) => {    
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizError, setQuizError] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(quizData?.quizQuestions[currentQuestionIndex])

  useEffect(() => {
    console.log(quizData)
    if(quizData) setCurrentQuestion(quizData?.quizQuestions[currentQuestionIndex])
  },[quizData])

  /**
   * Function to handle option change
   * 
   * @param {*} option 
   */
  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  /**
   * Function to handle submit
   */
  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);

      if (selectedOption === currentQuestion.correct_answer) {
        setScore(score + 1); // Increase score if correct
      }
    } else {
        setQuizError(true)
        setTimeout(() => {
            setQuizError(false)
        }, 2000);
    }
  };

  /**
   * Function to switch to next question
   */
  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);

    if (currentQuestionIndex < quizData.quizQuestions.length - 1) {
      let tempIndex = currentQuestionIndex + 1 
      setCurrentQuestionIndex(tempIndex);
      setCurrentQuestion(quizData?.quizQuestions[tempIndex])
    }
  };
  
  return (
    <>
    {isQuizOpen && <div className="modal-overlay">
        <div className="quizContainer">
        { quizError &&<p className="quizError">Please select a option!</p> } 
        <h2>{currentQuestion?.question}</h2>
        <div className="optionsContainer">
            {currentQuestion?.options.map((option, index) => (
            <label
                key={index}
                className={`option ${
                isSubmitted
                    ? option === currentQuestion?.correct_answer
                    ? "correct"
                    : option === selectedOption
                    ? "wrong"
                    : ""
                    : ""
                }`}
            >
                <input
                type="radio"
                name="quiz"
                value={option}
                onChange={() => handleOptionChange(option)}
                disabled={isSubmitted}
                checked={option === selectedOption}
                />
                {option}
            </label>
            ))}
        </div>
        <button onClick={handleSubmit} disabled={isSubmitted} className="submitBtn">
            Submit
        </button>

        {isSubmitted && (
            <div className="result">
            {selectedOption === currentQuestion?.correct_answer ? (
                <p className="success">✅ Correct Answer!</p>
            ) : (
                <p className="error">❌ Wrong Answer! The correct answer is <b>{currentQuestion.correct_answer}</b>.</p>
            )}

            {currentQuestionIndex < quizData?.quizQuestions.length - 1 ? (
                <button onClick={handleNextQuestion} className="nextBtn">Next Question</button>
            ) : (
                <div>
                    <p className="finalScore">🎯 Quiz Completed! Your Score: {score}/{quizData?.quizQuestions.length}</p>
                    <button onClick={onQuizClose} className="quizCloseButton">Close</button>
                </div>                
            )}
            </div>
        )}
        
        </div>
    </div>}
    </>
   
  );
};

export default Quiz;
