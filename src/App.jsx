import { useState } from 'react'
import Wordle from './Wordle.jsx'
import './App.css'

function App() {
  const [screen, setScreen] = useState('home')

  if (screen === 'wordle') {
    return <Wordle onBack={() => setScreen('home')} />
  }

  return (
    <main className="home-screen">
      <p className="home-eyebrow">Una pausa para jugar</p>
      <h1 className="home-title">Hola, bienvenida</h1>
      <p className="home-copy">Hoy vamos a jugar al Wordle en Español de España.</p>

      <div className="home-actions">
        <button className="primary-button" onClick={() => setScreen('wordle')}>
          Ir al Wordle <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  )
}

export default App
