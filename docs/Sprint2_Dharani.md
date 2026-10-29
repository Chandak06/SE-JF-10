# CSMQ-35: Study Material Search and Filtering

**Sprint:** 2  
**Owner:** Dharani S  
**SRS:** CSMQ-F-012  
**Test plan:** TC-MAT-02

## Implementation

Extended the authenticated `GET /api/materials` listing to accept `q` and `subject`. The keyword is matched case-insensitively against title, subject, and description. Subject filtering matches the complete subject name case-insensitively and combines with the keyword using AND semantics. Both inputs use the existing bounded, safe query validation; keyword and subject text is escaped before regex matching. Existing pagination is retained, and the `removedAt: null` condition excludes moderated materials.

Added keyword and subject fields to the student Materials page. Both filters are sent together, retained for pagination, retry, and post-upload refresh, and an unmatched search displays “No matching materials.” Existing upload and default listing flows remain in place.

## Acceptance Criteria Evidence

| Requirement | Implementation and verification |
|---|---|
| Search title, subject, and description keywords | Integration cases exercise all metadata fields. |
| Filter by subject and combine with keyword | Integration and frontend tests verify combined filtering. |
| Validate inputs and exclude removed materials | Invalid query cases and post-removal search are covered in the backend integration suite. |
| Show an appropriate empty result state | Materials page test checks the unmatched-results message. |
| Preserve listing, pagination, and PDF upload | Existing Materials page tests and Sprint 2 integration suite pass. |

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npx vitest run backend/tests/integration/sprint2.test.ts` | 10 tests passed |
| Materials page frontend tests | 9 passed |
| `git diff --check` | Passed |

## Commits

- `60e5e95` Sprint:2 CSMQ:35 Cover combined material search behavior
- `afe9cc7` Sprint:2 CSMQ:35 Search all material metadata
- `06e4e00` Sprint:2 CSMQ:35 Preserve filters across material requests
- `a842e70` Sprint:2 CSMQ:35 Add student search and subject filters
- `442f24a` Sprint:2 CSMQ:35 Verify tombstone and overlapping matches


