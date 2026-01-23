"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleContext } from "../../layout";
import { WorkerTypeSelection } from "@/components/team/worker-type-selection";

export default function AddTeamMemberPage() {
  const { setTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const [workerType, setWorkerType] = useState<
    "employee" | "contractor" | null
  >(null);

  useEffect(() => {
    setTitle("Team");
  }, [setTitle]);

  const handleProceed = () => {
    if (workerType === "contractor") {
      router.push("/dashboard/team/add/contractor");
    } else if (workerType === "employee") {
      router.push("/dashboard/team/add/employee");
    }
  };

  return (
    <WorkerTypeSelection
      selectedType={workerType}
      onSelect={setWorkerType}
      onProceed={handleProceed}
    />
  );
}
