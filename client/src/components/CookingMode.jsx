import React, { useState, useEffect } from 'react';
import styles from '../styles/CookingMode.module.css';

const CookingMode = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  const instructions = recipe.instructions.split('\n').filter(step => step.trim());

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const handleStepComplete = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(step => step !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleIngredientCheck = (ingredientIndex) => {
    if (checkedIngredients.includes(ingredientIndex)) {
      setCheckedIngredients(checkedIngredients.filter(item => item !== ingredientIndex));
    } else {
      setCheckedIngredients([...checkedIngredients, ingredientIndex]);
    }
  };

  const startTimer = (minutes) => {
    if (timer) clearInterval(timer);
    
    const totalSeconds = minutes * 60;
    setTimeLeft(totalSeconds);
    setIsTimerRunning(true);
    
    const newTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          clearInterval(newTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setIsTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (completedSteps.length / instructions.length) * 100;

  return (
    <div className={styles.cookingModeOverlay}>
      <div className={styles.cookingModeContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.recipeTitle}>{recipe.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {completedSteps.length} of {instructions.length} steps completed
          </span>
        </div>

        <div className={styles.content}>
          {/* Ingredients Checklist */}
          <div className={styles.ingredientsSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-list-check"></i>
              Ingredients Checklist
            </h3>
            <div className={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <label 
                  key={index} 
                  className={`${styles.ingredientItem} ${checkedIngredients.includes(index) ? styles.checked : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checkedIngredients.includes(index)}
                    onChange={() => handleIngredientCheck(index)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkmark}>
                    <i className="fas fa-check"></i>
                  </span>
                  <span className={styles.ingredientText}>{ingredient}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Timer Section */}
          <div className={styles.timerSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-clock"></i>
              Cooking Timer
            </h3>
            <div className={styles.timerDisplay}>
              <div className={styles.timeLeft}>{formatTime(timeLeft)}</div>
              <div className={styles.timerControls}>
                <button 
                  className={styles.timerButton}
                  onClick={() => startTimer(5)}
                  disabled={isTimerRunning}
                >
                  5 min
                </button>
                <button 
                  className={styles.timerButton}
                  onClick={() => startTimer(10)}
                  disabled={isTimerRunning}
                >
                  10 min
                </button>
                <button 
                  className={styles.timerButton}
                  onClick={() => startTimer(15)}
                  disabled={isTimerRunning}
                >
                  15 min
                </button>
                {isTimerRunning && (
                  <button 
                    className={`${styles.timerButton} ${styles.stopButton}`}
                    onClick={stopTimer}
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructionsSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-utensils"></i>
              Cooking Instructions
            </h3>
            <div className={styles.instructionsList}>
              {instructions.map((step, index) => (
                <div 
                  key={index} 
                  className={`${styles.instructionStep} ${completedSteps.includes(index) ? styles.completed : ''} ${currentStep === index ? styles.current : ''}`}
                >
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <button 
                      className={styles.completeButton}
                      onClick={() => handleStepComplete(index)}
                    >
                      <i className={`fas ${completedSteps.includes(index) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                    </button>
                  </div>
                  <p className={styles.stepText}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button 
            className={styles.navButton}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          <span className={styles.stepIndicator}>
            Step {currentStep + 1} of {instructions.length}
          </span>
          <button 
            className={styles.navButton}
            onClick={() => setCurrentStep(Math.min(instructions.length - 1, currentStep + 1))}
            disabled={currentStep === instructions.length - 1}
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookingMode; 