# PricingTable

Two to four plans, the one most people should choose `featured` (raised and marked "Most popular"), with a monthly/yearly switch when plans have `yearly` prices. 21 variants take the same plans.

- Features list what's in the plan, most important first; on higher plans start with "Everything in Starter, plus".
- A plan with no fixed price takes a string: `monthly: "Custom"`, `cta: "Talk to us"`.

Which variant:

- **Most products:** `cards`, `compact`, `outline`, `price-first`, `badges`, `icons` (`plan.icon`).
- **Make the featured plan stand out:** `dark-featured`, `brand-featured`, `gradient-featured`.
- **Quiet and dense:** `minimal`, `joined`, `rows`, `tinted`.
- **Show what's missing:** `excluded` (`plan.excluded`, crossed out), `table` (a comparison; pass `comparison` or it's built from the features).
- **One plan:** `single`. **Priced per seat:** `calculator` (`unit`).
- **Guided choice:** `radio` (pick, then one button), `tabs` (one plan at a time).
- **Beside a heading:** `split` (`intro`). **Many plans on a phone:** `carousel`.
