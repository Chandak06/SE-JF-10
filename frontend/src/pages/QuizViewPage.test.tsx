import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuizViewPage from './QuizViewPage';
import * as quizService from '../services/quizService';

vi.mock('../services/quizService', () => ({
  getQuizById: vi.fn()
}));

const mockQuizDetail: quizService.QuizDetail = {
  id: '65f111111111111111111111',
  title: 'Computer Networks Midterm',
  subject: 'Computer Networks',
  questionCount: 2,
  createdAt: '2026-10-29T10:00:00.000Z',
  questions: [
    {
      id: '65f000000000000000000001',
      questionText: 'What protocol operates at Layer 4 and provides reliable delivery?',
      difficulty: 'Easy',
      marks: 1,
      options: [
        { id: 'A', text: 'UDP' },
        { id: 'B', text: 'TCP' },
        { id: 'C', text: 'IP' },
        { id: 'D', text: 'Ethernet' }
      ]
    },
    {
      id: '65f000000000000000000002',
      questionText: 'What is the default port for secure web browsing (HTTPS)?',
      difficulty: 'Medium',
      marks: 2,
      options: [
        { id: 'A', text: '80' },
        { id: 'B', text: '443' },
        { id: 'C', text: '22' },
        { id: 'D', text: '8080' }
      ]
    }
  ]
};

describe('QuizViewPage (CSMQ-51)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizService.getQuizById).mockResolvedValue(mockQuizDetail);
  });

  const renderComponent = (quizId = '65f111111111111111111111') =>
    render(
      <MemoryRouter initialEntries={[`/quizzes/${quizId}`]}>
        <Routes>
          <Route path="/quizzes/:id" element={<QuizViewPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders quiz header, subject badge, question count, and questions list', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: 'Computer Networks Midterm' })).toBeInTheDocument();
    expect(screen.getByText('Computer Networks')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === 'Questions: 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Questions Overview (2)' })).toBeInTheDocument();

    expect(screen.getByText('What protocol operates at Layer 4 and provides reliable delivery?')).toBeInTheDocument();
    expect(screen.getByText('What is the default port for secure web browsing (HTTPS)?')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getAllByText('1 point if correct')).toHaveLength(2);
    expect(screen.queryByText('2 marks')).not.toBeInTheDocument();

    expect(screen.getByText('TCP')).toBeInTheDocument();
    expect(screen.getByText('443')).toBeInTheDocument();
  });

  it('CRITICAL SECURITY: never displays or contains correctAnswer or answer keys', async () => {
    const { container } = renderComponent();

    await screen.findByRole('heading', { name: 'Computer Networks Midterm' });

    const html = container.innerHTML;
    expect(html).not.toContain('correctAnswer');
    expect(html).not.toContain('answerKey');
    expect(html).not.toContain('correctOption');
  });

  it('renders error state and back link when quiz is not found', async () => {
    vi.mocked(quizService.getQuizById).mockRejectedValueOnce(
      new Error('Quiz not found.')
    );

    renderComponent('nonexistent-id');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quiz Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Quiz not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Back to Quizzes' })).toHaveAttribute(
      'href',
      '/quizzes'
    );
  });
});
