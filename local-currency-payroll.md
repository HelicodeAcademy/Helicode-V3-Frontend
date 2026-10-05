# Local currency pay and team withdrawal

Guide for the frontend. Existing request and response fields stay in place. New fields are added only when a local currency is used. If those fields are missing, keep the current dollar screens.

Company cash-out is unchanged. Do not send a local currency on company withdrawal.

Examples below use the live **Acme** company as of 5 October 2026.

| | |
|---|---|
| Company | Acme |
| Company id | `40425a49-cb75-4a76-a5b2-bbee2ca70a72` |
| Country | Nigeria |
| Employer | Nurudeen Rabiu |

Two members are used throughout:

**Marvelous Afolabi** — Nigeria, naira bank account already saved.

| | |
|---|---|
| Team id | `44d5a250-042b-42df-a4d2-ab6239910a82` |
| Email | afosmarvel+10@gmail.com |
| Role | Engineer, Tech, employee, active |
| Start date | 2026-03-29 |
| Salary today | 2500 USDC, monthly |
| Bank | GT Bank, Nigeria, NGN, Afolabi Marvelous Sunday |
| Wallet balance | 0 |

**Nurudeen Rabiu** (team member, not the employer login) — Nigeria, naira bank account saved, dollar salary.

| | |
|---|---|
| Team id | `15c689dd-4703-4d94-993b-f9472f4581a4` |
| Email | nrabiu705@gmail.com |
| Role | CTO, Tech, employee, active |
| Salary today | 150 USDC, monthly |
| Bank | OPay, Nigeria, NGN |
| Wallet balance | 2.20 |

Every response is wrapped as:

