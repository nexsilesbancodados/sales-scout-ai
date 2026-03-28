import { Loader2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <img src={logoImg} alt="Logo" className="h-14 w-auto animate-pulse" />
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    </div>
  );
}

export function ContentLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Carregando dados...</p>
      </div>
    </div>
  );
}
