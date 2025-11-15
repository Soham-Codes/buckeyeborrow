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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      borrow_requests: {
        Row: {
          agreed_to_guidelines: boolean
          contact_phone: string
          created_at: string
          id: string
          item_id: string
          needed_from: string
          needed_until: string
          purpose: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agreed_to_guidelines?: boolean
          contact_phone: string
          created_at?: string
          id?: string
          item_id: string
          needed_from: string
          needed_until: string
          purpose: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agreed_to_guidelines?: boolean
          contact_phone?: string
          created_at?: string
          id?: string
          item_id?: string
          needed_from?: string
          needed_until?: string
          purpose?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrow_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          borrower_expectations: string | null
          campus_area: string
          category: string
          condition_notes: string | null
          contact_method: string
          cost_type: string
          created_at: string | null
          id: string
          item_name: string
          item_number: string
          max_borrow_duration: string
          owner_id: string
          photo_url: string | null
          pickup_location: string
          pickup_time_window: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          borrower_expectations?: string | null
          campus_area: string
          category: string
          condition_notes?: string | null
          contact_method: string
          cost_type: string
          created_at?: string | null
          id?: string
          item_name: string
          item_number?: string
          max_borrow_duration: string
          owner_id: string
          photo_url?: string | null
          pickup_location: string
          pickup_time_window: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          borrower_expectations?: string | null
          campus_area?: string
          category?: string
          condition_notes?: string | null
          contact_method?: string
          cost_type?: string
          created_at?: string | null
          id?: string
          item_name?: string
          item_number?: string
          max_borrow_duration?: string
          owner_id?: string
          photo_url?: string | null
          pickup_location?: string
          pickup_time_window?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          dorm_area: string | null
          full_name: string
          id: string
          profile_photo_url: string | null
          rating: number | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          dorm_area?: string | null
          full_name: string
          id: string
          profile_photo_url?: string | null
          rating?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          dorm_area?: string | null
          full_name?: string
          id?: string
          profile_photo_url?: string | null
          rating?: number | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          comment_text: string
          commenter_id: string
          created_at: string | null
          id: string
          listing_number: string | null
          request_id: string
        }
        Insert: {
          comment_text: string
          commenter_id: string
          created_at?: string | null
          id?: string
          listing_number?: string | null
          request_id: string
        }
        Update: {
          comment_text?: string
          commenter_id?: string
          created_at?: string | null
          id?: string
          listing_number?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          additional_details: string | null
          created_at: string | null
          id: string
          item_name: string
          needed_by_date: string
          purpose: string
          request_number: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          additional_details?: string | null
          created_at?: string | null
          id?: string
          item_name: string
          needed_by_date: string
          purpose: string
          request_number: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_details?: string | null
          created_at?: string | null
          id?: string
          item_name?: string
          needed_by_date?: string
          purpose?: string
          request_number?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          borrow_request_notifications: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          profile_visibility: boolean | null
          return_reminders: boolean | null
          show_email: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          borrow_request_notifications?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          profile_visibility?: boolean | null
          return_reminders?: boolean | null
          show_email?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          borrow_request_notifications?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          profile_visibility?: boolean | null
          return_reminders?: boolean | null
          show_email?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_item_number: { Args: never; Returns: string }
      generate_request_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
