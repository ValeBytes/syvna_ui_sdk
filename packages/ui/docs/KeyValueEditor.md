# KeyValueEditor

Pairs of keys and values: environment variables, request headers, metadata, webhook fields. Duplicate keys are flagged; pasting a .env file into a name field fills many rows at once.

- `secrets` lets a row be hidden like a password.
- `keyPattern` checks names: /^[A-Z_][A-Z0-9_]*$/ for environment variables.
