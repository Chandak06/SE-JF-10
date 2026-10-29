import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateQuizPage from './CreateQuizPage';
import * as quizService from '../services/quizService';

vi.mock('../services/quizService', () => ({
  createQuiz: vi.fn(),
  fetchQuestionBankForQuiz: vi.fn()
}));

const mockQuestions: quizService.QuizQuestionSummary[] = [
  {
    id: '65f000000000000000000001',
    questionText: 'What protocol operates at the Transport Layer?',
    options: [
      { id: 'A', text: 'TCP' },
      { id: 'B', text: 'IP' },
      { id: 'C', text: 'HTTP' },
      { id: 'D', text: 'Ethernet' }
    ],
    difficulty: 'Easy',
    marks: 1,
    subject: 'Computer Networks',
    topic: 'Transport Layer'
  },
  {
    id: '65f000000000000000000002',
    questionText: 'What is the default port for HTTPS?',
    options: [
      { id: 'A', text: '80' },
      { id: 'B', text: '443' },
      { id: 'C', text: '22' },
      { id: 'D', text: '8080' }
    ],
    difficulty: 'Medium',
    marks: 2,
    subject: 'Computer Networks',
    topic: 'Security'
  }
];

describe('CreateQuizPage (CSMQ-49)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizService.fetchQuestionBankForQuiz).mockResolvedValue(mockQuestions);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <CreateQuizPage />
      </MemoryRouter>
    );

  it('renders page header, title, subject, and question picker', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'Create New Quiz' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Quiz Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Subject/i)).toBeInTheDocument();
    expect(screen.getByText('Select Questions from Question Bank')).toBeInTheDocument();
    expect(await screen.findByText('What protocol operates at the Transport Layer?')).toBeInTheDocument();
    expect(screen.getByText('What is the default port for HTTPS?')).toBeInTheDocument();
  });

  it('shows error if question bank fetch fails', async () => {
    vi.mocked(quizService.fetchQuestionBankForQuiz).mockRejectedValueOnce(
      new Error('Failed to connect to question service')
    );
    renderComponent();

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to connect to question service');
  });

  it('validates empty title on submission', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please provide a quiz title.');
    expect(quizService.createQuiz).not.toHaveBeenCalled();
  });

  it('validates empty subject on submission', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    await user.type(screen.getByLabelText(/Quiz Title/i), 'CN Midterm Prep');
    await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please specify a subject.');
    expect(quizService.createQuiz).not.toHaveBeenCalled();
  });

  it('validates zero questions selected on submission', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    await user.type(screen.getByLabelText(/Quiz Title/i), 'CN Midterm Prep');
    await user.type(screen.getByLabelText(/^Subject/i), 'Computer Networks');
    await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please select at least one question from the Question Bank.');
    expect(quizService.createQuiz).not.toHaveBeenCalled();
  });

  it('toggles question selection and updates counter', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    expect(screen.getByText(/0 question\(s\) selected/)).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    expect(screen.getByText(/1 question\(s\) selected/)).toBeInTheDocument();

    await user.click(checkboxes[1]);
    expect(screen.getByText(/2 question\(s\) selected/)).toBeInTheDocument();

    await user.click(checkboxes[0]);
    expect(screen.getByText(/1 question\(s\) selected/)).toBeInTheDocument();
  });

  it('supports select all and deselect all buttons', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    expect(screen.getByText(/0 question\(s\) selected/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select All' }));
    expect(screen.getByText(/2 question\(s\) selected/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deselect All' }));
    expect(screen.getByText(/0 question\(s\) selected/)).toBeInTheDocument();
  });

  it('submits valid quiz and displays success message', async () => {
    const user = userEvent.setup();
    vi.mocked(quizService.createQuiz).mockResolvedValueOnce({
      id: '65f999999999999999999999',
      title: 'CN Midterm Prep',
      subject: 'Computer Networks',
      questionCount: 2,
      questions: ['65f000000000000000000001', '65f000000000000000000002'],
      creator: '65f888888888888888888888'
    });

    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    await user.type(screen.getByLabelText(/Quiz Title/i), 'CN Midterm Prep');
    await user.type(screen.getByLabelText(/^Subject/i), 'Computer Networks');

    await user.click(screen.getByRole('button', { name: 'Select All' }));
    expect(screen.getByText(/2 question\(s\) selected/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

    await waitFor(() => {
      expect(quizService.createQuiz).toHaveBeenCalledWith({
        title: 'CN Midterm Prep',
        subject: 'Computer Networks',
        questionIds: ['65f000000000000000000001', '65f000000000000000000002']
      });
    });

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Quiz "CN Midterm Prep" created successfully with 2 question(s)!'
    );
  });

  it('displays API error message when creation fails', async () => {
    const user = userEvent.setup();
    vi.mocked(quizService.createQuiz).mockRejectedValueOnce(
      new Error('One or more selected questions no longer exist.')
    );

    renderComponent();

    await screen.findByText('What protocol operates at the Transport Layer?');
    await user.type(screen.getByLabelText(/Quiz Title/i), 'CN Midterm Prep');
    await user.type(screen.getByLabelText(/^Subject/i), 'Computer Networks');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'One or more selected questions no longer exist.'
    );
  });
});
