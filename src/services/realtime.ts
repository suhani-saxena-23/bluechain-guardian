import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribeToProjects(callback: (payload: any) => void): () => void {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        callback
      )
      .subscribe();

    this.channels.set('projects', channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete('projects');
    };
  }

  subscribeToUserProjects(userId: string, callback: (payload: any) => void): () => void {
    const channel = supabase
      .channel(`user-projects-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(`user-projects-${userId}`, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(`user-projects-${userId}`);
    };
  }

  subscribeToWallet(walletId: string, callback: (payload: any) => void): () => void {
    const channel = supabase
      .channel(`wallet-${walletId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `wallet_id=eq.${walletId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(`wallet-${walletId}`, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(`wallet-${walletId}`);
    };
  }

  subscribeToAssets(walletId: string, callback: (payload: any) => void): () => void {
    const channel = supabase
      .channel(`assets-${walletId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `wallet_id=eq.${walletId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(`assets-${walletId}`, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(`assets-${walletId}`);
    };
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
