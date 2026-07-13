// Mock data for the Tax & Compliance dashboard section.
// Replace with real API calls once the backend endpoints are available.

export type CountryCode = "NG" | "KE" | "ZA";

export type MarketStage = "live" | "in-build" | "planned";

export type ExceptionSeverity = "critical" | "warning" | "info";

export type DeadlineStatus = "Overdue" | "Due today" | "Filed" | "Scheduled";

export interface CountryProfile {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  employeeCount: number;
}

export const countries: CountryProfile[] = [
  {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    employeeCount: 164,
  },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES", employeeCount: 58 },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    currency: "ZAR",
    employeeCount: 41,
  },
];

export interface ComplianceOverview {
  status: "attention" | "ok" | "critical";
  statutoryLiabilityLabel: string;
  filingsDueCount: number;
  filingsDueWindowDays: number;
  filingsDueNote: string;
  payslipsGenerated: number;
  payslipsTotal: number;
  payslipsPending: number;
  exceptionsCount: number;
}

export const overviewByCountry: Record<CountryCode, ComplianceOverview> = {
  NG: {
    status: "attention",
    statutoryLiabilityLabel: "₦48.2M",
    filingsDueCount: 4,
    filingsDueWindowDays: 14,
    filingsDueNote: "1 overdue — NHF June remittance",
    payslipsGenerated: 212,
    payslipsTotal: 218,
    payslipsPending: 6,
    exceptionsCount: 3,
  },
  KE: {
    status: "attention",
    statutoryLiabilityLabel: "KES 2,148,600",
    filingsDueCount: 3,
    filingsDueWindowDays: 14,
    filingsDueNote: "1 overdue — NSSF July remittance",
    payslipsGenerated: 55,
    payslipsTotal: 58,
    payslipsPending: 3,
    exceptionsCount: 2,
  },
  ZA: {
    status: "attention",
    statutoryLiabilityLabel: "R615K",
    filingsDueCount: 4,
    filingsDueWindowDays: 14,
    filingsDueNote: "1 overdue — NHF June remittance",
    payslipsGenerated: 38,
    payslipsTotal: 41,
    payslipsPending: 3,
    exceptionsCount: 3,
  },
};

export interface ComplianceException {
  id: string;
  title: string;
  description: string;
  severity: ExceptionSeverity;
  action: string;
}

export const exceptionsByCountry: Record<CountryCode, ComplianceException[]> = {
  NG: [
    {
      id: "ng-1",
      title: "6 employees missing Tax ID (TIN)",
      description:
        "PAYE cannot be remitted and payslips cannot be issued for these employees.",
      severity: "critical",
      action: "Review",
    },
    {
      id: "ng-2",
      title: "NHF June remittance overdue",
      description:
        "Due 30 Jun 2026 · ₦1,280,500 outstanding — penalties may apply.",
      severity: "critical",
      action: "Remit now",
    },
    {
      id: "ng-3",
      title: "2 salary rate changes pending approval",
      description:
        "Effective 1 Jul 2026 — must be approved before this run is finalized.",
      severity: "warning",
      action: "Approve",
    },
    {
      id: "ng-4",
      title: "Kenya SHIF rate table updated",
      description:
        "New statutory rate table applied automatically, effective 1 Jul 2026.",
      severity: "info",
      action: "View",
    },
  ],
  KE: [
    {
      id: "ke-1",
      title: "4 employees missing KRA PIN",
      description:
        "PAYE filings will be rejected without a valid KRA PIN on file.",
      severity: "critical",
      action: "Review",
    },
    {
      id: "ke-2",
      title: "NSSF July remittance overdue",
      description: "Due 09 Jul 2026 · KES 412,300 outstanding.",
      severity: "critical",
      action: "Remit now",
    },
    {
      id: "ke-3",
      title: "SHIF rate table updated",
      description:
        "New statutory rate table applied automatically from 1 Jul 2026.",
      severity: "info",
      action: "View",
    },
  ],
  ZA: [
    {
      id: "za-1",
      title: "6 employees missing Tax ID (TIN)",
      description:
        "PAYE cannot be remitted and payslips cannot be issued for these employees.",
      severity: "critical",
      action: "Review",
    },
    {
      id: "za-2",
      title: "NHF June remittance overdue",
      description:
        "Due 30 Jun 2026 · R220,500 outstanding — penalties may apply.",
      severity: "critical",
      action: "Remit now",
    },
    {
      id: "za-3",
      title: "2 salary rate changes pending approval",
      description:
        "Effective 1 Jul 2026 — must be approved before this run is finalized.",
      severity: "warning",
      action: "Approve",
    },
  ],
};

