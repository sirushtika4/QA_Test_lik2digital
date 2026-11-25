# Verification and Validation

## Verification

Verification checks whether work products conform to their specified requirements: **“Are we building the product right?”** It can include reviewing requirements, design, source and test cases without running the application.

**Ink2Digital example:** inspect `uploadMiddleware.js` and the upload page to confirm that the documented accepted MIME types and byte limit match the implementation. Review the test workbook to verify that each expected result is traceable to visible source behavior.

## Validation

Validation checks whether the running product meets user needs: **“Are we building the right product?”** It requires exercising the system in a realistic environment.

**Ink2Digital example:** in the browser, register a test account, upload a handwritten PDF, digitize it, correct the recognized text, generate a PDF and verify that the downloaded output contains the saved text.

## Main differences

| Aspect | Verification | Validation |
|---|---|---|
| Focus | Conformance of requirements, design, code and test artifacts | Fitness of the running application for intended user workflows |
| Typical methods | Reviews, walkthroughs, static analysis, traceability checks | Manual or automated execution, acceptance and usability checks |
| Requires execution? | Not necessarily | Yes, the application is exercised |
| Ink2Digital example | Confirm source and test plan state a 10 MiB limit consistently | Upload a file at the boundary and observe the UI/API behavior |

## Static and dynamic testing

Static testing examines artifacts without executing the application (for example, review the route protection and compare documented limits to source). Dynamic testing executes the software with test data (for example, submit invalid credentials and observe the response). Both can find different classes of problems. Static review catches omissions and inconsistent rules early; dynamic testing confirms integrated behavior across browser, API, database and OCR dependencies.

## Why both matter

Documentation may accurately describe code that still fails at runtime, while a successful happy-path run may hide missing requirements or unsafe edge cases. Ink2Digital needs verification of validation rules and test coverage plus validation of complete user journeys and persisted outcomes. Report evidence separately so a source inspection is never presented as a manually passed test.
