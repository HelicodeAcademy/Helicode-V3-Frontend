"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";

interface AcceptTermsModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function AcceptTermsModal({
  open,
  onAccept,
  onClose,
  isSubmitting,
}: AcceptTermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm! bg-white w-full rounded-lg p-6 gap-0"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between mb-6">
          <DialogTitle className="text-2xl font-medium text-[#212121]">
            Accept terms
          </DialogTitle>
          <DialogClose asChild>
            <button className="text-[#000000] hover:text-[#101828]">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        <p className="text-[#000000B2] text-sm leading-relaxed mb-10">
          I confirm that all information and documents I provide are accurate,
          complete, and up to date.
        </p>

        <Button onClick={onAccept} disabled={isSubmitting} className="w-40">
          {isSubmitting ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin w-4 h-4" />
            </div>
          ) : (
            "Accept and Submit"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
