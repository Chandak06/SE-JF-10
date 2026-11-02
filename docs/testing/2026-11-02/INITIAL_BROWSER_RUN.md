# Initial browser execution and rerun

The initial full browser matrix passed 17/18 cases; Edge bulk moderation hit the 45-second test timeout at the confirm click. All six Edge cases then passed on an isolated rerun with unchanged product code, selectors and timeouts. Final browser evidence combines Chrome/Firefox from the first run with the complete Edge rerun (18 verified scenarios); the initial failure remains recorded. Its exact transient cause is not established.

| Browser suite | Case | Initial result |
| --- | --- | --- |
| [chrome] moderation.spec.ts | bulk material moderation confirms hidden scope, supports cancellation and retains PDF audit data | PASS |
| [chrome] moderation.spec.ts | complete Student attempt, result, history and subject performance survive Quiz moderation | PASS |
| [chrome] moderation.spec.ts | real Quiz creation, discovery, trusted API scoring and confirmed Quiz moderation integrate | PASS |
| [chrome] moderation.spec.ts | student uploads, administrator confirms removal and removed content cannot be downloaded | PASS |
| [chrome] moderation.spec.ts | student loads the 26th search match and keeps the search after another upload | PASS |
| [chrome] moderation.spec.ts | Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial | PASS |
| [edge] moderation.spec.ts | bulk material moderation confirms hidden scope, supports cancellation and retains PDF audit data | FAIL |
| [edge] moderation.spec.ts | complete Student attempt, result, history and subject performance survive Quiz moderation | PASS |
| [edge] moderation.spec.ts | real Quiz creation, discovery, trusted API scoring and confirmed Quiz moderation integrate | PASS |
| [edge] moderation.spec.ts | student uploads, administrator confirms removal and removed content cannot be downloaded | PASS |
| [edge] moderation.spec.ts | student loads the 26th search match and keeps the search after another upload | PASS |
| [edge] moderation.spec.ts | Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial | PASS |
| [firefox] moderation.spec.ts | bulk material moderation confirms hidden scope, supports cancellation and retains PDF audit data | PASS |
| [firefox] moderation.spec.ts | complete Student attempt, result, history and subject performance survive Quiz moderation | PASS |
| [firefox] moderation.spec.ts | real Quiz creation, discovery, trusted API scoring and confirmed Quiz moderation integrate | PASS |
| [firefox] moderation.spec.ts | student uploads, administrator confirms removal and removed content cannot be downloaded | PASS |
| [firefox] moderation.spec.ts | student loads the 26th search match and keeps the search after another upload | PASS |
| [firefox] moderation.spec.ts | Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial | PASS |

[Original outcomes, sanitized JUnit](evidence/browser-initial-junit.xml). The final browser evidence uses the unchanged Chrome/Firefox results and the complete isolated Edge rerun; initial failed results have not been counted as passes.
