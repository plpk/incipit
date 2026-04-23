import "./marketing.css";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BodyClass } from "./BodyClass";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BodyClass className="marketing-page" />
      <MarketingNav />
      <main className="overflow-x-hidden">{children}</main>
      <MarketingFooter />
    </>
  );
}