export interface StatutoryDeadline {
  id: string;
  obligation: string;
  country: CountryCode | "GH";
  due: string;
  status: DeadlineStatus | string;
}

export const upcomingDeadlines: StatutoryDeadline[] = [
  {
    id: "d1",
    obligation: "NHF remittance",
    country: "NG",
    due: "30 Jun",
    status: "Overdue",
  },
  {
    id: "d2",
    obligation: "PAYE remittance",
    country: "KE",
    due: "10 Jul",
    status: "Due today",
  },
  {
    id: "d3",
    obligation: "EMP201 (PAYE/UIF/SDL)",
    country: "ZA",
    due: "7 Jul",
    status: "Filed 06 Jul",
  },
  {
    id: "d4",
    obligation: "PAYE / NSSF / SHIF / AHL remittance",
    country: "KE",
    due: "9 Jul",
    status: "Filed 06 Jul",
  },
  {
    id: "d5",
    obligation: "SSNIT contribution",
    country: "GH",
    due: "14 Jul",
    status: "Scheduled",
  },
  {
    id: "d6",
    obligation: "PAYE remittance",
    country: "NG",
    due: "15 Jul",
    status: "Scheduled",
  },
];

export interface LiabilityRow {
  country: CountryCode | "GH";
  countryName: string;
  employees: number;
  paye: string;
  socialSecurity: string;
  otherStatutory: string;
  employerCost: string;
  totalRemittance: string;
}

export const liabilityByCountry: LiabilityRow[] = [
  {
    country: "NG",
    countryName: "Nigeria",
    employees: 164,
    paye: "N21,430,200",
    socialSecurity: "N14,892,600",
    otherStatutory: "N2,690,900",
    employerCost: "N6,890,300",
    totalRemittance: "N48,213,900",
  },
  {
    country: "KE",
    countryName: "Kenya",
    employees: 58,
    paye: "KES 2,148,600",
    socialSecurity: "KES 618,400",
    otherStatutory: "KES 611,300",
    employerCost: "KES 734,100",
    totalRemittance: "KES 4,612,500",
  },
  {
    country: "ZA",
    countryName: "South Africa",
    employees: 41,
    paye: "R42,000",
    socialSecurity: "R8,900",
    otherStatutory: "R6,940",
    employerCost: "R9,640",
    totalRemittance: "R815,100",
  },
  {
    country: "GH",
    countryName: "Ghana",
    employees: 22,
    paye: "GHS34,890",
    socialSecurity: "GHS9,640",
    otherStatutory: "GHS4,900",
    employerCost: "GHS9,640",
    totalRemittance: "GHS249,270",
  },
];

export interface TaxBand {
  band: string;
  rate: string;
}

export const payeBandsByCountry: Record<CountryCode, TaxBand[]> = {
  ZA: [
    { band: "First 237,100", rate: "18%" },
    { band: "Next 133,600", rate: "26%" },
    { band: "Next 142,300", rate: "31%" },
    { band: "Next 180,200", rate: "36%" },
    { band: "Next 184,900", rate: "39%" },
    { band: "Next 909,100", rate: "41%" },
    { band: "Above 1,817,000", rate: "45%" },
  ],
  NG: [
    { band: "First ₦800,000", rate: "0%" },
    { band: "Next ₦2,200,000", rate: "15%" },
    { band: "Next ₦9,000,000", rate: "18%" },
    { band: "Next ₦13,000,000", rate: "21%" },
    { band: "Next ₦25,000,000", rate: "23%" },
    { band: "Above ₦50,000,000", rate: "25%" },
  ],
  KE: [
    { band: "First KES 288,000", rate: "10%" },
    { band: "Next KES 100,000", rate: "25%" },
    { band: "Next KES 5,600,000", rate: "30%" },
    { band: "Next KES 3,600,000", rate: "32.5%" },
    { band: "Above KES 9,600,000", rate: "35%" },
  ],
};

