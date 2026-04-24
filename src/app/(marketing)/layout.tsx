import "./marketing.css";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BodyClass } from "./BodyClass";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  let hasProfile = false;
  if (user) {
    const admin = getServerSupabase();
    const { data: profile } = await admin
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    hasProfile = profile?.onboarding_completed === true;
  }
  return (
    <>
      <BodyClass className="marketing-page" />
      <MarketingNav signedIn={Boolean(user)} hasProfile={hasProfile} />
      <main className="overflow-x-hidden">{children}</main>
      <MarketingFooter />
    </>
  );
}
