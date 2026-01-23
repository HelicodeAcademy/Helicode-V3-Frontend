"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleContext } from "../../../layout";
import { ContractorDetailsForm } from "@/components/team/contractor-details-form";
import { ContractForm } from "@/components/team/contract-form";
import { NewHireSuccessModal } from "@/components/team/new-hire-success-modal";

export default function AddContractorPage() {
  const { setTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const [step, setStep] = useState<"details" | "contract">("details");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setTitle("Team");
  }, [setTitle]);

  const handleNextToContract = () => {
    setStep("contract");
  };

  const handleCreateHire = () => {
    setShowSuccessModal(true);
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/team/add");
  };

  const handleInviteNow = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/team");
  };

  return (
    <>
      {step === "details" && (
        <ContractorDetailsForm onNext={handleNextToContract} />
      )}
      {step === "contract" && <ContractForm onSubmit={handleCreateHire} />}
      <NewHireSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        onAddAnother={handleAddAnother}
        onInviteNow={handleInviteNow}
      />
    </>
  );
}
