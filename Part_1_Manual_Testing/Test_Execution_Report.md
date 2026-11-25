# Manual Test Execution Report

**Evidence review date:** 2026-11-25  
**Test branch observed:** `qa-manual-testing`  
**Execution state:** User-provided screenshots support three passes, one failure and two partial observations. All other cases remain `Not Run`; see `Evidence_Index.md`.

## 1. Start and verify the application

From `Handwriting-Digitization-System`, use separate terminals:

```powershell
cd server
npm run dev
```

Configure a local `server/.env` first with `MONGO_URI`, `JWT_SECRET` and optional `PORT`; keep this file private. Ensure MongoDB is running. In another terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL printed by the client (normally `http://localhost:5173`). Verify `http://localhost:5000/api/health` returns a success response. Confirm the client can reach the API, MongoDB connects, and OCR can initialize before dependent cases. Record OS, browser/version, branch/commit, date and database name. Use a disposable local database.

## 2. Execution procedure

1. Open `Manual_Test_Cases.xlsx` and `Black_Box_Testing.xlsx`; work from a copy if desired.
2. Run cases in ID order or by priority. Meet each precondition and use only synthetic test data.
3. Follow the steps and compare observed behavior with the expected result. Inspect persisted state by refreshing or revisiting the relevant page when the case requires it.
4. Record actual output, choose `Pass`, `Fail`, `Blocked` or leave `Not Run`, and add concise remarks. A case is Pass only when every material expected result is observed.
5. For Fail, preserve the input and environment, repeat once to confirm, note actual vs expected, severity and a defect reference. Do not erase failed observations after a fix; record a retest separately.
6. For Blocked, state the missing service, dependency or access and the evidence. Do not classify a prerequisite failure as an application defect without isolating it.
7. Capture screenshots with identifying UI state and no passwords, tokens, personal data or secrets. Use `Screenshots/` and enter the filename in the workbook.
8. Save the workbook and review the Summary sheets. The pass percentage is `Pass / (Pass + Fail) × 100`; blocked and not-run cases are excluded from the denominator. If no case has run, the percentage is blank/not applicable.

## 3. Browser workflow cues

| Area | Page / action | Check and suggested evidence |
|---|---|---|
| Registration | `/register`; enter name, email, password and confirmation; submit | Dashboard navigation and account created for valid data; visible validation for invalid data. Capture form/result without showing password. |
| Login | `/login`; enter test credentials; submit | Successful dashboard navigation or error for invalid credentials. Capture result, redact email if needed. |
| Authentication | Open `/dashboard`, `/upload`, `/documents` while signed out; then sign in | Protected pages redirect or remain inaccessible; signed-in user can access. Capture route/result only. |
| Upload | `/upload`; enter title, choose JPG/PNG/PDF and submit | Success message and document appears in `/documents`; invalid type/oversize should be rejected. Capture error/success and selected file metadata. |
| Digitization | Open a document from `/documents`; click **Digitize Handwriting** | Status/result message and recognized text; check that failed processing is communicated. Capture result and status. |
| Edit/save | Edit text in **Digitized Text**; click **Save Changes**; revisit/refresh | Saved text remains. Capture the editor and save confirmation. |
| PDF | With non-empty text, click **Generate PDF** | Browser downloads a PDF that opens and contains the saved text/title. Capture the UI; retain the PDF as supplemental evidence if allowed. |
| Management | `/documents`; search, choose status, change sort, delete a disposable document | List responds to filters/sort; deletion requires confirmation and item disappears. Capture before/after, avoiding unrelated records. |

## 4. Screenshot naming convention

Save genuine captures under `Screenshots/`, named by test case and concise scenario, for example:

```text
TC01_Valid_Registration.png
TC02_Invalid_Registration.png
TC03_Duplicate_Email.png
TC04_Valid_Login.png
TC05_Invalid_Login.png
TC06_Valid_JPG_Upload.png
TC07_Invalid_File_Type.png
TC08_File_Size_Boundary.png
TC09_OCR_Result.png
TC10_PDF_Download.png
```

The six supplied screenshots listed in `Evidence_Index.md` are included as redacted evidence copies. They are user-provided observations, not new browser captures from this package preparation. No illustrative screenshots were created.

## 5. Summary template

The manual workbook currently records **30 total cases: 3 Pass, 1 Fail, 0 Blocked, 26 Not Run**. Four cases are complete for status counting; the pass percentage is **75% of executed cases** (3 / (3 + 1)). Two other screenshots provide partial evidence while their cases remain `Not Run`. Personal names, email addresses, document titles and private handwriting/OCR text have been obscured in the public evidence copies; see `Evidence_Index.md`. The workbook formulas calculate from status cells. This summary reflects the supplied screenshots and scenario descriptions, not a new browser run by the package author.

After execution, report total cases, passed, failed, blocked, not run, pass percentage among executed cases, defect IDs/severity, environment, limitations and recommendations. Confirm formulas recalculate in the spreadsheet program used. Do not count blank statuses as passed.

## 6. Case-by-case browser execution

The workbooks hold full steps and expected results. For each row, open the named route (or begin at `/` and use the interface), enter the exact test data, perform the listed action, inspect the displayed response and any required persistence/download outcome, capture the named evidence if useful, then record actual result and status. For direct API cases, use a local API client only when specified; retain HTTP status and safe response excerpts, never bearer tokens. Cases that require a second account should use another synthetic account and verify cross-account isolation without deleting another user's data.

### Limitations and recommendations

OCR output depends on handwriting and runtime dependencies. Use the same known sample for comparisons and assess workflow completion unless an approved reference transcript exists. The source has no stated response-time target; timings are observations, not pass/fail thresholds. Before submission, fill in execution metadata, resolve all `Not Run` cases or explain why they remain, attach genuine evidence, and record defect references.

## 7. Observed defect: BUG-01

**Title:** Existing document preview returns `Cannot GET /uploads/<stored filename>`  
**Status:** Observed in the supplied screenshot; not reproducible in the current checkout environment.  
**Severity:** High: the original document cannot be previewed and the affected record cannot be digitized from its stored source.  
**Preconditions:** Authenticated user opens the affected uploaded PDF's detail page.  
**Steps:** Open `/documents/<document-id>` and inspect the Original Document panel.  
**Expected:** The stored PDF is served from `/uploads/<storedFileName>` and displayed.  
**Actual:** The panel displays `Cannot GET /uploads/1793210926340-243393577.pdf`; the screenshot also shows the document in `failed` status.  
**Source findings:** `server.js` mounts Express static files at `/uploads` from `server/uploads`. The client constructs the preview URL from `document.storedFileName`. Upload middleware writes files to that same `server/uploads` directory. This wiring is consistent when the referenced file exists. The screenshot's referenced filename is absent from the current local upload directory, which contains two other PDFs. No app, MongoDB or frontend process was listening during review, and `server/.env` was absent, so the database record could not be checked and the request could not be reproduced.  
**Likely cause (not established):** The database record references a stored filename whose file is missing from the active server's upload directory, or the UI is reaching a different server instance. Confirm against the row's `storedFileName`/`filePath` and active server before assigning root cause.  
**Suggested fix:** Reconcile the record and file storage first. Add a controlled missing-file check that displays a clear preview error and ensure database metadata stays consistent with durable file storage. No application code was changed.

## 8. Current execution prerequisites

At review time, no process was listening on ports 27017, 5000 or 5173 and `server/.env` was absent. Configure/start local MongoDB, API and client before further browser execution. Do not paste secrets into screenshots, workbook cells or chat.
