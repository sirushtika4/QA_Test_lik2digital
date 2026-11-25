# Ink2Digital Software Test Plan

**Module:** EC4206 – Software Testing and Quality Assurance  
**Part:** 1 – Test Planning, STLC and Black-Box Testing  
**Application:** Ink2Digital Handwriting Digitization System  
**Plan status:** Prepared; manual execution has not been performed as part of this package  
**Repository branch observed:** `qa-manual-testing`

## 1. Project overview

Ink2Digital is a React and Vite web client backed by a Node.js/Express API and MongoDB. Authenticated users can upload JPG, PNG and PDF documents, digitize handwriting, review and edit recognized text, generate a PDF, find documents using search/filter/sort, and delete their own documents. Image recognition uses the server's Tesseract.js service. PDFs are rendered page by page for recognition. A separate Python HTR service is described as experimental and is not the core OCR path verified in the API source.

## 2. Testing objectives

- Check that registration, login, session protection and logout-related navigation work as exposed by the UI and API.
- Check upload validation and persistence for accepted file types and size boundaries.
- Check document listing, detail view, digitization, text editing/saving, PDF generation and deletion.
- Exercise meaningful valid and invalid input partitions and combinations without assuming undocumented constraints.
- Record observed results and evidence so defects can be reproduced. Expected results in the case sheets are specifications, not observations.

## 3. Scope

### In scope

- Registration required fields, browser email input validation, password minimum (6 characters), confirmation match, duplicate email, and successful account creation.
- Login required fields, invalid credentials, authenticated routes and authenticated API access.
- Upload title, required file, accepted MIME types (image/jpeg, image/png, application/pdf), maximum size (10 × 1024 × 1024 bytes), and successful storage.
- OCR processing status/results and failure handling; PDF page recognition.
- Document list/search/status filter/sort, detail retrieval, edit/save, PDF download and deletion.
- User ownership boundaries for document endpoints.

### Out of scope

- Jest unit/white-box and Cucumber BDD work from Part 2; these files are not included or modified by this package.
- Automated browser testing, formal load/stress testing, penetration testing, production deployment acceptance, and quantitative OCR benchmarking.
- Experimental `htr-service` behavior unless it is explicitly wired into the running system under test.
- Requirements not evidenced in the UI/API, such as a maximum title length or an email regex on the server.

## 4. Testing strategy

Use manual, risk-based functional testing in a supported desktop browser. Start with registration/authentication, then upload and document lifecycle, then OCR/edit/PDF, then negative and ownership cases. Use equivalence partitioning for email, password lengths, and file types; boundary value analysis for 6 characters and 10 MiB; and a decision table for authentication, file type and size. Repeat an unexpected result once with the same clean data and capture the visible state plus relevant request/response details where safe. Do not modify application source to make a case pass.

The UI's `accept` attribute is only a file chooser hint; verify server enforcement too. Browser `type=email` validation may prevent malformed email strings from reaching the API, while the server itself only checks presence and lowercases email. Document that distinction when executing.

## 5. Test environment

| Component | Planned environment / verified configuration |
|---|---|
| OS | Windows workstation (confirm exact version at execution) |
| Browser | Current Google Chrome (record exact version at execution) |
| Client | React/Vite at `http://localhost:5173` (default Vite development URL) |
| API | Express at `http://localhost:5000`; frontend API base URL is hard-coded to this address |
| Database | MongoDB reachable through server `MONGO_URI` |
| OCR | Tesseract.js image recognition and PDF.js rendering with canvas dependencies |
| Test branch | `qa-manual-testing` |

The application cannot be considered ready until client, API, database and OCR dependencies are all available. Use an isolated local/test database and synthetic or approved documents; do not use personal/confidential documents.

## 6. Testing tools

- Chrome/Chromium browser and developer tools for UI observations and network diagnostics.
- VS Code and Git for source/branch identification.
- Excel or LibreOffice Calc for the provided `.xlsx` sheets and status dropdowns.
- Optional API client (for example, Postman) for direct API validation where browser-native validation blocks an input; never expose bearer tokens in screenshots.
- Screenshot capture utility built into the OS.

