# QuickBooks Frontend Implementation

This document explains the QuickBooks Online integration implemented on the Helicode
Accounting page (`/dashboard/accounting`). It mirrors the backend contract described
in `QUICKBOOKS_INTEGRATION.md`.

---

## What this feature does

Helicode companies can:

1. **Connect** their QuickBooks Online company via OAuth
2. **Map** Helicode transaction types to QBO chart-of-accounts entries
3. **Sync** successful wallet/payroll transactions into QuickBooks as journal entries
4. **Disconnect** the integration when needed

The Accounting page is the single UI surface for the full lifecycle.

---

## High-level user flow

```
Accounting page loads
  → GET /integrations/quickbooks/status

If not connected (or EXPIRED)
  → Show centered Connect card
  → User clicks Connect
  → GET /integrations/quickbooks/connect
  → Browser redirects to Intuit consent (authorizeUrl)
  → Intuit → backend callback → backend redirects browser to frontend with ?qbo=connected
  → Frontend refreshes status

If connected but mapping incomplete
  → Show connected summary + account mapping form
  → User selects bank + payroll expense (required) and optional accounts
  → PUT /integrations/quickbooks/mapping

If connected and mapping complete
  → Show sync stats, mapping summary, sync controls, disconnect
  → User can queue sync via POST /integrations/quickbooks/sync
```

---

## Files added or changed

### API layer

| File | Purpose |
| ---- | ------- |
| `src/lib/quickbooks-service.ts` | Typed client for all QuickBooks endpoints |
| `src/lib/permissions.ts` | Company-admin permission helper |
| `src/lib/api-client.ts` | Added `put()` helper for mapping updates |
| `src/store/auth-store.ts` | Added `QUICKBOOKS_MANAGE` permission action |

#### `quickbooks-service.ts`

Exposes these functions:

- `getQuickBooksConnectUrl()` → `GET /integrations/quickbooks/connect`
- `getQuickBooksStatus()` → `GET /integrations/quickbooks/status`
- `getQuickBooksAccounts()` → `GET /integrations/quickbooks/accounts`
- `updateQuickBooksMapping(payload)` → `PUT /integrations/quickbooks/mapping`
- `syncQuickBooks(payload)` → `POST /integrations/quickbooks/sync`
- `disconnectQuickBooks()` → `POST /integrations/quickbooks/disconnect`

All authenticated calls automatically include:

- `Authorization: Bearer <token>`
- `x-company-id: <companyId>`

via the shared `api-client`.

### UI components

| File | Purpose |
| ---- | ------- |
| `src/components/accounting/quickbooks-connect-card.tsx` | Disconnected / reconnect state (matches design mockup) |
| `src/components/accounting/quickbooks-mapping-form.tsx` | Account mapping dropdowns |
| `src/components/accounting/quickbooks-connected-panel.tsx` | Connected dashboard: stats, mapping, sync, disconnect |

### Pages & routing

| File | Purpose |
| ---- | ------- |
| `src/app/app/dashboard/accounting/page.tsx` | Main Accounting page orchestration |
| `src/app/app/settings/accounting/page.tsx` | Redirect alias for backend OAuth return URL |
| `src/middleware.ts` | Routes `/settings/*` into the app shell |

---

## Page behavior (`/dashboard/accounting`)

### 1. Initial load

On mount the page:

1. Sets the dashboard title to **Accounting**
2. Calls `getQuickBooksStatus()`
3. Renders one of three states based on the response

### 2. Permission gating

- **Employers** always have access
- **Company admins** need `QUICKBOOKS_MANAGE`:
  - `READ` → can view status, accounts, sync stats
  - `WRITE` → can connect, map, sync, disconnect

If the user lacks read permission, a dedicated access-denied card is shown.

### 3. Disconnected / expired state

Rendered by `QuickBooksConnectCard`:

- QuickBooks logo
- Title and description
- **Connect** button (or **Reconnect** when `status === "EXPIRED"`)

Clicking Connect:

```ts
const { authorizeUrl } = await getQuickBooksConnectUrl();
window.location.href = authorizeUrl;
```

The SPA never handles OAuth `code` / `realmId` directly. Intuit sends those to the
backend callback only.

### 4. OAuth return handling

The backend redirects the browser to the frontend with query params:

