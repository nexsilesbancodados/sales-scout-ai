import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: { action: string; title: string }[];
  requireInteraction?: boolean;
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      
      // Register service worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-notifications.js');
      setSwRegistration(registration);
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: '✓ Notificações ativadas',
          description: 'Você receberá alertas quando tarefas terminarem ou leads responderem.',
        });
        return true;
      } else if (result === 'denied') {
        toast({
          title: 'Notificações bloqueadas',
          description: 'Você pode reativar nas configurações do navegador.',
          variant: 'destructive',
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  const sendNotification = useCallback((data: NotificationData) => {
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Try to use service worker if available (works in background)
    if (swRegistration) {
      swRegistration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'prospecte-notification',
        data: data.data,
        requireInteraction: data.requireInteraction,
      });
    } else {
      // Fallback to regular notification (only works when tab is open)
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        tag: data.tag,
        data: data.data,
      });
    }
  }, [permission, swRegistration]);

  // Notification helpers
  const notifyJobComplete = useCallback((jobType: string, result: { processed: number; failed: number }) => {
    sendNotification({
      title: '✓ Tarefa concluída',
      body: `${jobType}: ${result.processed} processados, ${result.failed} falhas`,
      tag: 'job-complete',
      data: { type: 'job_complete' },
    });
  }, [sendNotification]);

  const notifyLeadResponse = useCallback((leadName: string, leadId: string) => {
    sendNotification({
      title: '💬 Nova resposta!',
      body: `${leadName} respondeu sua mensagem`,
      tag: `lead-${leadId}`,
      data: { type: 'lead_response', leadId },
      requireInteraction: true,
    });
  }, [sendNotification]);

  const notifyFollowUpDue = useCallback((leadName: string, leadId: string) => {
    sendNotification({
      title: '⏰ Follow-up pendente',
      body: `Hora de entrar em contato com ${leadName}`,
      tag: `followup-${leadId}`,
      data: { type: 'followup_due', leadId },
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyJobComplete,
    notifyLeadResponse,
    notifyFollowUpDue,
  };
}
