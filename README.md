# TANKA
─────
Sri Lanka's fuel management PWA.

Track availability. Manage your quota. Don't run dry.

---

## WHAT_IT_IS

Tanka is a crowdsourced fuel availability tracker for Sri Lanka. It shows real-time station status, manages personal fuel quotas under the odd/even plate restriction system, and enables passive location-based reporting — all offline-capable as a PWA. Built on the Jedach Fuel API.

---

## POWERED_BY

**Jedach Fuel API** — Open source fuel availability infrastructure for Sri Lanka

- 872 stations (IOC done, Ceypetco + Shell pending)
- Real-time availability, trust-weighted crowdsource reports, partner API system
- Live: https://jedach-fuel-api.mapasenul.workers.dev
- Repo: https://github.com/SenulMapa/jedach-fuel-api

---

## FEATURES

- **Odd/even plate eligibility system** — date-based fueling restriction enforcement
- **Passive QR reporting** — auto-logs location when near a station
- **Daily briefing** — algorithmic, rotates by date
- **Consumption prediction** — algorithmic fill-up forecasting based on log history
- **Vehicle quota tracking** — 5L to 200L/month by vehicle type
- **Wednesday public holiday warnings**
- **Dark OSM map** with live station markers and telemetry sheets
- **Full onboarding flow** — plate, vehicle type, name stored locally
- **PWA** — installable, offline-capable

---

## STACK

- React 18 + TypeScript
- Tailwind CSS 4.0
- React Router
- Framer Motion
- React Leaflet + CartoDB dark tiles
- Lucide React
- Jedach Fuel API (Bun + Hono + Cloudflare Workers + Supabase)

---

## RUNNING_LOCALLY

```bash
git clone https://github.com/SenulMapa/tanka
cd tanka
npm install
cp .env.example .env
npm run dev
```

**Note:** No API key needed for local dev. Station data is fetched from the public Jedach Fuel API endpoint.

---

## ENVIRONMENT

```env
VITE_FUEL_API_BASE_URL=https://jedach-fuel-api.mapasenul.workers.dev/api
```

---

## KNOWN_LIMITATIONS

Be transparent:

- **Ceypetco + Shell station data pending** — only IOC stations currently seeded
- **Passive reports are localStorage-only** — backend submission not yet wired
- **Quota tracking is client-side only** — no official integration with fuel distribution system
- **No auth system** — profile stored in localStorage, cleared on browser data wipe
- **Geolocation permission required** — core map + reporting features need GPS

---

## CONTRIBUTING

See [`CONTRIBUTING.md`](./CONTRIBUTING.md)

---

## LICENSE

MIT — see [`LICENSE`](./LICENSE). Jedach Fuel API is separately licensed under BSL 1.1.
