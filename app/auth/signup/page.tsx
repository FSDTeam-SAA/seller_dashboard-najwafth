import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <AuthShell title="Let's Get Started!" description="Create an account">
      <SignupForm />
    </AuthShell>
  );
}
