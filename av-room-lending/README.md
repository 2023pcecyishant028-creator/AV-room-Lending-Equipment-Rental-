# AV Room Lending Desk (Equipment rental)

A small lending-desk dashboard for a college AV room. It replaces the paper-register workflow with a clear view of equipment, bookings, active loans, transfers and returns.

The app is designed around the questions the desk gets every day:

- Is a particular item available?
- How many units are free?
- Who currently has the equipment?
- When is it due back?
- What deposit should be refunded after a late return?

## What is included

### Gear and availability

- Search the equipment library by name.
- Filter gear by category.
- See total stock and available units separately.
- Disable booking when all units are already out.

### Bookings

- Create a booking for a borrower and their club or department.
- Select the number of units and a required return date.
- Prevent a booking from exceeding the current available quantity.
- Add the equipment deposit per unit to the new loan.

### Active loans

- See the borrower, group, equipment, quantity, due date and status.
- Highlight active, due-today and overdue loans.
- Transfer an active loan to another borrower without creating a second loan.
- Keep the original due date, quantity, deposit, loan ID and availability unchanged during a transfer.

### Returns

- Open a return confirmation before checking equipment back in.
- Calculate a late fee of `$3/day/unit` for the prototype.
- Add returned units back to the available stock.
- Show the refundable deposit after subtracting the late fee.

## Run locally

Requirements:

- Node.js 20 or later
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### GitHub Codespaces

The scripts bind Next.js to `0.0.0.0` so the port can be forwarded correctly from Codespaces. If `localhost:3000` is not reachable in the browser, open port `3000` from the VS Code **Ports** panel and use its forwarded URL.

## Validate a production build

Run the checks before submitting:

```bash
npm run lint
npm run build
npm start
```

`npm run lint` checks the source with ESLint. `npm run build` performs the production TypeScript and Next.js build. `npm start` serves that production build.

## Debugging notes

- The app uses seeded in-memory data, so refreshing the browser resets the demo state.
- The demo date is fixed in `app/page.tsx` so the due-today and overdue examples are predictable.
- Booking, transfer and return state currently lives in the `Home` component.
- Use the browser console and the Next.js development overlay while running `npm run dev`.
- If the page does not load, first check that port `3000` is running and forwarded from the Codespace.

## Project map

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Dashboard UI, seed data, booking, transfer and return behavior |
| `app/globals.css` | Layout, colors, responsive styles and modal styling |
| `app/layout.tsx` | Global metadata and root layout |
| `REASONING.md` | Product interpretation and implementation decisions |
| `AI_LOGS.md` | AI-assisted development conversation record |

## Current scope

This is a focused prototype for the lending workflow. It does not yet persist data between refreshes, send automatic reminders, authenticate users, record damage, or enforce a server-side borrower limit. Those are the next production concerns once the core desk flow is connected to a database.
