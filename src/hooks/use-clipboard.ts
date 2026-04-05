import { toast } from 'sonner';

export function useClipboard() {
  const copy = async (text: string, label = '✅ Copiado!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label, { duration: 1500 });
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  return { copy };
}
