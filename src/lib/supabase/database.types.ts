export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      app_feedback: {
        Row: {
          comment: string | null;
          created_at: string;
          household_id: string;
          id: string;
          rating: number | null;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          household_id: string;
          id?: string;
          rating?: number | null;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          household_id?: string;
          id?: string;
          rating?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_feedback_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'app_feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      appointments: {
        Row: {
          address: string | null;
          appointment_date: string;
          appointment_time: string | null;
          created_at: string;
          created_by: string;
          household_id: string;
          id: string;
          is_shared: boolean;
          notes: string | null;
          title: string;
        };
        Insert: {
          address?: string | null;
          appointment_date: string;
          appointment_time?: string | null;
          created_at?: string;
          created_by: string;
          household_id: string;
          id?: string;
          is_shared?: boolean;
          notes?: string | null;
          title: string;
        };
        Update: {
          address?: string | null;
          appointment_date?: string;
          appointment_time?: string | null;
          created_at?: string;
          created_by?: string;
          household_id?: string;
          id?: string;
          is_shared?: boolean;
          notes?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'appointments_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'appointments_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      baby_size_by_week: {
        Row: {
          fruit_label: string;
          length_cm: number | null;
          week: number;
        };
        Insert: {
          fruit_label: string;
          length_cm?: number | null;
          week: number;
        };
        Update: {
          fruit_label?: string;
          length_cm?: number | null;
          week?: number;
        };
        Relationships: [];
      };
      checklist_item_templates: {
        Row: {
          checklist_slug: string;
          id: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          checklist_slug: string;
          id?: string;
          label: string;
          sort_order?: number;
        };
        Update: {
          checklist_slug?: string;
          id?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          address: string | null;
          created_at: string;
          household_id: string;
          id: string;
          is_emergency: boolean;
          name: string;
          phone: string | null;
          role_label: string | null;
          sort_order: number;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          household_id: string;
          id?: string;
          is_emergency?: boolean;
          name: string;
          phone?: string | null;
          role_label?: string | null;
          sort_order?: number;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          household_id?: string;
          id?: string;
          is_emergency?: boolean;
          name?: string;
          phone?: string | null;
          role_label?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'contacts_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      exercises: {
        Row: {
          description: string | null;
          duration_label: string | null;
          id: string;
          image_url: string | null;
          sort_order: number;
          title: string;
          trimester: number;
        };
        Insert: {
          description?: string | null;
          duration_label?: string | null;
          id?: string;
          image_url?: string | null;
          sort_order?: number;
          title: string;
          trimester: number;
        };
        Update: {
          description?: string | null;
          duration_label?: string | null;
          id?: string;
          image_url?: string | null;
          sort_order?: number;
          title?: string;
          trimester?: number;
        };
        Relationships: [];
      };
      gesture_suggestions: {
        Row: {
          body: string;
          id: string;
          sort_order: number;
          target_role: string;
        };
        Insert: {
          body: string;
          id?: string;
          sort_order?: number;
          target_role: string;
        };
        Update: {
          body?: string;
          id?: string;
          sort_order?: number;
          target_role?: string;
        };
        Relationships: [];
      };
      household_checklist_items: {
        Row: {
          checked: boolean;
          checklist_item_template_id: string;
          household_id: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          checked?: boolean;
          checklist_item_template_id: string;
          household_id: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          checked?: boolean;
          checklist_item_template_id?: string;
          household_id?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'household_checklist_items_checklist_item_template_id_fkey';
            columns: ['checklist_item_template_id'];
            isOneToOne: false;
            referencedRelation: 'checklist_item_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'household_checklist_items_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      household_info_items: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          label: string;
          sort_order: number;
          value: string | null;
        };
        Insert: {
          created_at?: string;
          household_id: string;
          id?: string;
          label: string;
          sort_order?: number;
          value?: string | null;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          value?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'household_info_items_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      household_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          household_id: string;
          id: string;
          invited_email: string;
          status: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          household_id: string;
          id?: string;
          invited_email: string;
          status?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          household_id?: string;
          id?: string;
          invited_email?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'household_invites_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
        ];
      };
      household_procedures: {
        Row: {
          household_id: string;
          id: string;
          procedure_template_id: string;
          reminder_enabled: boolean;
          status: string;
          updated_at: string;
        };
        Insert: {
          household_id: string;
          id?: string;
          procedure_template_id: string;
          reminder_enabled?: boolean;
          status?: string;
          updated_at?: string;
        };
        Update: {
          household_id?: string;
          id?: string;
          procedure_template_id?: string;
          reminder_enabled?: boolean;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'household_procedures_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'household_procedures_procedure_template_id_fkey';
            columns: ['procedure_template_id'];
            isOneToOne: false;
            referencedRelation: 'procedure_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      households: {
        Row: {
          accompaniment_type: string | null;
          birth_date: string | null;
          created_at: string;
          due_date: string | null;
          id: string;
          is_first_child: boolean | null;
          partner_first_name: string | null;
          partner_user_id: string | null;
          partner_uses_app: boolean;
          pregnant_user_id: string;
          priorities: string[];
          professional_status: string | null;
          region: string | null;
          reminder_frequency: string | null;
        };
        Insert: {
          accompaniment_type?: string | null;
          birth_date?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          is_first_child?: boolean | null;
          partner_first_name?: string | null;
          partner_user_id?: string | null;
          partner_uses_app?: boolean;
          pregnant_user_id: string;
          priorities?: string[];
          professional_status?: string | null;
          region?: string | null;
          reminder_frequency?: string | null;
        };
        Update: {
          accompaniment_type?: string | null;
          birth_date?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          is_first_child?: boolean | null;
          partner_first_name?: string | null;
          partner_user_id?: string | null;
          partner_uses_app?: boolean;
          pregnant_user_id?: string;
          priorities?: string[];
          professional_status?: string | null;
          region?: string | null;
          reminder_frequency?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'households_partner_user_id_fkey';
            columns: ['partner_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'households_pregnant_user_id_fkey';
            columns: ['pregnant_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      mood_checkins: {
        Row: {
          checkin_date: string;
          created_at: string;
          household_id: string;
          id: string;
          mood: string;
          need_note: string | null;
          user_id: string;
        };
        Insert: {
          checkin_date: string;
          created_at?: string;
          household_id: string;
          id?: string;
          mood: string;
          need_note?: string | null;
          user_id: string;
        };
        Update: {
          checkin_date?: string;
          created_at?: string;
          household_id?: string;
          id?: string;
          mood?: string;
          need_note?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mood_checkins_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mood_checkins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      procedure_templates: {
        Row: {
          deadline_days_after_birth: number | null;
          description: string | null;
          documents: string[];
          id: string;
          official_link: string | null;
          slug: string;
          sort_order: number;
          title: string;
        };
        Insert: {
          deadline_days_after_birth?: number | null;
          description?: string | null;
          documents?: string[];
          id?: string;
          official_link?: string | null;
          slug: string;
          sort_order?: number;
          title: string;
        };
        Update: {
          deadline_days_after_birth?: number | null;
          description?: string | null;
          documents?: string[];
          id?: string;
          official_link?: string | null;
          slug?: string;
          sort_order?: number;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          first_name: string | null;
          id: string;
          theme: string;
        };
        Insert: {
          created_at?: string;
          first_name?: string | null;
          id: string;
          theme?: string;
        };
        Update: {
          created_at?: string;
          first_name?: string | null;
          id?: string;
          theme?: string;
        };
        Relationships: [];
      };
      symptoms_log: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          log_date: string;
          symptoms: string[];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          household_id: string;
          id?: string;
          log_date: string;
          symptoms?: string[];
          user_id: string;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          log_date?: string;
          symptoms?: string[];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'symptoms_log_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'symptoms_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_household_invite: { Args: never; Returns: string };
      household_role: { Args: { hh_id: string }; Returns: string };
      is_household_member: { Args: { hh_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
