"use client";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface SettingsCardProps {
  label: string;
  value: string;
  isEditable?: boolean;
  isStatus?: boolean;
  onEdit?: () => void;
}

export function SettingsCard({
  label,
  value,
  isEditable = false,
  isStatus = false,
  onEdit,
}: SettingsCardProps) {
  return (
    <div className="border border-[#eaeaea] rounded-lg bg-white p-6 w-110.75">
      <div className="flex items-start justify-between mb-4">
        <p className="text-base font-medium text-[#475367]">{label}</p>
        {isEditable && onEdit && (
          <button
            onClick={onEdit}
            className="text-[#667085] hover:text-[#101828] transition-colors"
          >
            <Image
              src={"/settings/pencil-edit-02.svg"}
              alt="edit"
              width={24}
              height={24}
            />
          </button>
        )}
      </div>
      <div>
        {isStatus ? (
          //   <Badge className="bg-[#d1f3d1] text-[#219d53] hover:bg-[#d1f3d1] flex w-fit gap-1">
          //     <span className="text-lg">✓</span>
          //     {value}
          //   </Badge>
          <div className=" text-[#12B76A] text-xs font-medium">
            <span className="bg-[#ECFDF3] flex items-center gap-1 rounded-3xl py-1 px-2 w-fit">
              <Image
                src="/settings/award-03.svg"
                alt="award"
                width={18}
                height={18}
              />
              {value}
            </span>
          </div>
        ) : (
          <h3 className="text-2xl font-medium text-[#344054]">{value}</h3>
        )}
      </div>
    </div>
  );
}
