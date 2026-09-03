# Company Fiat Off-ramp — Frontend Integration

Companies can cash out USDC to a local bank / mobile money account using the
same Yellow Card and Quidax flow as team members. Existing company **crypto**
withdrawals (`POST /wallet/withdraw`) are unchanged.

This feature is **off by default**. Set:

```
PAYROLL_COMPANY_FIAT_OFFRAMP_ENABLED=true
```

Truthy values: `true`, `1`, `yes`, `on`. Unset or any other value keeps every
`/wallet/offramp/*` route at **403**. Team offramp is not gated.

Read the flag from `GET /company/me` as `companyFiatOfframpEnabled` (also under
`kyc.companyFiatOfframpEnabled`) before showing bank-withdraw UI.

API base (live): **https://helicode-backend.onrender.com**

---

## 1. Who can call these

Employer (always) or a company admin with **`COMPANY_WITHDRAWAL` WRITE**.

Same auth as other company wallet routes:

```
Authorization: Bearer <employer or company-admin access token>
X-Company-ID: <companyId>   # required for employers; optional for company admins
```

---

## 2. Provider routing (same as team)

| Country | Provider |
| ------- | -------- |
| Ghana (`GH` / `GHS`) | Quidax |
| Nigeria (`NG` / `NGN`) | Yellow Card by default; Quidax if `OFFRAMP_PROVIDER_NG=quidax` |
| Other Yellow Card countries | Yellow Card |

---

## 3. Setup

### Enums

`GET /wallet/offramp/enums`

### Save payout KYC

`POST /wallet/offramp/kyc`

Same body as `POST /team/offramp/kyc` (country, fullName, email, phone, address, dob, idType, idNumber, additionalIdType/Number). For Nigeria: `idType=NIN` and `additionalIdType=BVN`.

### List banks (Quidax / Ghana)

`GET /wallet/offramp/quidax/banks?country=GH&payoutType=momo`

### Save bank / MoMo

`POST /wallet/offramp/bank`

Same body as `POST /team/offramp/bank`. Ghana requires `bankName` + `bankCode`. Nigeria/Ghana require `bankCode`.

### Read back

- `GET /company/me` → `offrampKycStatus` and `bankPayoutStatus` (same booleans as `GET /team/me`; also nested under `kyc`)
- `GET /wallet/offramp/profile` → `{ companyId, kyc, bank, offrampKycStatus, bankPayoutStatus }`
- `GET /wallet/offramp/bank-payout`

---

## 4. Quote and withdraw

### Quote

`POST /wallet/offramp/fiat/quote`

```json
{ "amount": 100 }
```

```json
{ "currency": "NGN", "rate": 1550, "amountReceived": 155000 }
```

### Confirm code

`POST /auth/transaction-verification-code`

```json
{ "subject": "COMPANY_WITHDRAWAL_FIAT" }
```

Code is emailed to the employer / company admin (same 6-digit pattern as crypto withdraw).

### Initiate

`POST /wallet/offramp/fiat`

```json
{ "amount": 100, "verificationCode": "123456", "reason": "other" }
```

Funds are sent from the **company Bridge wallet**. A `COMPANY_WITHDRAWAL` transaction is created with metadata `kind: "COMPANY_FIAT_OFFRAMP"`.

Optional: `POST /wallet/offramp/fiat/dry-run` and `POST /wallet/offramp/preview` (same shapes as the team routes).

---

## 5. Lifecycle

1. Initiate debits the company wallet and sends USDC via Bridge to Yellow Card / Quidax.
2. Bridge transfer webhooks move `CompanyWithdrawal` to `CRYPTO_SENT` / `CRYPTO_CONFIRMED` (or `FAILED`, which refunds the company wallet once).
3. Yellow Card / Quidax webhooks move it to `COMPLETED` or `FAILED`. The linked `COMPANY_WITHDRAWAL` transaction is marked `SUCCESSFUL` only after the provider payout completes — not when Bridge confirms the crypto send.

Wallet refunds are idempotent (`companyWalletReversed` in withdrawal metadata). Crypto `POST /wallet/withdraw` still refunds from the Bridge transfer processor; fiat offramps do not, so a failure cannot credit the wallet twice.

---

## 6. What did not change

- `POST /wallet/withdraw` — company crypto send
- All `/team/offramp/*` and `/team/wallet/offramp/*` routes
- Yellow Card / Quidax webhook URLs (they now also match company withdrawals)
