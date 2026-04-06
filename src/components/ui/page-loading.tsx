import logoImg from "@/assets/logo.webp";

export function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div className="relative">
          <img src={logoImg} alt="Logo" className="h-14 w-auto animate-pulse" width={56} height={56} />
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-soft" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ContentLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">Carregando dados...</p>
      </div>
    </div>
  );
}
