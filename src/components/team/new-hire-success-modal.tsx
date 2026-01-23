"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface NewHireSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAnother: () => void;
  onInviteNow: () => void;
}

export function NewHireSuccessModal({
  open,
  onOpenChange,
  onAddAnother,
  onInviteNow,
}: NewHireSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center space-y-0! p-0" showCloseButton ={false}>
        <DialogTitle className="sr-only">New Hire Added</DialogTitle>
        <div className="w-full h-52.5 bg-[#e0e0e0] rounded-lg flex items-center justify-center"></div>

        <div className="px-6 pt-4 pb-6">
          <h2 className="text-2xl font-medium text-[#000000] mb-4">
            New hire as been added
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
            <Button variant="surface" onClick={onAddAnother} className="flex-1">
              Add Another Contrator
            </Button>
            <Button
              onClick={onInviteNow}
              variant="primary"
              className="flex-1 hover:bg-[#101828]/90"
            >
              Invite now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
