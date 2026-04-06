import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminRole } from '@/hooks/use-admin';
import { Navigate } from 'react-router-dom';
import { Loader2, Crown, Users, Headphones } from 'lucide-react';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminSupportTab } from '@/components/admin/AdminSupportTab';

export default function AdminPage() {
  const { isAdmin, isLoading: checkingAdmin } = useAdminRole();
  const [activeTab, setActiveTab] = useState('users');

  if (checkingAdmin) {
    return (
      <DashboardLayout title="Admin">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout
      title="Painel Admin"
      description="Gerencie usuários e suporte da plataforma"
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Administração</h2>
            <p className="text-xs text-muted-foreground">Gerencie toda a plataforma</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <Headphones className="h-4 w-4" />
              Suporte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <AdminSupportTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
