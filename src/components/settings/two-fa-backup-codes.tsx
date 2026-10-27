"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function TwoFaBackupCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const [saved, setSaved] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      toast.success("Backup codes copied");
    } catch {
      toast.error("Could not copy backup codes");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#667085]">
        Save these codes now. Each one works once, in place of your authenticator
        code. They will not be shown again.
      </p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F9FAFB] p-4 font-mono text-sm text-[#101828]">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => void copyAll()}
        className="h-9 border-[#D0D5DD]"
      >
        Copy codes
      </Button>
      <label className="flex items-start gap-2 text-sm text-[#101828]">
        <input
          type="checkbox"
          checked={saved}
          onChange={(event) => setSaved(event.target.checked)}
          className="mt-0.5 accent-[#111113]"
        />
        I have saved these backup codes
      </label>
      <Button
        type="button"
        disabled={!saved}
        onClick={onDone}
        className="h-10 w-full"
      >
        Done
      </Button>
    </div>
  );
}
