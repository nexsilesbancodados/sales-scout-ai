import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { AnimatedCharactersLogin } from '@/components/ui/animated-characters-login-page';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { RocketTransition } from '@/components/auth/RocketTransition';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, user } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showRocketTransition, setShowRocketTransition] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !showResetPassword && !showRocketTransition) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, showResetPassword, showRocketTransition, user]);

  const handleRocketComplete = useCallback(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  if (user && !showResetPassword && !showRocketTransition) {
    return null;
  }

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setAuthError('');
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
      setIsSubmitting(false);
    } else {
      setShowRocketTransition(true);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setIsSubmitting(true);
    setAuthError('');
    const { error } = await signUpWithEmail(email, password, name);
    if (error) {
      setAuthError(error.message);
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

  if (showRocketTransition) {
    return <RocketTransition isActive={showRocketTransition} onComplete={handleRocketComplete} />;
  }

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-[400px]">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Redefinir Senha</h1>
          <p className="text-muted-foreground mb-6">Digite sua nova senha abaixo</p>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="new-password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 h-11"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <>Salvar Nova Senha<ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-[400px]">
          <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <AnimatedCharactersLogin
      onLogin={handleLogin}
      onSignup={handleSignup}
      onForgotPassword={() => setShowForgotPassword(true)}
      isLoading={isSubmitting || loading}
      error={authError}
    />
  );
}
