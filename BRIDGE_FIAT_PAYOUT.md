# USD and EUR bank payouts — Frontend Integration

Companies and team members can send USDC from their wallet to a US bank
account (ACH, same-day ACH, wire, or FedNow) or a European IBAN (SEPA).

The money always leaves the **USDC wallet**. A EUR payout is still a USDC
debit; the amount received in euros uses an exchange rate and is indicative
until the payment settles. There is no separate EUR balance to spend.

Every JSON response uses the usual wrapper:

```json
{ "status": true, "statusCode": 200, "message": "…", "data": {} }
```

```http
Authorization: Bearer <token>
x-company-id: <companyId>
```

`x-company-id` is required for an employer. Company admins and team members
use the same header as their other wallet routes. Team routes do not need a
company id.

## Before you start

- **Feature flag.** Read `bridgeFiatPayoutEnabled` on `GET /company/me` and
  `GET /team/me`. When it is off, every route below returns **403**
  `"Bank payouts in USD and EUR are not enabled."` Hide the USD/EUR withdraw
  UI in that case. Ghana and Nigeria cash-out is a different flow and stays
  on its own flag (`companyFiatOfframpEnabled`).
- **Who can call company routes.** An employer, or a company admin with
  **`COMPANY_WITHDRAWAL` READ**, can list saved accounts. Saving, quoting,
  and withdrawing need **`COMPANY_WITHDRAWAL` WRITE**.
- **Who can call team routes.** The signed-in team member.
- **Fee.** Company **0.4%** (`COMPANY_OFFRAMP_DEVELOPER_FEE_PERCENT`). Team
  **0.2%** (`OFFRAMP_DEVELOPER_FEE_PERCENT`). The wallet is debited the
  amount the user entered. The bank receives the remainder. The amount has
  at most two decimal places. These fees are included in
  `GET /admin-dashboard/offramp-revenue` as source `BRIDGE_FIAT`.
  See [Offramp revenue](../admin/OFFRAMP_REVENUE.md).
- **One account per currency.** Saving again replaces the account used for
  the next withdrawal. A withdrawal already submitted keeps the account it
  was sent to.
- **Responses never include** the full account number, the full IBAN, or the
  external-account id. They include `last4`.

| Screen | Company | Team |
| --- | --- | --- |
| Saved accounts | `GET /wallet/bridge-payout` | `GET /team/wallet/bridge-payout` |
| Save US or EUR account | `POST /wallet/bridge-payout` | `POST /team/wallet/bridge-payout` |
| Quote | `POST /wallet/bridge-payout/quote` | `POST /team/wallet/bridge-payout/quote` |
| Withdraw | `POST /wallet/bridge-payout/withdraw` | `POST /team/wallet/bridge-payout/withdraw` |
| Payout status | `GET /wallet/bridge-payout/withdrawals/:id` | `GET /team/wallet/bridge-payout/withdrawals/:id` |

---

## 1. Save a payout account

`POST /wallet/bridge-payout` or `POST /team/wallet/bridge-payout`

### USD

```json
{
  "currency": "USD",
  "rail": "ach",
  "accountOwnerType": "individual",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "bankName": "Example Bank",
  "accountNumber": "123456789",
  "routingNumber": "021000021",
  "accountKind": "checking",
  "address": {
    "line1": "1 Market St",
    "line2": "Suite 4",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "US"
  }
}
```

`rail` is `ach`, `ach_same_day`, `wire`, or `fednow`. `accountKind` is
`checking` or `savings`. `routingNumber` is 9 digits. A US address needs
`state`. `country` is a 2-letter or 3-letter code (`US` or `USA`).

For a business account send `accountOwnerType: "business"` and `businessName`
instead of `firstName` / `lastName`. The name sent to the bank must be **3 to
35 characters**.

FedNow is only available when the saved account reports `fednow` in
`supportedRails`. Otherwise the save returns **400**
`"This account cannot receive that transfer type."`

### EUR (SEPA IBAN)

```json
{
  "currency": "EUR",
  "rail": "sepa",
  "accountOwnerType": "business",
  "businessName": "Helicode GmbH",
  "iban": "DE89370400440532013000",
  "bic": "COBADEFFXXX",
  "address": {
    "line1": "Unter den Linden 1",
    "city": "Berlin",
    "postalCode": "10117",
    "country": "DE"
  }
}
```

`rail` must be `sepa`. `bic` is optional. Spaces in the IBAN are ignored.

### Saved account

```json
{
  "currency": "USD",
  "rail": "ach",
  "supportedRails": ["ach", "wire"],
  "accountOwnerType": "individual",
  "accountOwnerName": "Ada Lovelace",
  "bankName": "Example Bank",
  "last4": "6789",
  "routingNumber": "021000021",
  "accountKind": "checking",
  "bic": null,
  "countryCode": "USA",
  "addressLine1": "1 Market St",
  "addressLine2": "Suite 4",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "updatedAt": "2026-10-26T12:00:00.000Z"
}
```

