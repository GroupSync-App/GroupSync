import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
}

export function PageContainer({ children, className, size = "lg" }: PageContainerProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    full: "max-w-full",
  };

  return (
    <div className={cn("container mx-auto px-4 py-6 md:py-8", sizeClasses[size], className)}>
      {children}
    </div>
  );
}
