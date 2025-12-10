import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
  displayName: z.string().optional(),
});

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const result = authSchema.safeParse({ email, password, displayName });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, displayName || undefined);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, hsl(195 85% 45% / 0.1), hsl(170 75% 50% / 0.1))",
        }}
      />
      <div 
        className="absolute top-0 right-0 w-96 h-96 -z-10 blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(195 85% 45%), transparent)",
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 -z-10 blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(170 75% 50%), transparent)",
        }}
      />

      <PageContainer size="sm" className="py-0">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <img 
            src="/groupsync-logo.png?v=2" 
            alt="GroupSync Logo" 
            className="w-14 h-14 rounded-2xl mb-4 shadow-lg" 
          />
          <h1 className="text-3xl font-bold text-foreground">GroupSync</h1>
          <p className="text-muted-foreground mt-1">Gruppenarbeit, einfach organisiert.</p>
        </div>

        <Card className="shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? "Willkommen zurück" : "Konto erstellen"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Melde dich an, um deine Gruppen zu verwalten"
                : "Registriere dich, um loszulegen"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Anzeigename</Label>
                  <Input 
                    id="displayName" 
                    type="text" 
                    placeholder="Max Mustermann"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Anmelden..." : "Registrieren..."}
                  </>
                ) : (
                  isLogin ? "Anmelden" : "Registrieren"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {isLogin ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  disabled={isLoading}
                >
                  {isLogin ? "Registrieren" : "Anmelden"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
