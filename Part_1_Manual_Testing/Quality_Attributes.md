# Software Quality Attributes for Ink2Digital

## Standard edition used

This document uses **ISO/IEC 25010:2023, Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model**, second edition. The 2023 model uses nine product quality characteristics and names the user-facing characteristic **Interaction capability**. This is a test-planning interpretation of the model, not a claim of formal ISO certification. Confirm the edition specified by the course before submission if the lecturer requires another edition.

Edition and model details: [ISO official catalogue entry for ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html).

## Relevant characteristics and evaluation

| Characteristic | Ink2Digital evaluation |
|---|---|
| Functional suitability | Verify that supported functions produce correct and complete outcomes: account creation/login, protected access, accepted uploads, OCR, saved edits, document retrieval/deletion and generated PDF content. Trace each check to a UI workflow/API behavior. |
| Reliability | Repeat core workflows and observe error recovery, persisted state after refresh/relogin, and behavior when MongoDB/OCR is unavailable. Check that a failed OCR operation leaves the document in `failed` status and displays a useful message. Record failures rather than assuming fault tolerance. |
| Performance efficiency | Record elapsed time for upload, document list retrieval, image OCR, multi-page PDF OCR and PDF generation using the same environment and files. The source provides no response-time target, so report measurements descriptively and do not invent an SLA. Formal load testing is outside this manual scope. |
| Security | Check protected routes without a token, invalid/expired token handling, ownership isolation between two users, duplicate account handling and that passwords are not displayed in responses. Review file type/size enforcement and ensure evidence does not expose tokens or secrets. These checks do not replace a security assessment. |
| Maintainability | Review whether route/controller/middleware responsibilities and validation rules are understandable and consistent. During testing, record duplicated UI/server limits or confusing errors as maintainability observations; do not change application code in this package. |
| Interaction capability | Check that labels and controls are understandable, validation/error/success messages are visible, loading states communicate progress, upload and OCR actions are clear, and keyboard/browser-native form validation works. Evaluate search/filter/sort and document editing from a user's perspective. |

### Measurement notes

For each manual observation, record browser/version, OS, build/branch, test data, and elapsed time when relevant. Separate objective checks (HTTP status, document status, downloaded PDF opens) from subjective observations (message clarity). A quality characteristic is evaluated by evidence against stated criteria; no overall quality score is claimed by this plan.
