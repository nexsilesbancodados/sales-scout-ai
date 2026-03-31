import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 overflow-hidden relative">
      {/* Floating orbs */}
      <div
        className="absolute w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`, top: '20%', left: '15%' }}
      />
      <div
        className="absolute w-48 h-48 rounded-full bg-accent/10 blur-3xl"
        style={{ transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`, bottom: '20%', right: '15%' }}
      />

      <div className="text-center animate-fade-in max-w-lg relative z-10">
        {/* Animated 404 */}
        <div className="mb-8 relative">
          <h1
            className="text-[10rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-primary/80 to-primary/20 select-none"
            style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass
              className="h-12 w-12 text-primary/40 animate-spin"
              style={{ animationDuration: '8s' }}
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-2 text-sm sm:text-base">
          A rota <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">{location.pathname}</code> não existe.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">
          Use <kbd className="px-1.5 py-0.5 rounded border bg-muted text-xs font-mono">Ctrl+K</kbd> para navegar rapidamente.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 min-w-[180px]">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Ir para o Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 min-w-[140px]"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
