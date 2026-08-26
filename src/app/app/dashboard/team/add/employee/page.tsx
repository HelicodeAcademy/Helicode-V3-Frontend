"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleContext } from "../../../layout";
import { HireDetailsFormComponent } from "@/components/team/hire-details-form";
import { HireContractFormComponent } from "@/components/team/hire-contract-form";
import { NewHireSuccessModal } from "@/components/team/new-hire-success-modal";
import { useAddHireStore } from "@/store/add-hire-store";


export default function AddEmployeePage() {
  const { setTitle } = useContext(PageTitleContext);
  const { reset } = useAddHireStore();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "contract">("details");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setTitle("Team");
    reset();
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
          title="Add Employee"
          subtitle="Onboard a new team member and get them ready to receive payments in just a few clicks."
          onNext={() => setStep("contract")}
        />
      )}
      {step === "contract" && (
        <HireContractFormComponent
          title="Add Employee"
          subtitle="Onboard a new team member and get them ready to receive payments in just a few clicks."
          workerType="EMPLOYEE"
          onSuccess={() => setShowSuccessModal(true)}
        />
      )}
      <NewHireSuccessModal
        open={showSuccessModal}
        onOpenChange={handleSuccessModalOpenChange}
        onAddAnother={handleAddAnother}
        onInviteNow={handleInviteNow}
        modalType="employee"
      />
    </>
  );
}
