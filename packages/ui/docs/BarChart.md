# BarChart

Amounts over a few periods side by side: sales by day, orders by month. Hover a bar for its value; `highlight` draws one bar strongest and the rest lighter, to make its point.

- Say the point in the Card's description ("Saturday was the best day since March") and in `label` for screen readers.
- Seven to twelve bars; more is a LineChart.

`layout="rows"` lays the bars down, one under another, each with its whole name and its value: use it for named things (revenue by gym, stock by product, tickets by team) and for more than eight bars. Columns are for periods (days, months), where the labels are short. Add `sorted` to rows to put the largest first.

