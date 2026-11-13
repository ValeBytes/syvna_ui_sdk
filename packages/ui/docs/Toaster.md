# Toaster

Short messages in a corner, for something that finished out of sight or that can be undone: "Order marked as packed · Undo", "Export ready". Put one `<Toaster />` in the app's root layout, then call `toast("Saved")` or `toast({ title, description, tone, action })` from anywhere.

- They stack, newest last, pause while hovered, and leave after 4.5 seconds (8 for errors).
- One action at most, named by its verb: "Undo", "View".
- Not for errors on a form (the Field's `error`) or for something the person must act on (an Alert or a Dialog).
