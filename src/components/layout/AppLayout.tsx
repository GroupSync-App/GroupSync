import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-background">
      {showHeader && !isAuthPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-14 items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">GroupSync</span>
            </Link>
          </div>
        </header>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
