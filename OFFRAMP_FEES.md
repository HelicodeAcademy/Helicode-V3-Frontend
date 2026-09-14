# Off-ramp fee — frontend integration

**Status:** Live  
**Default fee:** **0.2%** of the USDC the user asks to send (`OFFRAMP_DEVELOPER_FEE_PERCENT`)  
**Audience:** Frontend

Helicode keeps a percentage of every cash-out. The **sender pays**: the wallet is
debited the amount they typed; the bank / destination wallet receives the rest.
Payroll is unchanged (the company still pays that fee so the team member gets
their full salary). Company crypto `POST /wallet/withdraw` is unchanged (no fee).

---

## 1. What the frontend must change

Do **not** compute “you receive” as `amount × rate`. That overstates the payout.

Use the quote `data` fields as-is:

| Show on screen | Use this field |
| -------------- | -------------- |
| You send | `amountUsdc` |
| Helicode fee (USDC) | `feeUsdc` |
| Helicode fee (local) | `feeLocal` (bank / MoMo only) |
| Fee rate | `feePercent` (e.g. `0.2` means 0.2%) |
| Partner / destination receives (USDC) | `netUsdc` |
| You receive (local) | `amountReceived` — **already after the fee** |
| Rate | `rate` (bank / MoMo only) |

Show this breakdown **before** the confirmation-code step.

If `feePercent` / `feeUsdc` is `0`, still render the rows (fee ₦0 / 0 USDC). Set
`OFFRAMP_DEVELOPER_FEE_PERCENT=0` to disable charging; the same fields are
returned.

---

## 2. Coverage

| Flow | Endpoint | Fee? |
| ---- | -------- | ---- |
| Team bank / MoMo | `POST /team/wallet/offramp/fiat` | Yes |
| Team crypto send | `POST /team/wallet/offramp/crypto` | Yes |
| Company bank / MoMo | `POST /wallet/offramp/fiat` | Yes |
| Company crypto send | `POST /wallet/withdraw` | **No** |
| Payroll | pay-now / scheduled run | **No** (separate payroll fee) |

---

## 3. Shared fee fields

Added to quote, dry-run, preview, and initiate `data` (alongside existing keys):

```ts
{
  amountUsdc: number; // gross — what they typed
  feePercent: number; // 0.2
  feeUsdc: number;    // Helicode fee in USDC
  netUsdc: number;    // amountUsdc - feeUsdc
  feeLocal?: number;  // feeUsdc * rate (bank/MoMo quotes only)
}
```

On **bank / MoMo quotes**, `amountReceived` is local currency of `netUsdc`
(after the fee). On **team crypto quotes**, `amountReceived` equals `netUsdc`
(USDC to the destination address).

Envelope is unchanged:

```json
{
  "status": true,
  "statusCode": 200,
  "message": "…",
  "data": { }
}
```

---

## 4. Team — bank / mobile money

Auth: team JWT + `X-Company-ID`.

### Quote (use this for the rate screen)

`POST /team/wallet/offramp/fiat/quote`

```json
{ "amount": 100 }
```

**Before (do not keep using this as “you receive”):**

```json
{
  "currency": "NGN",
  "rate": 1550,
  "amountReceived": 155000
}
```

