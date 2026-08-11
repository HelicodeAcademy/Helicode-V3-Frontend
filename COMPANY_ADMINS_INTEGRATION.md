# Company Admins — Frontend Integration Guide

This guide covers the **Company Admin** feature: how an employer invites and
manages company admins, how a company admin sets up their account and logs in,
and how granular permissions gate the employer actions a company admin may
perform.

It also documents two related changes:

- **Team member status** is now a richer, company-facing status.
- **Contract upload/signing is optional** and can be skipped.

---

## 1. Concepts

- **Employer = Super Admin.** The employer who owns the company is the super
  admin. Only the employer can invite company admins and assign/change their
  permissions.
- **Company Admin.** A separate login scoped to a single company. They go
  through the same invite → setup-code → set-password flow as Helicode admins.
- **Permissions.** Each company admin holds a set of `{ action, access }`
  permissions. By default they can **view team members** and **view
  transactions** (read-only). The employer can grant additional actions.

### Permission actions

| Action                 | Meaning                                             | Typical access |
| ---------------------- | --------------------------------------------------- | -------------- |
| `VIEW_TEAM_MEMBERS`    | List team members                                   | `READ`         |
| `VIEW_TRANSACTIONS`    | View wallet + payroll transactions, wallet details  | `READ`         |
| `TEAM_INVITE`          | Invite / bulk-invite / resend team invites          | `WRITE`        |
| `TEAM_INFO_UPDATE`     | Edit team member info, revoke, upload contract      | `WRITE`        |
| `PAYROLL_GROUP_CREATE` | Create / update / delete / activate payroll groups  | `WRITE`        |
| `PAY_NOW`              | Pay a group, a member, or all members now           | `WRITE`        |
| `COMPANY_WITHDRAWAL`   | Withdraw from the company wallet                     | `WRITE`        |

### Access levels

- `READ` — can view.
- `WRITE` — can perform the action (implies `READ`).

`VIEW_TEAM_MEMBERS: READ` and `VIEW_TRANSACTIONS: READ` are **always granted**
and cannot be removed (they are the baseline of a company admin).

---

## 2. Authentication

Company admins authenticate with the same Bearer-token scheme as everyone else:

```
Authorization: Bearer <accessToken>
```

The access token already encodes the admin's `companyId`, so the
`X-Company-ID` header is optional. If sent, it must match the admin's company.

Employers always pass permission checks for their own company. Company admins
are additionally checked against their granted permissions; a missing/insufficient
permission returns **403 Forbidden**.

---

## 3. Employer-managed endpoints

All endpoints below require an **employer** access token.

### 3.1 Invite a company admin

`POST /company-admins/invite`

```json
{
  "email": "amara@acme.com",
  "firstName": "Amara",
  "lastName": "Obi",
  "permissions": [
    { "action": "TEAM_INVITE", "access": "WRITE" },
    { "action": "PAY_NOW", "access": "WRITE" }
  ]
}
```

- `permissions` is optional. The read-only view defaults are always included.
- Sends an email with a 6-digit setup code + setup link.

**Response**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Company admin invited.",
  "data": {
    "id": "b0c1...",
    "email": "amara@acme.com",
    "status": "PENDING",
    "expiresInMinutes": 10,
    "message": "Company admin invite sent."
  }
}
```

### 3.2 List company admins

`GET /company-admins?page=1&limit=20`

**Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Company admins fetched.",
  "data": {
    "data": [
      {
        "id": "b0c1...",
        "email": "amara@acme.com",
        "firstName": "Amara",
        "lastName": "Obi",
        "companyId": "c-123",
        "status": "ACTIVE",
        "hasCompletedSetup": true,
        "invitedById": "emp-1",
        "lastLoginAt": "2026-08-09T10:12:00.000Z",
        "createdAt": "2026-08-01T09:00:00.000Z",
        "updatedAt": "2026-08-09T10:12:00.000Z",
        "permissions": [
          { "action": "VIEW_TEAM_MEMBERS", "access": "READ" },
          { "action": "VIEW_TRANSACTIONS", "access": "READ" },
          { "action": "TEAM_INVITE", "access": "WRITE" }
        ]
      }
    ],
    "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

### 3.3 Get one company admin

`GET /company-admins/:id` — same shape as a single entry in the list above.

### 3.4 Update permissions (before or after invite)

`PATCH /company-admins/:id/permissions`

```json
{
  "permissions": [
    { "action": "TEAM_INVITE", "access": "WRITE" },
    { "action": "TEAM_INFO_UPDATE", "access": "WRITE" },
    { "action": "PAYROLL_GROUP_CREATE", "access": "WRITE" }
  ]
}
```

- Replaces the admin's grantable permissions. The read-only view defaults are
  re-applied automatically, so you never need to include them.
- Returns the updated admin (with the full permission list).

### 3.5 Resend invite

`POST /company-admins/:id/resend-invite` — resends the setup code. Fails if the
admin is already `ACTIVE` or `DISABLED`.

### 3.6 Remove a company admin

`DELETE /company-admins/:id`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Company admin removed.",
  "data": { "id": "b0c1...", "email": "amara@acme.com", "removed": true }
}
```

