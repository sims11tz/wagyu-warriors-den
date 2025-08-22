export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      avatar_options: {
        Row: {
          age_group: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          image_url: string
          name: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id: string
          image_url: string
          name: string
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      cigar_lounges: {
        Row: {
          created_at: string
          host_user_id: string
          id: string
          is_active: boolean
          max_members: number
          name: string
        }
        Insert: {
          created_at?: string
          host_user_id: string
          id?: string
          is_active?: boolean
          max_members?: number
          name: string
        }
        Update: {
          created_at?: string
          host_user_id?: string
          id?: string
          is_active?: boolean
          max_members?: number
          name?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          dress_code: string | null
          ends_at: string
          id: string
          menu_highlights: string[] | null
          starts_at: string
          title: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dress_code?: string | null
          ends_at: string
          id?: string
          menu_highlights?: string[] | null
          starts_at: string
          title: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dress_code?: string | null
          ends_at?: string
          id?: string
          menu_highlights?: string[] | null
          starts_at?: string
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      lounge_chat: {
        Row: {
          created_at: string
          id: string
          lounge_id: string
          message: string
          message_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lounge_id: string
          message: string
          message_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lounge_id?: string
          message?: string
          message_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lounge_chat_lounge_id_fkey"
            columns: ["lounge_id"]
            isOneToOne: false
            referencedRelation: "cigar_lounges"
            referencedColumns: ["id"]
          },
        ]
      }
      lounge_members: {
        Row: {
          cigar_status: string | null
          id: string
          joined_at: string
          last_seen: string
          lounge_id: string
          selected_cigar_id: number | null
          user_id: string
        }
        Insert: {
          cigar_status?: string | null
          id?: string
          joined_at?: string
          last_seen?: string
          lounge_id: string
          selected_cigar_id?: number | null
          user_id: string
        }
        Update: {
          cigar_status?: string | null
          id?: string
          joined_at?: string
          last_seen?: string
          lounge_id?: string
          selected_cigar_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lounge_members_lounge_id_fkey"
            columns: ["lounge_id"]
            isOneToOne: false
            referencedRelation: "cigar_lounges"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_verified: boolean | null
          avatar_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          favorites: Json | null
          handle: string | null
          id: string
          marbling_points: number | null
          public_profile: boolean | null
          sear_score: number | null
          smoke_rings: number | null
          tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_verified?: boolean | null
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          favorites?: Json | null
          handle?: string | null
          id?: string
          marbling_points?: number | null
          public_profile?: boolean | null
          sear_score?: number | null
          smoke_rings?: number | null
          tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_verified?: boolean | null
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          favorites?: Json | null
          handle?: string | null
          id?: string
          marbling_points?: number | null
          public_profile?: boolean | null
          sear_score?: number | null
          smoke_rings?: number | null
          tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_inactive_members: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_lounge_member: {
        Args: { p_lounge_id: string; p_user_id?: string }
        Returns: boolean
      }
      update_member_last_seen: {
        Args: { p_lounge_id: string }
        Returns: undefined
      }
      verify_user_age: {
        Args: { birth_date: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