**Now:**

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Off-ramp quote fetched",
  "data": {
    "currency": "NGN",
    "rate": 1550,
    "amountReceived": 154690,
    "amountUsdc": 100,
    "netUsdc": 99.8,
    "feeUsdc": 0.2,
    "feePercent": 0.2,
    "feeLocal": 310
  }
}
```

`amountReceived` = `99.8 × 1550` = **154690**, not `100 × 1550`.

Suggested copy:

- Rate: 1 USDC = {rate} {currency}
- You send: {amountUsdc} USDC
- Helicode fee: {feeLocal} {currency} ({feeUsdc} USDC)
- You receive: {amountReceived} {currency}

### Dry-run

`POST /team/wallet/offramp/fiat/dry-run`

```json
{ "amount": 100, "reason": "other" }
```

Existing Yellow Card / Quidax payload is unchanged. **Added** on `data`:
`amountUsdc`, `feePercent`, `feeUsdc`, `netUsdc`.

### Initiate

`POST /team/wallet/offramp/fiat`

```json
{ "amount": 100, "verificationCode": "123456", "reason": "other" }
```

Existing fields (`withdrawalId`, `yellowcardPaymentId` / `quidaxMerchantReference`,
`bridgeTransferId`, `convertedAmount`, `rate`, …) are unchanged. **Added** on
`data`: `amountUsdc`, `feePercent`, `feeUsdc`, `netUsdc`.

The wallet is still debited **100**. The payout partner is funded with **99.8**.

---

## 5. Team — crypto send

Auth: team JWT + `X-Company-ID`.

### Quote (new — call this before the confirm-code screen)

`POST /team/wallet/offramp/crypto/quote`

```json
{ "amount": 100 }
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Off-ramp quote fetched",
  "data": {
    "currency": "USDC",
    "amountUsdc": 100,
    "feePercent": 0.2,
    "feeUsdc": 0.2,
    "netUsdc": 99.8,
    "amountReceived": 99.8
  }
}
```

There is no local-currency rate. Show the fee in USDC. Destination receives
`amountReceived` / `netUsdc`.

Suggested copy:

- You send: {amountUsdc} USDC
- Helicode fee: {feeUsdc} USDC
- Destination receives: {netUsdc} USDC

### Initiate

`POST /team/wallet/offramp/crypto`

```json
{
  "amount": 100,
  "toAddress": "0x…",
  "verificationCode": "123456",
  "note": "optional"
}
```

Existing fields (`bridgeTransferId`, `reference`, `transaction`) are unchanged.
**Added** on `data`: `amountUsdc`, `feePercent`, `feeUsdc`, `netUsdc`.

---

## 6. Company — bank / mobile money

Auth: employer or company admin with `COMPANY_WITHDRAWAL` WRITE + `X-Company-ID`.

On by default. Hide the bank-withdraw UI if `GET /company/me` returns
`companyFiatOfframpEnabled: false`.

Company crypto `POST /wallet/withdraw` is **not** in this feature. Do not show
the cash-out fee on that screen.

### Profile flags

`GET /company/me`

**Added** (top-level and under `kyc`):

```json
{
  "companyFiatOfframpEnabled": true,
  "offrampFeePercent": 0.2
}
```

Use `offrampFeePercent` if you need the rate before a quote. Prefer the quote
for the actual `feeUsdc` / `amountReceived`.

### Quote (use this for the rate screen)

`POST /wallet/offramp/fiat/quote`

```json
{ "amount": 100 }
```

Same `data` shape as the team bank quote (`currency`, `rate`, `amountReceived`,
`amountUsdc`, `netUsdc`, `feeUsdc`, `feePercent`, `feeLocal`).

### Preview / dry-run

`POST /wallet/offramp/preview` — body still uses `amountUsdc` plus bank fields.  
`POST /wallet/offramp/fiat/dry-run` — `{ "amount": 100 }`.

Existing provider payloads are unchanged. **Added** on `data`: `amountUsdc`,
`feePercent`, `feeUsdc`, `netUsdc`.

### Initiate

`POST /wallet/offramp/fiat`

```json
{ "amount": 100, "verificationCode": "123456", "reason": "other" }
```

Existing fields (`withdrawalId`, provider ids, `bridgeTransferId`, …) are
unchanged. **Added** on `data`: `amountUsdc`, `feePercent`, `feeUsdc`, `netUsdc`.

---

## 7. Worked example (live 0.2%)

Cash out **100.00 USDC**. Partner rate **1 USDC = ₦1,550**.

| | USDC | Naira |
| - | ---- | ----- |
| They type | 100.00 | — |
| Helicode fee | 0.20 | ₦310 (`feeLocal`) |
| Partner / destination gets | 99.80 (`netUsdc`) | — |
| They receive in bank | — | ₦154,690 (`amountReceived`) |

Wrong: `100 × 1550 = ₦155,000`.  
Right: use `data.amountReceived`.

---

## 8. Errors

| Case | HTTP | Message |
| ---- | ---- | ------- |
| Amount too small after the fee | 400 | `Amount is too small after the Helicode fee` |
| Company bank routes disabled | 403 | `Company bank withdrawals are not enabled.` |

Request bodies are unchanged (`amount` / `amountUsdc` is still the **gross**
the user typed). Do not subtract the fee on the client before calling initiate.

---

## 9. What did not change

- Request bodies and auth headers
- Team KYC / bank save routes
- Company crypto `POST /wallet/withdraw`
- Payroll pay-now / scheduled runs
- Webhook URLs and withdrawal status lifecycle
