# FileUpload

Drop files or choose them, in three sizes. Lists what was chosen, with size and a remove button; files over `maxSize` are refused with a message.

- **dropzone** (default): a large area, when uploading is the point of the screen (an import, a product's files).
- **compact**: a one-line bar, inside a form among other fields.
- **button**: just "Attach a file", beside a message or a comment.
- Say what's taken in `hint`: "PNG or JPG, up to 5 MB". For pictures, ImageUpload shows previews; for a profile picture, AvatarUpload.
- Upload as soon as files are chosen (`onFiles`) and show each with an UploadItem and its progress.
