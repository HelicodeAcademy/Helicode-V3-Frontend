export type Option = { value: string; label: string };

export const COUNTRIES: Option[] = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "EG", label: "Egypt" },
  { value: "ET", label: "Ethiopia" },
  { value: "TZ", label: "Tanzania" },
  { value: "UG", label: "Uganda" },
  { value: "RW", label: "Rwanda" },
  { value: "SN", label: "Senegal" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "CM", label: "Cameroon" },
  { value: "AO", label: "Angola" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
  { value: "MZ", label: "Mozambique" },
  { value: "MG", label: "Madagascar" },
  { value: "BJ", label: "Benin" },
  { value: "BF", label: "Burkina Faso" },
  { value: "ML", label: "Mali" },
  { value: "NE", label: "Niger" },
  { value: "TD", label: "Chad" },
  { value: "SD", label: "Sudan" },
  { value: "LY", label: "Libya" },
  { value: "MA", label: "Morocco" },
  { value: "TN", label: "Tunisia" },
  { value: "DZ", label: "Algeria" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "OTHER", label: "Other" },
];

export const TEAM_SIZES: Option[] = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "500+", label: "500+ employees" },
];

export const PAYROLL_VOLUMES: Option[] = [
  { value: "under-50k", label: "Under $50,000" },
  { value: "50k-250k", label: "$50,000 – $250,000" },
  { value: "250k-1m", label: "$250,000 – $1M" },
  { value: "1m-5m", label: "$1M – $5M" },
  { value: "5m-20m", label: "$5M – $20M" },
  { value: "20m+", label: "$20M+" },
];

// ─── Hire Talent constants

export const ROLE_TYPES: Option[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const SENIORITY_LEVELS: Option[] = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "vp", label: "VP / Head of" },
  { value: "c-suite", label: "C-Suite / Executive" },
];

export const WORK_ARRANGEMENTS: Option[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export const SALARY_RANGES: Option[] = [
  { value: "under-1k", label: "Under $1,000 / mo" },
  { value: "1k-2k", label: "$1,000 – $2,000 / mo" },
  { value: "2k-4k", label: "$2,000 – $4,000 / mo" },
  { value: "4k-7k", label: "$4,000 – $7,000 / mo" },
  { value: "7k-12k", label: "$7,000 – $12,000 / mo" },
  { value: "12k-20k", label: "$12,000 – $20,000 / mo" },
  { value: "20k+", label: "$20,000+ / mo" },
  { value: "flexible", label: "Flexible / Open to discuss" },
];
