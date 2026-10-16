import { normalize } from './game/wordle.model.ts'

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

const STATE_LABELS = { absent: 'incorrecta', present: 'presente', correct: 'correcta' }

function Teclado({ disabled, keyStates, onPressKey }) {
  return (
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
                aria-label={state ? `${label}: ${STATE_LABELS[state]}` : label}
                disabled={disabled}
                onClick={() => onPressKey(key)}
                key={key}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            )
          })}
        </div>
      ))}
    </section>
  )
}

export default Teclado