Changing the account number, routing number, checking/savings, IBAN, or BIC
registers a new destination. Changing only the address or the name updates
the current destination, unless a withdrawal on that destination is still in
progress. In that case a new destination is registered and the in-progress
withdrawal is left on the previous one.

A deposit account issued by Helicode (a USD virtual account number, or a EUR
deposit IBAN) is rejected before it is saved:

**400** `"This account receives deposits and cannot be used for a payout."`

A shared bank routing number on its own is not treated as a deposit account.

### List

`GET /wallet/bridge-payout` or `GET /team/wallet/bridge-payout`

```json
{
  "feePercent": 0.4,
  "payouts": []
}
```

`feePercent` is 0.4 for a company and 0.2 for a team. `payouts` has at most
one USD row and one EUR row.

---

## 2. Quote

`POST /wallet/bridge-payout/quote` or `POST /team/wallet/bridge-payout/quote`

The payout account for that currency must already be saved.

```json
{ "currency": "USD", "amount": 100 }
```

USD is 1:1 after the fee. `indicative` is false.

```json
{
  "currency": "USD",
  "rail": "ach",
  "rate": 1,
  "amountReceived": 99.6,
  "indicative": false,
  "amountUsdc": 100,
  "feePercent": 0.4,
  "feeUsdc": 0.4,
  "netUsdc": 99.6,
  "feeLocal": 0.4
}
```

EUR uses the current USD→EUR rate. `amountReceived` is euros. `indicative`
is true because the settled amount can differ.

```json
{ "currency": "EUR", "amount": 100 }
```

If the rate cannot be loaded the message is **400**
`"Could not fetch payout quote"`. If no account is saved: **400**
`"Save a USD payout account first."` or `"Save a EUR payout account first."`

---

## 3. Withdraw

Request a code first. Company:

`POST /auth/transaction-verification-code`

```json
{ "subject": "COMPANY_WITHDRAWAL_FIAT" }
```

Team:

```json
{ "subject": "TEAM_WITHDRAWAL_FIAT" }
```

The code is the same 6-digit email code used for other fiat withdrawals. A
company can request it when either local-currency cash-out or this USD/EUR
flow is enabled.

Then:

`POST /wallet/bridge-payout/withdraw` or `POST /team/wallet/bridge-payout/withdraw`

```json
{
  "currency": "EUR",
  "amount": 100,
  "verificationCode": "123456",
  "code2fa": "123456",
  "reference": "Invoice 1042"
}
```

`code2fa` is required only when the user has an authenticator app turned on.
`reference` is optional. ACH and same-day ACH allow **10** characters. Wire,
FedNow, and SEPA allow **140**.

The rail is the one saved on the account. Save the account again to switch
rail. The destination is checked against Helicode deposit accounts again
before the transfer is created.

```json
{
  "withdrawalId": "…",
  "bridgeTransferId": "…",
  "currency": "EUR",
  "rail": "sepa",
  "amountUsdc": 100,
  "feePercent": 0.4,
  "feeUsdc": 0.4,
  "netUsdc": 99.6
}
```

If the transfer response is lost, or the bank returns a server error, the same
call still returns **200** and the wallet stays debited:

```json
{
  "withdrawalId": "…",
  "bridgeTransferId": null,
  "pending": true,
  "currency": "EUR",
  "rail": "sepa",
  "amountUsdc": 100,
  "feePercent": 0.4,
  "feeUsdc": 0.4,
  "netUsdc": 99.6
}
```

Do not start a second payout for that debit. Poll
`GET /wallet/bridge-payout/withdrawals/:id` (or the team route). That read
retries the same payment and does not debit again. Submitting withdraw
again does the same: it finishes or releases the payout already in
progress. A definite rejection, such as a refused bank account, returns
**400** and the debit is put back.

`GET` is allowed for a company admin with **`COMPANY_WITHDRAWAL` READ**.
The body matches the withdraw response and adds `status` and `last4`.
`pending` is true while the payment has not been accepted and the debit
is still held.

Other **400** messages:

- `"This account cannot receive that transfer type."`
- `"Insufficient wallet balance. Available: 10.00, Requested: 100.00"`
- `"Amount is too small after the Helicode fee"`
- `"amount must have at most 2 decimal places"`
- `"ACH reference must be 10 characters or fewer."`
- `"Transfer failed"`

---

## 4. Lifecycle

1. Withdraw debits the USDC wallet, then submits the payment. A lost response
   leaves that debit in place and returns `pending: true`. Poll the payout
   status, or submit withdraw again, to finish that same payment. Neither
   call debits the wallet a second time.
2. Emails show the USDC wallet debit. A USD payout also shows the post-fee
   USD amount the bank receives. A EUR payout stays in USDC until the
   payment settles and the transfer receipt includes the EUR amount.
3. A completed payment is a successful wallet transaction. A returned,
   canceled, or failed payment credits the USDC wallet once.

Ghana and Nigeria cash-out (`/wallet/offramp/*` and `/team/wallet/offramp/*`)
is unchanged.
