import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('Todo app', () => {
  it('edits a task name', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /edit eat/i }));

    const input = screen.getByDisplayValue('Eat');
    await user.clear(input);
    await user.type(input, 'Eat breakfast');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getAllByText('Eat breakfast').length).toBeGreaterThan(0);
  });
});
