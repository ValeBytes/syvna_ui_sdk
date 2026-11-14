# AuthLayout

The page around sign-in, sign-up and password forms. Use it for every auth page of an app, with the same `variant` on each, so they read as one product. On phones every variant is the brand and the form alone.

## Picking a variant

Pick by who signs in and what the app has to show, not by taste.

| Who signs in | Variant |
|---|---|
| Staff, to an internal tool or back office | `compact`, `card`, `frame` or `centered`: no selling, they already work here |
| Customers or partners, to a portal | `split`, `split-reverse` or `inset`, with a promise and real proof in `aside` |
| People deciding whether to sign up | `showcase` (a piece of the product in `aside.media`) or `split` with `points` |
| A business with a place or a trade to show | `photo`, with a real photograph in `aside.image` |
| An app with a strong brand colour | `card-brand` or `banner` |
| Sign in and sign up as equals | `topbar`: the link to the other page sits in the bar |

A panel variant without `aside` draws `centered`; `photo` without an image and `showcase` without media draw `split`.

## The panel

`aside` is a promise and its proof. The headline is what the app does for the person, in a few words. Then at most one or two of:

- `points`: two to four short reasons.
- `stats`: two or three numbers the app can stand behind.
- `quote`: a real person's words, with their name and role.

Never invent a quote, a number or a customer. An app with no proof yet shows the headline and a `body` line, or uses a variant without a panel.

## The form

Offer only the sign-in options Syvna has set up. In an app that is the template's `OAuthButtons`: it reads them from `colony.auth.providers()` and draws `AuthDivider` under them itself, and draws nothing when there are none. Never add a "Continue with Google" button by hand. Then the fields (`Field` + `Input`) and a `Button variant="primary" size="lg" block`.

## Words

Titles are short ("Sign in", "Create your account"); the description is one plain line. `footer` is the way to the other page ("New here? Create an account"). `legal` is the small print, when signing up means agreeing to something. `help` is one quiet link in the corner ("Need help?"), not a menu.
