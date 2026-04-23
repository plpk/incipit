import "../(marketing)/marketing.css";
import { BodyClass } from "../(marketing)/BodyClass";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BodyClass className="marketing-page" />
      <div className="auth-ambient" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden">
        {children}
      </div>
    </>
  );
}
