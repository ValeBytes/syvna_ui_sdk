# ApiKeyField

An API key or secret: hidden until asked, copyable, with when it was created and last used, and Revoke (which asks first).

- Right after creating a key, pass `value` and `fresh`: it starts revealed and warns it won't be shown again.
- Afterwards pass only `masked` ("sk_live_…3f9a"); never send the full key to the browser again.
