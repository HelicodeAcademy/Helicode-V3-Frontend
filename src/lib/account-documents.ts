import { format, parseISO } from "date-fns";
import { jsPDF } from "jspdf";
import type { AccountStatement } from "./accounts-service";
import { formatAccountMoney } from "./account-format";

function fileDate(value: string) {
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return "statement";
  return format(date, "yyyy-MM-dd");
}

function rowDate(value: string) {
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadStatementPdf(statement: AccountStatement) {
  const pdf = new jsPDF();
  const currency = statement.account.currency;
  const accountName = statement.account.details.accountName || statement.account.name;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(`${statement.account.name} statement`, 16, 20);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(102, 116, 133);
  pdf.text(accountName, 16, 28);
  pdf.text(
    `${rowDate(statement.period.from)} – ${rowDate(statement.period.to)}`,
    16,
    34,
  );

  pdf.setTextColor(16, 24, 40);
  const summary = [
    ["Opening balance", formatAccountMoney(statement.openingBalance, statement.currency)],
    ["Money in", formatAccountMoney(statement.moneyIn, statement.currency)],
    ["Money out", formatAccountMoney(statement.moneyOut, statement.currency)],
    ["Closing balance", formatAccountMoney(statement.closingBalance, statement.currency)],
  ];
  let y = 48;
  summary.forEach(([label, value]) => {
    pdf.setFont("helvetica", "normal");
    pdf.text(label, 16, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(value, 70, y);
    y += 7;
  });

  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Date", 16, y);
  pdf.text("Description", 46, y);
  pdf.text("In", 130, y);
  pdf.text("Out", 155, y);
  pdf.text("Balance", 176, y);
  y += 6;
  pdf.setFont("helvetica", "normal");

  statement.rows.forEach((row) => {
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
    const description = pdf.splitTextToSize(row.description || "—", 78);
    pdf.text(rowDate(row.date), 16, y);
    pdf.text(description, 46, y);
    pdf.text(row.moneyIn ? formatAccountMoney(row.moneyIn, statement.currency) : "—", 130, y);
    pdf.text(row.moneyOut ? formatAccountMoney(row.moneyOut, statement.currency) : "—", 155, y);
    pdf.text(
      row.balance ? formatAccountMoney(row.balance, statement.currency) : "—",
      176,
      y,
    );
    y += Math.max(6, description.length * 4 + 2);
  });

  pdf.save(
    `statement-${currency}-${fileDate(statement.period.from)}.pdf`,
  );
}

export function downloadAccountLetter(
  currency: string,
  title: string,
  fields: { label: string; value: string }[],
) {
  const pdf = new jsPDF();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(title, 16, 22);
  pdf.setFontSize(11);
  let y = 38;
  fields.forEach((field) => {
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(102, 116, 133);
    pdf.text(field.label, 16, y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(16, 24, 40);
    const lines = pdf.splitTextToSize(field.value, 170);
    pdf.text(lines, 16, y + 6);
    y += 8 + lines.length * 6;
  });
  pdf.save(`${currency.toLowerCase()}-account-letter.pdf`);
}