export interface StatutoryDeduction {
  deduction: string;
  legalBasis: string;
  employer: string;
  employee: string;
  basis: string;
  status: "Active" | "Updated" | "Inactive";
}

export const statutoryDeductionsByCountry: Record<
  CountryCode,
  StatutoryDeduction[]
> = {
  ZA: [
    {
      deduction: "UIF",
      legalBasis: "Unemployment Insurance Act",
      employer: "1%",
      employee: "1%",
      basis: "Gross pay, capped",
      status: "Active",
    },
    {
      deduction: "SDL",
      legalBasis: "Skills Development Levy Act",
      employer: "1%",
      employee: "—",
      basis: "Total payroll",
      status: "Active",
    },
    {
      deduction: "PAYE",
      legalBasis: "Income Tax Act",
      employer: "—",
      employee: "Progressive",
      basis: "Taxable income",
      status: "Updated",
    },
  ],
  NG: [
    {
      deduction: "PAYE",
      legalBasis: "Personal Income Tax Act",
      employer: "—",
      employee: "Progressive",
      basis: "Taxable income",
      status: "Active",
    },
    {
      deduction: "Pension (RSA)",
      legalBasis: "Pension Reform Act",
      employer: "10%",
      employee: "8%",
      basis: "Basic + housing + transport",
      status: "Active",
    },
    {
      deduction: "NHF",
      legalBasis: "National Housing Fund Act",
      employer: "—",
      employee: "2.5%",
      basis: "Basic salary",
      status: "Active",
    },
    {
      deduction: "NSITF",
      legalBasis: "Employees' Compensation Act",
      employer: "1%",
      employee: "—",
      basis: "Total payroll",
      status: "Active",
    },
  ],
  KE: [
    {
      deduction: "PAYE",
      legalBasis: "Income Tax Act",
      employer: "—",
      employee: "Progressive",
      basis: "Taxable income",
      status: "Active",
    },
    {
      deduction: "NSSF (Tier I & II)",
      legalBasis: "NSSF Act 2013",
      employer: "6%",
      employee: "6%",
      basis: "Pensionable pay, capped",
      status: "Active",
    },
    {
      deduction: "SHIF",
      legalBasis: "Social Health Insurance Act",
      employer: "—",
      employee: "2.75%",
      basis: "Gross pay",
      status: "Updated",
    },
    {
      deduction: "AHL",
      legalBasis: "Affordable Housing Act",
      employer: "1.5%",
      employee: "1.5%",
      basis: "Gross pay",
      status: "Active",
    },
  ],
};

export interface VariablePayItem {
  id: string;
  employee: string;
  element: string;
  amount: string;
  taxable: boolean;
  status: "Approved" | "Pending approval";
}

