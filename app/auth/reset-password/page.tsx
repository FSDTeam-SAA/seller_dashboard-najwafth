import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; otp?: string | string[] }>;
}) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";
  const otp = typeof params.otp === "string" ? params.otp : "";

  return (
    <AuthShell
      title="Reset New password"
      description="Enter your new password and confirm password"
    >
      <ResetPasswordForm initialEmail={email} initialOtp={otp} />
    </AuthShell>
  );
}
