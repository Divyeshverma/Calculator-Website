import { render, screen } from '@testing-library/react';
import App from './App';

test('renders calculator heading', () => {
  render(<App />);
  expect(screen.getByText(/MERN Calculator/i)).toBeInTheDocument();
  expect(screen.getByText(/Arithmetic calculator/i)).toBeInTheDocument();
});
