"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inviteCompanyAdmin } from "@/lib/company-admins-service";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface InviteFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteCompanyAdmin({
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      });
      toast.success("Invite sent successfully");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invite",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#101828]">
            Invite member
          </DialogTitle>
          <DialogDescription className="text-[#667085]">
            Send an invite so they can join your company as an admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-2">
                First name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input
                placeholder="Amara"
                {...register("firstName", { required: "Required" })}
                className={errors.firstName ? "border-[#FF383C]" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-[#ED2525] mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-2">
                Last name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input
                placeholder="Obi"
                {...register("lastName", { required: "Required" })}
                className={errors.lastName ? "border-[#FF383C]" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-[#ED2525] mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2">
              Work email <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              type="email"
              placeholder="amara@acme.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              className={errors.email ? "border-[#FF383C]" : ""}
            />
            {errors.email && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send invite"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