export const variablePayByCountry: Record<CountryCode, VariablePayItem[]> = {
  ZA: [
    {
      id: "vp1",
      employee: "Adaeze Okonkwo",
      element: "Performance bonus",
      amount: "R50,000",
      taxable: true,
      status: "Approved",
    },
    {
      id: "vp2",
      employee: "Tunde Bakare",
      element: "Overtime (18 hrs)",
      amount: "R6,750",
      taxable: true,
      status: "Approved",
    },
    {
      id: "vp3",
      employee: "Wanjiru Kamau",
      element: "Sales commission",
      amount: "KES 210,000",
      taxable: true,
      status: "Approved",
    },
    {
      id: "vp4",
      employee: "Thabo Nkosi",
      element: "13th cheque",
      amount: "R42,000",
      taxable: true,
      status: "Pending approval",
    },
    {
      id: "vp5",
      employee: "Kofi Mensah",
      element: "Salary arrears (May)",
      amount: "GH₵4,200",
      taxable: true,
      status: "Approved",
    },
    {
      id: "vp6",
      employee: "Ngozi Eze",
      element: "Reimbursement — travel",
      amount: "₦124,900",
      taxable: false,
      status: "Approved",
    },
  ],
  NG: [
    {
      id: "vp1",
      employee: "Ngozi Eze",
      element: "Reimbursement — travel",
      amount: "₦124,900",
      taxable: false,
      status: "Approved",
    },
    {
      id: "vp2",
      employee: "Adaeze Okonkwo",
      element: "Performance bonus",
      amount: "₦850,000",
      taxable: true,
      status: "Approved",
    },
    {
      id: "vp3",
      employee: "Tunde Bakare",
      element: "Overtime (18 hrs)",
      amount: "₦96,750",
      taxable: true,
      status: "Pending approval",
    },
  ],
  KE: [
    {
      id: "vp1",
      employee: "Wanjiru Kamau",
      element: "Sales commission",
      amount: "KES 210,000",
      taxable: true,
      status: "Approved",
    },
    {
      id: "vp2",
      employee: "Achieng Otieno",
      element: "Overtime (12 hrs)",
      amount: "KES 38,400",
      taxable: true,
      status: "Pending approval",
    },
  ],
};

export interface FilingRow {
  id: string;
  obligation: string;
  country: CountryCode | "GH";
  authority: string;
  dueDate: string;
  amount: string;
  status: "Overdue" | "Due today" | "Filed" | "Scheduled";
  actionLabel: string;
}

export const filings: FilingRow[] = [
  {
    id: "f1",
    obligation: "NHF remittance",
    country: "NG",
    authority: "Federal Mortgage Bank",
    dueDate: "30 Jun 2026",
    amount: "N1,284,500",
    status: "Overdue",
    actionLabel: "Remit",
  },
  {
    id: "f2",
    obligation: "PAYE remittance",
    country: "KE",
    authority: "State IRS (LRS)",
    dueDate: "10 Jul 2026",
    amount: "N20,918,200",
    status: "Due today",
    actionLabel: "Remit",
  },
  {
    id: "f3",
    obligation: "Pension contributions",
    country: "NG",
    authority: "PFAs via PenCom",
    dueDate: "07 Jul 2026",
    amount: "N14,514,200",
    status: "Filed",
    actionLabel: "Receipt",
  },
  {
    id: "f4",
    obligation: "EMP201 (PAYE/UIF/SDL)",
    country: "ZA",
    authority: "SARS eFiling",
    dueDate: "07 Jul 2026",
    amount: "R51,007",
    status: "Filed",
    actionLabel: "Receipt",
  },
  {
    id: "f5",
    obligation: "NSSF / SHIF / AHL remittance",
    country: "KE",
    authority: "NSSF / SHIF / AHL",
    dueDate: "09 Jul 2026",
    amount: "KES 1,893,400",
    status: "Filed",
    actionLabel: "Receipt",
  },
  {
    id: "f6",
    obligation: "SSNIT contribution",
    country: "GH",
    authority: "SSNIT",
    dueDate: "14 Jul 2026",
    amount: "GH₵9,370",
    status: "Scheduled",
    actionLabel: "Prepare",
  },
  {
    id: "f7",
    obligation: "PAYE remittance",
    country: "NG",
    authority: "State IRS",
    dueDate: "15 Jul 2026",
    amount: "N18,600,900",
    status: "Scheduled",
    actionLabel: "Prepare",
  },
];

export interface ReconciliationRow {
  component: string;
  prevPeriod: string;
  currentPeriod: string;
  variance: string;
  varianceDirection: "up" | "down" | "flat";
  comment: string;
}

