# YC Partner Preference Map

Local research dashboard for exploring public signals about YC partner preferences.

## Commands

```sh
npm install
npm run ingest:sample
npm run dev
```

`npm run ingest:sample` fetches a recent-batch sample from public YC pages. `npm run ingest` attempts the full company crawl and can take longer.

## Data Model

The generated dataset lives at `src/data/yc-preferences.json`.

Relationship types are intentionally separated:

- Official `primary_group_partner` from YC company pages
- Current partner bios from YC People and Partners pages
- Visiting and historical partner records from official YC blog/profile sources

Public data does not prove every personal investment a partner has ever made. The app treats official primary-partner attribution as high-confidence YC relationship data and keeps historical or visiting-partner notes as source-linked signals.
