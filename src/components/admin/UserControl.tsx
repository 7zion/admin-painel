import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { createTeamUser, changeTeamUserPassword, deleteTeamUser } from '../../lib/admin-users-server';
import { AdminUser } from '../../types/admin';
import { Plus, Users, Trash2, Shield, UserCheck, X, Sparkles, CheckCircle2, Key, Lock, Crown } from 'lucide-react';

export function UserControl() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // My Password states
  const [isMyPasswordOpen, setIsMyPasswordOpen] = useState(false);
  const [myOldPassword, setMyOldPassword] = useState('');
  const [myNewPassword, setMyNewPassword] = useState('');
  const [myPasswordError, setMyPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Change another user's password states
  const [passwordTargetUser, setPasswordTargetUser] = useState<AdminUser | null>(null);
  const [targetNewPassword, setTargetNewPassword] = useState('');
  const [targetPasswordError, setTargetPasswordError] = useState('');
  const [isChangingTargetPassword, setIsChangingTargetPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = users.find((u) => u.userId === currentUserId) || null;
  const isCurrentUserSuperAdmin = currentUser?.isSuperAdmin ?? false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error listening to users list:', error);
        setLoading(false);
        return;
      }
      const fetchedUsers: AdminUser[] = (data || []).map((row: any) => ({
        userId: row.id,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        isSuperAdmin: !!row.is_super_admin,
      }));
      setUsers(fetchedUsers);
      setLoading(false);
    };

    loadUsers();

    const channel = supabase
      .channel('user-control-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, loadUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openForm = () => {
    setEmail('');
    setPassword('');
    setRole('editor');
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || password.length < 6) {
      setErrorMsg('Preencha um e-mail válido e senha com no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Criação de usuário roda no servidor (server function com Service Role Key), já que
      // o client nunca pode ter essa chave — ela ignora todas as regras de RLS.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      await createTeamUser({
        data: {
          email,
          password,
          role,
          callerAccessToken: session.access_token,
        },
      });

      setSuccessMsg(`Usuário ${email} cadastrado com sucesso!`);
      setEmail('');
      setPassword('');
      setRole('editor');
      
      // Smoothly hide modal after success delay
      setTimeout(() => {
        setIsFormOpen(false);
        setSuccessMsg('');
      }, 1500);

    } catch (err: any) {
      console.error('Error adding new team user:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao criar o usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (userEmail: string) => {
    if (window.confirm(`Enviar e-mail de redefinição de senha para ${userEmail}?`)) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
        if (error) throw error;
        alert(`E-mail de redefinição enviado para ${userEmail}.`);
      } catch (err: any) {
        console.error('Error sending password reset email:', err);
        alert(err.message || 'Erro ao enviar e-mail de redefinição.');
      }
    }
  };

  const handleDeleteUser = async (userToDelete: AdminUser) => {
    if (users.length <= 1) {
      alert('Não é possível deletar o único administrador cadastrado.');
      return;
    }

    if (window.confirm(`Tem certeza de que deseja remover o acesso de ${userToDelete.email}? Essa ação também remove o login dele do Supabase, permitindo cadastrar o mesmo e-mail de novo depois.`)) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sessão expirada. Faça login novamente.');

        await deleteTeamUser({
          data: {
            targetUserId: userToDelete.userId,
            callerAccessToken: session.access_token,
          },
        });
      } catch (err: any) {
        console.error(`Error deleting user ${userToDelete.userId}:`, err);
        alert('Erro ao remover acesso: ' + (err?.message || 'Erro desconhecido.'));
      }
    }
  };

  const openChangeTargetPassword = (user: AdminUser) => {
    setPasswordTargetUser(user);
    setTargetNewPassword('');
    setTargetPasswordError('');
  };

  const handleChangeTargetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (!targetNewPassword || targetNewPassword.length < 6) {
      setTargetPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setTargetPasswordError('');
    setIsChangingTargetPassword(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      await changeTeamUserPassword({
        data: {
          targetUserId: passwordTargetUser.userId,
          newPassword: targetNewPassword,
          callerAccessToken: session.access_token,
        },
      });

      alert(`Senha de ${passwordTargetUser.email} atualizada com sucesso!`);
      setPasswordTargetUser(null);
      setTargetNewPassword('');
    } catch (err: any) {
      console.error('Error changing target user password:', err);
      setTargetPasswordError(err?.message || 'Erro ao trocar a senha.');
    } finally {
      setIsChangingTargetPassword(false);
    }
  };

  const handleUpdateMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myOldPassword || !myNewPassword || myNewPassword.length < 6) {
      setMyPasswordError('Preencha os campos corretamente. A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setMyPasswordError('');
    setIsUpdatingPassword(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser || !currentUser.email) {
        throw new Error('Usuário não autenticado.');
      }

      // Reautentica com a senha atual antes de trocar (mesmo comportamento do fluxo antigo)
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: myOldPassword,
      });
      if (reauthError) {
        setMyPasswordError('Senha atual incorreta.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: myNewPassword });
      if (updateError) throw updateError;

      setSuccessMsg('Sua senha foi alterada com sucesso!');
      setIsMyPasswordOpen(false);
      setMyOldPassword('');
      setMyNewPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setMyPasswordError(err.message || 'Erro ao alterar a senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6" id="user-control-root">
      <div className="flex justify-between items-center" id="user-header-section">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Membros e Acessos</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie os usuários autorizados a acessar este painel de controle.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setMyPasswordError('');
              setMyOldPassword('');
              setMyNewPassword('');
              setIsMyPasswordOpen(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer"
          >
            <Lock className="w-4 h-4" /> Minha Senha
          </button>
          <button
            onClick={openForm}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl border border-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer"
            id="btn-create-team-user"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500" id="user-loading">Carregando usuários...</div>
      ) : (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden" id="users-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="users-table">
              <thead>
                <tr className="border-b border-white/5 bg-[#121212]/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">E-mail</th>
                  <th className="py-4 px-6">Nível de Acesso</th>
                  <th className="py-4 px-6">Identificação UID</th>
                  <th className="py-4 px-6">Cadastrado em</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-white/[0.01] transition-colors" id={`user-row-${user.userId}`}>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-xs">
                        {user.email.substring(0, 2)}
                      </div>
                      <span className="font-semibold text-white">{user.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {user.role === 'admin' ? (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit">
                            <Shield className="w-3.5 h-3.5" /> Administrador
                          </span>
                        ) : (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit">
                            <UserCheck className="w-3.5 h-3.5" /> Editor
                          </span>
                        )}
                        {user.isSuperAdmin && (
                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/25 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit" title="Admin principal: só ele pode alterar a própria senha, e não pode ser removido ou alterado por outros admins.">
                            <Crown className="w-3.5 h-3.5" /> Principal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-mono">{user.userId}</td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Original'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleResetPassword(user.email)}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/20 transition-all inline-flex items-center cursor-pointer"
                        title="Redefinir senha (Enviar E-mail)"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      {(() => {
                        const isSelf = user.userId === currentUserId;
                        const canChangePassword = !isSelf && !user.isSuperAdmin && (user.role === 'editor' || isCurrentUserSuperAdmin);
                        return canChangePassword ? (
                          <button
                            onClick={() => openChangeTargetPassword(user)}
                            className="p-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/20 transition-all inline-flex items-center cursor-pointer"
                            title="Definir nova senha diretamente"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        ) : null;
                      })()}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={users.length <= 1 || user.userId === currentUserId || user.isSuperAdmin || (user.role === 'admin' && !isCurrentUserSuperAdmin)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 border border-red-500/20 transition-all inline-flex items-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={user.isSuperAdmin ? 'O admin principal não pode ser removido' : 'Remover acesso'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal User Creator form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" id="user-form-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-5 h-5" /> Adicionar Usuário
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 border border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-medium" id="modal-error">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2" id="modal-success">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: colega@7zion.com"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wilder block">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nível de Permissão</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('editor')}
                    className={`p-3 rounded-xl border text-left text-sm font-semibold transition-all ${
                      role === 'editor' 
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-white shadow-inner' 
                        : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <p className="font-bold">Editor</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-normal select-none">Pode editar conteúdos mas não usuários</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border text-left text-sm font-semibold transition-all ${
                      role === 'admin' 
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-white shadow-inner' 
                        : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <p className="font-bold">Administrador</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-normal select-none">Acesso total e controle de usuários</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl border border-white/5 text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] text-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Change My Password form */}
      {isMyPasswordOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" id="my-password-form-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsMyPasswordOpen(false)} />
          
          <div className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="text-indigo-400 w-5 h-5" /> Trocar Minha Senha
              </h2>
              <button 
                onClick={() => setIsMyPasswordOpen(false)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 border border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {myPasswordError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                {myPasswordError}
              </div>
            )}

            <form onSubmit={handleUpdateMyPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Senha Atual</label>
                <input
                  type="password"
                  required
                  value={myOldPassword}
                  disabled={isUpdatingPassword}
                  onChange={(e) => setMyOldPassword(e.target.value)}
                  placeholder="Sua senha atual"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nova Senha</label>
                <input
                  type="password"
                  required
                  value={myNewPassword}
                  disabled={isUpdatingPassword}
                  onChange={(e) => setMyNewPassword(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsMyPasswordOpen(false)}
                  disabled={isUpdatingPassword}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl border border-white/5 text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] text-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  {isUpdatingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Change Another User's Password */}
      {passwordTargetUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" id="target-password-form-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setPasswordTargetUser(null)} />

          <div className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="text-purple-400 w-5 h-5" /> Nova Senha para {passwordTargetUser.email}
              </h2>
              <button
                onClick={() => setPasswordTargetUser(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 border border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {targetPasswordError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-medium">
                {targetPasswordError}
              </div>
            )}

            <form onSubmit={handleChangeTargetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nova Senha</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={targetNewPassword}
                  disabled={isChangingTargetPassword}
                  onChange={(e) => setTargetNewPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setPasswordTargetUser(null)}
                  disabled={isChangingTargetPassword}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl border border-white/5 text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingTargetPassword}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-55 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.2)] text-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  {isChangingTargetPassword ? 'Salvando...' : 'Definir Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
