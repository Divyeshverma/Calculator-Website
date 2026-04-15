const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const validExpressionPattern = /^[0-9+\-*/%.()\s]+$/;

const sanitizeExpression = (expression = '') => {
  const trimmedExpression = String(expression).trim();

  if (!trimmedExpression) {
    throw new Error('Expression is required.');
  }

  if (!validExpressionPattern.test(trimmedExpression)) {
    throw new Error('Only arithmetic operators and numbers are allowed.');
  }

  if (/([+\-*/%.])\1+/.test(trimmedExpression.replace(/\*\*/g, ''))) {
    throw new Error('Invalid operator sequence.');
  }

  return trimmedExpression;
};

const evaluateExpression = (expression) => {
  const safeExpression = sanitizeExpression(expression);

  try {
    const result = Function(`"use strict"; return (${safeExpression})`)();

    if (!Number.isFinite(result)) {
      throw new Error('Result is not finite.');
    }

    return Number(result.toFixed(8));
  } catch (error) {
    throw new Error('Invalid arithmetic expression.');
  }
};

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/calculate', (request, response) => {
  try {
    const result = evaluateExpression(request.body.expression);
    response.json({ result });
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Calculator API is running on port ${PORT}`);
});
