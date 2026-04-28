'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { changePassword } from '@/lib/auth-service';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitPassword?: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
  onSubmitPassword = changePassword,
}: ChangePasswordModalProps) {
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ChangePasswordFormData>({
    mode: 'onBlur',
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await onSubmitPassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully!');
      reset();
      setTimeout(() => onOpenChange(false), 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage);
      console.error('Change password error:', error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#000000]">
            Change Password
          </DialogTitle>
        </DialogHeader>

        <hr className="bg-[#E4E7EC] my-3" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Old Password <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                className={`pr-10 ${errors.oldPassword ? 'border-[#FF383C]' : ''}`}
                {...register('oldPassword', {
                  required: 'Old password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
                aria-label="Toggle password visibility"
              >
                {showOldPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              New Password <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="8 characters minimum"
                className={`pr-10 ${errors.newPassword ? 'border-[#FF383C]' : ''}`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Confirm New Password <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className={`pr-10 ${errors.confirmPassword ? 'border-[#FF383C]' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant={'primary'}
            className="w-31.25 hover:bg-[#101828] text-white mt-8"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              'Save changes'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
