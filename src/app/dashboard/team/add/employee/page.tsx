"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleContext } from "../../../layout";
import { NewHireSuccessModal } from "@/components/team/new-hire-success-modal";
import { EmployeeDetailsForm } from "@/components/team/employee/employee-details-form";
import { EmployeeContractForm } from "@/components/team/employee/employee-form";

export default function AddEmployeePage() {
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
        <EmployeeDetailsForm onNext={handleNextToContract} />
      )}
      {step === "contract" && (
        <EmployeeContractForm onSubmit={handleCreateHire} />
      )}
      <NewHireSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        onAddAnother={handleAddAnother}
        onInviteNow={handleInviteNow}
        modalType="employee"
      />
    </>
  );
}
