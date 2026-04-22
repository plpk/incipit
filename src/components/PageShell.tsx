import { cn } from "@/lib/utils";

export function PageShell({
  topbar,
  children,
  wide,
}: {
  topbar?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      {topbar && (
        <div className="topbar">
          <div
            className={cn(
              "mx-auto flex items-center justify-between gap-4",
              wide ? "max-w-[1100px]" : "max-w-[760px]",
            )}
            style={{
              padding: "14px 48px",
            }}
          >
            {topbar}
          </div>
        </div>
      )}
      <div
        className={cn(
          "mx-auto animate-fade-up",
          wide ? "max-w-[1100px]" : "max-w-[760px]",
        )}
        style={{
          padding: "48px 48px 80px",
        }}
      >
        {children}
      </div>
    </>
  );
}