## 7. Test data requirements

- Unique synthetic registration email per successful registration; a second attempt with the same email for duplicate handling.
- Passwords of 5, 6 and 7 characters plus mismatch data. Avoid using a real personal password.
- Valid synthetic JPG, PNG and PDF files. Include a corrupt PDF to observe OCR error behavior if safely available.
- Files sized exactly 10,485,759, 10,485,760 and 10,485,761 bytes for limit testing; create locally with the documented safe generator and verify byte length before upload.
- A non-accepted file (for example `.txt`) and a document whose OCR output can be checked manually.
- Two test accounts to evaluate document ownership; keep all records in the isolated test database.

## 8. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Student / manual tester | Prepare test data, execute cases, capture evidence, record actual result/status and report defects. |
| QA reviewer / instructor | Review scope, traceability, evidence quality and defect reproduction. |
| Developer / project team | Clarify intended behavior and investigate confirmed defects. |

## 9. Entry and exit criteria

### Entry criteria

- Correct branch and cleanly understood working-tree state are recorded.
- Test build starts; `/api/health` responds successfully.
- MongoDB and OCR dependencies are available; a disposable test database is configured.
- Test account, supported browser, synthetic files and test case workbook are ready.

### Exit criteria

- Every planned case has a recorded status; blocked and not-run cases have reasons.
- Actual results are written only after observation; screenshots are linked by filename.
- Failures have reproducible steps and defect references or a clear limitation.
- Summary metrics are derived from recorded statuses and reviewed for accuracy.

## 10. Risks and assumptions

| Risk / assumption | Handling |
|---|---|
| OCR output varies with handwriting, image quality and OCR runtime | Assess workflow, completion/failure state and obvious text characteristics; do not require exact text absent a controlled fixture. |
| MongoDB, Tesseract assets, PDF rendering or native canvas dependency may be unavailable | Mark dependent tests Blocked with the failing prerequisite and evidence; do not call them failed application behavior without evidence. |
| Client checks may mask API behavior | Distinguish UI result from direct API result; test server enforcement only with an authorized local test environment. |
| UI and backend limits can drift | Source currently shows 10 MiB in both client and Multer. Recheck the branch before executing. |
| No formal requirements baseline was supplied | Treat source-observed behavior as the test oracle and flag product ambiguity instead of inventing rules. |
| Existing repository contains unrelated local modifications/generated files | Preserve them; stage only the Part 1 directory for submission. |

## 11. Testing schedule (relative, adjustable)

| Work item | Suggested effort | Dependency |
|---|---:|---|
| Review requirements/source and prepare environment | 0.5 day | Repository and local services |
| Execute account and authentication cases | 0.5 day | MongoDB, API, browser |
| Execute upload and boundary cases | 0.5 day | Test files, API |
| Execute OCR and document lifecycle cases | 1 day | OCR runtime, MongoDB |
| Triage, evidence review and summary | 0.5 day | Completed execution records |

These are planning estimates, not completed work or calendar commitments.

## 12. Expected deliverables

- This test plan, STLC, quality attributes and verification/validation documentation.
- `Manual_Test_Cases.xlsx` and `Black_Box_Testing.xlsx` with filters, validation lists and formula-based summaries.
- `Test_Execution_Report.md`, empty `Screenshots/` evidence directory, and a completed summary only after actual execution.
- Defect records and reproducible evidence for failures discovered during execution.

## 13. Source basis

Observed source: `server/controllers/authController.js`, `server/controllers/documentController.js`, `server/middleware/uploadMiddleware.js`, `server/server.js`, `server/models/User.js`, `server/models/Document.js`, `server/routes/authRoutes.js`, `server/routes/documentRoutes.js`, `server/services/ocrService.js`, `client/src/pages/Register.jsx`, `Login.jsx`, `Upload.jsx`, `Documents.jsx`, `DocumentDetails.jsx`, `client/src/services/api.js`, and `client/src/App.jsx`. Reinspect these files before execution if the branch changes.
