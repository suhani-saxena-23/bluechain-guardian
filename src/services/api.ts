import { supabase } from '@/lib/supabase';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

async function callEdgeFunction(functionName: string, body: any) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    signUp: async (email: string, password: string, metadata: any) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      return data;
    },

    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    getUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  },

  profiles: {
    create: async (profileData: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    get: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },

    update: async (userId: string, updates: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  projects: {
    submit: async (projectData: any) => {
      return callEdgeFunction('submit-project', projectData);
    },

    list: async (filters?: { status?: string; limit?: number; offset?: number }) => {
      return callEdgeFunction('get-projects', filters || {});
    },

    get: async (projectId: string) => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, profiles!projects_user_id_fkey(organization_name, role)')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },

    validate: async (projectId: string, validationData: any) => {
      return callEdgeFunction('validate-project', {
        project_id: projectId,
        ...validationData,
      });
    },

    getMyProjects: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },

  sensorData: {
    submit: async (sensorData: any) => {
      return callEdgeFunction('submit-sensor-data', sensorData);
    },

    getForProject: async (projectId: string) => {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('project_id', projectId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },

  wallet: {
    create: async () => {
      return callEdgeFunction('create-wallet', {});
    },

    get: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },

    getAssets: async (walletId: string) => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('wallet_id', walletId);
      if (error) throw error;
      return data;
    },

    getTransactions: async (walletId: string) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  },

  purchases: {
    create: async (purchaseData: any) => {
      return callEdgeFunction('purchase-credits', purchaseData);
    },

    list: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },
};
