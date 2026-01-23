"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "./layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const payrollMetrics = [
  { label: "Total Payroll Processed", value: "$500,000.40" },
  { label: "Wallet Balance", value: "$100,000.80" },
  { label: "Active Employee", value: "50" },
];

const recentPayments = [
  {
    name: "Vandross Idiake",
    role: "Software Engineer",
    status: "Active",
    amount: "$3,400.00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vandross",
  },
  {
    name: "Vandross Idiake",
    role: "Software Engineer",
    status: "Active",
    amount: "$3,400.00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vandross1",
  },
  {
    name: "Vandross Idiake",
    role: "Software Engineer",
    status: "Active",
    amount: "$3,400.00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vandross2",
  },
  {
    name: "Vandross Idiake",
    role: "Software Engineer",
    status: "Active",
    amount: "$3,400.00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vandross3",
  },
  {
    name: "Vandross Idiake",
    role: "Software Engineer",
    status: "Active",
    amount: "$3,400.00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vandross4",
  },
  {
    name: "Vandross Idiake",
    role: "Software Engineer",
    status: "Active",
    amount: "$3,400.00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vandross5",
  },
];

const quickActions = [
  {
    title: "Finish setting up your account",
    description:
      "To unlock all the benefits of Remoto's HR platform, complete your company details.",
    icon: "/home/profile-circle.svg",
  },
  {
    title: "Finish setting up your account",
    description:
      "To unlock all the benefits of Remoto's HR platform, complete your company details.",
    icon: "/home/profile-circle.svg",
  },
  {
    title: "Finish setting up your account",
    description:
      "To unlock all the benefits of Remoto's HR platform, complete your company details.",
    icon: "/home/profile-circle.svg",
  },
  {
    title: "Finish setting up your account",
    description:
      "To unlock all the benefits of Remoto's HR platform, complete your company details.",
    icon: "/home/profile-circle.svg",
  },
];

export default function DashboardHomePage() {
  const { setTitle } = useContext(PageTitleContext);
  const [activeMetric, setActiveMetric] = useState<string>("Last 30 days");

  useEffect(() => {
    setTitle("Home");
  }, [setTitle]);

  return (
    <div className="py-4 px-8">
      {/* Metrics Cards */}
      <div className="mb-6 grid gap-6 md:grid-cols-3">
        {payrollMetrics.map((metric) => (
          <div
            key={metric.label}
            className="border border-[#D0D5DD] rounded-3xl p-6"
          >
            <div className="font-medium text-[#475367]">{metric.label}</div>

            <div className="space-y-4">
              <div className="text-[2.5rem] font-bold text-[#344054]">
                {metric.value}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-[#D0D5DD] bg-white text-sm text-[#475367] hover:bg-[#f9fafb]"
              >
                {activeMetric}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mb-10 flex gap-3">
        <Button className="bg-[#ECF2FF] border border-[#0052FF] rounded-xl text-[#0052FF] font-semibold">
          <Image
            src="/home/user-add-02.svg"
            alt="contract"
            width={16}
            height={16}
          />
          Add new hire
        </Button>
        <Button className="bg-[#ECF2FF] border border-[#0052FF] rounded-xl text-[#0052FF] font-semibold">
          <Image
            src="/home/add-circle.svg"
            alt="contract"
            width={16}
            height={16}
          />
          Create contract
        </Button>
      </div>

      {/* Promotional Section */}
      <div className="mb-8 flex items-stretch gap-6 rounded-3xl border bg-white overflow-hidden">
        <div className="flex-1 p-6">
          <h2 className="text-lg font-bold text-[#0F112A] mb-2">
            Use Helicode to run seamless payroll and hiring
          </h2>
          <p className="text-[#475367] leading-[145%] mb-4 text-sm">
            Hire talent, manage contracts, stay compliant, and pay your team
            instantly using stablecoins, all from one simple platform.
          </p>
          <Button
            variant="primary"
            className="text-white hover:bg-[#101828]/90"
          >
            Get Started
          </Button>
        </div>

        <div className="shrink-0 hidden md:block relative w-117">
          <Image
            src="/home/bridge.svg"
            alt="Alex"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Recent Payments and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Recent Payments */}
        <div className="rounded-3xl border border-[#E4E7EC] bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E7EC]">
            <h3 className="text-sm font-medium text-[#101928]">
              Recent Payments
            </h3>
            <Button
              variant="secondary"
              className="rounded-full w-18 h-7 text-xs  bg-white border hover:bg-[#E0EAFF]"
            >
              View all
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow className="border-b border-[#E4E7EC] hover:bg-transparent">
                <TableHead className="px-6 py-4 text-xs font-medium text-[#344054]">
                  Person
                </TableHead>
                <TableHead className="py-4 text-xs font-medium text-[#344054]">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-medium text-right text-[#344054]">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentPayments.map((payment, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-[#E4E7EC] last:border-b-0 hover:bg-[#F9FAFB]"
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={payment.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>VI</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#101828]">
                          {payment.name}
                        </p>
                        <p className="text-xs text-[#475367]">{payment.role}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className="rounded-full bg-[#C8E8D580] w-17.25 h-6 text-xs font-medium text-[#17B26A] hover:bg-[#E7F6EC]">
                      <p className="h-3 w-3 rounded-full border border-[#12B76A]"></p>
                      {payment.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-6 text-right text-sm font-medium text-[#101928]">
                    {payment.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="rounded-3xl border border-[#eaeaea] bg-white p-6">
          <h3 className="text-sm font-medium text-[#101828] mb-12">
            Quick Actions
          </h3>
          <div className="space-y-4">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 pb-4 bg-[#F9FAFB] rounded-xl p-6 last:pb-0 last:border-b-0"
              >
                <div className="shrink-0 h-10 w-10 rounded-full bg-[#dde8ff] flex items-center justify-center">
                  <Image
                    src={action.icon}
                    alt={action.title}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#101928] text-sm">
                    {action.title}
                  </p>
                  <p className="text-xs text-[#696969] mt-1">
                    {action.description}
                  </p>

                  {idx === 0 && (
                    <Link href="/dashboard/setup-account">
                      <Button className="mt-3 bg-[#0166f4] text-white text-xs hover:bg-[#0166f4]/90">
                        Finish Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
