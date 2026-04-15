import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const buttons = [
  ['C', 'DEL', '%', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['+/-', '0', '.', '='],
];

const operatorMap = {
  x: '*',
  X: '*',
  '÷': '/',
};

const endsWithOperator = (value) => /[+\-*/.%]$/.test(value);

function App() {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState('0');
  const [status, setStatus] = useState('Ready');

  const displayExpression = useMemo(
    () => expression.replace(/\*/g, 'x').replace(/\//g, '÷'),
    [expression]
  );

  const calculateResult = async (currentExpression) => {
    if (!currentExpression || currentExpression === '0') {
      setResult('0');
      setStatus('Ready');
      return;
    }

    try {
      const response = await axios.post('/api/calculate', {
        expression: currentExpression,
      });
      setResult(String(response.data.result));
      setStatus('Calculated successfully');
    } catch (error) {
      setResult('Error');
      setStatus(
        error.response?.data?.message || 'Unable to calculate the expression'
      );
    }
  };

  const appendValue = (value) => {
    if (result === 'Error') {
      setResult('0');
    }

    if (/\d/.test(value)) {
      setExpression((previous) => (previous === '0' ? value : previous + value));
      return;
    }

    if (value === '.') {
      setExpression((previous) => {
        const parts = previous.split(/[+\-*/%]/);
        const currentPart = parts[parts.length - 1];

        if (currentPart.includes('.')) {
          return previous;
        }

        return endsWithOperator(previous) ? `${previous}0.` : `${previous}.`;
      });
      return;
    }

    if (['+', '-', '*', '/', '%'].includes(value)) {
      setExpression((previous) => {
        if (previous === '0' && value !== '-') {
          return previous;
        }

        if (endsWithOperator(previous)) {
          return previous.slice(0, -1) + value;
        }

        return previous + value;
      });
    }
  };

  const toggleSign = () => {
    setExpression((previous) => {
      if (previous === '0') {
        return '-0';
      }

      const parts = previous.match(/([+\-*/%]?)(-?\d*\.?\d*)$/);
      if (!parts) {
        return previous;
      }

      const [, operator, operand] = parts;
      const value = operand || '0';
      const start = previous.slice(0, previous.length - `${operator}${operand}`.length);

      if (operator === '-') {
        return `${start}+${value}`;
      }

      if (operator === '+') {
        return `${start}-${value}`;
      }

      if (start === '' && operator === '') {
        return value.startsWith('-') ? value.slice(1) : `-${value}`;
      }

      return `${start}${operator}-${
        value.startsWith('-') ? value.slice(1) : value
      }`;
    });
  };

  const clearAll = () => {
    setExpression('0');
    setResult('0');
    setStatus('Ready');
  };

  const deleteLast = () => {
    setExpression((previous) => {
      if (previous.length <= 1) {
        return '0';
      }

      const updated = previous.slice(0, -1);
      return updated === '-' ? '0' : updated;
    });
  };

  const handleButtonClick = async (value) => {
    if (value === 'C') {
      clearAll();
      return;
    }

    if (value === 'DEL') {
      deleteLast();
      return;
    }

    if (value === '+/-') {
      toggleSign();
      return;
    }

    if (value === '=') {
      await calculateResult(expression);
      return;
    }

    appendValue(value);
  };

  useEffect(() => {
    const handleKeyDown = async (event) => {
      const mappedKey = operatorMap[event.key] || event.key;

      if (/\d/.test(mappedKey) || ['+', '-', '*', '/', '.', '%'].includes(mappedKey)) {
        appendValue(mappedKey);
      } else if (mappedKey === 'Enter' || mappedKey === '=') {
        event.preventDefault();
        await calculateResult(expression);
      } else if (mappedKey === 'Backspace') {
        deleteLast();
      } else if (mappedKey === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appendValue, calculateResult, clearAll, deleteLast, expression]);

  return (
    <main className="app-shell">
      <section className="calculator-card">
        <div className="calculator-copy">
          <p className="eyebrow">MERN Calculator</p>
          <h1>Arithmetic calculator with a React frontend and Express API.</h1>
          <p className="subcopy">
            Use the keypad or your keyboard to add, subtract, multiply, divide,
            and work with percentages and decimals.
          </p>
        </div>

        <div className="calculator-panel">
          <div className="display" aria-live="polite">
            <span className="status">{status}</span>
            <span className="expression">{displayExpression}</span>
            <span className="result">= {result}</span>
          </div>

          <div className="button-grid">
            {buttons.flat().map((button) => (
              <button
                key={button}
                type="button"
                className={`calc-button ${
                  ['/', '*', '-', '+', '='].includes(button)
                    ? 'accent'
                    : ['C', 'DEL', '%', '+/-'].includes(button)
                    ? 'muted'
                    : ''
                } ${button === '0' ? 'wide' : ''}`}
                onClick={() => {
                  void handleButtonClick(button);
                }}
              >
                {button === '*' ? 'x' : button === '/' ? '÷' : button}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
