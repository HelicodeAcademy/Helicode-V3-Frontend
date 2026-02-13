"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface WalletFundedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletFundedModal({
  open,
  onOpenChange,
}: WalletFundedModalProps) {
  const router = useRouter();

  const handleGoHome = () => {
    onOpenChange(false);
    router.push("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-102.5 p-2 overflow-hidden gap-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Wallet Funded</DialogTitle>
        <Image
          src="/payroll/modal-illustration.png"
          alt="illusrtation"
          width={394}
          height={220}
        />

        {/* Content */}
        <div className="py-6 px-4">
          <h2 className="text-2xl font-bold leading-none mb-2">
            Payroll Wallet Funded
          </h2>
          <p className="text-sm text-[#667085]">
            You can now start paying your remote teams
          </p>

          <Button
            onClick={handleGoHome}
            variant={"primary"}
            className="mt-10 hover:bg-[#212121]/90"
          >
            Go to home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
