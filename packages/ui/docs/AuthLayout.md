# AuthLayout

The page around sign-in, sign-up and password forms: the brand at the top, a short title, the form in a narrow column with no card around it, and the link to the other page under it. On wide screens a panel in the app's sidebar colours sits beside the form with a promise in a few words and a quote; on phones it's the form alone. Use it for every auth page so they read as one product.

Offer only the sign-in options Syvna has set up. In an app that is the template's `OAuthButtons`: it reads them from `colony.auth.providers()` and draws `AuthDivider` under them itself, and draws nothing when there are none. Never add a "Continue with Google" button by hand. Then the fields (`Field` + `Input`) and a `Button variant="primary" size="lg" block`.

Titles are short ("Sign in", "Create your account"); the description is one welcoming line.
