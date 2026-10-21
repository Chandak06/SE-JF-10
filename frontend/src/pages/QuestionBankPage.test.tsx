import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuestionBankPage from './QuestionBankPage';
import * as questionService from '../services/questionService';

vi.mock('../services/questionService', () => ({
  createQuestion: vi.fn(),
  listQuestions: vi.fn()
}));

describe('QuestionBankPage (CSMQ-23 / CSMQ-24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(questionService.listQuestions).mockResolvedValue([]);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <QuestionBankPage />
      </MemoryRouter>
    );

  it('renders Question Bank header and empty state initially', async () => {
    renderComponent();

    expect(await screen.findByText('Question Bank')).toBeInTheDocument();
    expect(
      screen.getByText('No questions found matching your filter criteria.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '+ Add New MCQ' })
    ).toBeInTheDocument();
  });

  it('opens Add MCQ form when clicking + Add New MCQ', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: '+ Add New MCQ' })
    );

    const form = screen.getByRole('region', { name: 'Add MCQ Form' });
    expect(
      screen.getByRole('heading', {
        name: 'Add New Multiple Choice Question'
      })
    ).toBeInTheDocument();
    expect(within(form).getByLabelText(/Question Text/)).toBeInTheDocument();
    expect(within(form).getByPlaceholderText('e.g. Computer Networks')).toBeInTheDocument();
    expect(within(form).getByPlaceholderText('e.g. Transport Layer')).toBeInTheDocument();
    expect(within(form).getByLabelText(/Difficulty/)).toBeInTheDocument();
    expect(within(form).getByLabelText(/Marks/)).toBeInTheDocument();
    expect(within(form).getByLabelText('Mark Option A as correct')).toBeChecked();
  });

  it('submits valid MCQ form and displays success message', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: '+ Add New MCQ' })
    );

    await user.type(
      screen.getByLabelText(/Question Text/),
      'What does IP stand for?'
    );
    await user.type(
      screen.getByPlaceholderText('e.g. Computer Networks'),
      'Computer Networks'
    );
    await user.type(
      screen.getByPlaceholderText('e.g. Transport Layer'),
      'Network Layer'
    );

    await user.type(
      screen.getByPlaceholderText('Enter text for Option A...'),
      'Internet Protocol'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option B...'),
      'Internal Program'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option C...'),
      'Interface Point'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option D...'),
      'Instruction Pointer'
    );

    vi.mocked(questionService.createQuestion).mockResolvedValueOnce({
      id: 'q-new-1',
      questionText: 'What does IP stand for?',
      subject: 'Computer Networks',
      topic: 'Network Layer',
      difficulty: 'Easy',
      marks: 1,
      options: [
        { id: 'A', text: 'Internet Protocol' },
        { id: 'B', text: 'Internal Program' },
        { id: 'C', text: 'Interface Point' },
        { id: 'D', text: 'Instruction Pointer' }
      ],
      correctAnswer: 'A',
      createdAt: new Date().toISOString()
    });

    await user.click(screen.getByRole('button', { name: 'Add Question' }));

    expect(
      await screen.findByText('MCQ question created successfully.')
    ).toBeInTheDocument();
    expect(questionService.createQuestion).toHaveBeenCalledWith({
      questionText: 'What does IP stand for?',
      subject: 'Computer Networks',
      topic: 'Network Layer',
      difficulty: 'Easy',
      marks: 1,
      options: [
        { id: 'A', text: 'Internet Protocol' },
        { id: 'B', text: 'Internal Program' },
        { id: 'C', text: 'Interface Point' },
        { id: 'D', text: 'Instruction Pointer' }
      ],
      correctAnswer: 'A'
    });
  });

  it('renders questions list when questions exist', async () => {
    vi.mocked(questionService.listQuestions).mockResolvedValueOnce([
      {
        id: 'q-existing-1',
        questionText: 'Which protocol is connection-oriented?',
        subject: 'Computer Networks',
        topic: 'Transport Layer',
        difficulty: 'Easy',
        marks: 1,
        options: [
          { id: 'A', text: 'UDP' },
          { id: 'B', text: 'TCP' }
        ],
        correctAnswer: 'B'
      }
    ]);

    renderComponent();

    expect(
      await screen.findByText('1. Which protocol is connection-oriented?')
    ).toBeInTheDocument();
    expect(screen.getByText('Transport Layer')).toBeInTheDocument();
    expect(screen.getByText('TCP')).toBeInTheDocument();
  });
});
