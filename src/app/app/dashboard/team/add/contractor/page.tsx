"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleContext } from "../../../layout";
import { HireDetailsFormComponent } from "@/components/team/hire-details-form";
import { HireContractFormComponent } from "@/components/team/hire-contract-form";
import { NewHireSuccessModal } from "@/components/team/new-hire-success-modal";
import { useAddHireStore } from "@/store/add-hire-store";

export default function AddContractorPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { reset } = useAddHireStore();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "contract">("details");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setTitle("Team");
    reset(); // Clear any stale form data
  }, [setTitle, reset]);

  const handleAddAnother = () => {
    reset();
    setShowSuccessModal(false);
    router.push("/dashboard/team/add");
  };

  const handleInviteNow = () => {
    reset();
    setShowSuccessModal(false);
    router.push("/dashboard/team");
  };

  const handleSuccessModalOpenChange = (open: boolean) => {
    setShowSuccessModal(open);
    if (!open) {
      reset();
      router.push("/dashboard/team");
    }
  };

  return (
    <>
      {step === "details" && (
        <HireDetailsFormComponent
          title="Add Contractor"
          subtitle="Create a contract for an individual contractor"
          onNext={() => setStep("contract")}
        />
      )}
      {step === "contract" && (
        <HireContractFormComponent
          title="Add Contractor"
          subtitle="Create a contract for an individual contractor"
          workerType="CONTRACTOR"
          onSuccess={() => setShowSuccessModal(true)}
        />
      )}
      <NewHireSuccessModal
        open={showSuccessModal}
        onOpenChange={handleSuccessModalOpenChange}
        onAddAnother={handleAddAnother}
        onInviteNow={handleInviteNow}
        modalType="contractor"
      />
    </>
  );
}
