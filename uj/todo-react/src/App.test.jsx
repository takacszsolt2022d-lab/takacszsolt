import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('Todo app', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('edits a task name', async () => {
    const user = userEvent.setup();

    render(<App />);

    const editButton = screen.getByRole('button', { name: /edit eat/i });
    await user.click(editButton);

    const input = screen.getByDisplayValue('Eat');
    expect(document.activeElement).toBe(input);
    await user.clear(input);
    await user.type(input, 'Eat breakfast');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getAllByText('Eat breakfast').length).toBeGreaterThan(0);
    expect(
      document.activeElement,
    ).toBe(screen.getByRole('button', { name: /edit eat breakfast/i }));
  });

  it('returns focus to the edit button when editing is canceled', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /edit eat/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /edit eat/i }),
    );
  });

  it('moves focus to the list heading after deleting a task', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /delete eat/i }));

    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: /2 tasks remaining/i }),
    );
  });

  it('rejects react as a task name', async () => {
    const user = userEvent.setup();

    render(<App />);

    const input = screen.getByRole('textbox', { name: /what needs to be done\?/i });
    await user.type(input, 'react');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByText(/nem lehet .*react.*nem megengedett/i)).toBeTruthy();
    expect(screen.queryByLabelText('react')).toBeNull();
  });

  it('saves the selected importance with a new task', async () => {
    const user = userEvent.setup();

    render(<App />);

    const importance = screen.getByRole('slider', { name: /fontosság/i });
    fireEvent.change(importance, { target: { value: '5' } });
    await user.type(
      screen.getByRole('textbox', { name: /what needs to be done\?/i }),
      'Prepare report',
    );
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          /Fontosság:\s*5\s*\/\s*5/.test(element.textContent),
      ),
    ).toBeTruthy();
  });

  it('keeps added tasks after the app is mounted again', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(
      screen.getByRole('textbox', { name: /what needs to be done\?/i }),
      'Buy milk',
    );
    await user.click(screen.getByRole('button', { name: /add/i }));

    const taskKey = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).find((key) => key.startsWith('todo-task:') &&
      JSON.parse(localStorage.getItem(key)).name === 'Buy milk');

    expect(taskKey).toBeTruthy();

    unmount();

    render(<App />);

    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeTruthy();
  });
});
