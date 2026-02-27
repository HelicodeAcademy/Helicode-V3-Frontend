"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PaymentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentSuccessModal({
  open,
  onOpenChange,
}: PaymentSuccessModalProps) {
  const router = useRouter();

  const handleGoHome = () => {
    onOpenChange(false);
    router.push("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm flex flex-col p-2"
        showCloseButton={false}
      >
        {/* Illustration */}
        <Image
          src="/payroll/modal-illustration.png"
          alt="illustration"
          width={394}
          height={220}
          priority
        />

        <div className="px-6 mb-4">
          {/* Content */}
          <h2 className="text-2xl font-bold text-[#000000] mb-6">
            Payment Sent!
          </h2>

          <Button
            onClick={handleGoHome}
            className="bg-[#E9E9E9] text-[#363636] hover:bg-[#d1d5db] text-sm w-32.75 h-9"
          >
            Go back to home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
