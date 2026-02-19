"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { SettingsCard } from "@/components/settings/settings-card";

const settingsData = [
  {
    id: "company_name",
    label: "Company Name",
    value: "Helicode",
    isEditable: true,
  },
  {
    id: "payroll_settings",
    label: "Payroll Settings",
    value: "Monthly",
    isEditable: true,
  },
  {
    id: "admin_name",
    label: "Admin Name",
    value: "Aaron Goh",
    isEditable: true,
  },
  {
    id: "title",
    label: "Title",
    value: "COO",
    isEditable: false,
  },
  {
    id: "status",
    label: "Status",
    value: "Active",
    isStatus: true,
    isEditable: false,
  },
  {
    id: "currency",
    label: "Currency",
    value: "USD",
    isEditable: false,
  },
];

export default function SettingsPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Settings");
  }, [setTitle]);

  const handleEdit = (settingId: string) => {
    // Edit logic will be implemented when adding modal or edit forms
    console.log(`Edit ${settingId}`);
  };

  return (
    <div className="py-4 px-8 space-y-6 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-227.5 mx-auto py-41.25">
        {settingsData.map((setting) => (
          <SettingsCard
            key={setting.id}
            label={setting.label}
            value={setting.value}
            isEditable={setting.isEditable}
            isStatus={setting.isStatus}
            onEdit={() => handleEdit(setting.id)}
          />
        ))}
      </div>
    </div>
  );
}
