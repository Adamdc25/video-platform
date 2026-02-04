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
          email: string | null
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          is_admin: boolean
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_invites: {
        Row: {
          id: string
          token: string
          email: string | null
          created_by: string
          used_by: string | null
          used_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          email?: string | null
          created_by: string
          used_by?: string | null
          used_at?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          email?: string | null
          created_by?: string
          used_by?: string | null
          used_at?: string | null
          expires_at?: string
          created_at?: string
        }
      }
      series: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          series_id: string | null
          title: string
          description: string | null
          video_url: string
          trailer_url: string | null
          thumbnail_url: string | null
          vertical_thumbnail_url: string | null
          duration_seconds: number | null
          episode_number: number | null
          season_number: number | null
          slug: string
          view_count: number
          is_published: boolean
          top_10_rank: number | null
          created_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          series_id?: string | null
          title: string
          description?: string | null
          video_url: string
          trailer_url?: string | null
          thumbnail_url?: string | null
          vertical_thumbnail_url?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          season_number?: number | null
          slug: string
          view_count?: number
          is_published?: boolean
          top_10_rank?: number | null
          created_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          series_id?: string | null
          title?: string
          description?: string | null
          video_url?: string
          trailer_url?: string | null
          thumbnail_url?: string | null
          vertical_thumbnail_url?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          season_number?: number | null
          slug?: string
          view_count?: number
          is_published?: boolean
          top_10_rank?: number | null
          created_at?: string
          published_at?: string | null
        }
      }
      watch_progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          progress_seconds: number
          completed: boolean
          last_watched: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          progress_seconds?: number
          completed?: boolean
          last_watched?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          progress_seconds?: number
          completed?: boolean
          last_watched?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          video_id: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          added_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      video_categories: {
        Row: {
          video_id: string
          category_id: string
        }
        Insert: {
          video_id: string
          category_id: string
        }
        Update: {
          video_id?: string
          category_id?: string
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
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Series = Database['public']['Tables']['series']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type WatchProgress = Database['public']['Tables']['watch_progress']['Row']
export type Watchlist = Database['public']['Tables']['watchlist']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type AdminInvite = Database['public']['Tables']['admin_invites']['Row']
