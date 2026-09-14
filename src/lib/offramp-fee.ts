/**
 * Shared off-ramp fee fields returned on quote / dry-run / initiate responses.
 * Prefer these over client-side fee math. `amountReceived` is already net of fee.
 */
export interface OfframpFeeFields {
  amountUsdc: number;
  feePercent: number;
  feeUsdc: number;
  netUsdc: number;
  /** Present on bank / MoMo quotes only (feeUsdc * rate). */
  feeLocal?: number;
}

export interface OfframpFiatQuote extends OfframpFeeFields {
  currency: string;
  rate: number;
  amountReceived: number;
}

export interface OfframpCryptoQuote extends OfframpFeeFields {
  currency: string;
  amountReceived: number;
}

export function formatUsdc(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function formatLocalAmount(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}
