import "./marketing.css";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BodyClass } from "./BodyClass";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  return (
    <>
      <BodyClass className="marketing-page" />
      <MarketingNav signedIn={Boolean(user)} />
      <main className="overflow-x-hidden">{children}</main>
      <MarketingFooter />
    </>
  );
}
