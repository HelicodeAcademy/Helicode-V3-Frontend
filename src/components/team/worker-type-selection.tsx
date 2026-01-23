"use client";

import { Button } from "@/components/ui/button";

interface WorkerTypeSelectionProps {
  selectedType: "employee" | "contractor" | null;
  onSelect: (type: "employee" | "contractor") => void;
  onProceed: () => void;
}

export function WorkerTypeSelection({
  selectedType,
  onSelect,
  onProceed,
}: WorkerTypeSelectionProps) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="max-w-112.5 w-full">
        <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2 leading-[145%]">
          Who would you like to add to your team?
        </h1>
        <p className="text-[#444444] text-sm mb-8">
          Select how you&apos;d like to classify this worker.
        </p>

        <div className="space-y-6">
          {/* Employee Option */}
          <button
            type="button"
            onClick={() => onSelect("employee")}
            className={`w-full text-left p-6 rounded-lg border transition-all ${
              selectedType === "employee"
                ? "border-[#0166f4] bg-[#f0f6ff]"
                : "border-[#e4e7ec] hover:border-[#d0d5dd]"
            }`}
          >
            <div className="flex gap-5 items-start">
              <div
                className={`mt-1 h-5 w-5 rounded-full border shrink-0 ${
                  selectedType === "employee"
                    ? "border-[#0052FF] bg-[#0052FF1A]"
                    : "border-[#E4E7EC]"
                }`}
              ></div>
              <div>
                <h3 className="font-medium text-[#0F112A] text-lg">
                  An employee
                </h3>
                <p className="text-sm text-[#475367] mt-2">
                  Full-time or part-time team members on your payroll. They
                  receive benefits, have taxes withheld, and work under your
                  company&apos;s direction.
                </p>
              </div>
            </div>
          </button>

          {/* Contractor Option */}
          <button
            type="button"
            onClick={() => onSelect("contractor")}
            className={`w-full text-left p-6 rounded-lg border transition-all ${
              selectedType === "contractor"
                ? "border-[#0166f4] bg-[#f0f6ff]"
                : "border-[#E4E7EC] hover:border-[#d0d5dd]"
            }`}
          >
            <div className="flex items-start gap-5">
              <div
                className={`mt-1 h-5 w-5 rounded-full border shrink-0 ${
                  selectedType === "contractor"
                    ? "border-[#0052FF] bg-[#0052FF1A]"
                    : "border-[#d0d5dd]"
                }`}
              ></div>
              <div>
                <h3 className="font-medium text-[#0F112A] text-lg">
                  A Contractor
                </h3>
                <p className="text-sm text-[#475367] mt-2">
                  Independent workers who provide services under a contract.
                  They manage their own taxes, set their own schedules, and
                  typically work on specific projects.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-10 flex justify-end">
          <Button
            onClick={onProceed}
            disabled={!selectedType}
            variant={"primary"}
            className="hover:bg-[#101828]/90"
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