---

## 4. Company-admin self endpoints

These are used by the company admin themselves (no auth for setup/login).

### 4.1 Request a setup code

`POST /company-admins/auth/setup-code`

```json
{ "email": "amara@acme.com" }
```

### 4.2 Complete setup (set password)

`POST /company-admins/auth/setup-confirm`

```json
{
  "email": "amara@acme.com",
  "code": "123456",
  "password": "SuperSecret1",
  "firstName": "Amara",
  "lastName": "Obi"
}
```

**Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Company admin account activated.",
  "data": { "id": "b0c1...", "email": "amara@acme.com", "status": "ACTIVE" }
}
```

### 4.3 Login

`POST /company-admins/auth/login`

```json
{ "email": "amara@acme.com", "password": "SuperSecret1" }
```

**Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully logged in.",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "b0c1...",
      "email": "amara@acme.com",
      "firstName": "Amara",
      "lastName": "Obi",
      "companyId": "c-123",
      "status": "ACTIVE",
      "permissions": [
        { "action": "VIEW_TEAM_MEMBERS", "access": "READ" },
        { "action": "VIEW_TRANSACTIONS", "access": "READ" },
        { "action": "TEAM_INVITE", "access": "WRITE" }
      ]
    }
  }
}
```

### 4.4 Refresh tokens

`POST /company-admins/auth/refresh` with `Authorization: Bearer <refreshToken>`.

**Response**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Token refreshed.",
  "data": { "accessToken": "eyJhbGci...", "refreshToken": "eyJhbGci..." }
}
```

### 4.5 Current profile

`GET /company-admins/auth/me` with the access token — returns the admin profile
+ permissions (same shape as `user` above).

---

## 5. Acting on behalf of the company

A company admin uses the **same endpoints as the employer**. The backend checks
their permission automatically. Below is the permission each action requires.

| Endpoint                                   | Required permission                  |
| ------------------------------------------ | ------------------------------------ |
| `GET /teams`                               | `VIEW_TEAM_MEMBERS` (READ)           |
| `POST /teams/add`, `bulk-add`, `bulk-upload-csv`, `:id/resend-invite` | `TEAM_INVITE` (WRITE) |
| `PATCH /teams/:id`, `DELETE /teams/:id/revoke`, `POST /teams/:id/contract` | `TEAM_INFO_UPDATE` (WRITE) |
| `GET /wallet/details`, `GET /wallet/transactions`, `GET /payroll-groups/transactions` | `VIEW_TRANSACTIONS` (READ) |
| `POST /payroll-groups`, `PATCH /payroll-groups/:id`, `PATCH /:id/status`, `DELETE /:id`, `POST /:id/retry-run` | `PAYROLL_GROUP_CREATE` (WRITE) |
| `POST /payroll-groups/:id/pay-now`, `pay-now/all`, `pay-now/:teamId` | `PAY_NOW` (WRITE) |
| `POST /wallet/withdraw`                    | `COMPANY_WITHDRAWAL` (WRITE)         |
| `GET /payroll-groups`, `GET /payroll-groups/:id`, `payslips`, `stats` | any authenticated company admin |

> **Pay Now** still requires a transaction verification code. A company admin
> requests it exactly like an employer:
> `POST /auth/transaction-verification-code` with the same access token and
> subject (`COMPANY_PAY_NOW_GROUP` / `COMPANY_PAY_NOW_MEMBER` /
> `COMPANY_PAY_NOW_ALL`). The code is emailed to the admin.

If a company admin lacks the required permission the request returns:

```json
{
  "statusCode": 403,
  "message": "Missing permission: PAY_NOW. Ask your company admin to grant it."
}
```

---

## 6. Team member status (company view)

`GET /teams` now returns a richer, company-facing `status`. Labels are at most
two words:

| Status            | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `Pending`         | Invited, invite still valid, not yet accepted.                 |
| `Expired`         | Invite expired before it was accepted.                         |
| `Invite Accepted` | Accepted the invite but has no Bridge wallet yet (KYC pending).|
| `Active`          | Accepted the invite **and** has a Bridge wallet — payable.     |

Each row also includes a `hasBridgeWallet` boolean. You can filter with
`GET /teams?status=Active` (also accepts `Pending`, `Expired`, `Invite Accepted`).

**Sample response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teams fetched successfully",
  "data": [
    {
      "id": "team-1",
      "fullName": "Jane Doe",
      "country": "NG",
      "type": "EMPLOYEE",
      "department": "Engineering",
      "role": "Software Engineer",
      "amount": 500,
      "status": "Invite Accepted",
      "hasBridgeWallet": false,
      "dateJoined": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## 7. Contracts are optional

Uploading a contract (by the company) and signing it (by the team member) are
now **completely optional**:

- Adding/editing a team member with no contract file works as before.
- Creating payroll groups, paying now, and scheduled payroll runs **no longer
  require** a contract to exist or be signed.
- `PATCH /team/contract/sign` returns `{ "success": true, "skipped": true }`
  when there is no contract to sign, instead of erroring.

The `contract` / `contractSignStatus` fields are still returned where they were
before — treat them as informational, not as a gate.
