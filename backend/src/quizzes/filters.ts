export interface QuizFilterParams {
  search?: unknown;
  keyword?: unknown;
  subject?: unknown;
}

export interface QuizMongoFilter {
  removedAt: null;
  title?: { $regex: string; $options: string };
  subject?: { $regex: string; $options: string };
}

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function buildQuizFilter(
  params: QuizFilterParams = {}
): QuizMongoFilter {
  const filter: QuizMongoFilter = {
    removedAt: null
  };

  const searchTerm =
    typeof params.search === 'string' && params.search.trim()
      ? params.search.trim()
      : typeof params.keyword === 'string' && params.keyword.trim()
        ? params.keyword.trim()
        : '';

  if (searchTerm) {
    filter.title = {
      $regex: escapeRegex(searchTerm),
      $options: 'i'
    };
  }

  if (typeof params.subject === 'string' && params.subject.trim()) {
    filter.subject = {
      $regex: escapeRegex(params.subject.trim()),
      $options: 'i'
    };
  }

  return filter;
}
