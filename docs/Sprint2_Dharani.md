## CSMQ-35: Study Material Search and Filtering

**Sprint:** 2  
**Owner:** Dharani S  
**SRS:** CSMQ-F-012  
**Test plan:** TC-MAT-02

## Implementation

Extended the authenticated `GET /api/materials` listing to accept `q` and `subject`. The keyword is matched case-insensitively against title, subject, and description. Subject filtering matches the complete subject name case-insensitively and combines with the keyword using AND semantics. Both inputs use the existing bounded, safe query validation; keyword and subject text is escaped before regex matching. Existing pagination is retained, and the `removedAt: null` condition excludes moderated materials.

Added a keyword search with the filter icon at the right edge of the search field. The icon opens a searchable picker populated by authenticated `GET /api/materials/subjects`, which returns distinct subjects from active materials only. Selecting a subject immediately combines it with the current keyword, uses a muted active icon state, and shows a clear-filter chip. An unmatched search displays “No matching materials.” Existing upload and default listing flows remain in place.

## Acceptance Criteria Evidence

| Requirement | Implementation and verification |
|---|---|
| Search title, subject, and description keywords | Integration cases exercise all metadata fields. |
| Filter by subject and combine with keyword | Integration and frontend tests verify combined filtering. |
| Choose from searchable existing subjects | The protected subjects endpoint and picker search are covered by backend and frontend tests. |
| Validate inputs and exclude removed materials | Invalid query cases and post-removal search are covered in the backend integration suite. |
| Show an appropriate empty result state | Materials page test checks the unmatched-results message. |
| Preserve listing, pagination, and PDF upload | Existing Materials page tests and Sprint 2 integration suite pass. |

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npx vitest run backend/tests/integration/sprint2.test.ts` | 12 tests passed |
| Materials page and auth service frontend tests | 30 passed |
| `git diff --check` | Passed |

Updated the Playwright pagination test to count material groups by their accessible card labels after the card role changed. The browser suite could not be rerun locally because the Playwright executable is unavailable in this workspace.

## Commits

- `60e5e95` Sprint:2 CSMQ:35 Cover combined material search behavior
- `afe9cc7` Sprint:2 CSMQ:35 Search all material metadata
- `06e4e00` Sprint:2 CSMQ:35 Preserve filters across material requests
- `a842e70` Sprint:2 CSMQ:35 Add student search and subject filters
- `442f24a` Sprint:2 CSMQ:35 Verify tombstone and overlapping matches



## CSMQ-36: Study Material View and Details

**Sprint:** 2
**Owner:** Dharani S

### Implementation

Added an authenticated `GET /api/materials/:id` lookup. It returns the material ID, title, subject, description, uploader ID, and creation date for active materials. Invalid IDs return HTTP 400. Missing and removed materials return HTTP 404. The route selects only the required metadata and does not expose file data.

Added a “View details” action to each material card. It loads details by ID and displays the title, subject, description, uploader identifier, and localized upload date. Lookup errors appear in the details view.

### Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| Sprint 2 backend integration suite | 11 tests passed |
| Materials page frontend tests | 11 tests passed |

### Commits

- `39e32f4` Sprint:2 CSMQ:36 Add protected material details lookup
- `55763f3` Sprint:2 CSMQ:36 Add authenticated material details client
- `09e25ce` Sprint:2 CSMQ:36 Show selected material details
- `98713a2` Sprint:2 CSMQ:36 Test selected details and unavailable state


## CSMQ-38: Study Material PDF Viewing and Download

**Sprint:** 2
**Owner:** Dharani S
**SRS:** CSMQ-F-012, CSMQ-F-013
**Test plan:** TC-MAT-02, TC-MAT-03
**Related tasks:** CSMQ-35, CSMQ-36

### Implementation

Extended the authenticated GridFS file endpoint for inline PDF viewing and attachment downloads. It validates material IDs and disposition, returns `application/pdf`, and only serves materials whose `removedAt` is null. The response filename is derived safely from the material title. Missing files and removed or nonexistent materials return 404; invalid IDs or dispositions return 400.

Refined material cards into left aligned, compact cards that open metadata details when selected. View PDF and Download PDF use clear document and download icons. The PDF viewer uses the browser Fullscreen API with a viewport fallback. Added a small gap below the search bar. Keyword and subject inputs share a single search control with search and filter icons. Search, subject filters, details, and upload remain integrated.

### Verification and Jira Evidence

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| Materials page and auth service tests | 28 passed |
| Sprint 2 backend integration suite | 11 tests passed |
| GridFS response bytes and dispositions | Verified for inline and attachment responses |
| Unauthenticated, invalid, nonexistent, and removed material requests | Rejected with controlled responses |
| Frontend lint and production build | Passed |

Updated the Playwright selectors to match the current search and download labels. The browser flow checks material details, the PDF viewer, and its full-screen toggle before downloading. The browser suite could not be run in this workspace because `@playwright/test` is not installed; the CI run should verify the selector changes.

Test commands and results are recorded here for Jira evidence.

### Commits

- `b3cc625` Sprint:2 CSMQ:38 Serve protected GridFS PDFs safely
- `b157ef8` Sprint:2 CSMQ:38 Request PDFs with authenticated disposition
- `4a0ffcd` Sprint:2 CSMQ:38 Add PDF viewing and named download actions
- `ab1861c` Sprint:2 CSMQ:38 Test PDF viewing and titled download

## CSMQ-54: Student Dashboard and Navigation

**Sprint:** 2
**Owner:** Dharani S
**SRS:** Section 3.1, CSMQ-NF-005

### Implementation

Added the protected `/dashboard` student landing page and made successful student login redirect there. The Study Commons brand now links authenticated students to `/dashboard` and administrators to `/admin`; signed-out visitors retain the home link. Removed the student eyebrow, reduced the welcome heading size, and gave the dashboard a full-width, left-aligned layout with a slightly wider gutter between columns and a divider sized to the recent-material tiles. Two large, disabled quiz buttons sit on the left without “Coming soon” text; up to two recently opened active materials appear on the right. Recent materials are scoped to the signed-in student and open the selected PDF in the Materials viewer. Materials, Quiz Creation, and Quiz Search stay in the shared Navbar and are not duplicated as dashboard buttons. Prajwal’s existing CSMQ-47 to CSMQ-53 Quiz model, API, and UI routes are integrated and reused. Existing registration, session handling, logout, materials, admin routing, and role checks remain in place.

The handoff review found no Quiz History or Performance page or API in Karan’s available branches. The dashboard buttons remain disabled until those routes are available. The dashboard does not replace them with the local attempt prototype. Acceptance criterion 6 remains dependent on Karan’s route and page exports.

### Verification

| Check | Result |
|---|---|
| Frontend suite | 102 tests passed |
| Backend unit suite | 171 tests passed |
| Backend integration suite | 89 passed; 1 local-demo test failed when MongoMemoryServer stopped with `mongod internal error (fassert() failure)` |
| Backend typecheck and build | Passed |
| Frontend lint and production build | Passed |
| Browser suite | Not run; `@playwright/test` is missing from this workspace |

The Quiz API, cross-module, question, and Sprint 2 integration tests passed. Student Dashboard browser coverage was added for route access, Quiz navigation, and widths from 320px to 1440px.
