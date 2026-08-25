# Transactions Feed — Frontend Integration

This document covers `GET /wallet/transactions/feed`, the company Transactions
dashboard used by the **Company** and **People** tabs.

Sample payloads below are taken from the live **Bluedot Labs** company
(`0f9100bf-c0ac-4fa8-8739-60e999e32d1a`) as of 24 Aug 2026.

---

## 1. Endpoint

```
GET /wallet/transactions/feed
```

- **Auth:** employer or company-admin JWT (`Authorization: Bearer <token>`).
- **Permission:** `VIEW_TRANSACTIONS` / `READ` (employers always pass).
- **Company context:** `x-company-id` header. Optional when the JWT already
  carries `companyId` (employer / company-admin).

The existing `GET /wallet/transactions` list is unchanged.

---

## 2. Query payload

| Param        | Type   | Default   | Notes                                                                 |
| ------------ | ------ | --------- | --------------------------------------------------------------------- |
| `view`       | string | `company` | `company` or `people`.                                                |
| `search`     | string | —         | Company: type / amount / currency / payment method / status. People: name / role / worker type / amount / status. |
| `status`     | string | —         | `success`, `paid` (alias of success), `pending`, `failed`.            |
| `workerType` | string | —         | People view only: `employee` or `contractor`.                         |
| `page`       | int    | `1`       | 1-based.                                                              |
| `limit`      | int    | `10`      | Max `100`.                                                            |

### Company tab

```http
GET /wallet/transactions/feed?view=company&page=1&limit=10
Authorization: Bearer <accessToken>
x-company-id: 0f9100bf-c0ac-4fa8-8739-60e999e32d1a
```

Filter examples:

```http
GET /wallet/transactions/feed?view=company&status=success&search=payroll
GET /wallet/transactions/feed?view=company&status=pending&page=2&limit=10
```

### People tab

```http
GET /wallet/transactions/feed?view=people&page=1&limit=10
Authorization: Bearer <accessToken>
x-company-id: 0f9100bf-c0ac-4fa8-8739-60e999e32d1a
```

Filter examples:

```http
GET /wallet/transactions/feed?view=people&status=paid&workerType=employee
GET /wallet/transactions/feed?view=people&workerType=contractor&search=abigail
```

---

