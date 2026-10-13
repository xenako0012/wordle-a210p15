import { useState } from 'react'
import Wordle from './Wordle.jsx'
import './App.css'

function Saludo({ nombre }) {
  return <h2 className="saludo">Hola, {nombre}</h2>
}

function Contador() {
  const [cuenta, setCuenta] = useState(0)

  return (
    <button className="counter-button" onClick={() => setCuenta((value) => value + 1)}>
      Has pulsado {cuenta} veces
    </button>
  )
}

function App() {
  const [screen, setScreen] = useState('home')

  if (screen === 'wordle') {
    return <Wordle onBack={() => setScreen('home')} />
  }

  return (
    <main className="home-screen">
      <p className="home-eyebrow">Una pausa para jugar</p>
      <h1 className="home-title">Hola, bienvenida</h1>
      <p className="home-copy">Hoy vamos a jugar al Wordle.</p>

      <section className="home-greetings" aria-label="Saludos">
        <Saludo nombre="Belén, mi señora y ama todapoderosa" />
      </section>

      <div className="home-actions">
        <Contador />
        <button className="primary-button" onClick={() => setScreen('wordle')}>
          Ir al Wordle <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  )
}

export default App
