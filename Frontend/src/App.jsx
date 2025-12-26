import { useState } from 'react'
import customImage from '../Gemini_Generated_Image_2z3odu2z3odu2z3o.png'
import './App.css'

function App() {
  const [secretNumber] = useState(Math.floor(Math.random() * 100) + 1)
  const [guess, setGuess] = useState('')
  const [message, setMessage] = useState('Guess a number between 1 and 100!')
  const [attempts, setAttempts] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const handleGuess = () => {
    if (!guess) {
      setMessage('Please enter a number!')
      return
    }

    const guessNum = parseInt(guess)
    setAttempts(attempts + 1)

    if (guessNum === secretNumber) {
      setMessage(`🎉 You won! The number was ${secretNumber}. Attempts: ${attempts + 1}`)
      setGameWon(true)
    } else if (guessNum < secretNumber) {
      setMessage('Too low! Try a higher number.')
    } else {
      setMessage('Too high! Try a lower number.')
    }
  }

  const resetGame = () => {
    window.location.reload()
  }

  return (
    <>
      <div>
        <img src={customImage} className="logo" alt="bitscode logo" />
      </div>
      <h1>Welcome to bitscode community</h1>
      <h2>Number Guessing Game</h2>
      <div className="card">
        <p>{message}</p>
        {!gameWon && (
          <>
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess"
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button onClick={handleGuess}>Guess</button>
          </>
        )}
        {gameWon && (
          <button onClick={resetGame}>Play Again</button>
        )}
      </div>
      
    </>
  )
}

export default App
