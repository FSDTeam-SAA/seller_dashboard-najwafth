import { AuthShell } from "@/components/auth/auth-shell";
import { EnterOtpForm } from "@/components/auth/enter-otp-form";

export default async function EnterOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <AuthShell title="Enter OTP" bodyClassName="max-w-[500px]">
      <EnterOtpForm initialEmail={email} />
    </AuthShell>
  );
}
