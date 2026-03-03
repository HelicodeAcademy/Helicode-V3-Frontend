import { Button } from "../../ui/button";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useForm } from "react-hook-form";
import { signupCompany } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

/**
 * Product Selection Form - Third step of signup
 * Allows user to select product (PAYROLL, RECRUITMENT, ACCOUNTING)
 * This step is optional - user can skip and go straight to email verification
 * Uses react-hook-form for handling form submission
 */

interface ProductFormData {
  product: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "hiring",
    name: "Hiring",
    description: "Source and hire top talents around the world",
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Pay employees globally with stablecoin",
  },
  {
    id: "hr-onboarding",
    name: "HR/Onboarding",
    description: "Automate people ops with a global HR system",
    disabled: false,
  },
];
export function ProductForm() {
  const router = useRouter();
  const { signupData, setCurrentStep, setUserId, setCompanyId, setIsLoading } =
    useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<string>("hiring");

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      // prepare the signup data with selected product
      const completeSignupData = {
        ...signupData,
        product: data.product,
      };

      // Call the signup API with complete data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await signupCompany(completeSignupData as any);

      // Save userId and companyId to store for later steps
      setUserId(response.userId);
      setCompanyId(response.companyId);

      // Move to verification step
      setCurrentStep("verify");
      toast.success("Account created! Please verify your email.");
      router.push("/signup/company/verify-email");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);

      // Prepare signup data without product
      const completeSignupData = {
        ...signupData,
        product: undefined,
      };

      // Call signup API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await signupCompany(completeSignupData as any);

      // Store returned IDs
      setUserId(response.userId);
      setCompanyId(response.companyId);

      // Move to verification step
      setCurrentStep("verify");

      toast.success("Account created! Please verify your email.");
      router.push("/signup/verify-email");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account";
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-3 text-[2rem] font-medium text-[#101828] leading-[145%]">
          Which product are you interested in?
        </h1>
        <p className="text-sm text-[#444444] leading-[145%]">
          Choose what you want to use first.
        </p>
      </div>

      {/* Products Grid */}
      <form
        onSubmit={handleSubmit(() => onSubmit({ product: selectedProduct }))}
      >
        <div className="mb-8 space-y-6 p-1.5 rounded-2xl">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() =>
                !product.disabled && setSelectedProduct(product.id)
              }
              disabled={product.disabled}
              className={`w-full rounded-lg bg-white p-6 border text-left transition-all ${
                product.disabled ? "opacity-30" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                    selectedProduct === product.id && !product.disabled
                      ? "border-[#0052FF] bg-[#0052FF]/10"
                      : "border-[#E4E7EC]"
                  }`}
                >
                  {/* {selectedProduct === product.id && !product.disabled && (
                        <Check className="h-4 w-4 text-white" />
                      )} */}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <h3
                    className={`font-medium text-lg ${
                      product.disabled ? "text-[#252525]" : "text-[#0F112A]"
                    }`}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      product.disabled ? "text-[#5A5A5A]" : "text-[#475367]"
                    }`}
                  >
                    {product.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            variant={"primary"}
            disabled={isSubmitting || !selectedProduct}
            className="w-24.25 bg-[#1C1C1C] hover:bg-[#212121] text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              "Get Started"
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSkip}
            variant="surface"
            className="w-18.25 text-[#101828] hover:bg-[#f4f5f7] transition-colors bg-transparent"
          >
            Skip
          </Button>
        </div>
      </form>
    </div>
  );
}