```json
{
  "status": true,
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

Employer calls use the employer token. The company id is already on that token. Team calls use the team token and this header:

```
x-company-id: 40425a49-cb75-4a76-a5b2-bbee2ca70a72
```

## The rule

- **USD or USDC** means dollars. Nigeria as the country does not change that. The amount is saved, paid, shown, and withdrawn as dollars. No new fields are returned.
- **A local code** (NGN for Nigeria, GHS for Ghana, and the list below) is converted when it is saved or sent. The wallet still moves dollars. The screen shows the local amount the person typed.
- Do not convert on the client. Call the quote endpoint and display what it returns. On save and on pay, send the local amount again. The server quotes it again.

| Country | Code to send | Local currency |
|---|---|---|
| Nigeria | Nigeria or NG | NGN |
| Ghana | Ghana or GH | GHS |
| Kenya | Kenya or KE | KES |
| Uganda | Uganda or UG | UGX |
| Rwanda | Rwanda or RW | RWF |
| South Africa | South Africa or ZA | ZAR |
| Tanzania | Tanzania or TZ | TZS |
| Zambia | Zambia or ZM | ZMW |
| Benin, Burkina Faso, Ivory Coast, Mali, Senegal, Togo | country name or BJ, BF, CI, ML, SN, TG | XOF |
| Cameroon, Congo, Gabon | country name or CM, CG, GA | XAF |
| DR Congo | DR Congo or CD | CDF |
| Botswana | Botswana or BW | BWP |
| Malawi | Malawi or MW | MWK |

Any other country stays on USD. Sending NGN for a member in Ghana is rejected.

## 1. Quote a salary before the form submits

`POST /teams/payroll/quote`

Same employer auth as adding a team member. Call this when the country, currency, or amount changes.

Naira salary for a new Nigerian member:

```json
{
  "country": "Nigeria",
  "currency": "NGN",
  "amount": 250000
}
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payroll quote ready",
  "data": {
    "country": "Nigeria",
    "currency": "NGN",
    "amount": 250000,
    "settlementCurrency": "USDC",
    "settlementAmount": 186.42,
    "rate": 1341.05,
    "quotedAt": "2026-10-05T00:30:00.000Z"
  }
}
```

`settlementAmount` and `rate` in this sample are the shape only. Show the numbers from the live response. `rate` is how many naira equal 1 dollar. The payroll fee is still taken from `settlementAmount` on the company side, the same way a dollar salary is charged today.

Dollar salary for the same Nigerian country. This is how Acme pays Marvelous today (2500) and Nurudeen today (150):

```json
{
  "country": "Nigeria",
  "currency": "USD",
  "amount": 2500
}
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payroll quote ready",
  "data": {
    "country": "Nigeria",
    "currency": "USD",
    "amount": 2500,
    "settlementCurrency": "USDC",
    "settlementAmount": 2500,
    "rate": null,
    "quotedAt": null
  }
}
```

Show “2,500.00 USD”. Do not show a naira line.

If the rate cannot be loaded, the message is `Could not fetch payout rate`. Keep the form usable and ask the employer to try the quote again. If the currency does not match the country, the message is `Payroll currency must be USD or the local currency for this country`.

## 2. Add a team member

`POST /teams/add`

Same body as today. `amount` is still a string. `currency` still accepts `USD` and `USDC`. It now also accepts a local code from the table.

Marvelous, if he were added again on a naira salary. The success body does not change:

```json
{
  "firstName": "Marvelous",
  "lastName": "Afolabi",
  "country": "Nigeria",
  "email": "afosmarvel+10@gmail.com",
  "role": "Engineer",
  "department": "Tech",
  "type": "EMPLOYEE",
  "startDate": "2026-03-29",
  "amount": "250000",
  "frequency": "MONTHLY",
  "currency": "NGN"
}
```

```json
{
  "status": true,
  "statusCode": 201,
  "message": "Team member invited",
  "data": {
    "message": "Team member invited",
    "email": "afosmarvel+10@gmail.com",
    "membershipId": "59430659-b064-46d7-8ab8-3cda07aeeea1"
  }
}
```

What is stored: `amount` on the payroll record becomes the dollar settlement, and `currency` stays `USDC`, so payroll keeps running. `localAmount` 250000 and `localCurrency` `NGN` are stored beside that. The client does not send the dollar figure.

Leaving currency as USD, which is Acme’s current Marvelous salary, is unchanged:

```json
{
  "firstName": "Marvelous",
  "lastName": "Afolabi",
  "country": "Nigeria",
  "email": "afosmarvel+10@gmail.com",
  "role": "Engineer",
  "department": "Tech",
  "type": "EMPLOYEE",
  "startDate": "2026-03-29",
  "amount": "2500",
  "frequency": "MONTHLY",
  "currency": "USD"
}
```

That stores amount `2500`, currency `USDC`, and no local fields.

CSV upload uses the same columns as today (`amount`, `currency`). `NGN` is accepted in the currency column when the country is Nigeria. `USD` and `USDC` stay valid for every country.

## 3. Edit a salary

`PATCH /teams/44d5a250-042b-42df-a4d2-ab6239910a82`

Send `amount` and `currency` together when the salary currency changes. A naira edit re-quotes. A USD edit clears the local fields and the member’s screens go back to dollars.

```json
{
  "amount": "250000",
  "currency": "NGN"
}
```

## 4. Team home

`GET /team/me`

Header `x-company-id: 40425a49-cb75-4a76-a5b2-bbee2ca70a72`

Nurudeen’s account **today** has a dollar salary, so the payload is the one the app already reads. `wallet.balance` is the live wallet figure, 2.20. No local fields are present. Keep rendering `incomingPayrollAmount` as the incoming salary.

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Team details retrieved",
  "data": {
    "id": "15c689dd-4703-4d94-993b-f9472f4581a4",
    "firstName": "Nurudeen",
    "lastName": "Rabiu",
    "email": "nrabiu705@gmail.com",
    "country": "Nigeria",
    "wallet": {
      "id": "d616324b-1b8b-4e4b-8b78-92facb5fea7a",
      "balance": 2.2
    },
    "companies": [
      {
        "company": {
          "id": "40425a49-cb75-4a76-a5b2-bbee2ca70a72",
          "name": "Acme",
          "country": "Nigeria"
        },
        "membership": {
          "status": "ACTIVE",
          "department": "Tech",
          "role": "CTO",
          "type": "EMPLOYEE",
          "startDate": "2026-04-13T00:00:00.000Z"
        },
        "payroll": {
          "amount": 150,
          "frequency": "MONTHLY",
          "currency": "USDC"
        },
        "incomingPayrollAmount": 150,
        "incomingPayrollDate": "2026-04-13T00:00:00.000Z"
      }
    ]
  }
}
```

