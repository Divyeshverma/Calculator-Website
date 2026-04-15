import { useEffect, useMemo, useState } from 'react';
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
  '/': '/',
};

const validExpressionPattern = /^[0-9+\-*/%.()\s]+$/;
const endsWithOperator = (value) => /[+\-*/.%]$/.test(value);
const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };

const tokenizeExpression = (expression) => {
  const tokens = [];
  let currentNumber = '';

  for (let index = 0; index < expression.length; index += 1) {
    const character = expression[index];

    if (character === ' ') {
      continue;
    }

    if (/\d|\./.test(character)) {
      currentNumber += character;
      continue;
    }

    if (
      character === '-' &&
      currentNumber === '' &&
      (tokens.length === 0 || ['+', '-', '*', '/', '%', '('].includes(tokens[tokens.length - 1]))
    ) {
      currentNumber = '-';
      continue;
    }

    if (currentNumber) {
      tokens.push(currentNumber);
      currentNumber = '';
    }

    tokens.push(character);
  }

  if (currentNumber) {
    tokens.push(currentNumber);
  }

  return tokens;
};

const applyOperation = (values, operator) => {
  const rightValue = values.pop();
  const leftValue = values.pop();

  if (leftValue === undefined || rightValue === undefined) {
    throw new Error('Invalid arithmetic expression');
  }

  switch (operator) {
    case '+':
      values.push(leftValue + rightValue);
      break;
    case '-':
      values.push(leftValue - rightValue);
      break;
    case '*':
      values.push(leftValue * rightValue);
      break;
    case '/':
      if (rightValue === 0) {
        throw new Error('Cannot divide by zero');
      }
      values.push(leftValue / rightValue);
      break;
    case '%':
      if (rightValue === 0) {
        throw new Error('Cannot divide by zero');
      }
      values.push(leftValue % rightValue);
      break;
    default:
      throw new Error('Invalid arithmetic expression');
  }
};

const evaluateExpression = (expression) => {
  const trimmedExpression = String(expression || '').trim();

  if (!trimmedExpression || trimmedExpression === '0') {
    return { result: '0', status: 'Ready' };
  }

  if (!validExpressionPattern.test(trimmedExpression)) {
    throw new Error('Only arithmetic operators and numbers are allowed.');
  }

  try {
    const tokens = tokenizeExpression(trimmedExpression);
    const values = [];
    const operators = [];

    tokens.forEach((token) => {
      if (!Number.isNaN(Number(token))) {
        values.push(Number(token));
        return;
      }

      if (token === '(') {
        operators.push(token);
        return;
      }

      if (token === ')') {
        while (operators.length && operators[operators.length - 1] !== '(') {
          applyOperation(values, operators.pop());
        }

        if (operators.pop() !== '(') {
          throw new Error('Invalid arithmetic expression');
        }

        return;
      }

      while (
        operators.length &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        applyOperation(values, operators.pop());
      }

      operators.push(token);
    });

    while (operators.length) {
      const operator = operators.pop();

      if (operator === '(') {
        throw new Error('Invalid arithmetic expression');
      }

      applyOperation(values, operator);
    }

    const calculatedValue = values.pop();

    if (values.length || !Number.isFinite(calculatedValue)) {
      throw new Error('Invalid result');
    }

    return {
      result: String(Number(calculatedValue.toFixed(8))),
      status: 'Calculated successfully',
    };
  } catch (error) {
    throw new Error('Invalid arithmetic expression');
  }
};

function App() {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState('0');
  const [status, setStatus] = useState('Ready');

  const displayExpression = useMemo(() => expression.replace(/\*/g, 'x'), [expression]);

  const calculateResult = (currentExpression) => {
    try {
      const calculation = evaluateExpression(currentExpression);
      setResult(calculation.result);
      setStatus(calculation.status);
    } catch (error) {
      setResult('Error');
      setStatus(error.message || 'Unable to calculate the expression');
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
      const start = previous.slice(
        0,
        previous.length - `${operator}${operand}`.length
      );

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

  const handleButtonClick = (value) => {
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
      calculateResult(expression);
      return;
    }

    appendValue(value);
  };

  useEffect(() => {
    // Keyboard support uses the latest displayed expression for evaluation.
    const handleKeyDown = (event) => {
      const mappedKey = operatorMap[event.key] || event.key;

      if (/\d/.test(mappedKey) || ['+', '-', '*', '/', '.', '%'].includes(mappedKey)) {
        appendValue(mappedKey);
      } else if (mappedKey === 'Enter' || mappedKey === '=') {
        event.preventDefault();
        calculateResult(expression);
      } else if (mappedKey === 'Backspace') {
        deleteLast();
      } else if (mappedKey === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, result]);

  return (
    <main className="app-shell">
      <section className="calculator-card">
        <div className="calculator-copy">
          <p className="eyebrow">Frontend Calculator</p>
          <h1>Arithmetic calculator ready to deploy on Netlify.</h1>
          <p className="subcopy">
            Use the keypad or your keyboard to add, subtract, multiply, divide,
            and work with percentages and decimals, all inside the frontend.
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
                  handleButtonClick(button);
                }}
              >
                {button === '*' ? 'x' : button}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
