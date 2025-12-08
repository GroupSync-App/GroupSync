import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AnimatedStatCard } from "@/components/landing/AnimatedStatCard";
import { 
  Users, 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  Clock, 
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  ChevronDown
} from "lucide-react";

const LandingPage = () => {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">GroupSync</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Anmelden</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              <Link to="/login">Jetzt starten</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Die smarte Lösung für Gruppenarbeit</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="text-foreground">Gruppenarbeit</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                endlich einfach
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-100">
              Koordiniere Aufgaben, plane Termine und triff Entscheidungen gemeinsam – 
              alles in einer App, die für Studierende gemacht ist.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                <Link to="/login">
                  Kostenlos starten
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 hover:scale-105 transition-transform"
                onClick={scrollToFeatures}
              >
                Mehr erfahren
                <ChevronDown className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Hero visual - Dashboard Preview */}
          <div className="mt-16 md:mt-24 relative animate-scale-in animation-delay-300">
            <div className="max-w-5xl mx-auto bg-card rounded-2xl border border-border shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Mockup Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
                </div>
                <div className="w-12" /> {/* Spacer for balance */}
              </div>
              
              <div className="p-4 md:p-8 bg-gradient-to-br from-secondary/30 to-background">
                {/* Context Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">So könnte dein Dashboard aussehen</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Users, number: 3, label: "Gruppen", sublabel: "aktiv", color: "from-primary to-primary" },
                    { icon: CheckSquare, number: 12, label: "Aufgaben", sublabel: "offen", color: "from-accent to-accent" },
                    { icon: Calendar, number: 5, label: "Termine", sublabel: "geplant", color: "from-warning to-warning" },
                    { icon: BarChart3, number: 2, label: "Umfragen", sublabel: "laufend", color: "from-success to-success" },
                  ].map((item, i) => (
                    <AnimatedStatCard
                      key={i}
                      icon={item.icon}
                      number={item.number}
                      label={item.label}
                      sublabel={item.sublabel}
                      color={item.color}
                      delay={400 + i * 100}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Alles, was dein Team braucht
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Von der ersten Idee bis zum fertigen Projekt – GroupSync begleitet euch durch jede Phase.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: "Gruppen verwalten",
                description: "Erstelle Gruppen, lade Mitglieder per Link ein und behalte den Überblick über alle deine Projekte.",
                color: "primary"
              },
              {
                icon: CheckSquare,
                title: "Aufgaben zuweisen",
                description: "Verteile Aufgaben, setze Prioritäten und tracke den Fortschritt – jeder weiß, was zu tun ist.",
                color: "accent"
              },
              {
                icon: BarChart3,
                title: "Umfragen erstellen",
                description: "Triff Entscheidungen demokratisch mit anonymen oder öffentlichen Abstimmungen.",
                color: "warning"
              },
              {
                icon: Calendar,
                title: "Termine planen",
                description: "Finde gemeinsame Zeitfenster und plane Meetings ohne endlose Nachrichtenflut.",
                color: "success"
              },
              {
                icon: Clock,
                title: "Verfügbarkeiten teilen",
                description: "Zeige deinem Team, wann du Zeit hast, und finde schneller gemeinsame Termine.",
                color: "primary"
              },
              {
                icon: Shield,
                title: "Sicher & privat",
                description: "Deine Daten gehören dir. Ende-zu-Ende-Verschlüsselung für alle sensiblen Informationen.",
                color: "accent"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              In 3 Schritten startklar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Keine komplizierte Einrichtung – einfach registrieren und loslegen.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Registrieren",
                description: "Erstelle kostenlos deinen Account in wenigen Sekunden."
              },
              {
                step: "02",
                title: "Gruppe erstellen",
                description: "Starte eine neue Gruppe oder tritt einer bestehenden bei."
              },
              {
                step: "03",
                title: "Loslegen",
                description: "Erstelle Aufgaben, plane Termine und arbeitet zusammen."
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                    <span className="text-3xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>100% kostenlos für Studierende</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Bereit, Gruppenarbeit neu zu erleben?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Schließe dich tausenden Studierenden an, die bereits smarter zusammenarbeiten.
            </p>
            
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-primary/30"
            >
              <Link to="/login">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">GroupSync</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 GroupSync. Made with ❤️ for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