## 3. Response shape

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "view": "company",
    "summary": {
      "payIn": { "totalAmount": "4749.00", "transactionCount": 6 },
      "payOut": { "totalAmount": "6967.66", "transactionCount": 87 },
      "currency": "USDC"
    },
    "transactions": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 127,
      "totalPages": 13,
      "hasPrevious": false,
      "hasNext": true
    }
  }
}
```

### Summary cards

`summary` is **company-wide** and identical on both tabs. Only
`SUCCESSFUL` rows are counted:

| Card    | Included types                                         | Bluedot Labs |
| ------- | ------------------------------------------------------ | ------------ |
| Pay In  | `FIAT_PAYIN`, `STABLECOIN_PAYIN`                       | `$4,749.00` / 6 |
| Pay Out | `PAYROLL`, `COMPANY_WITHDRAWAL`, `TEAM_WITHDRAWAL`     | `$6,967.66` / 87 |

Search / status / worker-type filters do **not** change the cards.

### Status mapping

| DB status                 | Company UI | People UI |
| ------------------------- | ---------- | --------- |
| `SUCCESSFUL`              | `Success`  | `Paid`    |
| `INITIATED`, `PROCESSING` | `Pending`  | `Pending` |
| `FAILED`                  | `Failed`   | `Failed`  |

### Payment method (Company tab)

| Transaction type      | `paymentMethod` |
| --------------------- | --------------- |
| `FIAT_PAYIN`          | `Bank Transfer` |
| `PAYROLL`             | `Payroll`       |
| `STABLECOIN_PAYIN`    | `Crypto`        |
| `COMPANY_WITHDRAWAL`  | `Crypto`        |
| `TEAM_WITHDRAWAL`     | `Crypto`        |

`type` is `Received` for pay-ins and `Sent` for everything else.

People amounts use the **net** salary from payroll metadata when present
(the team member's take-home). Company-tab payroll rows still show the
**gross** amount debited from the company wallet.

`currency` is the stored value (`USDC` for payroll, often `USD` for fiat
pay-ins / company withdrawals). New payroll transfers default to `USDC`.

---

## 4. Sample — Company view (Bluedot Labs)

```http
GET /wallet/transactions/feed?view=company&page=1&limit=5
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "view": "company",
    "summary": {
      "payIn": { "totalAmount": "4749.00", "transactionCount": 6 },
      "payOut": { "totalAmount": "6967.66", "transactionCount": 87 },
      "currency": "USDC"
    },
    "transactions": [
      {
        "id": "67fe9352-0a85-43d2-8c9a-a545aad12e7a",
        "type": "Sent",
        "amount": "5.00",
        "currency": "USD",
        "paymentMethod": "Crypto",
        "status": "Success",
        "date": "2026-08-15T14:20:38.597Z",
        "dateDisplay": "Aug 15, 2026 2:20 PM"
      },
      {
        "id": "5544d560-8721-4011-b855-3def0c15c822",
        "type": "Sent",
        "amount": "5.00",
        "currency": "USD",
        "paymentMethod": "Crypto",
        "status": "Pending",
        "date": "2026-08-15T14:20:36.957Z",
        "dateDisplay": "Aug 15, 2026 2:20 PM"
      },
      {
        "id": "0c81242d-3f08-4fc9-bfbe-b62378e46f41",
        "type": "Sent",
        "amount": "40.00",
        "currency": "USD",
        "paymentMethod": "Crypto",
        "status": "Success",
        "date": "2026-08-14T13:54:43.427Z",
        "dateDisplay": "Aug 14, 2026 1:54 PM"
      },
      {
        "id": "80b95442-c802-48dd-a7ac-0bf94a979624",
        "type": "Sent",
        "amount": "806.45",
        "currency": "USDC",
        "paymentMethod": "Payroll",
        "status": "Success",
        "date": "2026-08-04T21:53:27.225Z",
        "dateDisplay": "Aug 4, 2026 9:53 PM"
      },
      {
        "id": "8d81bb03-1bb5-4533-9c16-199c00b7c957",
        "type": "Received",
        "amount": "775.00",
        "currency": "USD",
        "paymentMethod": "Bank Transfer",
        "status": "Success",
        "date": "2026-07-30T17:07:44.359Z",
        "dateDisplay": "Jul 30, 2026 5:07 PM"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 127,
      "totalPages": 26,
      "hasPrevious": false,
      "hasNext": true
    }
  }
}
```

The fifth row above is a real `FIAT_PAYIN` from the same company (it sits
further down the default newest-first list). Use it as the **Received /
Bank Transfer** example.

---

## 5. Sample — People view (Bluedot Labs)

```http
GET /wallet/transactions/feed?view=people&page=1&limit=5
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "view": "people",
    "summary": {
      "payIn": { "totalAmount": "4749.00", "transactionCount": 6 },
      "payOut": { "totalAmount": "6967.66", "transactionCount": 87 },
      "currency": "USDC"
    },
    "transactions": [
      {
        "id": "80b95442-c802-48dd-a7ac-0bf94a979624",
        "name": "Suleman Ismaila",
        "initials": "SI",
        "role": "Blockchain Developer",
        "workerType": "Employee",
        "amount": "800.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-08-04T21:53:27.225Z",
        "dateDisplay": "Aug 4, 2026 9:53 PM"
      },
      {
        "id": "bb7861b8-7824-4f81-a19b-be5742068fb2",
        "name": "Nurudeen Rabiu",
        "initials": "NR",
        "role": "Backend Developer",
        "workerType": "Employee",
        "amount": "182.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-07-30T17:20:55.298Z",
        "dateDisplay": "Jul 30, 2026 5:20 PM"
      },
      {
        "id": "82d47aa2-7366-483f-a854-9dd301d6502f",
        "name": "Michael Simba",
        "initials": "MS",
        "role": "Growth Lead",
        "workerType": "Employee",
        "amount": "150.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-07-30T17:19:40.942Z",
        "dateDisplay": "Jul 30, 2026 5:19 PM"
      },
      {
        "id": "0c151d76-2865-4a63-80b8-c2db5f8a6b08",
        "name": "Hypolithe Asseke",
        "initials": "HA",
        "role": "Head of Academy",
        "workerType": "Employee",
        "amount": "140.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-07-30T17:18:12.685Z",
        "dateDisplay": "Jul 30, 2026 5:18 PM"
      },
      {
        "id": "ab13bafd-fad9-4e77-b5aa-3f289ed2463b",
        "name": "Marvelous Afolabi",
        "initials": "MA",
        "role": "Software Engineer",
        "workerType": "Employee",
        "amount": "140.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-07-30T17:17:11.549Z",
        "dateDisplay": "Jul 30, 2026 5:17 PM"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 50,
      "totalPages": 10,
      "hasPrevious": false,
      "hasNext": true
    }
  }
}
```

### Worker-type filter (contractor)

```http
GET /wallet/transactions/feed?view=people&workerType=contractor&page=1&limit=2
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "view": "people",
    "summary": {
      "payIn": { "totalAmount": "4749.00", "transactionCount": 6 },
      "payOut": { "totalAmount": "6967.66", "transactionCount": 87 },
      "currency": "USDC"
    },
    "transactions": [
      {
        "id": "d46b9ed6-22b6-426d-a020-b8d643f1b943",
        "name": "Abigail Udo",
        "initials": "AU",
        "role": "Community Associate",
        "workerType": "Contractor",
        "amount": "20.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-04-24T14:25:35.036Z",
        "dateDisplay": "Apr 24, 2026 2:25 PM"
      },
      {
        "id": "1a159f08-cbda-4e26-9e96-869af8e31047",
        "name": "Ayanfeoluwa Akindele",
        "initials": "AA",
        "role": "Software Engineer",
        "workerType": "Contractor",
        "amount": "72.00",
        "currency": "USDC",
        "status": "Paid",
        "date": "2026-04-07T08:32:19.666Z",
        "dateDisplay": "Apr 7, 2026 8:32 AM"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 2,
      "total": 3,
      "totalPages": 2,
      "hasPrevious": false,
      "hasNext": true
    }
  }
}
```

---

## 6. Frontend mapping

| UI control              | Query / field                                      |
| ----------------------- | -------------------------------------------------- |
| Company / People tabs   | `view=company` / `view=people`                     |
| Search                  | `search`                                           |
| Status dropdown         | `status=success\|pending\|failed` (or `paid`)      |
| Worker type dropdown    | `workerType=employee\|contractor` (people only)    |
| Pay In / Pay Out cards  | `data.summary.payIn` / `data.summary.payOut`       |
| Table rows              | `data.transactions`                                |
| "Page X of Y"           | `pagination.page` / `pagination.totalPages`        |
| Previous / Next         | `pagination.hasPrevious` / `pagination.hasNext`    |
| Avatar initials         | `initials` (people view)                           |
| Date column             | `dateDisplay` (ISO `date` is also returned)        |
