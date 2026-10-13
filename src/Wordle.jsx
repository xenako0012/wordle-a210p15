import { useEffect, useEffectEvent, useState } from 'react'
import { ANSWERS } from './game/word-list.ts'
import {
  evaluateGuess,
  isLetter,
  MAX_ATTEMPTS,
  normalize,
  WORD_LENGTH,
} from './game/wordle.model.ts'

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

const STATE_RANK = { absent: 1, present: 2, correct: 3 }
const SOLUTIONS = [...new Set(ANSWERS.map(normalize))].filter(
  (word) => [...word].length === WORD_LENGTH,
)

function randomAnswer(exclude = '') {
  const previousAnswer = normalize(exclude)
  const choices = SOLUTIONS.filter((answer) => answer !== previousAnswer)
  return choices[Math.floor(Math.random() * choices.length)]
}

function Wordle({ onBack }) {
  const [answer, setAnswer] = useState(() => randomAnswer())
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [dictionary, setDictionary] = useState(() => new Set(ANSWERS.map(normalize)))
  const [dictionaryReady, setDictionaryReady] = useState(false)
  const [status, setStatus] = useState('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    fetch('/dictionary.es.txt')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el diccionario')
        return response.text()
      })
      .then((text) => {
        if (!active) return
        setDictionary(new Set(text.split(/\s+/).filter(Boolean).map(normalize)))
        setDictionaryReady(true)
      })
      .catch(() => {
        if (!active) return
        setDictionary(new Set(ANSWERS.map(normalize)))
        setDictionaryReady(true)
      })

    return () => {
      active = false
    }
  }, [])

  function submitGuess() {
    if (status !== 'playing' || !dictionaryReady) return
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage('Escribe cinco letras.')
      return
    }

    const normalizedGuess = normalize(currentGuess)
    if (!dictionary.has(normalizedGuess)) {
      setMessage('Esa palabra no está en el diccionario.')
      return
    }

    const nextGuesses = [...guesses, currentGuess]
    const result = evaluateGuess(currentGuess, answer)
    setGuesses(nextGuesses)
    setCurrentGuess('')
    setMessage('')

    if (result.every((state) => state === 'correct')) {
      setStatus('won')
    } else if (nextGuesses.length === MAX_ATTEMPTS) {
      setStatus('lost')
    }
  }

  function pressKey(key) {
    if (status !== 'playing' || !dictionaryReady) return
    setMessage('')

    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((guess) => guess.slice(0, -1))
    } else if (isLetter(key)) {
      setCurrentGuess((guess) => (guess.length < WORD_LENGTH ? guess + key : guess))
    }
  }

  const handlePhysicalKey = useEffectEvent((event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Enter') {
      if (event.target instanceof HTMLButtonElement) return
      event.preventDefault()
      pressKey('ENTER')
    } else if (event.key === 'Backspace') {
      event.preventDefault()
      pressKey('BACKSPACE')
    } else if (isLetter(event.key)) {
      pressKey(event.key.toUpperCase())
    }
  })

  useEffect(() => {
    const listener = (event) => handlePhysicalKey(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  function startNewGame() {
    setAnswer(randomAnswer(answer))
    setGuesses([])
    setCurrentGuess('')
    setStatus('playing')
    setMessage('')
  }

  const keyStates = new Map()
  guesses.forEach((guess) => {
    evaluateGuess(guess, answer).forEach((state, index) => {
      const key = normalize(guess[index])
      const previous = keyStates.get(key)
      if (!previous || STATE_RANK[state] > STATE_RANK[previous]) keyStates.set(key, state)
    })
  })

  return (
    <main className="wordle-screen">
      <header className="wordle-toolbar">
        <button className="wordle-back" type="button" onClick={onBack}>
          ← Inicio
        </button>
        <h1 className="wordle-title">WORDLE ES</h1>
        <span aria-hidden="true" className="wordle-header-spacer" />
      </header>

      <p className="wordle-subtitle">Adivina la palabra de cinco letras en seis intentos.</p>

      <section className="wordle-board" role="grid" aria-label="Tablero de Wordle">
        {Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
          const guess = guesses[rowIndex] ?? (rowIndex === guesses.length ? currentGuess : '')
          const result = rowIndex < guesses.length ? evaluateGuess(guess, answer) : []

          return (
            <div className="wordle-row" role="row" key={rowIndex}>
              {Array.from({ length: WORD_LENGTH }, (_, columnIndex) => {
                const letter = guess[columnIndex] ?? ''
                const tileState = result[columnIndex] ?? (letter ? 'filled' : 'empty')
                return (
                  <div
                    className={`wordle-tile wordle-tile--${tileState}`}
                    role="gridcell"
                    aria-label={`${letter || 'vacía'} ${tileState}`}
                    key={columnIndex}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </section>

      <p className="wordle-message" aria-live="polite">
        {!dictionaryReady
          ? 'Cargando diccionario…'
          : status === 'won'
            ? `¡Bien hecho! La palabra era ${answer.toLocaleUpperCase('es-ES')}.`
            : status === 'lost'
              ? `Se acabaron los intentos. Era ${answer.toLocaleUpperCase('es-ES')}.`
              : message}
      </p>

      {status !== 'playing' && (
        <button className="new-word-button" type="button" onClick={startNewGame}>
          Nueva partida
        </button>
      )}

      <section className="wordle-keyboard" aria-label="Teclado en pantalla">
        {KEY_ROWS.map((row) => (
          <div className="wordle-key-row" key={row.join('')}>
            {row.map((key) => {
              const state = key.length === 1 ? keyStates.get(normalize(key)) : ''
              const label = key === 'BACKSPACE' ? 'Borrar última letra' : key
              return (
                <button
                  className={`wordle-key${key.length > 1 ? ' wordle-key--wide' : ''}${state ? ` wordle-key--${state}` : ''}`}
                  type="button"
                  aria-label={label}
                  disabled={!dictionaryReady || status !== 'playing'}
                  onClick={() => pressKey(key)}
                  key={key}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              )
            })}
          </div>
        ))}
      </section>

    </main>
  )
}

export default Wordle