import { createServerFn } from '@tanstack/react-start';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig from '../../supabase-config.json';

// Toda operação aqui roda no servidor com a Service Role Key do Supabase — só pode
// rodar em createServerFn (nunca no client) porque essa chave ignora todas as regras
// de RLS. A autorização (quem pode fazer o quê com quem) é checada manualmente abaixo.
function getServiceRoleClient(): SupabaseClient {
  const serviceRoleKey = typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.');
  }
  return createClient(supabaseConfig.url, serviceRoleKey);
}

async function requireAdminCaller(callerAccessToken: string, adminClient: SupabaseClient) {
  const anonClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  const { data: callerData, error: callerError } = await anonClient.auth.getUser(callerAccessToken);
  if (callerError || !callerData.user) {
    throw new Error('Não autenticado.');
  }

  const { data: callerRow, error: roleError } = await adminClient
    .from('users')
    .select('id, role, is_super_admin')
    .eq('id', callerData.user.id)
    .maybeSingle();
  if (roleError || !callerRow || (callerRow as any).role !== 'admin') {
    throw new Error('Apenas administradores podem realizar esta ação.');
  }

  return callerRow as { id: string; role: 'admin' | 'editor'; is_super_admin: boolean };
}

export const createTeamUser = createServerFn({ method: 'POST' })
  .validator((data: { email: string; password: string; role: 'admin' | 'editor'; callerAccessToken: string }) => data)
  .handler(async ({ data }) => {
    const { email, password, role, callerAccessToken } = data;
    const adminClient = getServiceRoleClient();
    await requireAdminCaller(callerAccessToken, adminClient);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(createError?.message || 'Falha ao criar usuário.');
    }

    const { error: insertError } = await adminClient.from('users').insert({
      id: created.user.id,
      email: created.user.email || email,
      role,
      created_at: new Date().toISOString(),
    });
    if (insertError) {
      throw new Error(insertError.message);
    }

    return { success: true, userId: created.user.id };
  });

// Admin define diretamente uma nova senha para outro usuário (sem precisar de e-mail
// de redefinição). Hierarquia: qualquer admin pode trocar a senha de um editor; só o
// super admin (primeiro admin do projeto) pode trocar a senha de outros admins; a
// senha do próprio super admin só pode ser trocada por ele mesmo (via "Minha Senha").
export const changeTeamUserPassword = createServerFn({ method: 'POST' })
  .validator((data: { targetUserId: string; newPassword: string; callerAccessToken: string }) => data)
  .handler(async ({ data }) => {
    const { targetUserId, newPassword, callerAccessToken } = data;
    if (!newPassword || newPassword.length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
    }

    const adminClient = getServiceRoleClient();
    const caller = await requireAdminCaller(callerAccessToken, adminClient);

    const { data: targetRow, error: targetError } = await adminClient
      .from('users')
      .select('id, role, is_super_admin')
      .eq('id', targetUserId)
      .maybeSingle();
    if (targetError || !targetRow) {
      throw new Error('Usuário-alvo não encontrado.');
    }

    if (targetRow.is_super_admin && targetRow.id !== caller.id) {
      throw new Error('A senha do administrador principal só pode ser alterada por ele mesmo.');
    }
    if (targetRow.role === 'admin' && !caller.is_super_admin && targetRow.id !== caller.id) {
      throw new Error('Apenas o administrador principal pode alterar a senha de outros administradores.');
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });
    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true };
  });

// Remove um usuário por completo: da tabela public.users E do Supabase Auth
// (auth.users). Excluir só a linha da tabela deixava o e-mail "preso" no Auth,
// impedindo recriar um usuário novo com o mesmo e-mail depois.
export const deleteTeamUser = createServerFn({ method: 'POST' })
  .validator((data: { targetUserId: string; callerAccessToken: string }) => data)
  .handler(async ({ data }) => {
    const { targetUserId, callerAccessToken } = data;
    const adminClient = getServiceRoleClient();
    const caller = await requireAdminCaller(callerAccessToken, adminClient);

    if (targetUserId === caller.id) {
      throw new Error('Você não pode remover o seu próprio acesso.');
    }

    const { data: targetRow, error: targetError } = await adminClient
      .from('users')
      .select('id, role, is_super_admin')
      .eq('id', targetUserId)
      .maybeSingle();
    if (targetError || !targetRow) {
      throw new Error('Usuário-alvo não encontrado.');
    }

    if (targetRow.is_super_admin) {
      throw new Error('O administrador principal não pode ser removido.');
    }
    if (targetRow.role === 'admin' && !caller.is_super_admin) {
      throw new Error('Apenas o administrador principal pode remover outros administradores.');
    }

    const { error: deleteRowError } = await adminClient.from('users').delete().eq('id', targetUserId);
    if (deleteRowError) {
      throw new Error(deleteRowError.message);
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (deleteAuthError) {
      throw new Error(deleteAuthError.message);
    }

    return { success: true };
  });
