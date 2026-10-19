"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  Calendar,
  CirclePlus,
  Download,
  Globe,
  Search,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { PageTitleContext } from "../layout";
import { AddPeopleModal } from "@/components/team/add-people-modal";
import { ImportCsvModal } from "@/components/team/import-csv-modal";
import { TeamTable, type TeamSortKey } from "@/components/team/team-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCompanyDetails } from "@/lib/company-details";
import { getPayrollGroups, type PayrollGroup } from "@/lib/payroll-service";
import { getTeamMembers } from "@/lib/team-service";
import { cn } from "@/lib/utils";
import {
  useTeamStore,
  type TeamMember,
  type WorkerType,
} from "@/store/team-store";
import Image from "next/image";

const PAGE_SIZE = 10;

type Tab = "Active" | "Onboarding" | "Invited" | "Offboarding" | "Inactive";

const TABS: Tab[] = [
  "Active",
  "Onboarding",
  "Invited",
  "Offboarding",
  "Inactive",
];

function isActiveStatus(status: TeamMember["status"]) {
  return status === "Active" || status === "Invite Accepted";
}

function inTab(member: TeamMember, tab: Tab) {
  if (tab === "Active") return isActiveStatus(member.status);
  if (tab === "Invited") return member.status === "Pending";
  if (tab === "Inactive") return member.status === "Inactive";
  return false;
}

