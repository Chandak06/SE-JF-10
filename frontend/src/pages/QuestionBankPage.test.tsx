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

  it('triggers listQuestions with subject filter', async () => {
    const user = userEvent.setup();
    renderComponent();

    const subjectFilter = screen.getByLabelText('Filter by Subject');
    await user.type(subjectFilter, 'Databases');

    expect(questionService.listQuestions).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Databases' })
    );
  });

  it('triggers listQuestions with difficulty filter', async () => {
    const user = userEvent.setup();
    renderComponent();

    const diffFilter = screen.getByLabelText('Filter by Difficulty');
    await user.selectOptions(diffFilter, 'Hard');

    expect(questionService.listQuestions).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'Hard' })
    );
  });

  it('clears listing error banner when subsequent filter request succeeds', async () => {
    const user = userEvent.setup();
    vi.mocked(questionService.listQuestions).mockRejectedValueOnce(
      new Error('Network failure loading questions')
    );

    renderComponent();

    expect(
      await screen.findByText('Network failure loading questions')
    ).toBeInTheDocument();

    vi.mocked(questionService.listQuestions).mockResolvedValueOnce([
      {
        id: 'q-recov-1',
        questionText: 'Recovered question text?',
        subject: 'Math',
        topic: 'Algebra',
        difficulty: 'Easy',
        marks: 1,
        options: [
          { id: 'A', text: 'Option 1' },
          { id: 'B', text: 'Option 2' }
        ],
        correctAnswer: 'A'
      }
    ]);

    const diffFilter = screen.getByLabelText('Filter by Difficulty');
    await user.selectOptions(diffFilter, 'Easy');

    expect(
      await screen.findByText('1. Recovered question text?')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Network failure loading questions')
    ).not.toBeInTheDocument();
  });

  it('ensures only results for current filters update the list when filter changes during save', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: '+ Add New MCQ' })
    );

    await user.type(
      screen.getByLabelText(/Question Text/),
      'What is TCP?'
    );
    await user.type(
      screen.getByPlaceholderText('e.g. Computer Networks'),
      'Networking'
    );
    await user.type(
      screen.getByPlaceholderText('e.g. Transport Layer'),
      'Transport'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option A...'),
      'Transmission Control Protocol'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option B...'),
      'Total Control Protocol'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option C...'),
      'Time Control Protocol'
    );
    await user.type(
      screen.getByPlaceholderText('Enter text for Option D...'),
      'Test Control Protocol'
    );

    let resolveSave!: (val: unknown) => void;
    const savePromise = new Promise((resolve) => {
      resolveSave = resolve;
    });
    vi.mocked(questionService.createQuestion).mockReturnValueOnce(
      savePromise as unknown as Promise<questionService.Question>
    );

    // Click submit
    await user.click(screen.getByRole('button', { name: 'Add Question' }));

    // Mock response for Hard difficulty vs unfiltered
    vi.mocked(questionService.listQuestions).mockImplementation(
      async (filters) => {
        if (filters?.difficulty === 'Hard') {
          return [
            {
              id: 'q-hard-1',
              questionText: 'Hard question only?',
              subject: 'Networking',
              topic: 'Transport',
              difficulty: 'Hard',
              marks: 1,
              options: [
                { id: 'A', text: 'Opt 1' },
                { id: 'B', text: 'Opt 2' }
              ],
              correctAnswer: 'A'
            }
          ];
        }
        return [
          {
            id: 'q-unfiltered-1',
            questionText: 'Unfiltered question?',
            subject: 'Networking',
            topic: 'Transport',
            difficulty: 'Easy',
            marks: 1,
            options: [
              { id: 'A', text: 'Opt 1' },
              { id: 'B', text: 'Opt 2' }
            ],
            correctAnswer: 'A'
          }
        ];
      }
    );

    // While save is in progress, change filter to Hard
    const diffFilter = screen.getByLabelText('Filter by Difficulty');
    await user.selectOptions(diffFilter, 'Hard');

    // Complete saving
    resolveSave({
      id: 'q-new-tcp',
      questionText: 'What is TCP?',
      subject: 'Networking',
      topic: 'Transport',
      difficulty: 'Easy',
      marks: 1,
      options: [
        { id: 'A', text: 'Transmission Control Protocol' },
        { id: 'B', text: 'Total Control Protocol' }
      ],
      correctAnswer: 'A'
    });

    // Form closes and displays Hard question, NOT overwritten by unfiltered
    expect(
      await screen.findByText('MCQ question created successfully.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('1. Hard question only?')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('1. Unfiltered question?')
    ).not.toBeInTheDocument();
  });

  it('clears loading state and displays results when an MCQ is saved while initial list is still loading', async () => {
    const user = userEvent.setup();

    let resolveInitialLoad!: (val: unknown) => void;
    const initialLoadPromise = new Promise((resolve) => {
      resolveInitialLoad = resolve;
    });

    // Initial listQuestions is pending
    vi.mocked(questionService.listQuestions).mockReturnValueOnce(
      initialLoadPromise as unknown as Promise<questionService.Question[]>
    );

    renderComponent();

    expect(screen.getByText('Loading Question Bank...')).toBeInTheDocument();

    // User opens form and submits an MCQ while initial load is still in-flight
    await user.click(screen.getByRole('button', { name: '+ Add New MCQ' }));

    await user.type(screen.getByLabelText(/Question Text/), 'Question saved mid-load?');
    await user.type(screen.getByPlaceholderText('e.g. Computer Networks'), 'Math');
    await user.type(screen.getByPlaceholderText('e.g. Transport Layer'), 'Calculus');
    await user.type(screen.getByPlaceholderText('Enter text for Option A...'), 'Option 1');
    await user.type(screen.getByPlaceholderText('Enter text for Option B...'), 'Option 2');
    await user.type(screen.getByPlaceholderText('Enter text for Option C...'), 'Option 3');
    await user.type(screen.getByPlaceholderText('Enter text for Option D...'), 'Option 4');

    vi.mocked(questionService.createQuestion).mockResolvedValueOnce({
      id: 'q-mid-load',
      questionText: 'Question saved mid-load?',
      subject: 'Math',
      topic: 'Calculus',
      difficulty: 'Easy',
      marks: 1,
      options: [
        { id: 'A', text: 'Option 1' },
        { id: 'B', text: 'Option 2' },
        { id: 'C', text: 'Option 3' },
        { id: 'D', text: 'Option 4' }
      ],
      correctAnswer: 'A',
      createdAt: new Date().toISOString()
    });

    // The refresh triggered after saving returns the saved question
    vi.mocked(questionService.listQuestions).mockResolvedValueOnce([
      {
        id: 'q-mid-load',
        questionText: 'Question saved mid-load?',
        subject: 'Math',
        topic: 'Calculus',
        difficulty: 'Easy',
        marks: 1,
        options: [
          { id: 'A', text: 'Option 1' },
          { id: 'B', text: 'Option 2' },
          { id: 'C', text: 'Option 3' },
          { id: 'D', text: 'Option 4' }
        ],
        correctAnswer: 'A'
      }
    ]);

    await user.click(screen.getByRole('button', { name: 'Add Question' }));

    // Now resolve the initial load promise with empty list
    resolveInitialLoad([]);

    // Verify loading state is cleared and questions are displayed
    expect(
      await screen.findByText('MCQ question created successfully.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('1. Question saved mid-load?')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Loading Question Bank...')
    ).not.toBeInTheDocument();
  });
});
