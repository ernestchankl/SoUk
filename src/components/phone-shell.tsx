import { cn } from "@/lib/utils";

export function PhoneShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-[#07140f]">
      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background/95 shadow-[0_0_80px_rgba(0,0,0,0.5)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function TopBar({
  left,
  title,
  right,
}: {
  left?: React.ReactNode;
  title: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 border-b border-white/8 bg-background/90 px-3 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] backdrop-blur-md">
      <div className="flex items-center">{left}</div>
      <div className="text-center text-sm font-medium tracking-wide">{title}</div>
      <div className="flex items-center justify-end">{right}</div>
    </header>
  );
}
