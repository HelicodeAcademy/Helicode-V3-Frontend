"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface NewHireSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAnother: () => void;
  onInviteNow: () => void;
  modalType?: "contractor" | "employee";
}

export function NewHireSuccessModal({
  open,
  onOpenChange,
  onAddAnother,
  onInviteNow,
  modalType
}: NewHireSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-2" showCloseButton={false}>
        <DialogTitle className="sr-only">New Hire Added</DialogTitle>
        <Image
          src="/payroll/modal-illustration.png"
          alt="illusrtation"
          width={394}
          height={220}
          className="w-full"
        />

        <div className="px-4 pt-6 pb-6">
          <h2 className="text-2xl font-bold text-[#000000] mb-4">
            New hire has been added
          </h2>
          <p className="text-sm text-[#444444] mb-10">
            You can now start adding hires and company admins to grow your team
            on Helicode. If you have any questions, don&apos;t hesitate to drop
            us a line at{" "}
            <a
              href="mailto:help@helicode.xyz"
              className="text-[#0052FF] hover:underline"
            >
              help@helicode.xyz.
            </a>
          </p>
          <div className="flex gap-3">
            <Button variant="surface" onClick={onAddAnother} className="">
              Add Another {modalType === "employee" ? "Employee" : "Contractor"}
            </Button>
            <Button
              onClick={onInviteNow}
              variant="primary"
              className="hover:bg-[#101828]/90"
            >
              Invite now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
