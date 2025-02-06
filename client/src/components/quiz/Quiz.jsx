import React, { useState } from "react";
import "./Quiz.scss"; // Import custom CSS

const quizData = [
  {
    question: "What is physics?",
    options: ["Study of matter", "Study of plants", "Study of animals", "Study of coding"],
    answer: "Study of matter",
  },
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    answer: "Mars",
  },
];

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quizData[currentQuestionIndex];

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

      if (selectedOption === currentQuestion.answer) {
        setScore(score + 1); // Increase score if correct
      }
    } else {

    }
  };

  /**
   * Function to switch to next question
   */
  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);

    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="quizContainer">
      {/* <p className="quizError">Please select a option!</p>   */}
      <h2>{currentQuestion.question}</h2>
      <div className="optionsContainer">
        {currentQuestion.options.map((option, index) => (
          <label
            key={index}
            className={`option ${
              isSubmitted
                ? option === currentQuestion.answer
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
          {selectedOption === currentQuestion.answer ? (
            <p className="success">✅ Correct Answer!</p>
          ) : (
            <p className="error">❌ Wrong Answer! The correct answer is <b>{currentQuestion.answer}</b>.</p>
          )}

          {currentQuestionIndex < quizData.length - 1 ? (
            <button onClick={handleNextQuestion} className="nextBtn">Next Question</button>
          ) : (
            <p className="finalScore">🎯 Quiz Completed! Your Score: {score}/{quizData.length}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
