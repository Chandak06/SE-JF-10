import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuizListPage from './QuizListPage';
import * as quizService from '../services/quizService';

vi.mock('../services/quizService', () => ({
  searchQuizzes: vi.fn()
}));

const mockQuizzes: quizService.QuizSummary[] = [
  {
    id: '65f111111111111111111111',
    title: 'Computer Networks Midterm',
    subject: 'Computer Networks',
    questionCount: 5,
    createdAt: '2026-10-29T10:00:00.000Z'
  },
  {
    id: '65f222222222222222222222',
    title: 'Database Normalization Drill',
    subject: 'Database Systems',
    questionCount: 3,
    createdAt: '2026-10-28T12:00:00.000Z'
  }
];

describe('QuizListPage (CSMQ-51)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizService.searchQuizzes).mockResolvedValue(mockQuizzes);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <QuizListPage />
      </MemoryRouter>
    );

  it('renders header, search inputs, and loads available quizzes', async () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'Available Quizzes' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by quiz title…')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by subject…')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+ Create Quiz' })).toBeInTheDocument();

    expect(await screen.findByText('Computer Networks Midterm')).toBeInTheDocument();
    expect(screen.getByText('Database Normalization Drill')).toBeInTheDocument();
    expect(screen.getByText('5 questions')).toBeInTheDocument();
    expect(screen.getByText('3 questions')).toBeInTheDocument();
  });

  it('displays empty state when no quizzes exist', async () => {
    vi.mocked(quizService.searchQuizzes).mockResolvedValueOnce([]);
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'No quizzes found' })).toBeInTheDocument();
    expect(screen.getByText(/No quizzes have been published yet/)).toBeInTheDocument();
  });

  it('filters quizzes by search keyword and subject inputs', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('Computer Networks Midterm');

    const titleInput = screen.getByPlaceholderText('Search by quiz title…');
    await user.type(titleInput, 'Networks');

    await waitFor(() => {
      expect(quizService.searchQuizzes).toHaveBeenCalledWith({
        search: 'Networks',
        subject: undefined
      });
    });

    const subjectInput = screen.getByPlaceholderText('Filter by subject…');
    await user.type(subjectInput, 'Computer Networks');

    await waitFor(() => {
      expect(quizService.searchQuizzes).toHaveBeenCalledWith({
        search: 'Networks',
        subject: 'Computer Networks'
      });
    });
  });

  it('clears filters when Clear Filters button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText('Computer Networks Midterm');
    const titleInput = screen.getByPlaceholderText('Search by quiz title…');
    await user.type(titleInput, 'Networks');

    const clearBtn = await screen.findByRole('button', { name: 'Clear Filters' });
    await user.click(clearBtn);

    expect(titleInput).toHaveValue('');
    await waitFor(() => {
      expect(quizService.searchQuizzes).toHaveBeenCalledWith({
        search: undefined,
        subject: undefined
      });
    });
  });

  it('shows error banner and retries successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(quizService.searchQuizzes).mockRejectedValueOnce(
      new Error('Failed to reach quiz service')
    );

    renderComponent();

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to reach quiz service');

    vi.mocked(quizService.searchQuizzes).mockResolvedValueOnce(mockQuizzes);
    const retryBtn = screen.getByRole('button', { name: 'Retry' });
    await user.click(retryBtn);

    expect(await screen.findByText('Computer Networks Midterm')).toBeInTheDocument();
  });

  it('links to quiz view details page', async () => {
    renderComponent();

    await screen.findByText('Computer Networks Midterm');
    const viewLinks = screen.getAllByRole('link', { name: 'View Details' });
    expect(viewLinks[0]).toHaveAttribute('href', '/quizzes/65f111111111111111111111');
    expect(viewLinks[1]).toHaveAttribute('href', '/quizzes/65f222222222222222222222');
  });
});
