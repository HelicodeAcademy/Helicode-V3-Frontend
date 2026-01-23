"use client";

import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { PageTitleContext } from "../layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SetupStep = "form1" | "form2" | "confirmation" | "success";

interface CompanyDetails {
  legalCompanyName: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  invoiceCurrency: string;
  countryCode: string;
  phoneNumber: string;
  taxIdNumber: string;
  websiteUrl: string;
}

interface PersonalDetails {
  fullLegalName: string;
  countryOfResidence: string;
  nationality: string;
  dateOfBirth: string;
  emailAddress: string;
  governmentId: string;
  proofOfAddress: string;
  companyLegalName: string;
  certificateOfIncorporation: string;
  roleInCompany: string;
}

export default function SetupAccountPage() {
  const { setTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>("form1");
  const [companyData, setCompanyData] = useState<CompanyDetails | null>(null);
  const [personalData, setPersonalData] = useState<PersonalDetails | null>(
    null,
  );

  const companyForm = useForm<CompanyDetails>({
    defaultValues: {
      invoiceCurrency: "USD",
      countryCode: "+250",
    },
  });

  const personalForm = useForm<PersonalDetails>({
    defaultValues: {},
  });

  useEffect(() => {
    setTitle("Set up account");
  }, [setTitle]);

  const onCompanySubmit = (data: CompanyDetails) => {
    setCompanyData(data);
    setStep("form2");
  };

  const onPersonalSubmit = (data: PersonalDetails) => {
    setPersonalData(data);
    setStep("confirmation");
  };

  const handleConfirm = () => {
    setStep("success");
  };

  const handleBack = () => {
    setStep("form2");
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  // Form 1: Company Details
  if (step === "form1") {
    return (
      <div className="p-6 md:p-10 max-w-140 mx-auto">
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-[#212121] mb-2">
            Finish setting up your account
          </h1>
          <p className="text-[#444444] text-sm leading-[100%]">
            This is needed for taxes, security, and compliance. Make sure these
            details match your company&apos;s legal documents.
          </p>
        </div>

        <form
          onSubmit={companyForm.handleSubmit(onCompanySubmit)}
          className="space-y-5"
        >
          {/* Legal company name */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Legal company name <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Enter your company name"
              {...companyForm.register("legalCompanyName", { required: true })}
              className=""
            />
          </div>

          {/* Country */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Country <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Select
              onValueChange={(value) => companyForm.setValue("country", value)}
            >
              <SelectTrigger className="rounded-lg border border-[#E4E7EC] bg-white w-full text-[#000000] focus:border-ring focus:ring-2 focus:ring-ring/10">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="rw">Rwanda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Enter your company&apos;s address{" "}
              <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Address"
              {...companyForm.register("address", { required: true })}
              className=""
            />
          </div>

          {/* City */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              City <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Enter your company city"
              {...companyForm.register("city", { required: true })}
              className=""
            />
          </div>

          {/* State */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              State <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Select
              onValueChange={(value) => companyForm.setValue("state", value)}
            >
              <SelectTrigger className="rounded-lg border border-[#E4E7EC] bg-white w-full text-[#000000] focus:border-ring focus:ring-2 focus:ring-ring/10">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ca">California</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="tx">Texas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Postal code */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Postal code <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Enter your postal code"
              {...companyForm.register("postalCode", { required: true })}
            />
          </div>

          {/* Invoice currency */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Invoice currency <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              {...companyForm.register("invoiceCurrency", { required: true })}
            />
          </div>

          {/* Country code and Phone number */}
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <div>
              <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
                Country code <span className="text-[#FF3F3F]">*</span>
              </Label>
              <Input
                {...companyForm.register("countryCode", { required: true })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
                Company phone number <span className="text-[#FF3F3F]">*</span>
              </Label>
              <Input
                placeholder="Phone number"
                {...companyForm.register("phoneNumber", { required: true })}
              />
            </div>
          </div>

          {/* Tax ID number */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Company Tax ID number <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Enter your company's tax ID"
              {...companyForm.register("taxIdNumber", { required: true })}
            />
          </div>

          {/* Website URL */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Enter the URL of your company&apos;s website{" "}
              <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Company website"
              {...companyForm.register("websiteUrl", { required: true })}
            />
          </div>

          <Button
            type="submit"
            variant={"primary"}
            className="w-50 text-white rounded-lg hover:bg-[#1a1a1a]/90 mt-4"
          >
            Continue
          </Button>
        </form>
      </div>
    );
  }

  // Form 2: Personal Details
  if (step === "form2") {
    return (
      <div className="p-6 md:p-10 max-w-140 mx-auto">
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-[#212121] mb-2">
            Finish setting up your account
          </h1>
          <p className="text-[#444444] text-sm leading-[100%]">
            This is needed for taxes, security, and compliance. Make sure these
            details match your company&apos;s legal documents.
          </p>
        </div>

        <form
          onSubmit={personalForm.handleSubmit(onPersonalSubmit)}
          className="space-y-5"
        >
          {/* Full legal name */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Full legal name <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Enter your full name"
              {...personalForm.register("fullLegalName", { required: true })}
            />
          </div>

          {/* Country of residence */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Country of residence <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                personalForm.setValue("countryOfResidence", value)
              }
            >
              <SelectTrigger className="rounded-lg border border-[#E4E7EC] bg-white w-full text-[#000000] focus:border-ring focus:ring-2 focus:ring-ring/10">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="rw">Rwanda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nationality */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Nationality <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              {...personalForm.register("nationality", { required: true })}
            />
          </div>

          {/* Date of birth */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Date of birth <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="20 - 01 - 2000"
              {...personalForm.register("dateOfBirth", { required: true })}
            />
          </div>

          {/* Email address */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Email address <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Enter your email address"
              {...personalForm.register("emailAddress", { required: true })}
            />
          </div>

          {/* Upload government issued ID */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Upload government issued ID
              <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Upload ID"
              {...personalForm.register("governmentId", { required: true })}
            />
          </div>

          {/* Upload proof of address */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Upload proof of address <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Upload"
              {...personalForm.register("proofOfAddress", { required: true })}
            />
          </div>

          {/* Company legal name */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Company legal name <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Company legal name"
              {...personalForm.register("companyLegalName", { required: true })}
            />
          </div>

          {/* Certificate of incorporation */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Certificate of incorporation
              <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Upload certificate of incorporation"
              {...personalForm.register("certificateOfIncorporation", {
                required: true,
              })}
            />
          </div>

          {/* Your role in the company */}
          <div>
            <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
              Your role in the company <span className="text-[#FF3F3F]">*</span>
            </Label>
            <Input
              placeholder="Upload certificate of incorporation"
              {...personalForm.register("roleInCompany", { required: true })}
            />
          </div>

          <Button
            type="submit"
            variant={"primary"}
            className="w-50 text-white rounded-lg hover:bg-[#1a1a1a]/90 mt-4"
          >
            Continue
          </Button>
        </form>
      </div>
    );
  }

  // Confirmation Screen
  if (step === "confirmation" && companyData) {
    return (
      <div className="p-6 md:p-10 max-w-130.75 mx-auto">
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-[#212121] mb-2">
            Confirm account details
          </h1>
          <p className="text-[#444444] text-sm leading-relaxed">
            Check that these details, match your company&apos;s legal documents.
          </p>
        </div>

        <div className="rounded-[10px] border border-[#E0E0E0] bg-[#FFFFFF] p-6">
          <h3 className="font-bold mb-4 text-lg">Company Information</h3>

          <div className="space-y-0">
            <div className="flex justify-between items-center py-4 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#000000] font-medium">
                Legal company name
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.legalCompanyName}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#000000] font-medium">
                Country
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.country}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#000000] font-medium">
                Filling address
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.address || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#000000] font-medium">
                Postal code
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.postalCode || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#000000] font-medium">
                Phone number
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.countryCode}
                {companyData.phoneNumber}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#E0E0E0]">
              <span className="text-sm text-[#000000] font-medium">
                Invoice currency
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.invoiceCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-sm text-[#000000] font-medium">
                VAT or TAX ID number font-medium
              </span>
              <span className="text-sm text-[#8A8A8A]">
                {companyData.taxIdNumber || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-10">
          <Button
            onClick={handleBack}
            variant={"surface"}
            className="w-19 rounded-lg hover:bg-[#1a1a1a]/90"
          >
            Go back
          </Button>

          <Button
            onClick={handleConfirm}
            variant={"primary"}
            className="w-19  rounded-lg hover:bg-[#1a1a1a]/90"
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === "success") {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f3f3f3] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-2 max-w-102.5 w-full shadow-sm">
          {/* Placeholder image */}
          <div className="h-37.75 bg-[#e0e0e0] mb-6 rounded-lg" />

          <div className="px-6 pb-6">
            <h1 className="text-2xl font-bold text-[#000000] mb-4">
              You&apos;re all set, {companyData?.legalCompanyName}!
            </h1>
            <p className="text-[#444444] text-sm leading-relaxed mb-10">
              You can now start adding hires and company admins to grow your
              team on Helicode. If you have any questions, don&apos;t hesitate
              to drop us a line at{" "}
              <span className="text-[#0052FF] hover:underline">
                help@helicode.xyz.
              </span>
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleFinish}
                variant={"surface"}
                className="w-13"
              >
                Skip
              </Button>
              <Button
                onClick={handleFinish}
                variant={"primary"}
                className="w-19"
              >
                Add Hire
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
