# UploadItem

One file on its way up, or there: its kind as an icon (PDF in red, sheets in green, pictures in blue), name and size, a progress bar while it uploads, then a tick or what went wrong.

- Pass `progress` (0–100) from the upload; leave it off and the bar moves without a number.
- Uploading: Cancel. Failed: Retry and Remove. Done: Remove.
- Errors say what happened: "The connection dropped", not "Error 500".
