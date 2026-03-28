import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminUsers, useAdminRole } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Smartphone,
  Target,
  Search,
  Trash2,
  Loader2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminPage() {
  const { isAdmin, isLoading: checkingAdmin } = useAdminRole();
  const { users, stats, loadingUsers, loadingStats, deleteUser, isDeletingUser } = useAdminUsers();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  if (checkingAdmin) {
    return (
      <DashboardLayout title="Admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (userId: string) => {
    deleteUser(userId, {
      onSuccess: () => {
        toast({ title: '✓ Usuário removido', description: 'O usuário foi excluído com sucesso.' });
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      },
    });
  };

  return (
    <DashboardLayout
      title="Painel Admin"
      description="Gerencie todos os usuários da plataforma"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuários</p>
                  <p className="text-2xl font-bold">{loadingStats ? '...' : stats?.total_users || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Smartphone className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp Conectado</p>
                  <p className="text-2xl font-bold">{loadingStats ? '...' : stats?.connected_whatsapp || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{loadingStats ? '...' : (stats?.total_leads || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Mensagens</p>
                  <p className="text-2xl font-bold">{loadingStats ? '...' : (stats?.total_messages || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Usuários ({filteredUsers.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>IA Ativa</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Último acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{u.full_name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.whatsapp_connected ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {u.auto_prospecting ? (
                            <Badge className="bg-green-600 text-white text-xs">Ativa</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inativa</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.roles.includes('admin') ? (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              <ShieldCheck className="h-3 w-3 mr-1" />Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Usuário</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.last_sign_in_at
                            ? formatDistanceToNow(new Date(u.last_sign_in_at), { addSuffix: true, locale: ptBR })
                            : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-right">
                          {!u.roles.includes('admin') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget({ id: u.id, email: u.email })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.email}</strong>? 
              Esta ação não pode ser desfeita. Todos os dados do usuário serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingUser}
            >
              {isDeletingUser ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