Other existing keys (`kycStatus`, `bridgeKycStatus`, `offrampKycStatus`, `contract`, and the rest) are still returned. They are omitted above only to keep the sample short.

After a naira salary is saved, the same call adds fields and does not rename the old ones. `incomingPayrollAmount` and `payroll.amount` remain the dollar amount that will be paid. Show the naira figure as the salary label.

```json
{
  "wallet": {
    "id": "b9b61f5e-ccbd-4b21-a1d3-1863ecdf1fc3",
    "balance": 0,
    "localBalance": 0,
    "localCurrency": "NGN"
  },
  "companies": [
    {
      "payroll": {
        "amount": 186.42,
        "frequency": "MONTHLY",
        "currency": "USDC",
        "localAmount": 250000,
        "localCurrency": "NGN",
        "fxRate": 1341.05,
        "fxQuotedAt": "2026-10-05T00:30:00.000Z"
      },
      "incomingPayrollAmount": 186.42,
      "incomingPayrollLocalAmount": 250000,
      "incomingPayrollLocalCurrency": "NGN"
    }
  ]
}
```

Display rules:

- `wallet.balance` is always the dollar balance. Marvelous is 0 today. Nurudeen is 2.20.
- Show `wallet.localBalance` and `wallet.localCurrency` only when both are present. That balance is the dollar balance converted at the current rate, not the rate from the day the salary was saved.
- Show `incomingPayrollLocalAmount` as the incoming salary when it is present. Otherwise show `incomingPayrollAmount` as dollars.
- If the live rate fails, `balance` is still returned. `localBalance` is then based on the last rate saved with the salary, when one exists.

`payroll.amount` for Acme today is a whole number (2500, 150, 500, 300, 2000, 100) because those salaries were entered in dollars. After a naira salary, `payroll.amount` can include cents. Keep treating it as a number.

## 5. Pay now

`POST /payroll-groups/pay-now/44d5a250-042b-42df-a4d2-ab6239910a82`

`amount` is still optional. If you omit it, Acme pays Marvelous his saved salary: **2500** dollars. That behaviour does not change.

To send naira, pass `currency`. The fee is calculated on the dollar equivalent, then that dollar amount is what lands in the member wallet.

```json
{
  "verificationCode": "123456",
  "amount": 250000,
  "currency": "NGN"
}
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payroll paid successfully",
  "data": {
    "ledgerEntryId": "generated-id",
    "teamId": "44d5a250-042b-42df-a4d2-ab6239910a82",
    "amount": 186.42,
    "date": "2026-10-05T00:30:00.000Z",
    "localAmount": 250000,
    "localCurrency": "NGN"
  }
}
```

`data.amount` is still the dollars credited. That is the field existing screens should keep using. Show `localAmount` and `localCurrency` as the amount the employer typed when they are present.

Paying Nurudeen 150 dollars, including when his country is Nigeria:

