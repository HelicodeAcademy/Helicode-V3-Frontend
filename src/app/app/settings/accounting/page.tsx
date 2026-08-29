import { redirect } from "next/navigation";

type SettingsAccountingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SettingsAccountingRedirectPage({
  searchParams,
}: SettingsAccountingPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    }
  });

  const suffix = query.toString();
  redirect(suffix ? `/dashboard/accounting?${suffix}` : "/dashboard/accounting");
}