function payLabel(member: TeamMember) {
  if (member.localAmount != null && member.localCurrency) {
    return `${member.localAmount.toLocaleString()} ${member.localCurrency}`;
  }
  return `$${Number(member.amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusLabel(status: TeamMember["status"]) {
  return status === "Pending" ? "Invited" : status;
}

function stepDate(date: Date, frequency: string) {
  if (frequency === "WEEKLY") return addWeeks(date, 1);
  if (frequency === "BIWEEKLY") return addWeeks(date, 2);
  if (frequency === "MONTHLY") return addMonths(date, 1);
  if (frequency === "QUARTERLY") return addMonths(date, 3);
  if (frequency === "ANNUAL") return addYears(date, 1);
  return null;
}

function nextPayrollDate(startDate: string, frequency: string) {
  const start = parseISO(startDate);
  if (Number.isNaN(start.getTime())) return null;
  const today = startOfDay(new Date());
  let cursor = startOfDay(start);
  for (let i = 0; i < 600; i += 1) {
    if (cursor >= today) return cursor;
    const next = stepDate(cursor, frequency);
    if (!next || next.getTime() === cursor.getTime()) return null;
    cursor = next;
  }
  return null;
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export default function TeamPage() {
  const router = useRouter();
  const { setTitle } = useContext(PageTitleContext);
  const { members, isLoading, setMembers, setIsLoading, setError } =
    useTeamStore();
  const [tab, setTab] = useState<Tab>("Active");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<WorkerType | "">("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{
    key: TeamSortKey;
    dir: "asc" | "desc";
  } | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [groups, setGroups] = useState<PayrollGroup[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    setTitle("Team");
  }, [setTitle]);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTeamMembers({});
      setMembers(result.data, result.total);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load team members.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [setMembers, setIsLoading, setError]);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    let cancelled = false;
    getCompanyDetails()
      .then((company) => {
        if (!cancelled) setCompanyName(company.name);
      })
      .catch(() => undefined);
    getPayrollGroups()
      .then((next) => {
        if (!cancelled) setGroups(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const activeMembers = useMemo(
    () => members.filter((member) => isActiveStatus(member.status)),
    [members],
  );

  const nextPayroll = useMemo(() => {
    let best: { date: Date; recipients?: number } | null = null;
    for (const group of groups) {
      if (!group.isActive || !group.startDate) continue;
      const date = nextPayrollDate(group.startDate, group.frequency);
      if (!date) continue;
      const recipients = group.memberCount ?? group.teamMembers?.length;
      if (!best || date < best.date) best = { date, recipients };
    }
    return best;
  }, [groups]);

  const countries = useMemo(
    () => [
      ...new Set(activeMembers.map((member) => member.country).filter(Boolean)),
    ],
    [activeMembers],
  );

  const tabMembers = useMemo(
    () => members.filter((member) => inTab(member, tab)),
    [members, tab],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tabMembers.filter((member) => {
      if (type && member.type !== type) return false;
      if (country && member.country !== country) return false;
      if (!query) return true;
      return (
        member.fullName.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    });
  }, [tabMembers, search, type, country]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const value = (member: TeamMember) => {
        if (sort.key === "name") return member.fullName;
        if (sort.key === "type") return member.type;
        if (sort.key === "country") return member.country;
        if (sort.key === "pay") return Number(member.amount) || 0;
        if (sort.key === "start") return member.dateJoined || "";
        return statusLabel(member.status);
      };
      const left = value(a);
      const right = value(b);
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageMembers = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const typeOptions = [
    ...new Set(tabMembers.map((member) => member.type)),
  ] as WorkerType[];
  const countryOptions = [
    ...new Set(tabMembers.map((member) => member.country).filter(Boolean)),
  ];

  const monthlyPayroll = activeMembers.reduce(
    (sum, member) => sum + (Number(member.amount) || 0),
    0,
  );
  const employeeCount = activeMembers.filter(
    (member) => member.type === "EMPLOYEE",
  ).length;
  const contractorCount = activeMembers.filter(
    (member) => member.type === "CONTRACTOR",
  ).length;

  const payrollSubtitle = (() => {
    if (!nextPayroll) return "";
    const days = differenceInCalendarDays(nextPayroll.date, new Date());
    const when =
      days <= 0 ? "today" : days === 1 ? "in 1 day" : `in ${days} days`;
    if (nextPayroll.recipients == null) return when;
    const recipients =
      nextPayroll.recipients === 1
        ? "1 recipient"
        : `${nextPayroll.recipients} recipients`;
    return `${when} · ${recipients}`;
  })();

  const exportRows = () => {
    const header = [
      "Name",
      "Role",
      "Type",
      "Country",
      "Pay / month",
      "Start date",
      "Status",
    ];
    const lines = sorted.map((member) =>
      [
        member.fullName,
        member.role,
        member.type === "EMPLOYEE" ? "Employee" : "Contractor",
        member.country,
        payLabel(member),
        member.dateJoined
          ? new Date(member.dateJoined).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        statusLabel(member.status),
      ]
        .map((value) => csvCell(String(value ?? "")))
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "team.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-8 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-[#667085]">
            Everyone you pay through Helicode. Employees, contractors and
            pending invites.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-10 gap-2 rounded-lg px-4 text-white "
        >
          <Image
            src="/team/user-plus.svg"
            alt="Add people"
            width={16}
            height={16}
          />
          <span className="text-sm font-medium text-white">Add people</span>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Active members"
          value={String(activeMembers.length)}
          detail={`${employeeCount} employees · ${contractorCount} contractors`}
        />
        <StatCard
          icon={Calendar}
          label="Monthly payroll"
          value={monthlyPayroll.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
          detail="Paid in USD or local currency"
        />
        <StatCard
          icon={Calendar}
          label="Next payroll"
          value={nextPayroll ? format(nextPayroll.date, "MMM d") : "—"}
          detail={payrollSubtitle}
        />
        <StatCard
          icon={Globe}
          label="Countries"
          value={String(countries.length)}
          detail={countries.join(", ")}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((item) => {
          const selected = tab === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setPage(1);
                setType("");
                setCountry("");
              }}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium",
                selected
                  ? "bg-[#101828] text-white"
                  : "border border-[#EAECF0] bg-white text-[#344054]",
              )}
            >
              {item}
              {item === "Active" && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] px-1.5 text-xs",
                    selected
                      ? "bg-[#34343A] text-white"
                      : "bg-[#F2F4F7] text-[#344054]",
                  )}
                >
                  {activeMembers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, role or email..."
            className="h-10 rounded-[10px] border-[#E4E7EC] bg-white pl-9"
          />
        </div>
        <FilterChip
          label="Type"
          value={
            type === "EMPLOYEE"
              ? "Employee"
              : type === "CONTRACTOR"
                ? "Contractor"
                : ""
          }
          options={typeOptions.map((option) => ({
            value: option,
            label: option === "EMPLOYEE" ? "Employee" : "Contractor",
          }))}
          onSelect={(value) => {
            setType(value === type ? "" : (value as WorkerType));
            setPage(1);
          }}
        />
        <FilterChip
          label="Country"
          value={country}
          options={countryOptions.map((option) => ({
            value: option,
            label: option,
          }))}
          onSelect={(value) => {
            setCountry(value === country ? "" : value);
            setPage(1);
          }}
        />

        <div className="lg:ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={exportRows}
            className="h-9 gap-2 rounded-lg border-[#E4E7EC] bg-white"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <TeamTable
          members={pageMembers}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onRevoked={fetchMembers}
          isLoading={isLoading}
          sortKey={sort?.key}
          sortDir={sort?.dir}
          onSort={(key) => {
            setSort((current) => {
              if (!current || current.key !== key) return { key, dir: "asc" };
              if (current.dir === "asc") return { key, dir: "desc" };
              return null;
            });
            setPage(1);
          }}
        />
      </div>

      <AddPeopleModal
        open={addOpen}
        onOpenChange={setAddOpen}
        companyName={companyName}
        onEmployee={() => {
          setAddOpen(false);
          router.push("/dashboard/team/add/employee");
        }}
        onContractor={() => {
          setAddOpen(false);
          router.push("/dashboard/team/add/contractor");
        }}
        onImport={() => {
          setAddOpen(false);
          setImportOpen(true);
        }}
      />
      <ImportCsvModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          setImportOpen(false);
          void fetchMembers();
        }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-[#667085]">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#101828]">
        {value}
      </p>
      {detail ? <p className="mt-1 text-sm text-[#667085]">{detail}</p> : null}
    </div>
  );
}

function FilterChip({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E4E7EC] bg-white px-3 text-[#344054] font-medium text-xs"
        >
          <CirclePlus className="h-4 w-4 text-[#3F3F46]" />
          {value || label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        {options.length === 0
          ? null
          : options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={cn(
                  "flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-[#F9FAFB]",
                  value === option.label && "font-medium text-[#101828]",
                )}
              >
                {option.label}
              </button>
            ))}
      </PopoverContent>
    </Popover>
  );
}
