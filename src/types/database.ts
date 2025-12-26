export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'generator' | 'validator' | 'consumer'
          organization_name: string
          registration_number: string
          email: string
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'generator' | 'validator' | 'consumer'
          organization_name: string
          registration_number: string
          email: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'generator' | 'validator' | 'consumer'
          organization_name?: string
          registration_number?: string
          email?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          hectares: number
          latitude: number
          longitude: number
          address: string | null
          photo_urls: string[]
          video_url: string | null
          status: 'submitted' | 'under-review' | 'verified' | 'rejected'
          co2_tons: number | null
          validator_id: string | null
          validator_notes: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          hectares: number
          latitude: number
          longitude: number
          address?: string | null
          photo_urls?: string[]
          video_url?: string | null
          status?: 'submitted' | 'under-review' | 'verified' | 'rejected'
          co2_tons?: number | null
          validator_id?: string | null
          validator_notes?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          hectares?: number
          latitude?: number
          longitude?: number
          address?: string | null
          photo_urls?: string[]
          video_url?: string | null
          status?: 'submitted' | 'under-review' | 'verified' | 'rejected'
          co2_tons?: number | null
          validator_id?: string | null
          validator_notes?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sensor_data: {
        Row: {
          id: string
          project_id: string
          validator_id: string
          temperature: number | null
          salinity: number | null
          ph: number | null
          dissolved_o2: number | null
          turbidity: number | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          validator_id: string
          temperature?: number | null
          salinity?: number | null
          ph?: number | null
          dissolved_o2?: number | null
          turbidity?: number | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          validator_id?: string
          temperature?: number | null
          salinity?: number | null
          ph?: number | null
          dissolved_o2?: number | null
          turbidity?: number | null
          recorded_at?: string
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          address: string
          balance_inr: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          balance_inr?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          balance_inr?: number
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          wallet_id: string
          name: string
          symbol: string
          balance: number
          inr_value: number
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          name: string
          symbol: string
          balance?: number
          inr_value?: number
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          name?: string
          symbol?: string
          balance?: number
          inr_value?: number
          icon?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          wallet_id: string
          type: 'received' | 'sent' | 'swap' | 'buy'
          token: string
          amount: number
          inr_value: number
          from_address: string | null
          to_address: string | null
          status: 'completed' | 'pending' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          type: 'received' | 'sent' | 'swap' | 'buy'
          token: string
          amount: number
          inr_value: number
          from_address?: string | null
          to_address?: string | null
          status?: 'completed' | 'pending' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          type?: 'received' | 'sent' | 'swap' | 'buy'
          token?: string
          amount?: number
          inr_value?: number
          from_address?: string | null
          to_address?: string | null
          status?: 'completed' | 'pending' | 'failed'
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          wallet_id: string
          credits: number
          price_per_credit: number
          inr_amount: number
          wallet_hash: string
          status: 'completed' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id: string
          credits: number
          price_per_credit: number
          inr_amount: number
          wallet_hash: string
          status?: 'completed' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string
          credits?: number
          price_per_credit?: number
          inr_amount?: number
          wallet_hash?: string
          status?: 'completed' | 'pending'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'generator' | 'validator' | 'consumer'
      verification_status: 'pending' | 'verified' | 'rejected'
      project_status: 'submitted' | 'under-review' | 'verified' | 'rejected'
      transaction_type: 'received' | 'sent' | 'swap' | 'buy'
      transaction_status: 'completed' | 'pending' | 'failed'
      purchase_status: 'completed' | 'pending'
    }
  }
}
