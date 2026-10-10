# Shared security integration contract

Owner: Harshit Chandak, PES2UG24CS185. Jira: CSMQ-2, CSMQ-3, CSMQ-4, CSMQ-5.

## Composition

The shared module avoids a second production User schema. Dharani's integrated `createMongoAccountRepository` implements `AccountRepository` against their MongoDB User model (see `backend/src/types/security.ts`):

| Method | Contract |
| --- | --- |
| findById(id) | Return an Account or null; include current role and active state. |
| findByEmail(email) | Query a scalar normalized email; return Account including passwordHash or null. |
| createStudent({ name, email, passwordHash }) | Save only these fields and force role student. Never hash an already hashed value again. Enforce a unique normalized-email database index. |

`Account` has id (string), name, email, role (`student` or `admin`), active (boolean), passwordHash. Adapter methods must not spread untrusted request bodies into database queries. Translate their User model fields to this interface. `passwordHash` must be selected internally for login, and excluded from all public responses. Create administrator accounts only through a trusted provisioning process, never public registration.

The executable composition root is backend/src/runtime.ts. It connects Dharani's model/repository, shared authentication and sessions, and the real PDF upload router. server.ts starts that runtime. Optional question and attempt routers can be passed to createRuntime by their owners.

## Authentication HTTP contract

| Method and path | Request | Successful result |
| --- | --- | --- |
| POST /api/auth/register | JSON name, email, password only | 201 { authenticatedUser }; register then login |
| POST /api/auth/login | JSON email, password only | 200 { authenticatedUser, token, expiresAt } |
| GET /api/auth/me | Authorization: Bearer token | 200 { authenticatedUser } |
| POST /api/auth/logout | Authorization: Bearer token | 204; that session is invalidated server-side |

`authenticatedUser` contains only id, name, email, role. Public registration rejects client role/active/passwordHash fields. Emails are trimmed/lowercased. Names are trimmed, 1–100 characters, with control characters and markup delimiters rejected. Passwords are 12 characters minimum, 72 UTF-8 bytes maximum, with no NUL; they are never trimmed. The byte limit prevents bcrypt truncation. Defaults: bcrypt cost 12, 60-minute absolute session lifetime.

Send the token in the Authorization header only. Do not put it in URLs, logs or form fields. Keep it in frontend memory; page reload can require re-login for this sprint. Clear it and the UI authentication state on logout or 401. Auth responses use `Cache-Control: no-store`.

Tokens are opaque 256-bit random values. Only a SHA-256 digest is stored in MongoDB. Expiry is checked per request independently of MongoDB TTL cleanup. Logout deletes the current session; concurrent sessions remain valid. User deletion/deactivation and role changes take effect on the next request. Client claims never set authorization.

Authentication failure: 401. Authenticated wrong role: 403. Invalid payload/JSON: 400. Duplicate registration: 409. Too-large JSON: 413. Authentication rate limit: 429. Unexpected failure: 500 with no stack or sensitive details. Error form:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Request contains missing, invalid, or unexpected fields." }, "requestId": "server-generated-id" }
```

The rate-limit response has the same error shape; its request ID is available in the `X-Request-Id` header. Frontends should not rely on messages to identify error types.

## Feature route boundaries

- Materials: mounted at `/api/materials` after `requireAuth(auth)`. The integrated upload router enforces Student-only access, plain-text title/subject/description, one valid unencrypted PDF with at least one page, and MAX_UPLOAD_BYTES (10 MiB default). Multipart field name: file. Metadata is stored in materials and bytes in the materialFiles GridFS bucket; failed metadata writes clean up the file.
- Question management: `/api/questions` requires authentication and admin role before Prajwal's router runs. This is the Sprint 1 admin Add/Filter contract. A future student-safe selection endpoint must be separate and omit correct answers.
- Attempts: `/api/attempts` requires authentication and student role. Karan's router uses `req.user.id`, never a userId supplied by the client.
- Exported `requireRole('admin')` can protect later moderation routes. Do not expose admin mutation routes behind authentication alone.

Security contract tests retain question/attempt sentinel handlers because those business modules are not yet integrated. Production runtime tests additionally verify Dharani's account model and actual PDF parsing, GridFS bytes, metadata persistence, upload limits and logout replay. Frontend tests verify the shared API client and upload/logout UI. These do not claim completed MCQ creation or evaluation.

## Transport and failures

Local HTTP is supported. Production API requests require HTTPS; configure TLS termination and `TRUST_PROXY` to the exact proxy IP/CIDR only if one is used. Keep the backend inaccessible to direct external traffic and make the proxy replace forwarded headers. With no trusted proxy configured, spoofed `X-Forwarded-Proto` cannot bypass HTTPS enforcement. HTTPS deployment itself is not claimed as tested.

Global JSON limit is 16 KiB. CORS is restricted to `CLIENT_ORIGIN`. Authentication has a per-process IP limit of 20 registration/login requests per 15 minutes (single-development-deployment scope). Unexpected error logging includes only request ID, status and a fixed code, never request/DB details. Health/readiness expose no database URI.
