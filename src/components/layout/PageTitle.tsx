import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
  action?: ReactNode;
}

export function PageTitle({ children, subtitle, className, action }: PageTitleProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {children}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="mt-3 md:mt-0">{action}</div>}
    </div>
  );
}
