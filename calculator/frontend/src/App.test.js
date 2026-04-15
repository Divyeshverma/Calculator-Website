import { render, screen } from '@testing-library/react';
import App from './App';

test('renders calculator heading', () => {
  render(<App />);
  expect(screen.getByText(/Frontend Calculator/i)).toBeInTheDocument();
  expect(screen.getByText(/ready to deploy on Netlify/i)).toBeInTheDocument();
});