```json
{
  "verificationCode": "123456",
  "amount": 150,
  "currency": "USD"
}
```

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Payroll paid successfully",
  "data": {
    "ledgerEntryId": "generated-id",
    "teamId": "15c689dd-4703-4d94-993b-f9472f4581a4",
    "amount": 150,
    "date": "2026-10-05T00:30:00.000Z"
  }
}
```

No `localAmount` on that response. Omitting `currency` is the same as USD: `amount` is dollars.

`POST /payroll-groups/:id/pay-now/:teamId` accepts the same body.

## 6. Team withdrawal quote

`POST /team/wallet/offramp/fiat/quote`

Team token, plus `x-company-id`.

`amount` is still the dollar amount when `currency` is omitted, `USD`, or `USDC`. The response fields you already use stay: `currency`, `rate`, `amountReceived`, `amountUsdc`, `netUsdc`, `feeUsdc`, `feePercent`, `feeLocal`.

Nurudeen withdrawing 2.20 dollars, which is his full Acme balance, and his bank is already NGN:

```json
{
  "amount": 2.2
}
```

The response is the current quote. Do not add local input fields to the screen in this case. Label the typed amount as USD.

To let him type naira instead, send his saved bank currency. For Marvelous and Nurudeen that currency is `NGN`.

```json
{
  "amount": 250000,
  "currency": "NGN"
}
```

The server converts 250,000 NGN to dollars, then applies the existing cash-out fee to those dollars. The response keeps the current fields and adds two:

```json
{
  "status": true,
  "statusCode": 200,
  "message": "Off-ramp quote fetched",
  "data": {
    "currency": "NGN",
    "rate": 1341.05,
    "amountReceived": 249502.34,
    "amountUsdc": 186.42,
    "netUsdc": 186.05,
    "feeUsdc": 0.37,
    "feePercent": 0.2,
    "feeLocal": 496.19,
    "inputAmount": 250000,
    "inputCurrency": "NGN"
  }
}
```

Use the returned `amountReceived` as the estimated bank credit. Use `inputAmount` as what the member typed. Use `amountUsdc` as the wallet debit, which is what the app already shows as the dollar total. The numbers above are the shape. Bind the inputs to the live quote.

`POST /team/wallet/offramp/fiat` and `POST /team/wallet/offramp/fiat/dry-run` take the same `amount` and optional `currency`, plus the verification code and optional reason they already take. A dollar withdrawal does not send `currency`.

If `currency` is not USD and not the saved bank currency, the message is `Withdrawal currency must be USD or the saved bank currency`. Marvelous cannot quote GHS while his payout account is NGN.

## 7. Transactions

Dollar rows stay as they are. A local salary or a local withdrawal adds `localAmount` and `localCurrency` beside the existing `amount` and `currency`.

Team history, `GET /team/transactions`, with the Acme header. A payroll credit for a naira salary:

```json
{
  "payrollDate": "2026-10-05T00:30:00.000Z",
  "amount": 186.42,
  "currency": "USDC",
  "status": "success",
  "frequency": "MONTHLY",
  "type": "payroll",
  "direction": "credit",
  "localAmount": 250000,
  "localCurrency": "NGN"
}
```

Nurudeen’s current dollar activity does not include `localAmount`. Keep showing `amount` and `currency` for those rows.

Company people and company wallet feeds (`GET /wallet/transactions/feed`) keep `amount` and `currency`. When the payment was typed in naira, the same row also includes:

```json
{
  "localAmount": "250,000.00",
  "localCurrency": "NGN"
}
```

`localAmount` on those feeds is a formatted string, matching how `amount` is already formatted there.

## 8. What the emails say

Team withdrawal emails show one amount, in the currency that was typed: `250,000.00 NGN` or `2.20 USD`. They do not say USDC. Company cash-out emails are unchanged.

## 9. What not to change

- Do not stop sending the current add-member, pay-now, or withdrawal bodies. Dollar calls stay valid if `currency` is left off.
- Do not rename `amount`, `currency`, `incomingPayrollAmount`, or `wallet.balance`.
- Do not write NGN into the currency field of a dollar salary. The stored payroll currency remains `USDC`. Read `localCurrency` when you need the label.
- Do not change company withdrawal screens or requests.