export const reconciliationByCountry: Record<CountryCode, ReconciliationRow[]> =
  {
    NG: [
      {
        component: "Gross pay",
        prevPeriod: "N128,410,000",
        currentPeriod: "N134,270,000",
        variance: "+4.6%",
        varianceDirection: "up",
        comment: "2 new hires, bonuses",
      },
      {
        component: "Variable pay",
        prevPeriod: "N2,140,000",
        currentPeriod: "N4,890,000",
        variance: "+128.5%",
        varianceDirection: "up",
        comment: "Mid-year performance bonus",
      },
      {
        component: "PAYE",
        prevPeriod: "N20,914,600",
        currentPeriod: "N21,430,200",
        variance: "+2.5%",
        varianceDirection: "up",
        comment: "Rate change effective 1 Jul",
      },
      {
        component: "Pension (EE + ER)",
        prevPeriod: "N14,614,200",
        currentPeriod: "N14,892,600",
        variance: "+1.9%",
        varianceDirection: "up",
        comment: "",
      },
      {
        component: "NHF",
        prevPeriod: "N1,284,600",
        currentPeriod: "N1,310,200",
        variance: "+2.0%",
        varianceDirection: "up",
        comment: "",
      },
      {
        component: "Net pay",
        prevPeriod: "N89,120,600",
        currentPeriod: "N93,684,100",
        variance: "+5.1%",
        varianceDirection: "up",
        comment: "",
      },
    ],
    KE: [
      {
        component: "Gross pay",
        prevPeriod: "KES 41,200,000",
        currentPeriod: "KES 42,890,000",
        variance: "+4.1%",
        varianceDirection: "up",
        comment: "1 new hire",
      },
      {
        component: "PAYE",
        prevPeriod: "KES 2,090,400",
        currentPeriod: "KES 2,148,600",
        variance: "+2.8%",
        varianceDirection: "up",
        comment: "",
      },
      {
        component: "NSSF",
        prevPeriod: "KES 601,200",
        currentPeriod: "KES 618,400",
        variance: "+2.9%",
        varianceDirection: "up",
        comment: "",
      },
      {
        component: "Net pay",
        prevPeriod: "KES 34,610,000",
        currentPeriod: "KES 36,010,900",
        variance: "+4.0%",
        varianceDirection: "up",
        comment: "",
      },
    ],
    ZA: [
      {
        component: "Gross pay",
        prevPeriod: "R2,410,000",
        currentPeriod: "R2,510,000",
        variance: "+4.1%",
        varianceDirection: "up",
        comment: "13th cheque accrual",
      },
      {
        component: "PAYE",
        prevPeriod: "R408,900",
        currentPeriod: "R420,000",
        variance: "+2.7%",
        varianceDirection: "up",
        comment: "",
      },
      {
        component: "UIF",
        prevPeriod: "R24,100",
        currentPeriod: "R25,100",
        variance: "+4.1%",
        varianceDirection: "up",
        comment: "",
      },
      {
        component: "Net pay",
        prevPeriod: "R1,890,000",
        currentPeriod: "R1,964,300",
        variance: "+3.9%",
        varianceDirection: "up",
        comment: "",
      },
    ],
  };

export interface PayslipRow {
  id: string;
  employee: string;
  country: CountryCode;
  payPeriod: string;
  netPay: string;
  status: "Generated" | "Pending" | "Failed";
  reason?: string;
}

