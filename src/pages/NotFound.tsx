import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
          <div className="h-1 w-16 bg-primary/30 rounded-full mx-auto" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-3">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Ir para o Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to={-1 as any}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
