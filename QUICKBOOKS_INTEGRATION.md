# QuickBooks Online — Frontend Integration

Helicode can connect a company to **QuickBooks Online** and post settled
wallet/payroll activity as **Journal Entries** in that company's books.

This is the QBO **Accounting** API (not QuickBooks Payroll). Each Helicode
`Transaction` becomes one journal entry:

| Helicode type | Journal entry |
| ------------- | ------------- |
| `FIAT_PAYIN` / `STABLECOIN_PAYIN` | Debit bank, credit income |
| `PAYROLL` | Debit payroll expense (net) + fee expense (developer fee), credit bank (gross) |
| `COMPANY_WITHDRAWAL` / `TEAM_WITHDRAWAL` | Debit withdrawal (or payroll expense fallback), credit bank |

`USDC` / `USDT` are posted as **USD** (QBO has no USDC currency). Payroll
amounts sent as `USD` from the client are stored and transferred as `USDC`
on Helicode, then mapped to USD in QBO.

API base (live): **https://helicode-backend.onrender.com**  
Swagger: [https://helicode-backend.onrender.com](https://helicode-backend.onrender.com)

---

## 1. Environment

Set these on the backend (never commit secrets):

```bash
QBO_CLIENT_ID=
QBO_CLIENT_SECRET=

# Intuit Redirect URI — BACKEND callback. Must match the Intuit app exactly.
QBO_REDIRECT_URI=https://helicode-backend.onrender.com/integrations/quickbooks/callback

# Where the API sends the browser AFTER a successful/failed OAuth exchange.
QBO_FRONTEND_REDIRECT_URI=https://app.helicode.xyz/settings/accounting

QBO_ENVIRONMENT=sandbox   # or production
QBO_SCOPES=com.intuit.quickbooks.accounting

# 32-byte hex, or any passphrase (scrypt-derived). Encrypts tokens at rest.
QBO_TOKEN_ENC_KEY=
```

Create an Intuit developer app at https://developer.intuit.com, enable
**Accounting**, and add the **Redirect URI** above under Keys & credentials.

Sandbox and Production each have their own client id/secret and URL lists.

---

## 2. Redirect URI: backend vs frontend

There are **two different URLs**. Do not mix them in the Intuit portal.

| URL | Owner | Used for |
| --- | ----- | -------- |
| `QBO_REDIRECT_URI` | **Backend** | What you paste as Intuit **Redirect URI**. Intuit sends `code`, `state`, `realmId` here. |
| `QBO_FRONTEND_REDIRECT_URI` | **Frontend** | After the API stores tokens, it **302-redirects the browser** here. |

Live backend callback:

```
https://helicode-backend.onrender.com/integrations/quickbooks/callback
```

Flow:

```
Connect button (FE)
  → GET https://helicode-backend.onrender.com/integrations/quickbooks/connect
  → open data.authorizeUrl (Intuit consent)
  → Intuit → GET .../integrations/quickbooks/callback   ← Redirect URI (backend)
  → API 302 → https://app.helicode.xyz/settings/accounting?qbo=connected
     or     → ...?qbo=error&message=...
```

The SPA must **not** be registered as the Intuit Redirect URI. It never
receives `code` / `realmId`.

---

## 3. Intuit App URLs (host / launch / disconnect / connect)

These four fields on the Intuit “Add your app’s host domain…” screen are
**browser pages**, not the OAuth callback. They are used by the App Store
and “Open app from QuickBooks”.

Assume the payroll UI is `https://app.helicode.xyz` (change if yours differs).

| Intuit field | What to paste |
| ------------ | ------------- |
| **Host domain** | `app.helicode.xyz` (no `https://`) |
| **Launch URL** | `https://app.helicode.xyz/settings/accounting` |
| **Disconnect URL** | `https://app.helicode.xyz/settings/accounting?qbo=disconnect` |
| **Connect / Reconnect URL** | `https://app.helicode.xyz/settings/accounting?qbo=connect` |

- **Launch** — user already connected; page should `GET .../status`.
- **Connect / Reconnect** — logged-in user calls `GET .../connect`, then
  `window.location = data.authorizeUrl`. Do **not** put the API
  `/connect` route here (it requires a JWT and returns JSON).
- **Disconnect** — Intuit GETs this page. While logged in, call
  `POST .../disconnect`.

`https://helicode-backend.onrender.com` is the **API host**, not the
customer-facing host domain.

---

## 4. Auth & permission

All routes except the OAuth **callback** require:

```
Authorization: Bearer <employer-or-company-admin-token>
x-company-id: <companyId>
```

| Action | Access |
| ------ | ------ |
| `QUICKBOOKS_MANAGE` | `READ` for status/accounts, `WRITE` for connect/map/sync/disconnect |

Employers always pass. Company admins need the employer to grant
`QUICKBOOKS_MANAGE`.

---

## 5. Connect button flow

1. `GET /integrations/quickbooks/connect`
2. Send the user to `data.authorizeUrl`
3. Intuit hits the backend callback; the API redirects to
   `QBO_FRONTEND_REDIRECT_URI?qbo=connected` (or `?qbo=error&message=...`)
4. Settings page calls `GET /integrations/quickbooks/status` and hides
   Connect when `connected: true`

### `GET /integrations/quickbooks/connect`

```http
GET https://helicode-backend.onrender.com/integrations/quickbooks/connect
Authorization: Bearer <token>
x-company-id: <companyId>
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "QuickBooks authorize URL created",
  "data": {
    "authorizeUrl": "https://appcenter.intuit.com/connect/oauth2?client_id=...&redirect_uri=https%3A%2F%2Fhelicode-backend.onrender.com%2Fintegrations%2Fquickbooks%2Fcallback&state=..."
  }
}
```

### `GET /integrations/quickbooks/callback`

```
https://helicode-backend.onrender.com/integrations/quickbooks/callback
```

Public. Intuit calls this. Do not call it from the SPA.

### `GET /integrations/quickbooks/status`

```http
GET https://helicode-backend.onrender.com/integrations/quickbooks/status
Authorization: Bearer <token>
x-company-id: <companyId>
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "QuickBooks status fetched",
  "data": {
    "connected": true,
    "status": "CONNECTED",
    "realmId": "934145000000000",
    "environment": "SANDBOX",
    "companyName": "Bluedot Labs",
    "lastSyncAt": null,
    "lastError": null,
    "mappingComplete": false,
    "mapping": {
      "bankAccountId": null,
      "bankAccountName": null,
      "payrollExpenseAccountId": null,
      "payrollExpenseAccountName": null,
      "feeExpenseAccountId": null,
      "feeExpenseAccountName": null,
      "incomeAccountId": null,
      "incomeAccountName": null,
      "withdrawalAccountId": null,
      "withdrawalAccountName": null
    },
    "sync": { "pending": 0, "failed": 0, "synced": 0 }
  }
}
```

`status` is `CONNECTED` | `EXPIRED` | `DISCONNECTED`. When `EXPIRED`, show
Connect again (“Reconnect”).

When `connected: false`, show the Connect card.

---

## 6. Account mapping

Required before sync: **bank** + **payroll expense**.

```http
GET https://helicode-backend.onrender.com/integrations/quickbooks/accounts
Authorization: Bearer <token>
x-company-id: <companyId>
```

```json
{
  "status": true,
  "data": {
    "accounts": [
      {
        "id": "35",
        "name": "Checking",
        "fullyQualifiedName": "Checking",
        "accountType": "Bank",
        "accountSubType": "Checking",
        "currency": "USD",
        "currentBalance": 12000
      },
      {
        "id": "7",
        "name": "Payroll Expenses",
        "fullyQualifiedName": "Payroll Expenses",
        "accountType": "Expense",
        "accountSubType": "PayrollExpenses",
        "currency": "USD",
        "currentBalance": 0
      }
    ]
  }
}
```

```http
PUT https://helicode-backend.onrender.com/integrations/quickbooks/mapping
Authorization: Bearer <token>
x-company-id: <companyId>
Content-Type: application/json

{
  "bankAccountId": "35",
  "bankAccountName": "Checking",
  "payrollExpenseAccountId": "7",
  "payrollExpenseAccountName": "Payroll Expenses",
  "feeExpenseAccountId": "8",
  "feeExpenseAccountName": "Bank Charges",
  "incomeAccountId": "79",
  "incomeAccountName": "Sales",
  "withdrawalAccountId": "30",
  "withdrawalAccountName": "Owner's Draw"
}
```

Suggested UI filters:

- Bank / cash → `bankAccountId`
- Expense (payroll) → `payrollExpenseAccountId`
- Expense (fees) → `feeExpenseAccountId` (optional; falls back to payroll expense)
- Income → `incomeAccountId` (optional; pay-ins)
- Equity / expense → `withdrawalAccountId` (optional; crypto withdrawals)

---

## 7. Sync

```http
POST https://helicode-backend.onrender.com/integrations/quickbooks/sync
Authorization: Bearer <token>
x-company-id: <companyId>
Content-Type: application/json

{
  "from": "2026-01-01",
  "to": "2026-12-31"
}
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "QuickBooks sync queued",
  "data": { "queued": 87 }
}
```

- Only `SUCCESSFUL` company-wallet transactions are posted.
- Already-synced rows are skipped (`QuickbooksSyncItem` unique on `transactionId`).
- Jobs run on the `quickbooks-sync` BullMQ queue (needs Redis).
- `from` / `to` are optional.

---

## 8. Disconnect

```http
POST https://helicode-backend.onrender.com/integrations/quickbooks/disconnect
Authorization: Bearer <token>
x-company-id: <companyId>
```

Revokes the Intuit refresh token and marks the connection `DISCONNECTED`.
Sync history is kept.

---

## 9. Frontend checklist

1. Connect card → `GET .../connect` → open `authorizeUrl`.
2. After redirect (`?qbo=connected`) → `GET .../status`.
3. If `mappingComplete === false` → load accounts → `PUT .../mapping`.
4. Sync button → `POST .../sync`.
5. Show `sync.synced` / `sync.failed` / `lastError` on the card.
6. Disconnect (in-app or `?qbo=disconnect`) → `POST .../disconnect`.
7. Connect from App Store (`?qbo=connect`) → same as step 1 after login.

---

## 10. Endpoint index

Base: `https://helicode-backend.onrender.com`

| Method | Path | Auth |
| ------ | ---- | ---- |
| `GET` | `/integrations/quickbooks/connect` | JWT + `QUICKBOOKS_MANAGE` WRITE |
| `GET` | `/integrations/quickbooks/callback` | Public (Intuit only) |
| `GET` | `/integrations/quickbooks/status` | JWT + `QUICKBOOKS_MANAGE` READ |
| `GET` | `/integrations/quickbooks/accounts` | JWT + `QUICKBOOKS_MANAGE` READ |
| `PUT` | `/integrations/quickbooks/mapping` | JWT + `QUICKBOOKS_MANAGE` WRITE |
| `POST` | `/integrations/quickbooks/sync` | JWT + `QUICKBOOKS_MANAGE` WRITE |
| `POST` | `/integrations/quickbooks/disconnect` | JWT + `QUICKBOOKS_MANAGE` WRITE |