export const payslipsByCountry: Record<CountryCode, PayslipRow[]> = {
  NG: [
    {
      id: "p1",
      employee: "Adaeze Okonkwo",
      country: "NG",
      payPeriod: "Jul 2026",
      netPay: "N612,400",
      status: "Generated",
    },
    {
      id: "p2",
      employee: "Tunde Bakare",
      country: "NG",
      payPeriod: "Jul 2026",
      netPay: "N488,100",
      status: "Generated",
    },
    {
      id: "p3",
      employee: "Ngozi Eze",
      country: "NG",
      payPeriod: "Jul 2026",
      netPay: "N701,900",
      status: "Generated",
    },
    {
      id: "p4",
      employee: "Chidi Umeh",
      country: "NG",
      payPeriod: "Jul 2026",
      netPay: "—",
      status: "Pending",
      reason: "Missing Tax ID (TIN)",
    },
    {
      id: "p5",
      employee: "Blessing Nnamdi",
      country: "NG",
      payPeriod: "Jul 2026",
      netPay: "—",
      status: "Pending",
      reason: "Missing Tax ID (TIN)",
    },
    {
      id: "p6",
      employee: "Ifeanyi Obi",
      country: "NG",
      payPeriod: "Jul 2026",
      netPay: "—",
      status: "Failed",
      reason: "Bank account verification failed",
    },
  ],
  KE: [
    {
      id: "p7",
      employee: "Wanjiru Kamau",
      country: "KE",
      payPeriod: "Jul 2026",
      netPay: "KES 148,200",
      status: "Generated",
    },
    {
      id: "p8",
      employee: "Achieng Otieno",
      country: "KE",
      payPeriod: "Jul 2026",
      netPay: "KES 132,900",
      status: "Generated",
    },
    {
      id: "p9",
      employee: "Kiptoo Rono",
      country: "KE",
      payPeriod: "Jul 2026",
      netPay: "—",
      status: "Pending",
      reason: "Missing KRA PIN",
    },
  ],
  ZA: [
    {
      id: "p10",
      employee: "Thabo Nkosi",
      country: "ZA",
      payPeriod: "Jul 2026",
      netPay: "R38,400",
      status: "Generated",
    },
    {
      id: "p11",
      employee: "Lerato Dube",
      country: "ZA",
      payPeriod: "Jul 2026",
      netPay: "R41,900",
      status: "Generated",
    },
    {
      id: "p12",
      employee: "Sipho Ndlovu",
      country: "ZA",
      payPeriod: "Jul 2026",
      netPay: "—",
      status: "Pending",
      reason: "Missing Tax ID (TIN)",
    },
  ],
};

export interface CoverageMarket {
  code: string;
  name: string;
  flag: string;
  stage: MarketStage;
  detail: string;
  targetQuarter?: string;
}

export const coverageMarkets: CoverageMarket[] = [
  {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    stage: "live",
    detail: "164 employees on payroll",
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    stage: "live",
    detail: "58 employees on payroll",
  },
  {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    stage: "live",
    detail: "18 employees on payroll",
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    stage: "live",
    detail: "41 employees on payroll",
  },
  {
    code: "UG",
    name: "Uganda",
    flag: "🇺🇬",
    stage: "in-build",
    detail: "Target Q3 2026 · PAYE, NSSF",
    targetQuarter: "Q3 2026",
  },
  {
    code: "TZ",
    name: "Tanzania",
    flag: "🇹🇿",
    stage: "in-build",
    detail: "Target Q3 2026 · PAYE, NSSF, SDL",
    targetQuarter: "Q3 2026",
  },
  {
    code: "RW",
    name: "Rwanda",
    flag: "🇷🇼",
    stage: "in-build",
    detail: "Target Q3 2026 · PAYE, RSSB",
    targetQuarter: "Q3 2026",
  },
  {
    code: "ZM",
    name: "Zambia",
    flag: "🇿🇲",
    stage: "in-build",
    detail: "Target Q3 2026 · PAYE, NAPSA",
    targetQuarter: "Q3 2026",
  },
  {
    code: "BW",
    name: "Botswana",
    flag: "🇧🇼",
    stage: "planned",
    detail: "PAYE, register interest",
  },
  {
    code: "MW",
    name: "Malawi",
    flag: "🇲🇼",
    stage: "planned",
    detail: "PAYE, pension, register interest",
  },
  {
    code: "SN",
    name: "Senegal",
    flag: "🇸🇳",
    stage: "planned",
    detail: "IR, PVID, register interest",
  },
  {
    code: "CI",
    name: "Ivory Coast",
    flag: "🇨🇮",
    stage: "planned",
    detail: "ITS, CNPS, register interest",
  },
  {
    code: "BJ",
    name: "Benin",
    flag: "🇧🇯",
    stage: "planned",
    detail: "ITS, CNSS, register interest",
  },
];

export const payPeriods = ["May 2026", "June 2026", "July 2026 (open)"];