| Query | Frontend action |
| ----- | --------------- |
| `?qbo=connected` | Success toast + refresh status + clear query |
| `?qbo=error&message=...` | Error toast + clear query |
| `?qbo=connect` | Auto-start connect flow (App Store reconnect URL) |
| `?qbo=disconnect` | Call disconnect endpoint (Intuit disconnect URL) |

Query handling uses a ref guard so effects do not fire twice in React Strict Mode.

### 5. Connected state

Rendered by `QuickBooksConnectedPanel` when:

```ts
status.connected === true
&& status.status !== "DISCONNECTED"
&& status.status !== "EXPIRED"
```

Shows:

- Company name and environment
- Connection status badge
- Sync counters: `synced`, `pending`, `failed`
- `lastSyncAt` and `lastError`
- Mapping form or mapping summary
- Sync controls with optional date range (`from` / `to`)
- Disconnect with confirmation dialog

---

## Account mapping

`QuickBooksMappingForm` loads accounts from `GET /integrations/quickbooks/accounts`
and filters them by QBO account type:

| Field | Required | Account filter |
| ----- | -------- | -------------- |
| Bank account | Yes | `accountType === "Bank"` |
| Payroll expense | Yes | `accountType === "Expense"` |
| Fee expense | No | `accountType === "Expense"` |
| Income account | No | `accountType === "Income"` |
| Withdrawal account | No | `accountType === "Equity"` or `"Expense"` |

On save, the form sends both `id` and `name` for each selected account to
`PUT /integrations/quickbooks/mapping`, as required by the API.

Until `mappingComplete === true`, sync is disabled.

---

## Sync

The sync section posts to:

```http
POST /integrations/quickbooks/sync
{
  "from": "2026-01-01",  // optional
  "to": "2026-12-31"     // optional
}
```

The UI:

- Allows optional date filters
- Disables sync when mapping is incomplete or user lacks write permission
- Shows toast with `queued` count from the response
- Refreshes status afterward to update `sync.*`, `lastSyncAt`, and `lastError`

Only `SUCCESSFUL` company-wallet transactions are posted by the backend. Already-synced
rows are skipped server-side.

---

## Disconnect

Disconnect is available from:

1. The in-app **Disconnect** button (with confirmation dialog)
2. The Intuit **Disconnect URL** (`?qbo=disconnect`)

Both call `POST /integrations/quickbooks/disconnect`, revoke the Intuit token, and
refresh status. Sync history is retained on the backend.

---

## Redirect alias route

Backend env `QBO_FRONTEND_REDIRECT_URI` may point to:

```
/settings/accounting
```

The app’s primary UI lives at:

```
/dashboard/accounting
```

`src/app/app/settings/accounting/page.tsx` preserves query params and redirects:

```
/settings/accounting?qbo=connected
  → /dashboard/accounting?qbo=connected
```

This keeps Intuit / backend configuration compatible without duplicating UI logic.

---

## Design notes

- The **Connect** card matches the existing Accounting mockup (centered card, logo,
  description, primary button with link icon).
- Connected state uses the dashboard’s standard white cards, borders, and typography.
- Status badges use green (connected), orange (expired), and neutral (disconnected).

---

## Testing checklist

1. **Disconnected** — Accounting page shows Connect card; button opens Intuit URL.
2. **OAuth success** — Return with `?qbo=connected` shows connected panel.
3. **OAuth error** — Return with `?qbo=error&message=...` shows error toast.
4. **Mapping** — Required fields block sync until saved; optional fields work.
5. **Sync** — Queues jobs and refreshes counters.
6. **Disconnect** — Returns to Connect card.
7. **Permissions** — Company admin without `QUICKBOOKS_MANAGE` sees access message.
8. **Alias route** — `/settings/accounting?qbo=connected` lands on dashboard page.

---

## Backend configuration reminder

Ensure production backend env matches:

```bash
QBO_REDIRECT_URI=https://helicode-backend.onrender.com/integrations/quickbooks/callback
QBO_FRONTEND_REDIRECT_URI=https://app.helicode.xyz/settings/accounting
```

The frontend alias route handles the `/settings/accounting` return path. If you prefer
the redirect to land directly on `/dashboard/accounting`, update
`QBO_FRONTEND_REDIRECT_URI` accordingly — both work with this implementation.
