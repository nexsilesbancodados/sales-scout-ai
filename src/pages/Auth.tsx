import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { RocketTransition } from '@/components/auth/RocketTransition';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import authBackground from '@/assets/auth-background.jpg';
import logoImage from '@/assets/logo.png';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithEmail, signUpWithEmail, loading, user } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showRocketTransition, setShowRocketTransition] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  const handleRocketComplete = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  if (user && !showResetPassword && !showRocketTransition) {
    navigate('/dashboard');
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signInWithEmail(loginEmail, loginPassword);
    if (error) {
      toast({ title: 'Erro no login', description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
    } else {
      setShowRocketTransition(true);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signUpWithEmail(signupEmail, signupPassword, signupName);
    if (error) {
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar a conta.' });
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: 'Erro ao redefinir senha', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Senha redefinida!', description: 'Sua senha foi atualizada com sucesso.' });
        setShowResetPassword(false);
        navigate('/dashboard');
      }
    } catch {
      toast({ title: 'Erro inesperado', description: 'Tente novamente mais tarde.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <RocketTransition isActive={showRocketTransition} onComplete={handleRocketComplete} />

      {/* Left side - Visual */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center"
        style={{
          backgroundImage: `url(${authBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />
        <div className="relative z-10 p-12 max-w-lg">
          <img src={logoImage} alt="Prospecte" className="h-16 w-auto mb-8 drop-shadow-2xl" />
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
            Automatize sua prospecção com inteligência artificial
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Capture leads, envie mensagens personalizadas e converta mais clientes — tudo no piloto automático.
          </p>
          <div className="flex items-center gap-3 mt-8">
            {['Captura automática', 'IA Conversacional', 'Anti-ban'].map((feature) => (
              <div key={feature} className="flex items-center gap-1.5 text-white/80 text-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={logoImage} alt="Prospecte" className="h-14 w-auto mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Automatize sua prospecção com IA
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              {showResetPassword ? 'Redefinir Senha' : showForgotPassword ? 'Recuperar Senha' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-muted-foreground mt-1 text-[15px]">
              {showResetPassword
                ? 'Digite sua nova senha abaixo'
                : showForgotPassword
                ? ''
                : 'Entre ou crie sua conta para começar'}
            </p>
          </div>

          {showResetPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 h-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <>Salvar Nova Senha<ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </form>
          ) : showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1">
                <TabsTrigger value="login" className="text-sm font-medium">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="seu@email.com" className="pl-10 h-11" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-medium">Senha</Label>
                      <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-primary hover:underline font-medium">
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" type="password" placeholder="••••••••" className="pl-10 h-11" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 gradient-primary mt-2" disabled={loading || isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Entrando...</> : <>Entrar<ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" type="text" placeholder="Seu nome" className="pl-10 h-11" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="seu@email.com" className="pl-10 h-11" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 h-11" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} minLength={6} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 gradient-primary mt-2" disabled={loading || isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cadastrando...</> : <>Criar conta<ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-foreground hover:underline">Termos</a>
            {' '}e{' '}
            <a href="#" className="text-foreground hover:underline">Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
