import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { RocketTransition } from '@/components/auth/RocketTransition';
import { SmokeyBackground } from '@/components/ui/smokey-background';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, ArrowRight, Mail, User, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import logoImg from '@/assets/logo.png';

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
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password, name);
      if (error) {
        setAuthError(error.message);
      } else {
        toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar a conta.' });
      }
      setIsSubmitting(false);
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setAuthError(error.message);
        setIsSubmitting(false);
      } else {
        setShowRocketTransition(true);
      }
    }
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
    <main className="relative w-screen h-screen overflow-hidden bg-gray-950">
      <SmokeyBackground className="absolute inset-0" color="#6D28D9" backdropBlurAmount="sm" />

      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="p-8 space-y-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
            {/* Logo & Title */}
            <div className="text-center space-y-2">
              <img src={logoImg} alt="NexaProspect" className="h-12 w-auto mx-auto drop-shadow-lg" />
              <h2 className="text-2xl font-bold text-white">
                {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
              </h2>
              <p className="text-sm text-gray-300">
                {isSignUp ? 'Comece a prospectar em 5 minutos' : 'Entre para continuar prospectando'}
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 animate-fade-in">
                <p className="text-sm text-red-300">{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name (sign up only) */}
              {isSignUp && (
                <div className="relative z-0 animate-fade-in">
                  <input
                    type="text"
                    id="floating_name"
                    className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-purple-400 peer transition-colors"
                    placeholder=" "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="floating_name"
                    className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    <User className="inline-block mr-2 -mt-1" size={16} />
                    Nome completo
                  </label>
                </div>
              )}

              {/* Email */}
              <div className="relative z-0">
                <input
                  type="email"
                  id="floating_email"
                  className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-purple-400 peer transition-colors"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label
                  htmlFor="floating_email"
                  className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  <Mail className="inline-block mr-2 -mt-1" size={16} />
                  E-mail
                </label>
              </div>

              {/* Password */}
              <div className="relative z-0">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="floating_password"
                  className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-purple-400 peer pr-8 transition-colors"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <label
                  htmlFor="floating_password"
                  className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  <Lock className="inline-block mr-2 -mt-1" size={16} />
                  Senha
                </label>
                <button
                  type="button"
                  className="absolute right-0 top-2.5 text-gray-400 hover:text-white transition"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength indicator (sign up) */}
              {isSignUp && password.length > 0 && (
                <div className="space-y-1 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: password.length >= level * 3
                            ? level <= 1 ? '#ef4444' : level <= 2 ? '#f59e0b' : level <= 3 ? '#22c55e' : '#7B2FF2'
                            : 'rgba(255,255,255,0.1)'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {password.length < 6 ? 'Mínimo 6 caracteres' : password.length < 8 ? 'Razoável' : password.length < 12 ? 'Boa' : 'Excelente!'}
                  </p>
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-white transition"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="group w-full flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all duration-300 active:scale-[0.98]"
              >
                {isSubmitting || loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Aguarde...</>
                ) : (
                  <>
                    {isSignUp ? 'Criar conta' : 'Entrar'}
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
              <button
                type="button"
                className="font-semibold text-purple-400 hover:text-purple-300 transition"
                onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              >
                {isSignUp ? 'Entrar' : 'Criar conta'}
              </button>
            </p>
          </div>

          {/* Trust signals below the card */}
          <div className="mt-6 flex items-center justify-center gap-5">
            <span className="flex items-center gap-1.5 text-[11px] text-white/25">
              <Shield className="h-3 w-3" /> Dados protegidos
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/25">
              <Zap className="h-3 w-3" /> Setup em 5 min
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
