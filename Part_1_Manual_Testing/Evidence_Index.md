# Evidence Index

**Review date:** 2026-11-25  
**Evidence source:** six supplied screenshots were reviewed for this package. The repository copies below are redacted to remove personal names, email addresses, private handwritten notes and document titles. Original captures are not included. `Pass`/`Fail` statuses reflect only the visible screenshot behavior and the user's stated scenario. `Not Run` means the full test oracle was not established by the screenshot; partial evidence is still identified.

## Manual test checklist

| Test ID | Scenario | Evidence available | Missing evidence / next step | Priority | Recommended screenshot filename |
|---|---|---|---|---|---|
| TC01 | Register with valid details | None | Successful account creation and dashboard/session state | P1 | `TC01_Valid_Registration.png` |
| TC02 | Required registration fields empty | None | Required-field validation visible | P2 | `TC02_Required_Fields.png` |
| TC03 | Password below 6 characters | None | Rejection for 5-character matching password | P1 | `TC03_Password_5_Chars.png` |
| TC04 | Password at 6-character minimum | None | Acceptance at exactly 6 with remaining valid data | P1 | `TC04_Password_6_Chars.png` |
| TC05 | Registration password confirmation mismatch | None | Mismatch error and no account created | P2 | `TC05_Password_Mismatch.png` |
| TC06 | Duplicate email / case-insensitive lookup | Partial: duplicate warning visible | Re-run with different email letter case; verify duplicate is still rejected | P1 | `TC06_Duplicate_Email_REDACTED.png` |
| TC07 | Malformed email in registration | None | Browser rejection for malformed email | P2 | `TC07_Invalid_Email.png` |
| TC08 | Valid login | None | Successful login and dashboard state | P1 | `TC08_Valid_Login.png` |
| TC09 | Wrong-password login | Invalid-credentials message visible; supplied scenario says invalid login | Fresh sanitized run if exact input needs stronger evidence | P1 | `TC09_Invalid_Login_REDACTED.png` |
| TC10 | Login with unknown email | None | Generic invalid-credentials error for unknown synthetic email | P2 | `TC10_Unknown_Email.png` |
| TC11 | Empty login fields | None | Browser required-field validation | P2 | `TC11_Empty_Login.png` |
| TC12 | Protected page while signed out | None | Redirect or denial on protected route | P1 | `TC12_Protected_Route.png` |
| TC13 | Protected API request without token | None | Unauthorized response and no document data | P1 | `TC13_No_Token_API.png` |
| TC14 | Upload valid JPG | None | Upload success and document listed | P1 | `TC14_Valid_JPG_Upload.png` |
| TC15 | Upload valid PNG | None | Upload success and image preview | P1 | `TC15_Valid_PNG_Upload.png` |
| TC16 | Upload valid PDF | Partial: a 2.44 MiB PDF is selected; Upload button is visible | Submit; confirm success message, list entry and preview | P1 | `TC16_PDF_Selected_Only.png` |
| TC17 | Unsupported file type | None | `.txt` rejection at UI; separately check server if needed | P1 | `TC17_Unsupported_File_Type.png` |
| TC18 | File larger than 10 MiB | UI error “File must be smaller than 10 MB” visible | Exact byte count and direct backend enforcement are unverified; exact BVA still needed | P1 | `TC18_File_Over_10MiB.png` |
| TC19 | Empty title fallback | None | Upload with blank title; verify filename-derived title | P3 | `TC19_Title_Fallback.png` |
| TC20 | Document search/filter/sort | None | Show query, selected status and ordering outcome | P2 | `TC20_Document_Filters.png` |
| TC21 | View own document details and original preview | Fail: metadata shown; preview says `Cannot GET /uploads/...pdf` | Reproduce with API/database running; inspect matching metadata and stored file | P1 | `TC21_Preview_Cannot_GET_REDACTED.png` |
| TC22 | Digitize supported image | Success message, `completed` status and recognized text visible; OCR inaccuracies also visible | No approved exact-text oracle; workflow completion is tested, accuracy score is not | P1 | `TC22_OCR_Completed_REDACTED.png` |
| TC23 | Digitize supported PDF | None | Process readable PDF and inspect completed state/page text | P1 | `TC23_PDF_OCR.png` |
| TC24 | Corrupt PDF error handling | None | Test only with disposable corrupt PDF; record failure status/message | P2 | `TC24_Corrupt_PDF.png` |
| TC25 | Edit and save recognized text | None | Save changed text; verify after refresh/reopen | P1 | `TC25_Save_Edited_Text.png` |
| TC26 | Generate and download PDF | None | Download, open PDF and confirm title/text | P1 | `TC26_PDF_Download.png` |
| TC27 | PDF action disabled for blank text | None | Show blank editor and disabled action | P2 | `TC27_Blank_Text_PDF_Disabled.png` |
| TC28 | Delete own document | None | Confirm deletion and absence after refresh | P1 | `TC28_Delete_Document.png` |
| TC29 | Read another user's document | None | Second-account ownership denial / 404; no data disclosed | P1 | `TC29_Ownership_Denied.png` |
| TC30 | Invalid/expired token handling | None | API rejection and client session redirect/clear behavior | P1 | `TC30_Invalid_Token.png` |

## Black-box checklist

| Worksheet | Evidence state | Remaining work |
|---|---|---|
| Equivalence Partitioning (12 rows) | EP-S-2 has UI rejection evidence for an oversized file. EP-EM-3 has partial exact-case duplicate evidence. Other partitions have none. | Test unique/malformed/mixed-case duplicate emails, 5/6+ password classes, each JPG/PNG/PDF type, unsupported MIME, and both size classes. Only EP-S-2 is marked Pass. |
| Boundary Value Analysis (8 rows) | No exact boundary execution evidence. The generic over-10-MB screenshot does not establish byte count. | Test password lengths 5/6/7 and file sizes 10,485,759 / 10,485,760 / 10,485,761 bytes with valid upload fixtures. The schema confidence row is not ordinary UI input; it may remain blocked/out of manual scope. |
| Decision Table (8 rules) | No rule has evidence covering all its conditions. | Run R1–R8, recording authentication, MIME, exact size class and outcome. Observe R4 type/size error precedence; do not assume it. |

## Repository evidence copies

- [TC06 duplicate email (redacted)](Screenshots/TC06_Duplicate_Email_REDACTED.png)
- [TC09 invalid login (redacted)](Screenshots/TC09_Invalid_Login_REDACTED.png)
- [TC18 oversized file](Screenshots/TC18_File_Over_10MiB.png)
- [TC16 PDF selected only](Screenshots/TC16_PDF_Selected_Only.png)
- [TC22 OCR workflow completed (private source and output redacted)](Screenshots/TC22_OCR_Completed_REDACTED.png)
- [TC21 preview failure (redacted)](Screenshots/TC21_Preview_Cannot_GET_REDACTED.png)

Only the six listed, redacted evidence copies are included in this package. The TC22 screenshot preserves the completion state; its private source document and recognized text are obscured, so OCR accuracy is not assessed from the public copy. Redaction does not imply another test execution.
