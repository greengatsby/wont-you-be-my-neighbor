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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_validations: {
        Row: {
          app: string
          created_at: string
          description: string
          feature: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["admin_validation_priority"]
          sort_order: number
          status: Database["public"]["Enums"]["admin_validation_status"]
          type: Database["public"]["Enums"]["admin_validation_type"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          app: string
          created_at?: string
          description: string
          feature: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["admin_validation_priority"]
          sort_order: number
          status?: Database["public"]["Enums"]["admin_validation_status"]
          type?: Database["public"]["Enums"]["admin_validation_type"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          app?: string
          created_at?: string
          description?: string
          feature?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["admin_validation_priority"]
          sort_order?: number
          status?: Database["public"]["Enums"]["admin_validation_status"]
          type?: Database["public"]["Enums"]["admin_validation_type"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      agent_tools: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          tool_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          tool_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tools_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      andrew_admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          organization_id: string
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "andrew_admin_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "andrew_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      andrew_extensiv_facilities: {
        Row: {
          created_at: string
          customer_id: string
          facility_id: string
          facility_name: string
          id: string
          is_default: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string
          facility_id: string
          facility_name: string
          id?: string
          is_default?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          facility_id?: string
          facility_name?: string
          id?: string
          is_default?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      andrew_extensiv_orders_synced: {
        Row: {
          created_at: string
          creation_date: string
          creation_hour: number | null
          customer_id: string
          customer_name: string | null
          days_late: number | null
          deadline: string | null
          facility_id: string
          id: string
          is_closed: boolean | null
          is_on_time: boolean | null
          on_time_rule: string | null
          order_id: string
          packaging_cost: number | null
          raw_order_data: Json | null
          reference_num: string | null
          ship_date: string | null
          shipping_cost: number | null
          shipping_revenue: number | null
          sync_version: number | null
          synced_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creation_date: string
          creation_hour?: number | null
          customer_id: string
          customer_name?: string | null
          days_late?: number | null
          deadline?: string | null
          facility_id: string
          id?: string
          is_closed?: boolean | null
          is_on_time?: boolean | null
          on_time_rule?: string | null
          order_id: string
          packaging_cost?: number | null
          raw_order_data?: Json | null
          reference_num?: string | null
          ship_date?: string | null
          shipping_cost?: number | null
          shipping_revenue?: number | null
          sync_version?: number | null
          synced_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creation_date?: string
          creation_hour?: number | null
          customer_id?: string
          customer_name?: string | null
          days_late?: number | null
          deadline?: string | null
          facility_id?: string
          id?: string
          is_closed?: boolean | null
          is_on_time?: boolean | null
          on_time_rule?: string | null
          order_id?: string
          packaging_cost?: number | null
          raw_order_data?: Json | null
          reference_num?: string | null
          ship_date?: string | null
          shipping_cost?: number | null
          shipping_revenue?: number | null
          sync_version?: number | null
          synced_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      andrew_extensiv_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_id: string
          error_message: string | null
          facility_id: string
          id: string
          job_type: string
          orders_fetched: number | null
          orders_inserted: number | null
          orders_updated: number | null
          retry_count: number | null
          started_at: string | null
          status: string
          sync_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_id: string
          error_message?: string | null
          facility_id: string
          id?: string
          job_type: string
          orders_fetched?: number | null
          orders_inserted?: number | null
          orders_updated?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
          sync_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          error_message?: string | null
          facility_id?: string
          id?: string
          job_type?: string
          orders_fetched?: number | null
          orders_inserted?: number | null
          orders_updated?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
          sync_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      andrew_extensiv_tokens: {
        Row: {
          access_token: string
          company_id: string
          created_at: string
          expires_at: string | null
          organization_id: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          company_id: string
          created_at?: string
          expires_at?: string | null
          organization_id?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          company_id?: string
          created_at?: string
          expires_at?: string | null
          organization_id?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "andrew_extensiv_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "andrew_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      andrew_ghl_oauth_state: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          state: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          state: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          state?: string
          used?: boolean | null
        }
        Relationships: []
      }
      andrew_ghl_tokens: {
        Row: {
          access_token: string
          company_name: string | null
          created_at: string
          expires_at: string
          location_id: string
          organization_id: string | null
          refresh_token: string
          refresh_token_expires_at: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          company_name?: string | null
          created_at?: string
          expires_at: string
          location_id: string
          organization_id?: string | null
          refresh_token: string
          refresh_token_expires_at?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          company_name?: string | null
          created_at?: string
          expires_at?: string
          location_id?: string
          organization_id?: string | null
          refresh_token?: string
          refresh_token_expires_at?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "andrew_ghl_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "andrew_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      andrew_organizations: {
        Row: {
          created_at: string
          extensiv_company_id: string | null
          extensiv_connected_at: string | null
          ghl_api_key: string | null
          ghl_connected_at: string | null
          ghl_location_id: string | null
          id: string
          name: string
          qbo_connected_at: string | null
          qbo_realm_id: string | null
          updated_at: string
          xero_connected_at: string | null
          xero_tenant_id: string | null
        }
        Insert: {
          created_at?: string
          extensiv_company_id?: string | null
          extensiv_connected_at?: string | null
          ghl_api_key?: string | null
          ghl_connected_at?: string | null
          ghl_location_id?: string | null
          id?: string
          name: string
          qbo_connected_at?: string | null
          qbo_realm_id?: string | null
          updated_at?: string
          xero_connected_at?: string | null
          xero_tenant_id?: string | null
        }
        Update: {
          created_at?: string
          extensiv_company_id?: string | null
          extensiv_connected_at?: string | null
          ghl_api_key?: string | null
          ghl_connected_at?: string | null
          ghl_location_id?: string | null
          id?: string
          name?: string
          qbo_connected_at?: string | null
          qbo_realm_id?: string | null
          updated_at?: string
          xero_connected_at?: string | null
          xero_tenant_id?: string | null
        }
        Relationships: []
      }
      andrew_qbo_oauth_state: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          state: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          state: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          state?: string
          used?: boolean | null
        }
        Relationships: []
      }
      andrew_qbo_tokens: {
        Row: {
          access_token: string
          company_name: string | null
          created_at: string
          expires_at: string
          organization_id: string | null
          realm_id: string
          refresh_token: string
          refresh_token_expires_at: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          company_name?: string | null
          created_at?: string
          expires_at: string
          organization_id?: string | null
          realm_id: string
          refresh_token: string
          refresh_token_expires_at?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          company_name?: string | null
          created_at?: string
          expires_at?: string
          organization_id?: string | null
          realm_id?: string
          refresh_token?: string
          refresh_token_expires_at?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "andrew_qbo_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "andrew_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      andrew_users: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          organization_id: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          organization_id: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "andrew_user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "andrew_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      andrew_xero_oauth_state: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          state: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          state: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          state?: string
          used?: boolean | null
        }
        Relationships: []
      }
      andrew_xero_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          organization_id: string | null
          refresh_token: string
          refresh_token_expires_at: string | null
          scope: string | null
          tenant_id: string
          tenant_name: string | null
          tenant_type: string | null
          token_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          organization_id?: string | null
          refresh_token: string
          refresh_token_expires_at?: string | null
          scope?: string | null
          tenant_id: string
          tenant_name?: string | null
          tenant_type?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          organization_id?: string | null
          refresh_token?: string
          refresh_token_expires_at?: string | null
          scope?: string | null
          tenant_id?: string
          tenant_name?: string | null
          tenant_type?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "andrew_xero_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "andrew_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_analyses: {
        Row: {
          confidence: number | null
          created_at: string
          flagged: boolean
          id: string
          labels: Json | null
          model: string
          on_task: boolean
          reasons: string | null
          screenshot_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          flagged?: boolean
          id?: string
          labels?: Json | null
          model: string
          on_task: boolean
          reasons?: string | null
          screenshot_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          flagged?: boolean
          id?: string
          labels?: Json | null
          model?: string
          on_task?: boolean
          reasons?: string | null
          screenshot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_analyses_screenshot_id_fkey"
            columns: ["screenshot_id"]
            isOneToOne: false
            referencedRelation: "clock_screenshots"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "clock_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_clients: {
        Row: {
          color: string | null
          company: string | null
          created_at: string
          description: string | null
          email: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          company?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          company?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "clock_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clock_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_meeting_projects: {
        Row: {
          auto_detected: boolean | null
          confidence_score: number | null
          created_at: string | null
          id: string
          meeting_id: string
          project_id: string
        }
        Insert: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          meeting_id: string
          project_id: string
        }
        Update: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          meeting_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_meeting_projects_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "clock_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_meeting_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "clock_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_meetings: {
        Row: {
          audio_url: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          organization_id: string | null
          started_at: string
          tasks_generated: boolean
          transcription_entries: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          started_at?: string
          tasks_generated?: boolean
          transcription_entries?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          started_at?: string
          tasks_generated?: boolean
          transcription_entries?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "clock_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clock_meetings_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "clock_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_organizations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      clock_project_repos: {
        Row: {
          created_at: string | null
          default_branch: string | null
          description: string | null
          id: string
          name: string
          project_id: string
          repo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_branch?: string | null
          description?: string | null
          id?: string
          name: string
          project_id: string
          repo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_branch?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          repo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clock_project_repos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "clock_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_projects: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clock_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "clock_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_repo_user_paths: {
        Row: {
          created_at: string | null
          id: string
          is_valid: boolean | null
          last_validated_at: string | null
          local_path: string
          repo_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          local_path: string
          repo_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          local_path?: string
          repo_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_repo_user_paths_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "clock_project_repos"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_screenshots: {
        Row: {
          app_name: string | null
          captured_at: string
          created_at: string
          height: number | null
          id: string
          session_id: string
          storage_path: string
          url: string | null
          width: number | null
          window_title: string | null
        }
        Insert: {
          app_name?: string | null
          captured_at?: string
          created_at?: string
          height?: number | null
          id?: string
          session_id: string
          storage_path: string
          url?: string | null
          width?: number | null
          window_title?: string | null
        }
        Update: {
          app_name?: string | null
          captured_at?: string
          created_at?: string
          height?: number | null
          id?: string
          session_id?: string
          storage_path?: string
          url?: string | null
          width?: number | null
          window_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clock_screenshots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clock_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_session_edits: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_duration_ms: number | null
          old_duration_ms: number | null
          session_id: string
          source: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_duration_ms?: number | null
          old_duration_ms?: number | null
          session_id: string
          source?: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_duration_ms?: number | null
          old_duration_ms?: number | null
          session_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_session_edits_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "clock_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_session_edits_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clock_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_sessions: {
        Row: {
          active_duration_ms: number | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          note: string | null
          project_name: string | null
          source: string
          started_at: string
          task_id: string | null
          task_notion_page_id: string | null
          task_title: string | null
          user_id: string
        }
        Insert: {
          active_duration_ms?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          note?: string | null
          project_name?: string | null
          source?: string
          started_at?: string
          task_id?: string | null
          task_notion_page_id?: string | null
          task_title?: string | null
          user_id: string
        }
        Update: {
          active_duration_ms?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          note?: string | null
          project_name?: string | null
          source?: string
          started_at?: string
          task_id?: string | null
          task_notion_page_id?: string | null
          task_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "clock_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_settings: {
        Row: {
          auto_idle_threshold_seconds: number
          blur_faces: boolean
          blur_text: boolean
          created_at: string
          privacy_level: string
          randomize_interval: boolean
          screenshot_interval_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_idle_threshold_seconds?: number
          blur_faces?: boolean
          blur_text?: boolean
          created_at?: string
          privacy_level?: string
          randomize_interval?: boolean
          screenshot_interval_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_idle_threshold_seconds?: number
          blur_faces?: boolean
          blur_text?: boolean
          created_at?: string
          privacy_level?: string
          randomize_interval?: boolean
          screenshot_interval_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clock_task_activity: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_task_activity_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "clock_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "clock_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_task_generation_history: {
        Row: {
          codebase_queries: Json | null
          created_at: string | null
          generation_metadata: Json | null
          id: string
          llm_model: string | null
          meeting_id: string
          project_id: string
          tasks_created: string[] | null
          tasks_updated: string[] | null
          transcript_id: string | null
        }
        Insert: {
          codebase_queries?: Json | null
          created_at?: string | null
          generation_metadata?: Json | null
          id?: string
          llm_model?: string | null
          meeting_id: string
          project_id: string
          tasks_created?: string[] | null
          tasks_updated?: string[] | null
          transcript_id?: string | null
        }
        Update: {
          codebase_queries?: Json | null
          created_at?: string | null
          generation_metadata?: Json | null
          id?: string
          llm_model?: string | null
          meeting_id?: string
          project_id?: string
          tasks_created?: string[] | null
          tasks_updated?: string[] | null
          transcript_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clock_task_generation_history_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "clock_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_task_generation_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "clock_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_task_generation_history_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "clock_transcriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_task_templates: {
        Row: {
          created_at: string | null
          description: string | null
          fields: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fields: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clock_tasks: {
        Row: {
          acceptance_criteria: Json | null
          archived: boolean | null
          assignee_id: string | null
          category_id: string | null
          client_id: string | null
          completed_at: string | null
          content: Json | null
          context: Json | null
          created_at: string
          dependencies: Json | null
          description: string | null
          due_date: string | null
          estimate: Json | null
          id: string
          last_activity_at: string | null
          last_session_at: string | null
          metrics: Json | null
          on_task_ratio: number | null
          order_index: number
          parent_id: string | null
          priority: string | null
          problem: Json | null
          project_id: string | null
          relevant_files: Json | null
          review_checklist: Json | null
          solution: Json | null
          source_meeting_id: string | null
          started_at: string | null
          status: string
          tags: string[] | null
          task_type: Database["public"]["Enums"]["task_type"] | null
          title: string
          total_duration_ms: number | null
          transcription_id: string | null
          updated_at: string
          user_id: string
          validation_path: Json | null
        }
        Insert: {
          acceptance_criteria?: Json | null
          archived?: boolean | null
          assignee_id?: string | null
          category_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          content?: Json | null
          context?: Json | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          due_date?: string | null
          estimate?: Json | null
          id?: string
          last_activity_at?: string | null
          last_session_at?: string | null
          metrics?: Json | null
          on_task_ratio?: number | null
          order_index?: number
          parent_id?: string | null
          priority?: string | null
          problem?: Json | null
          project_id?: string | null
          relevant_files?: Json | null
          review_checklist?: Json | null
          solution?: Json | null
          source_meeting_id?: string | null
          started_at?: string | null
          status?: string
          tags?: string[] | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          title: string
          total_duration_ms?: number | null
          transcription_id?: string | null
          updated_at?: string
          user_id: string
          validation_path?: Json | null
        }
        Update: {
          acceptance_criteria?: Json | null
          archived?: boolean | null
          assignee_id?: string | null
          category_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          content?: Json | null
          context?: Json | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          due_date?: string | null
          estimate?: Json | null
          id?: string
          last_activity_at?: string | null
          last_session_at?: string | null
          metrics?: Json | null
          on_task_ratio?: number | null
          order_index?: number
          parent_id?: string | null
          priority?: string | null
          problem?: Json | null
          project_id?: string | null
          relevant_files?: Json | null
          review_checklist?: Json | null
          solution?: Json | null
          source_meeting_id?: string | null
          started_at?: string | null
          status?: string
          tags?: string[] | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          title?: string
          total_duration_ms?: number | null
          transcription_id?: string | null
          updated_at?: string
          user_id?: string
          validation_path?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clock_tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "clock_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clock_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "clock_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "clock_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tasks_source_meeting_id_fkey"
            columns: ["source_meeting_id"]
            isOneToOne: false
            referencedRelation: "clock_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_tasks_transcription_id_fkey"
            columns: ["transcription_id"]
            isOneToOne: false
            referencedRelation: "clock_transcriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_transcriptions: {
        Row: {
          assigned_user_id: string | null
          conversation_history: Json | null
          created_at: string | null
          filled_template: Json | null
          id: string
          questions: Json | null
          status: string | null
          task_id: string | null
          template_id: string | null
          transcription_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_user_id?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          filled_template?: Json | null
          id?: string
          questions?: Json | null
          status?: string | null
          task_id?: string | null
          template_id?: string | null
          transcription_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_user_id?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          filled_template?: Json | null
          id?: string
          questions?: Json | null
          status?: string | null
          task_id?: string | null
          template_id?: string | null
          transcription_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_transcriptions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "clock_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_transcriptions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "clock_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          screenshots_enabled: boolean
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_seen_at?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          screenshots_enabled?: boolean
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          screenshots_enabled?: boolean
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "clock_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_checkout_rate_limits: {
        Row: {
          attempted_at: string
          id: string
          ip_address: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      dev_proposal_access_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          ip_address: string
          proposal_slug: string
          success: boolean | null
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          ip_address: string
          proposal_slug: string
          success?: boolean | null
        }
        Update: {
          attempted_at?: string | null
          id?: string
          ip_address?: string
          proposal_slug?: string
          success?: boolean | null
        }
        Relationships: []
      }
      dev_proposals: {
        Row: {
          access_password: string | null
          calendar_link: string | null
          created_at: string | null
          email: string | null
          hero_cta_link: string
          hero_cta_text: string
          hero_headline: string
          hero_subheadline: string
          id: string
          logo_url: string | null
          organization_name: string
          phone_number: string | null
          primary_color: string | null
          secondary_color: string | null
          sections: Json | null
          status: string | null
          title: string
          updated_at: string | null
          url_slug: string
        }
        Insert: {
          access_password?: string | null
          calendar_link?: string | null
          created_at?: string | null
          email?: string | null
          hero_cta_link: string
          hero_cta_text: string
          hero_headline: string
          hero_subheadline: string
          id?: string
          logo_url?: string | null
          organization_name: string
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sections?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          url_slug: string
        }
        Update: {
          access_password?: string | null
          calendar_link?: string | null
          created_at?: string | null
          email?: string | null
          hero_cta_link?: string
          hero_cta_text?: string
          hero_headline?: string
          hero_subheadline?: string
          id?: string
          logo_url?: string | null
          organization_name?: string
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sections?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          url_slug?: string
        }
        Relationships: []
      }
      dev_service_purchases: {
        Row: {
          amount_paid: number
          completed_at: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          id: string
          metadata: Json | null
          minutes_purchased: number
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string
        }
        Insert: {
          amount_paid: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          minutes_purchased: number
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          minutes_purchased?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecosystem_participant_groups: {
        Row: {
          average_feedback_score: number | null
          conversion_rate: number
          count: number
          created_at: string | null
          description: string | null
          id: string
          name: string
          program_id: string
          updated_at: string | null
        }
        Insert: {
          average_feedback_score?: number | null
          conversion_rate?: number
          count?: number
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          program_id: string
          updated_at?: string | null
        }
        Update: {
          average_feedback_score?: number | null
          conversion_rate?: number
          count?: number
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          program_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_participant_groups_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_programs: {
        Row: {
          cost_dollars: number
          cost_hours: number
          created_at: string | null
          description: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          cost_dollars?: number
          cost_hours?: number
          created_at?: string | null
          description: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          cost_dollars?: number
          cost_hours?: number
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      elena_players: {
        Row: {
          created_at: string
          id: string
          is_elena: boolean
          is_host: boolean
          name: string
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_elena?: boolean
          is_host?: boolean
          name: string
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_elena?: boolean
          is_host?: boolean
          name?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elena_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "elena_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      elena_riddles: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          order_index: number
          text: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          order_index: number
          text: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          order_index?: number
          text?: string
        }
        Relationships: []
      }
      elena_rooms: {
        Row: {
          code: string
          created_at: string
          current_phase: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_phase?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_phase?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      elena_scores: {
        Row: {
          created_at: string
          id: string
          player_id: string
          points: number
          reason: string | null
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          points: number
          reason?: string | null
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          points?: number
          reason?: string | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elena_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "elena_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elena_scores_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "elena_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      elena_submissions: {
        Row: {
          answer_text: string | null
          challenge_type: string
          created_at: string
          id: string
          justification_text: string | null
          message_text: string | null
          phase: string
          player_id: string
          riddle_id: string | null
          room_id: string
          target_player_id: string | null
        }
        Insert: {
          answer_text?: string | null
          challenge_type: string
          created_at?: string
          id?: string
          justification_text?: string | null
          message_text?: string | null
          phase: string
          player_id: string
          riddle_id?: string | null
          room_id: string
          target_player_id?: string | null
        }
        Update: {
          answer_text?: string | null
          challenge_type?: string
          created_at?: string
          id?: string
          justification_text?: string | null
          message_text?: string | null
          phase?: string
          player_id?: string
          riddle_id?: string | null
          room_id?: string
          target_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elena_submissions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "elena_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elena_submissions_riddle_id_fkey"
            columns: ["riddle_id"]
            isOneToOne: false
            referencedRelation: "elena_riddles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elena_submissions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "elena_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elena_submissions_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "elena_players"
            referencedColumns: ["id"]
          },
        ]
      }
      er_bookings: {
        Row: {
          admin_notes: string | null
          calendly_event_uri: string | null
          confirmed_at: string | null
          confirmed_by_email: string | null
          created_at: string
          id: string
          invitee_email: string | null
          invitee_name: string | null
          raw_payload: Json
          scheduled_at: string | null
          session_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          calendly_event_uri?: string | null
          confirmed_at?: string | null
          confirmed_by_email?: string | null
          created_at?: string
          id?: string
          invitee_email?: string | null
          invitee_name?: string | null
          raw_payload: Json
          scheduled_at?: string | null
          session_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          calendly_event_uri?: string | null
          confirmed_at?: string | null
          confirmed_by_email?: string | null
          created_at?: string
          id?: string
          invitee_email?: string | null
          invitee_name?: string | null
          raw_payload?: Json
          scheduled_at?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "er_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "er_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      er_logs: {
        Row: {
          admin_email: string | null
          context: Json | null
          created_at: string
          event: string
          id: number
          level: string
          message: string | null
          session_id: string | null
          source: string
        }
        Insert: {
          admin_email?: string | null
          context?: Json | null
          created_at?: string
          event: string
          id?: number
          level: string
          message?: string | null
          session_id?: string | null
          source: string
        }
        Update: {
          admin_email?: string | null
          context?: Json | null
          created_at?: string
          event?: string
          id?: number
          level?: string
          message?: string | null
          session_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "er_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      er_messages: {
        Row: {
          created_at: string
          id: number
          parts: Json
          role: string
          seq: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          parts: Json
          role: string
          seq: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: number
          parts?: Json
          role?: string
          seq?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "er_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "er_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      er_prompt_versions: {
        Row: {
          content: Json
          created_at: string
          created_by_email: string | null
          id: string
          is_active: boolean
          notes: string | null
          version_number: number
        }
        Insert: {
          content: Json
          created_at?: string
          created_by_email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          version_number: number
        }
        Update: {
          content?: Json
          created_at?: string
          created_by_email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          version_number?: number
        }
        Relationships: []
      }
      er_sessions: {
        Row: {
          coach: string | null
          completed_at: string | null
          flow: string
          id: string
          last_activity_at: string
          prompt_version_id: string | null
          q8_baseline: number | null
          ref: string | null
          reset_at: string | null
          scores: Json
          started_at: string
          user_agent: string | null
          user_name: string | null
        }
        Insert: {
          coach?: string | null
          completed_at?: string | null
          flow: string
          id?: string
          last_activity_at?: string
          prompt_version_id?: string | null
          q8_baseline?: number | null
          ref?: string | null
          reset_at?: string | null
          scores?: Json
          started_at?: string
          user_agent?: string | null
          user_name?: string | null
        }
        Update: {
          coach?: string | null
          completed_at?: string | null
          flow?: string
          id?: string
          last_activity_at?: string
          prompt_version_id?: string | null
          q8_baseline?: number | null
          ref?: string | null
          reset_at?: string | null
          scores?: Json
          started_at?: string
          user_agent?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "er_sessions_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "er_prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      er_users: {
        Row: {
          claimed_at: string | null
          created_at: string
          email: string | null
          id: string
          note: string | null
          phone: string | null
          role: string
          supabase_user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          note?: string | null
          phone?: string | null
          role?: string
          supabase_user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          note?: string | null
          phone?: string | null
          role?: string
          supabase_user_id?: string | null
        }
        Relationships: []
      }
      esm_ai_conversations: {
        Row: {
          created_at: string | null
          current_step: number | null
          id: string
          metadata: Json | null
          session_id: string
          updated_at: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          id?: string
          metadata?: Json | null
          session_id: string
          updated_at?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          id?: string
          metadata?: Json | null
          session_id?: string
          updated_at?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      esm_ai_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "esm_ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "esm_ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      esm_champion_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          idea_key: string
          idea_title: string
          motivation: string | null
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          idea_key: string
          idea_title: string
          motivation?: string | null
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          idea_key?: string
          idea_title?: string
          motivation?: string | null
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      esm_conversation_events: {
        Row: {
          conversation_id: string
          created_at: string | null
          data: Json
          event_type: string
          id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          data?: Json
          event_type: string
          id?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          data?: Json
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esm_conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "esm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      esm_conversations: {
        Row: {
          created_at: string | null
          has_escalation: boolean | null
          id: string
          last_message_at: string | null
          message_count: number | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          has_escalation?: boolean | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          has_escalation?: boolean | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          session_id?: string
        }
        Relationships: []
      }
      esm_docs_pages: {
        Row: {
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          is_step: boolean | null
          order_index: number | null
          section_id: string | null
          slug: string
          step_number: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          is_step?: boolean | null
          order_index?: number | null
          section_id?: string | null
          slug: string
          step_number?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          is_step?: boolean | null
          order_index?: number | null
          section_id?: string | null
          slug?: string
          step_number?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esm_docs_pages_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "esm_docs_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      esm_docs_sections: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          order_index: number | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      esm_faqs: {
        Row: {
          answer: string
          attribution: string | null
          created_at: string | null
          embedding: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          question: string
          source: string | null
          source_chunk_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          attribution?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          question: string
          source?: string | null
          source_chunk_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          attribution?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          question?: string
          source?: string | null
          source_chunk_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esm_faqs_source_chunk_fk"
            columns: ["source_chunk_id"]
            isOneToOne: false
            referencedRelation: "esm_knowledge_chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      esm_idea_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          idea_key: string
          user_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          idea_key: string
          user_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          idea_key?: string
          user_name?: string
        }
        Relationships: []
      }
      esm_idea_reactions: {
        Row: {
          created_at: string
          id: string
          idea_key: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_key: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_key?: string
          user_name?: string
        }
        Relationships: []
      }
      esm_idea_submissions: {
        Row: {
          anything: string | null
          champion: string | null
          created_at: string
          embedding: string | null
          id: string
          idea: string | null
          idea_en: string | null
          idea_es: string | null
          invest: string | null
          model: string | null
          more: string | null
          more_en: string | null
          more_es: string | null
          name: string
          obstacles: string | null
          source_lang: string | null
          theme: string | null
        }
        Insert: {
          anything?: string | null
          champion?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          idea?: string | null
          idea_en?: string | null
          idea_es?: string | null
          invest?: string | null
          model?: string | null
          more?: string | null
          more_en?: string | null
          more_es?: string | null
          name: string
          obstacles?: string | null
          source_lang?: string | null
          theme?: string | null
        }
        Update: {
          anything?: string | null
          champion?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          idea?: string | null
          idea_en?: string | null
          idea_es?: string | null
          invest?: string | null
          model?: string | null
          more?: string | null
          more_en?: string | null
          more_es?: string | null
          name?: string
          obstacles?: string | null
          source_lang?: string | null
          theme?: string | null
        }
        Relationships: []
      }
      esm_ideas: {
        Row: {
          champion_name: string | null
          created_at: string
          desc_en: string
          desc_es: string
          embedding: string | null
          id: string
          is_published: boolean
          momentum: string
          theme: string
          title_en: string
          title_es: string
        }
        Insert: {
          champion_name?: string | null
          created_at?: string
          desc_en: string
          desc_es: string
          embedding?: string | null
          id?: string
          is_published?: boolean
          momentum?: string
          theme: string
          title_en: string
          title_es: string
        }
        Update: {
          champion_name?: string | null
          created_at?: string
          desc_en?: string
          desc_es?: string
          embedding?: string | null
          id?: string
          is_published?: boolean
          momentum?: string
          theme?: string
          title_en?: string
          title_es?: string
        }
        Relationships: []
      }
      esm_ingest_events: {
        Row: {
          created_at: string | null
          data: Json
          event_type: string
          id: string
          run_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          event_type: string
          id?: string
          run_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          event_type?: string
          id?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esm_ingest_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "esm_ingest_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      esm_ingest_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          run_type: string
          source_file: string
          started_at: string | null
          status: string
          summary: Json | null
          total_chunks: number | null
          total_embedded: number | null
          total_qas: number | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_type: string
          source_file: string
          started_at?: string | null
          status?: string
          summary?: Json | null
          total_chunks?: number | null
          total_embedded?: number | null
          total_qas?: number | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          run_type?: string
          source_file?: string
          started_at?: string | null
          status?: string
          summary?: Json | null
          total_chunks?: number | null
          total_embedded?: number | null
          total_qas?: number | null
        }
        Relationships: []
      }
      esm_knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          source_ref: string
          source_type: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_ref: string
          source_type: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_ref?: string
          source_type?: string
        }
        Relationships: []
      }
      esm_pending_questions: {
        Row: {
          answer: string | null
          assigned_to: string | null
          context: string | null
          created_at: string | null
          id: string
          question: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          answer?: string | null
          assigned_to?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          question: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          answer?: string | null
          assigned_to?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          question?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esm_pending_questions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "esm_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      esm_team_members: {
        Row: {
          created_at: string | null
          description: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      esm_why_notes: {
        Row: {
          created_at: string
          id: string
          lang: string | null
          note: string
          paragraph_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          lang?: string | null
          note: string
          paragraph_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          lang?: string | null
          note?: string
          paragraph_id?: string
          user_name?: string
        }
        Relationships: []
      }
      heliocore_transfer_logs: {
        Row: {
          cc_address: string
          cc_photo_id: string
          cc_project_id: string
          created_at: string
          creator_name: string | null
          error_message: string | null
          folder: string | null
          id: number
          match_score: number | null
          match_type: string | null
          photo_url: string
          ps_address: string | null
          ps_project_id: string | null
          status: string
          upload_response: string | null
        }
        Insert: {
          cc_address: string
          cc_photo_id: string
          cc_project_id: string
          created_at?: string
          creator_name?: string | null
          error_message?: string | null
          folder?: string | null
          id?: number
          match_score?: number | null
          match_type?: string | null
          photo_url: string
          ps_address?: string | null
          ps_project_id?: string | null
          status: string
          upload_response?: string | null
        }
        Update: {
          cc_address?: string
          cc_photo_id?: string
          cc_project_id?: string
          created_at?: string
          creator_name?: string | null
          error_message?: string | null
          folder?: string | null
          id?: number
          match_score?: number | null
          match_type?: string | null
          photo_url?: string
          ps_address?: string | null
          ps_project_id?: string | null
          status?: string
          upload_response?: string | null
        }
        Relationships: []
      }
      human_agents: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_name: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      icwt_submissions: {
        Row: {
          category: string | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          github_url: string | null
          id: string
          status: string | null
          submission_url: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          status?: string | null
          submission_url: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          status?: string | null
          submission_url?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      icwt_users: {
        Row: {
          created_at: string | null
          id: string
          phone: string
          team_description: string | null
          team_members: string | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          phone: string
          team_description?: string | null
          team_members?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone?: string
          team_description?: string | null
          team_members?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      icwt_votes: {
        Row: {
          created_at: string | null
          id: string
          submission_id: string | null
          voter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          submission_id?: string | null
          voter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          submission_id?: string | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "icwt_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "icwt_submission_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icwt_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "icwt_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          commission_amount: number
          commission_status: string
          created_at: string
          customer_address: string
          customer_name: string
          expected_payment_date: string | null
          id: number
          installation_date: string
          installation_id: string
          installation_type: string
          notes: string | null
          payment_status: string
          rep_id: string
          rep_name: string
          sale_amount: number
          updated_at: string
        }
        Insert: {
          commission_amount: number
          commission_status?: string
          created_at?: string
          customer_address: string
          customer_name: string
          expected_payment_date?: string | null
          id?: number
          installation_date: string
          installation_id?: string
          installation_type: string
          notes?: string | null
          payment_status?: string
          rep_id: string
          rep_name: string
          sale_amount: number
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_status?: string
          created_at?: string
          customer_address?: string
          customer_name?: string
          expected_payment_date?: string | null
          id?: number
          installation_date?: string
          installation_id?: string
          installation_type?: string
          notes?: string | null
          payment_status?: string
          rep_id?: string
          rep_name?: string
          sale_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_company: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          default_currency: string | null
          default_payment_terms: number | null
          email: string | null
          id: string
          invoice_counter: number | null
          invoice_prefix: string | null
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_payment_terms?: number | null
          email?: string | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_payment_terms?: number | null
          email?: string | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      invoice_customers: {
        Row: {
          billing_address: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          shipping_address: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_invoice_items: {
        Row: {
          description: string | null
          discount_amount: number
          discount_percent: number
          id: string
          invoice_id: string
          line_total: number
          metadata: Json | null
          position: number
          product_id: string | null
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          description?: string | null
          discount_amount?: number
          discount_percent?: number
          id?: string
          invoice_id: string
          line_total?: number
          metadata?: Json | null
          position?: number
          product_id?: string | null
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          description?: string | null
          discount_amount?: number
          discount_percent?: number
          id?: string
          invoice_id?: string
          line_total?: number
          metadata?: Json | null
          position?: number
          product_id?: string | null
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "invoice_products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_invoices: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          discount_total: number
          due_date: string | null
          id: string
          issue_date: string
          metadata: Json | null
          notes: string | null
          number: string | null
          status: string
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_total?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          metadata?: Json | null
          notes?: string | null
          number?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          discount_total?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          metadata?: Json | null
          notes?: string | null
          number?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "invoice_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string
          method: string
          note: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id: string
          method: string
          note?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          method?: string
          note?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_products: {
        Row: {
          created_at: string
          currency: string
          default_tax_rate: number | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          sku: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_tax_rate?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          sku?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_tax_rate?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          sku?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          reason: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          reason?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "invoice_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      language_cefr_levels: {
        Row: {
          created_at: string | null
          description: string
          level: string
          name: string
          sort_order: number
          target_total_verbs: number
          target_total_words: number
        }
        Insert: {
          created_at?: string | null
          description: string
          level: string
          name: string
          sort_order: number
          target_total_verbs: number
          target_total_words: number
        }
        Update: {
          created_at?: string | null
          description?: string
          level?: string
          name?: string
          sort_order?: number
          target_total_verbs?: number
          target_total_words?: number
        }
        Relationships: []
      }
      language_phrase_video_views: {
        Row: {
          completed: boolean | null
          id: string
          user_id: string
          video_id: string
          viewed_at: string | null
          watch_duration_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          user_id: string
          video_id: string
          viewed_at?: string | null
          watch_duration_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          user_id?: string
          video_id?: string
          viewed_at?: string | null
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "language_phrase_video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "language_phrase_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      language_phrase_videos: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          file_size_bytes: number | null
          generation_completed_at: string | null
          generation_started_at: string | null
          id: string
          phrase_id: string
          prompt_used: string
          size: string | null
          sora_video_id: string | null
          status: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_size_bytes?: number | null
          generation_completed_at?: string | null
          generation_started_at?: string | null
          id?: string
          phrase_id: string
          prompt_used: string
          size?: string | null
          sora_video_id?: string | null
          status?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_size_bytes?: number | null
          generation_completed_at?: string | null
          generation_started_at?: string | null
          id?: string
          phrase_id?: string
          prompt_used?: string
          size?: string | null
          sora_video_id?: string | null
          status?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_phrase_videos_phrase_id_fkey"
            columns: ["phrase_id"]
            isOneToOne: false
            referencedRelation: "language_phrases"
            referencedColumns: ["id"]
          },
        ]
      }
      language_phrases: {
        Row: {
          audio_url: string | null
          cefr_level: string
          context_translation: string | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          language: string
          phrase: string
          translation: string
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          cefr_level: string
          context_translation?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          language: string
          phrase: string
          translation: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          cefr_level?: string
          context_translation?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          language?: string
          phrase?: string
          translation?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      language_roleplay: {
        Row: {
          cefr_level: string | null
          created_at: string | null
          id: string
          language: string
          scene_description: string
          scene_type: string | null
          special_words: Json | null
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string | null
          id?: string
          language: string
          scene_description: string
          scene_type?: string | null
          special_words?: Json | null
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          cefr_level?: string | null
          created_at?: string | null
          id?: string
          language?: string
          scene_description?: string
          scene_type?: string | null
          special_words?: Json | null
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      language_roleplay_completions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          livekit_room_name: string | null
          roleplay_id: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          livekit_room_name?: string | null
          roleplay_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          livekit_room_name?: string | null
          roleplay_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_roleplay_completions_roleplay_id_fkey"
            columns: ["roleplay_id"]
            isOneToOne: false
            referencedRelation: "language_roleplay"
            referencedColumns: ["id"]
          },
        ]
      }
      language_roleplay_phrases: {
        Row: {
          created_at: string | null
          phrase_id: string
          roleplay_id: string
        }
        Insert: {
          created_at?: string | null
          phrase_id: string
          roleplay_id: string
        }
        Update: {
          created_at?: string | null
          phrase_id?: string
          roleplay_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_roleplay_phrases_phrase_id_fkey"
            columns: ["phrase_id"]
            isOneToOne: false
            referencedRelation: "language_phrases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "language_roleplay_phrases_roleplay_id_fkey"
            columns: ["roleplay_id"]
            isOneToOne: false
            referencedRelation: "language_roleplay"
            referencedColumns: ["id"]
          },
        ]
      }
      language_roleplay_transcripts: {
        Row: {
          created_at: string | null
          id: string
          role: string
          roleplay_id: string
          timestamp_ms: number | null
          transcript: string
          translation: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          roleplay_id: string
          timestamp_ms?: number | null
          transcript: string
          translation?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          roleplay_id?: string
          timestamp_ms?: number | null
          transcript?: string
          translation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_roleplay_transcripts_roleplay_id_fkey"
            columns: ["roleplay_id"]
            isOneToOne: false
            referencedRelation: "language_roleplay"
            referencedColumns: ["id"]
          },
        ]
      }
      language_roleplay_vocab: {
        Row: {
          created_at: string | null
          id: string
          roleplay_id: string
          vocab_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          roleplay_id: string
          vocab_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          roleplay_id?: string
          vocab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_roleplay_vocab_roleplay_id_fkey"
            columns: ["roleplay_id"]
            isOneToOne: false
            referencedRelation: "language_roleplay"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "language_roleplay_vocab_vocab_id_fkey"
            columns: ["vocab_id"]
            isOneToOne: false
            referencedRelation: "language_vocab"
            referencedColumns: ["id"]
          },
        ]
      }
      language_user_enrollments: {
        Row: {
          cefr_level: string | null
          created_at: string | null
          enrolled_at: string | null
          id: string
          is_active: boolean | null
          language: string
          last_practiced_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          language: string
          last_practiced_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cefr_level?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string
          last_practiced_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      language_users: {
        Row: {
          cefr_level: string | null
          created_at: string | null
          display_name: string | null
          id: string
          native_language: string
          target_language: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          native_language: string
          target_language: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cefr_level?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          native_language?: string
          target_language?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_users_cefr_level_fkey"
            columns: ["cefr_level"]
            isOneToOne: false
            referencedRelation: "language_cefr_levels"
            referencedColumns: ["level"]
          },
        ]
      }
      language_verb_conjugations: {
        Row: {
          conjugated_form: string
          conjugated_translation: string | null
          created_at: string | null
          id: string
          person: string | null
          tense: string
          updated_at: string | null
          vocab_id: string | null
        }
        Insert: {
          conjugated_form: string
          conjugated_translation?: string | null
          created_at?: string | null
          id?: string
          person?: string | null
          tense: string
          updated_at?: string | null
          vocab_id?: string | null
        }
        Update: {
          conjugated_form?: string
          conjugated_translation?: string | null
          created_at?: string | null
          id?: string
          person?: string | null
          tense?: string
          updated_at?: string | null
          vocab_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_verb_conjugations_vocab_id_fkey"
            columns: ["vocab_id"]
            isOneToOne: false
            referencedRelation: "language_vocab"
            referencedColumns: ["id"]
          },
        ]
      }
      language_vocab: {
        Row: {
          audio_url: string | null
          cefr_level: string | null
          context: string | null
          context_translation: string | null
          context_words: Json | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          infinitive: string | null
          language: string
          part_of_speech: string | null
          translation: string | null
          updated_at: string | null
          word: string
        }
        Insert: {
          audio_url?: string | null
          cefr_level?: string | null
          context?: string | null
          context_translation?: string | null
          context_words?: Json | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          infinitive?: string | null
          language: string
          part_of_speech?: string | null
          translation?: string | null
          updated_at?: string | null
          word: string
        }
        Update: {
          audio_url?: string | null
          cefr_level?: string | null
          context?: string | null
          context_translation?: string | null
          context_words?: Json | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          infinitive?: string | null
          language?: string
          part_of_speech?: string | null
          translation?: string | null
          updated_at?: string | null
          word?: string
        }
        Relationships: []
      }
      language_vocab_completions: {
        Row: {
          cefr_level: string
          created_at: string | null
          focused_at: string | null
          id: string
          is_focused: boolean
          language: string
          level_1_attempts: number | null
          level_1_completed: boolean | null
          level_1_completed_at: string | null
          level_2_attempts: number | null
          level_2_completed: boolean | null
          level_2_completed_at: string | null
          level_3_attempts: number | null
          level_3_completed: boolean | null
          level_3_completed_at: string | null
          level_4_attempts: number | null
          level_4_completed: boolean | null
          level_4_completed_at: string | null
          level_4_roleplay_id: string | null
          level_5_attempts: number | null
          level_5_completed: boolean | null
          level_5_completed_at: string | null
          level_5_roleplay_id: string | null
          updated_at: string | null
          user_id: string
          vocab_id: string
        }
        Insert: {
          cefr_level: string
          created_at?: string | null
          focused_at?: string | null
          id?: string
          is_focused?: boolean
          language: string
          level_1_attempts?: number | null
          level_1_completed?: boolean | null
          level_1_completed_at?: string | null
          level_2_attempts?: number | null
          level_2_completed?: boolean | null
          level_2_completed_at?: string | null
          level_3_attempts?: number | null
          level_3_completed?: boolean | null
          level_3_completed_at?: string | null
          level_4_attempts?: number | null
          level_4_completed?: boolean | null
          level_4_completed_at?: string | null
          level_4_roleplay_id?: string | null
          level_5_attempts?: number | null
          level_5_completed?: boolean | null
          level_5_completed_at?: string | null
          level_5_roleplay_id?: string | null
          updated_at?: string | null
          user_id: string
          vocab_id: string
        }
        Update: {
          cefr_level?: string
          created_at?: string | null
          focused_at?: string | null
          id?: string
          is_focused?: boolean
          language?: string
          level_1_attempts?: number | null
          level_1_completed?: boolean | null
          level_1_completed_at?: string | null
          level_2_attempts?: number | null
          level_2_completed?: boolean | null
          level_2_completed_at?: string | null
          level_3_attempts?: number | null
          level_3_completed?: boolean | null
          level_3_completed_at?: string | null
          level_4_attempts?: number | null
          level_4_completed?: boolean | null
          level_4_completed_at?: string | null
          level_4_roleplay_id?: string | null
          level_5_attempts?: number | null
          level_5_completed?: boolean | null
          level_5_completed_at?: string | null
          level_5_roleplay_id?: string | null
          updated_at?: string | null
          user_id?: string
          vocab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_vocab_completions_level_5_roleplay_id_fkey"
            columns: ["level_5_roleplay_id"]
            isOneToOne: false
            referencedRelation: "language_roleplay"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "language_vocab_completions_vocab_id_fkey"
            columns: ["vocab_id"]
            isOneToOne: false
            referencedRelation: "language_vocab"
            referencedColumns: ["id"]
          },
        ]
      }
      lyrics_phrases: {
        Row: {
          id: string
          normalized_text: string
          sequence_number: number
          song_id: string
          text: string
        }
        Insert: {
          id?: string
          normalized_text: string
          sequence_number: number
          song_id: string
          text: string
        }
        Update: {
          id?: string
          normalized_text?: string
          sequence_number?: number
          song_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "lyrics_phrases_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "lyrics_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      lyrics_songs: {
        Row: {
          artist: string | null
          created_at: string
          id: string
          raw_lyrics: string
          title: string
        }
        Insert: {
          artist?: string | null
          created_at?: string
          id?: string
          raw_lyrics: string
          title: string
        }
        Update: {
          artist?: string | null
          created_at?: string
          id?: string
          raw_lyrics?: string
          title?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          impact_summary: string
          milestone_type: string
          scenario_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          impact_summary: string
          milestone_type: string
          scenario_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          impact_summary?: string
          milestone_type?: string
          scenario_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_connections: {
        Row: {
          contact_shared_a: boolean | null
          contact_shared_b: boolean | null
          created_at: string | null
          event_id: string | null
          id: string
          shared_tags: string[] | null
          similarity_score: number | null
          user_a: string
          user_b: string
        }
        Insert: {
          contact_shared_a?: boolean | null
          contact_shared_b?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          shared_tags?: string[] | null
          similarity_score?: number | null
          user_a: string
          user_b: string
        }
        Update: {
          contact_shared_a?: boolean | null
          contact_shared_b?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          shared_tags?: string[] | null
          similarity_score?: number | null
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_connections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "neighbors_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_connections_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_connections_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_event_participants: {
        Row: {
          event_id: string
          id: string
          joined_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "neighbors_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_events: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          livekit_room_name: string | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          livekit_room_name?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          livekit_room_name?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_interest_tags: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          source_event_id: string | null
          tag: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          source_event_id?: string | null
          tag: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          source_event_id?: string | null
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_interest_tags_event"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "neighbors_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_interest_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_recordings: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          egress_id: string | null
          id: string
          room_id: string
          storage_url: string | null
          transcription_status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          egress_id?: string | null
          id?: string
          room_id: string
          storage_url?: string | null
          transcription_status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          egress_id?: string | null
          id?: string
          room_id?: string
          storage_url?: string | null
          transcription_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_recordings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "neighbors_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_room_members: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "neighbors_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_rooms: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          livekit_room_name: string
          room_type: string
          round_id: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          livekit_room_name: string
          room_type?: string
          round_id?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          livekit_room_name?: string
          room_type?: string
          round_id?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_breakout_rooms_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "neighbors_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_rooms_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "neighbors_events"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_rounds: {
        Row: {
          created_at: string | null
          duration_seconds: number
          ended_at: string | null
          ends_at: string | null
          event_id: string
          id: string
          prompt: string | null
          round_number: number
          round_type: string
          started_at: string | null
          status: string
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number
          ended_at?: string | null
          ends_at?: string | null
          event_id: string
          id?: string
          prompt?: string | null
          round_number: number
          round_type: string
          started_at?: string | null
          status?: string
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number
          ended_at?: string | null
          ends_at?: string | null
          event_id?: string
          id?: string
          prompt?: string | null
          round_number?: number
          round_type?: string
          started_at?: string | null
          status?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_rounds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "neighbors_events"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_transcripts: {
        Row: {
          created_at: string | null
          end_time: number | null
          id: string
          recording_id: string
          speaker_user_id: string | null
          start_time: number | null
          text: string
        }
        Insert: {
          created_at?: string | null
          end_time?: number | null
          id?: string
          recording_id: string
          speaker_user_id?: string | null
          start_time?: number | null
          text: string
        }
        Update: {
          created_at?: string | null
          end_time?: number | null
          id?: string
          recording_id?: string
          speaker_user_id?: string | null
          start_time?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighbors_transcripts_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "neighbors_recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neighbors_transcripts_speaker_user_id_fkey"
            columns: ["speaker_user_id"]
            isOneToOne: false
            referencedRelation: "neighbors_users"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbors_users: {
        Row: {
          consent_ai_processing: boolean | null
          consent_recording: boolean | null
          created_at: string | null
          display_name: string | null
          id: string
          interest_embedding: string | null
          is_admin: boolean | null
          neighborhood: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          consent_ai_processing?: boolean | null
          consent_recording?: boolean | null
          created_at?: string | null
          display_name?: string | null
          id: string
          interest_embedding?: string | null
          is_admin?: boolean | null
          neighborhood?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          consent_ai_processing?: boolean | null
          consent_recording?: boolean | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          interest_embedding?: string | null
          is_admin?: boolean | null
          neighborhood?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      news_audio_cache: {
        Row: {
          bytes: string
          created_at: string
          key: string
          sample_rate: number
          user_id: string | null
          voice_a: string | null
          voice_b: string | null
        }
        Insert: {
          bytes: string
          created_at?: string
          key: string
          sample_rate?: number
          user_id?: string | null
          voice_a?: string | null
          voice_b?: string | null
        }
        Update: {
          bytes?: string
          created_at?: string
          key?: string
          sample_rate?: number
          user_id?: string | null
          voice_a?: string | null
          voice_b?: string | null
        }
        Relationships: []
      }
      news_preferences: {
        Row: {
          cadence: string | null
          created_at: string
          reading_level: string | null
          region_scope: string | null
          regions: string[] | null
          style: string | null
          tone: string | null
          topics: string[] | null
          updated_at: string
          user_id: string
          voice_a: string | null
          voice_b: string | null
        }
        Insert: {
          cadence?: string | null
          created_at?: string
          reading_level?: string | null
          region_scope?: string | null
          regions?: string[] | null
          style?: string | null
          tone?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id: string
          voice_a?: string | null
          voice_b?: string | null
        }
        Update: {
          cadence?: string | null
          created_at?: string
          reading_level?: string | null
          region_scope?: string | null
          regions?: string[] | null
          style?: string | null
          tone?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string
          voice_a?: string | null
          voice_b?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "news_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      news_profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      news_segments: {
        Row: {
          audio_key: string
          created_at: string
          dialogue: Json
          title: string | null
          user_id: string | null
        }
        Insert: {
          audio_key: string
          created_at?: string
          dialogue: Json
          title?: string | null
          user_id?: string | null
        }
        Update: {
          audio_key?: string
          created_at?: string
          dialogue?: Json
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_segments_audio_key_fkey"
            columns: ["audio_key"]
            isOneToOne: true
            referencedRelation: "news_audio_cache"
            referencedColumns: ["key"]
          },
        ]
      }
      news_settings: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      outcomes: {
        Row: {
          created_at: string
          equity_percent: number | null
          financial_value: number
          id: string
          name: string
          notes: string | null
          probability: number
          salary_annual: number | null
          scenario_id: string
          time_to_liquidity_years: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equity_percent?: number | null
          financial_value: number
          id?: string
          name: string
          notes?: string | null
          probability: number
          salary_annual?: number | null
          scenario_id: string
          time_to_liquidity_years?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equity_percent?: number | null
          financial_value?: number
          id?: string
          name?: string
          notes?: string | null
          probability?: number
          salary_annual?: number | null
          scenario_id?: string
          time_to_liquidity_years?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_conversations: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "potluck_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "potluck_users"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_dinner_attendees: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          dinner_id: string
          id: string
          invited_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          dinner_id: string
          id?: string
          invited_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          dinner_id?: string
          id?: string
          invited_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "potluck_dinner_attendees_dinner_id_fkey"
            columns: ["dinner_id"]
            isOneToOne: false
            referencedRelation: "potluck_dinners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "potluck_dinner_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "potluck_users"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_dinners: {
        Row: {
          created_at: string | null
          dinner_date: string
          host_id: string | null
          id: string
          location: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dinner_date: string
          host_id?: string | null
          id?: string
          location?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dinner_date?: string
          host_id?: string | null
          id?: string
          location?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potluck_dinners_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "potluck_users"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_household_foods: {
        Row: {
          created_at: string | null
          dinner_id: string
          food_item: string
          household_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dinner_id: string
          food_item: string
          household_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dinner_id?: string
          food_item?: string
          household_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potluck_household_foods_dinner_id_fkey"
            columns: ["dinner_id"]
            isOneToOne: false
            referencedRelation: "potluck_dinners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "potluck_household_foods_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "potluck_households"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_household_notes: {
        Row: {
          created_at: string | null
          household_id: string
          id: string
          note: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          household_id: string
          id?: string
          note: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          household_id?: string
          id?: string
          note?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potluck_household_notes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "potluck_households"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_households: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      potluck_invitation_blast_recipients: {
        Row: {
          blast_id: string
          created_at: string | null
          error_message: string | null
          id: string
          phone_number: string
          sent_at: string | null
          status: string
          telnyx_message_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blast_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          phone_number: string
          sent_at?: string | null
          status: string
          telnyx_message_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blast_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          phone_number?: string
          sent_at?: string | null
          status?: string
          telnyx_message_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "potluck_invitation_blast_recipients_blast_id_fkey"
            columns: ["blast_id"]
            isOneToOne: false
            referencedRelation: "potluck_invitation_blasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "potluck_invitation_blast_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "potluck_users"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_invitation_blasts: {
        Row: {
          created_at: string | null
          dinner_id: string | null
          failed_count: number
          id: string
          message: string
          recipient_count: number
          sent_count: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dinner_id?: string | null
          failed_count?: number
          id?: string
          message: string
          recipient_count: number
          sent_count?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dinner_id?: string | null
          failed_count?: number
          id?: string
          message?: string
          recipient_count?: number
          sent_count?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potluck_invitation_blasts_dinner_id_fkey"
            columns: ["dinner_id"]
            isOneToOne: false
            referencedRelation: "potluck_dinners"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          telnyx_message_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          telnyx_message_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          telnyx_message_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potluck_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "potluck_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_user_foods: {
        Row: {
          created_at: string | null
          dinner_id: string
          food_category: string | null
          food_item: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dinner_id: string
          food_category?: string | null
          food_item: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dinner_id?: string
          food_category?: string | null
          food_item?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "potluck_user_foods_dinner_id_fkey"
            columns: ["dinner_id"]
            isOneToOne: false
            referencedRelation: "potluck_dinners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "potluck_user_foods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "potluck_users"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_user_notes: {
        Row: {
          created_at: string | null
          id: string
          note: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "potluck_user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "potluck_users"
            referencedColumns: ["id"]
          },
        ]
      }
      potluck_users: {
        Row: {
          created_at: string | null
          household_id: string | null
          id: string
          name: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          household_id?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          household_id?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potluck_users_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "potluck_households"
            referencedColumns: ["id"]
          },
        ]
      }
      probability_adjustments: {
        Row: {
          adjustment_reason: string
          created_at: string
          id: string
          milestone_id: string
          new_probability: number
          outcome_id: string
          previous_probability: number
        }
        Insert: {
          adjustment_reason: string
          created_at?: string
          id?: string
          milestone_id: string
          new_probability: number
          outcome_id: string
          previous_probability: number
        }
        Update: {
          adjustment_reason?: string
          created_at?: string
          id?: string
          milestone_id?: string
          new_probability?: number
          outcome_id?: string
          previous_probability?: number
        }
        Relationships: [
          {
            foreignKeyName: "probability_adjustments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "probability_adjustments_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      register_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "register_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_customers: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          loyalty_points: number
          notes: string | null
          organization_id: string
          phone: string | null
          tier_id: string | null
          total_spent: number
          updated_at: string | null
          visit_count: number
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          loyalty_points?: number
          notes?: string | null
          organization_id: string
          phone?: string | null
          tier_id?: string | null
          total_spent?: number
          updated_at?: string | null
          visit_count?: number
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          loyalty_points?: number
          notes?: string | null
          organization_id?: string
          phone?: string | null
          tier_id?: string | null
          total_spent?: number
          updated_at?: string | null
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_tier"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "register_membership_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_employees: {
        Row: {
          created_at: string
          employment_type: string
          end_date: string | null
          hourly_rate: number | null
          id: string
          organization_id: string
          pay_frequency: string
          pin_code: string | null
          salary: number | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employment_type?: string
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          organization_id: string
          pay_frequency?: string
          pin_code?: string | null
          salary?: number | null
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employment_type?: string
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          organization_id?: string
          pay_frequency?: string
          pin_code?: string | null
          salary?: number | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "register_users"
            referencedColumns: ["id"]
          },
        ]
      }
      register_gift_cards: {
        Row: {
          code: string
          created_at: string | null
          current_balance: number
          customer_id: string | null
          expires_at: string | null
          id: string
          initial_balance: number
          is_active: boolean | null
          organization_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          current_balance: number
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          initial_balance: number
          is_active?: boolean | null
          organization_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          current_balance?: number
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_gift_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "register_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_gift_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_inventory_transfers: {
        Row: {
          created_at: string
          created_by: string | null
          from_location_id: string
          id: string
          notes: string | null
          organization_id: string
          status: string
          to_location_id: string
          transfer_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          from_location_id: string
          id?: string
          notes?: string | null
          organization_id: string
          status?: string
          to_location_id: string
          transfer_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          from_location_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          status?: string
          to_location_id?: string
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_inventory_transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "register_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_inventory_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_inventory_transfers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_inventory_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_location_inventory: {
        Row: {
          id: string
          location_id: string
          max_stock: number | null
          product_id: string
          quantity: number
          reorder_point: number | null
          reserved_quantity: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          location_id: string
          max_stock?: number | null
          product_id: string
          quantity?: number
          reorder_point?: number | null
          reserved_quantity?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          location_id?: string
          max_stock?: number | null
          product_id?: string
          quantity?: number
          reorder_point?: number | null
          reserved_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "register_location_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_location_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "register_products"
            referencedColumns: ["id"]
          },
        ]
      }
      register_locations: {
        Row: {
          address: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          opening_hours: Json | null
          organization_id: string
          phone: string | null
          tax_rate: number | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          opening_hours?: Json | null
          organization_id: string
          phone?: string | null
          tax_rate?: number | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          opening_hours?: Json | null
          organization_id?: string
          phone?: string | null
          tax_rate?: number | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_loyalty_transactions: {
        Row: {
          balance_after: number
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          points: number
          sale_id: string | null
          transaction_type: string
        }
        Insert: {
          balance_after: number
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          points: number
          sale_id?: string | null
          transaction_type: string
        }
        Update: {
          balance_after?: number
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          points?: number
          sale_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "register_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_loyalty_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "register_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      register_membership_tiers: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          min_spent: number
          name: string
          organization_id: string
          points_multiplier: number
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_spent?: number
          name: string
          organization_id: string
          points_multiplier?: number
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_spent?: number
          name?: string
          organization_id?: string
          points_multiplier?: number
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "register_membership_tiers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_organizations: {
        Row: {
          address: Json | null
          business_type: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          slug: string
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          business_type?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          slug: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          business_type?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          slug?: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      register_payroll_items: {
        Row: {
          employee_id: string
          gross_pay: number
          hourly_rate: number
          hours_worked: number
          id: string
          notes: string | null
          payroll_run_id: string
        }
        Insert: {
          employee_id: string
          gross_pay?: number
          hourly_rate: number
          hours_worked?: number
          id?: string
          notes?: string | null
          payroll_run_id: string
        }
        Update: {
          employee_id?: string
          gross_pay?: number
          hourly_rate?: number
          hours_worked?: number
          id?: string
          notes?: string | null
          payroll_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "register_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "register_payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      register_payroll_runs: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          period_end: string
          period_start: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          status?: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "register_payroll_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_products: {
        Row: {
          barcode: string | null
          category_id: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          organization_id: string
          price: number
          reorder_point: number | null
          sku: string | null
          tax_rate: number | null
          track_inventory: boolean | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          organization_id: string
          price?: number
          reorder_point?: number | null
          sku?: string | null
          tax_rate?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          organization_id?: string
          price?: number
          reorder_point?: number | null
          sku?: string | null
          tax_rate?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "register_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "register_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_promotions: {
        Row: {
          applies_to: string
          buy_quantity: number | null
          code: string | null
          created_at: string
          end_date: string | null
          get_discount_percent: number | null
          get_quantity: number | null
          id: string
          is_active: boolean
          max_discount: number | null
          max_uses: number | null
          min_purchase: number | null
          name: string
          organization_id: string
          stackable: boolean
          start_date: string | null
          target_ids: string[] | null
          type: string
          usage_count: number
          value: number
        }
        Insert: {
          applies_to?: string
          buy_quantity?: number | null
          code?: string | null
          created_at?: string
          end_date?: string | null
          get_discount_percent?: number | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          max_uses?: number | null
          min_purchase?: number | null
          name: string
          organization_id: string
          stackable?: boolean
          start_date?: string | null
          target_ids?: string[] | null
          type: string
          usage_count?: number
          value: number
        }
        Update: {
          applies_to?: string
          buy_quantity?: number | null
          code?: string | null
          created_at?: string
          end_date?: string | null
          get_discount_percent?: number | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          max_uses?: number | null
          min_purchase?: number | null
          name?: string
          organization_id?: string
          stackable?: boolean
          start_date?: string | null
          target_ids?: string[] | null
          type?: string
          usage_count?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "register_promotions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_purchase_order_items: {
        Row: {
          id: string
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number
          total: number
          unit_cost: number
        }
        Insert: {
          id?: string
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number
          total?: number
          unit_cost: number
        }
        Update: {
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number
          total?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "register_purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "register_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "register_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      register_purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          location_id: string | null
          notes: string | null
          order_date: string | null
          organization_id: string
          po_number: string
          received_date: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          order_date?: string | null
          organization_id: string
          po_number: string
          received_date?: string | null
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          order_date?: string | null
          organization_id?: string
          po_number?: string
          received_date?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "register_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_purchase_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "register_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      register_registers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          location_id: string | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "register_registers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_registers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          organization_id: string
          permissions: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          organization_id: string
          permissions?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          organization_id?: string
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pos_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_sale_items: {
        Row: {
          discount_amount: number
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sale_id: string
          tax_amount: number
          total: number
          unit_price: number
        }
        Insert: {
          discount_amount?: number
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_id: string
          tax_amount?: number
          total: number
          unit_price: number
        }
        Update: {
          discount_amount?: number
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_id?: string
          tax_amount?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "register_sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "register_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "register_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      register_sale_promotions: {
        Row: {
          affected_items: Json | null
          created_at: string
          discount_amount: number
          id: string
          promotion_id: string
          sale_id: string
        }
        Insert: {
          affected_items?: Json | null
          created_at?: string
          discount_amount: number
          id?: string
          promotion_id: string
          sale_id: string
        }
        Update: {
          affected_items?: Json | null
          created_at?: string
          discount_amount?: number
          id?: string
          promotion_id?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_sale_promotions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "register_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_sale_promotions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "register_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      register_sales: {
        Row: {
          cashier_id: string | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number
          id: string
          location_id: string | null
          notes: string | null
          organization_id: string
          payment_method: string
          payment_status: string
          receipt_number: string
          register_id: string | null
          subtotal: number
          tax_amount: number
          total: number
        }
        Insert: {
          cashier_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          location_id?: string | null
          notes?: string | null
          organization_id: string
          payment_method?: string
          payment_status?: string
          receipt_number: string
          register_id?: string | null
          subtotal?: number
          tax_amount?: number
          total?: number
        }
        Update: {
          cashier_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          location_id?: string | null
          notes?: string | null
          organization_id?: string
          payment_method?: string
          payment_status?: string
          receipt_number?: string
          register_id?: string | null
          subtotal?: number
          tax_amount?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "register_sales_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "register_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "register_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_sales_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_sales_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "register_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      register_shifts: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          end_time: string
          id: string
          is_published: boolean
          location_id: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          employee_id: string
          end_time: string
          id?: string
          is_published?: boolean
          location_id?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          end_time?: string
          id?: string
          is_published?: boolean
          location_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "register_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_suppliers: {
        Row: {
          address: Json | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          local_id: string
          organization_id: string
          server_id: string | null
          status: string
          sync_type: string
          synced_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          local_id: string
          organization_id: string
          server_id?: string | null
          status?: string
          sync_type: string
          synced_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          local_id?: string
          organization_id?: string
          server_id?: string | null
          status?: string
          sync_type?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_sync_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_time_entries: {
        Row: {
          break_minutes: number
          clock_in: string
          clock_out: string | null
          created_at: string
          employee_id: string
          id: string
          location_id: string | null
          notes: string | null
          status: string
          total_hours: number | null
        }
        Insert: {
          break_minutes?: number
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          location_id?: string | null
          notes?: string | null
          status?: string
          total_hours?: number | null
        }
        Update: {
          break_minutes?: number
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          status?: string
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "register_time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "register_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_time_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      register_transfer_items: {
        Row: {
          id: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "register_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "register_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "register_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "register_inventory_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      register_users: {
        Row: {
          auth_id: string
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          location_id: string | null
          organization_id: string
          phone: string | null
          pin_code: string | null
          role_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id: string
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          location_id?: string | null
          organization_id: string
          phone?: string | null
          pin_code?: string | null
          role_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          location_id?: string | null
          organization_id?: string
          phone?: string | null
          pin_code?: string | null
          role_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_users_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "register_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "register_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "register_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_parameters: {
        Row: {
          created_at: string
          discount_rate: number
          expected_hours_per_week: number | null
          id: string
          learning_growth_score: number | null
          mission_alignment_score: number | null
          opportunity_cost_salary: number | null
          risk_aversion_coefficient: number
          scenario_id: string
          updated_at: string
          work_life_balance_score: number | null
          years_to_vesting: number | null
        }
        Insert: {
          created_at?: string
          discount_rate?: number
          expected_hours_per_week?: number | null
          id?: string
          learning_growth_score?: number | null
          mission_alignment_score?: number | null
          opportunity_cost_salary?: number | null
          risk_aversion_coefficient?: number
          scenario_id: string
          updated_at?: string
          work_life_balance_score?: number | null
          years_to_vesting?: number | null
        }
        Update: {
          created_at?: string
          discount_rate?: number
          expected_hours_per_week?: number | null
          id?: string
          learning_growth_score?: number | null
          mission_alignment_score?: number | null
          opportunity_cost_salary?: number | null
          risk_aversion_coefficient?: number
          scenario_id?: string
          updated_at?: string
          work_life_balance_score?: number | null
          years_to_vesting?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_parameters_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: true
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      simulation_actions: {
        Row: {
          action_data: Json
          action_type: string
          id: string
          position: number | null
          simulation_step_id: string | null
          timestamp: string | null
        }
        Insert: {
          action_data: Json
          action_type: string
          id?: string
          position?: number | null
          simulation_step_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action_data?: Json
          action_type?: string
          id?: string
          position?: number | null
          simulation_step_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_actions_simulation_step_id_fkey"
            columns: ["simulation_step_id"]
            isOneToOne: false
            referencedRelation: "simulation_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_steps: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string | null
          id: string
          original_cue_speaker: string | null
          original_cue_start_time: string | null
          position: number | null
          simulation_id: string | null
          speaker_id: string | null
          speaker_role: string
          step_number: number
          timestamp: string | null
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          original_cue_speaker?: string | null
          original_cue_start_time?: string | null
          position?: number | null
          simulation_id?: string | null
          speaker_id?: string | null
          speaker_role: string
          step_number: number
          timestamp?: string | null
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          original_cue_speaker?: string | null
          original_cue_start_time?: string | null
          position?: number | null
          simulation_id?: string | null
          speaker_id?: string | null
          speaker_role?: string
          step_number?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_steps_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_steps_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          active_agent_id: string | null
          completed: boolean
          created_at: string | null
          current_step_number: number
          id: string
          squad_id: string | null
          success_criteria: Json | null
          transcript_id: string
          transcript_title: string
          updated_at: string | null
        }
        Insert: {
          active_agent_id?: string | null
          completed?: boolean
          created_at?: string | null
          current_step_number?: number
          id?: string
          squad_id?: string | null
          success_criteria?: Json | null
          transcript_id: string
          transcript_title: string
          updated_at?: string | null
        }
        Update: {
          active_agent_id?: string | null
          completed?: boolean
          created_at?: string | null
          current_step_number?: number
          id?: string
          squad_id?: string | null
          success_criteria?: Json | null
          transcript_id?: string
          transcript_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulations_active_agent_id_fkey"
            columns: ["active_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          agent_ids: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          agent_ids?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          agent_ids?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          created_at: string | null
          description: string
          function_name: string
          id: string
          module_path: string | null
          name: string
          parameters: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          function_name: string
          id?: string
          module_path?: string | null
          name: string
          parameters?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          function_name?: string
          id?: string
          module_path?: string | null
          name?: string
          parameters?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      trader_copy_signals: {
        Row: {
          avg_entry_price: number | null
          confidence_score: number
          created_at: string | null
          current_price: number | null
          expires_at: string | null
          id: number
          market_id: string
          outcome: string
          reasoning: string | null
          recommended_action: string | null
          signal_type: string
          status: string | null
          top_traders: Json | null
          total_position_size: number | null
          trader_count: number
        }
        Insert: {
          avg_entry_price?: number | null
          confidence_score: number
          created_at?: string | null
          current_price?: number | null
          expires_at?: string | null
          id?: number
          market_id: string
          outcome: string
          reasoning?: string | null
          recommended_action?: string | null
          signal_type: string
          status?: string | null
          top_traders?: Json | null
          total_position_size?: number | null
          trader_count: number
        }
        Update: {
          avg_entry_price?: number | null
          confidence_score?: number
          created_at?: string | null
          current_price?: number | null
          expires_at?: string | null
          id?: number
          market_id?: string
          outcome?: string
          reasoning?: string | null
          recommended_action?: string | null
          signal_type?: string
          status?: string | null
          top_traders?: Json | null
          total_position_size?: number | null
          trader_count?: number
        }
        Relationships: []
      }
      trader_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trader_ingestion_jobs: {
        Row: {
          completed_at: string | null
          error: string | null
          id: number
          job_type: string
          metadata: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          error?: string | null
          id?: number
          job_type: string
          metadata?: Json | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          error?: string | null
          id?: number
          job_type?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      trader_market_scores: {
        Row: {
          created_at: string | null
          edge_potential_score: number | null
          id: number
          information_asymmetry_score: number | null
          liquidity_score: number | null
          market_id: string
          overall_score: number | null
          reasoning: string | null
          recommended_for_research: boolean | null
          researchability_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          edge_potential_score?: number | null
          id?: number
          information_asymmetry_score?: number | null
          liquidity_score?: number | null
          market_id: string
          overall_score?: number | null
          reasoning?: string | null
          recommended_for_research?: boolean | null
          researchability_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          edge_potential_score?: number | null
          id?: number
          information_asymmetry_score?: number | null
          liquidity_score?: number | null
          market_id?: string
          overall_score?: number | null
          reasoning?: string | null
          recommended_for_research?: boolean | null
          researchability_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_market_scores_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "trader_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_markets: {
        Row: {
          active: boolean | null
          category: string | null
          closed: boolean | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_id: string | null
          id: string
          liquidity: number | null
          outcome: string | null
          question: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          closed?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string | null
          id: string
          liquidity?: number | null
          outcome?: string | null
          question: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          closed?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string | null
          id?: string
          liquidity?: number | null
          outcome?: string | null
          question?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_markets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "trader_events"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_media_items: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          id: number
          metadata: Json | null
          published_at: string
          source: string
          source_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          id?: number
          metadata?: Json | null
          published_at: string
          source: string
          source_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          id?: number
          metadata?: Json | null
          published_at?: string
          source?: string
          source_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      trader_media_market_links: {
        Row: {
          created_at: string | null
          id: number
          market_id: string
          media_item_id: number
          relevance_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          market_id: string
          media_item_id: number
          relevance_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          market_id?: string
          media_item_id?: number
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_media_market_links_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trader_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trader_media_market_links_media_item_id_fkey"
            columns: ["media_item_id"]
            isOneToOne: false
            referencedRelation: "trader_media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_performance_snapshots: {
        Row: {
          id: number
          pnl: number | null
          position_count: number | null
          rank: number | null
          snapshot_at: string | null
          time_period: string | null
          volume: number | null
          wallet_address: string
        }
        Insert: {
          id?: number
          pnl?: number | null
          position_count?: number | null
          rank?: number | null
          snapshot_at?: string | null
          time_period?: string | null
          volume?: number | null
          wallet_address: string
        }
        Update: {
          id?: number
          pnl?: number | null
          position_count?: number | null
          rank?: number | null
          snapshot_at?: string | null
          time_period?: string | null
          volume?: number | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "trader_performance_snapshots_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "trader_tracked_profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      trader_position_triggers: {
        Row: {
          action_params: Json | null
          condition_type: string
          condition_value: Json
          created_at: string | null
          id: number
          position_id: number
          priority: number | null
          status: string
          trigger_type: string
          triggered_at: string | null
        }
        Insert: {
          action_params?: Json | null
          condition_type: string
          condition_value: Json
          created_at?: string | null
          id?: number
          position_id: number
          priority?: number | null
          status?: string
          trigger_type: string
          triggered_at?: string | null
        }
        Update: {
          action_params?: Json | null
          condition_type?: string
          condition_value?: Json
          created_at?: string | null
          id?: number
          position_id?: number
          priority?: number | null
          status?: string
          trigger_type?: string
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_position_triggers_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "trader_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_positions: {
        Row: {
          closed_at: string | null
          current_price: number | null
          current_value: number | null
          direction: string
          entered_at: string | null
          entry_amount: number
          entry_price: number
          id: number
          market_id: string
          metadata: Json | null
          profit_loss: number | null
          profit_loss_percent: number | null
          report_id: number | null
          shares: number
          status: string
        }
        Insert: {
          closed_at?: string | null
          current_price?: number | null
          current_value?: number | null
          direction: string
          entered_at?: string | null
          entry_amount: number
          entry_price: number
          id?: number
          market_id: string
          metadata?: Json | null
          profit_loss?: number | null
          profit_loss_percent?: number | null
          report_id?: number | null
          shares: number
          status: string
        }
        Update: {
          closed_at?: string | null
          current_price?: number | null
          current_value?: number | null
          direction?: string
          entered_at?: string | null
          entry_amount?: number
          entry_price?: number
          id?: number
          market_id?: string
          metadata?: Json | null
          profit_loss?: number | null
          profit_loss_percent?: number | null
          report_id?: number | null
          shares?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trader_positions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trader_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trader_positions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "trader_research_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_price_history: {
        Row: {
          created_at: string | null
          id: number
          market_id: string
          price: number
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          market_id: string
          price: number
          timestamp: string
        }
        Update: {
          created_at?: string | null
          id?: number
          market_id?: string
          price?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "trader_price_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trader_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_research_reports: {
        Row: {
          ai_probability: number | null
          confidence: number | null
          created_at: string | null
          edge: number | null
          expected_roi: number | null
          expires_at: string | null
          full_report: Json | null
          id: number
          market_id: string
          market_price: number | null
          reasoning: string | null
          recommendation: string | null
          research_depth: string
          sources_count: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          ai_probability?: number | null
          confidence?: number | null
          created_at?: string | null
          edge?: number | null
          expected_roi?: number | null
          expires_at?: string | null
          full_report?: Json | null
          id?: number
          market_id: string
          market_price?: number | null
          reasoning?: string | null
          recommendation?: string | null
          research_depth: string
          sources_count?: number | null
          status: string
          updated_at?: string | null
        }
        Update: {
          ai_probability?: number | null
          confidence?: number | null
          created_at?: string | null
          edge?: number | null
          expected_roi?: number | null
          expires_at?: string | null
          full_report?: Json | null
          id?: number
          market_id?: string
          market_price?: number | null
          reasoning?: string | null
          recommendation?: string | null
          research_depth?: string
          sources_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_research_reports_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trader_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_research_sources: {
        Row: {
          content: string | null
          created_at: string | null
          credibility_score: number | null
          id: number
          metadata: Json | null
          published_at: string | null
          relevance_score: number | null
          report_id: number
          source_type: string
          title: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          credibility_score?: number | null
          id?: number
          metadata?: Json | null
          published_at?: string | null
          relevance_score?: number | null
          report_id: number
          source_type: string
          title: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          credibility_score?: number | null
          id?: number
          metadata?: Json | null
          published_at?: string | null
          relevance_score?: number | null
          report_id?: number
          source_type?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_research_sources_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "trader_research_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_sentiment_analysis: {
        Row: {
          analysis_metadata: Json | null
          confidence: number | null
          created_at: string | null
          id: number
          keywords: string[] | null
          media_item_id: number
          sentiment_label: string
          sentiment_score: number
        }
        Insert: {
          analysis_metadata?: Json | null
          confidence?: number | null
          created_at?: string | null
          id?: number
          keywords?: string[] | null
          media_item_id: number
          sentiment_label: string
          sentiment_score: number
        }
        Update: {
          analysis_metadata?: Json | null
          confidence?: number | null
          created_at?: string | null
          id?: number
          keywords?: string[] | null
          media_item_id?: number
          sentiment_label?: string
          sentiment_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "trader_sentiment_analysis_media_item_id_fkey"
            columns: ["media_item_id"]
            isOneToOne: false
            referencedRelation: "trader_media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_tracked_positions: {
        Row: {
          avg_price: number | null
          cash_pnl: number | null
          created_at: string | null
          current_price: number | null
          current_value: number | null
          id: number
          initial_value: number | null
          last_updated_at: string | null
          market_id: string
          outcome: string
          percent_pnl: number | null
          position_opened_at: string | null
          realized_pnl: number | null
          size: number
          total_bought: number | null
          total_sold: number | null
          wallet_address: string
        }
        Insert: {
          avg_price?: number | null
          cash_pnl?: number | null
          created_at?: string | null
          current_price?: number | null
          current_value?: number | null
          id?: number
          initial_value?: number | null
          last_updated_at?: string | null
          market_id: string
          outcome: string
          percent_pnl?: number | null
          position_opened_at?: string | null
          realized_pnl?: number | null
          size: number
          total_bought?: number | null
          total_sold?: number | null
          wallet_address: string
        }
        Update: {
          avg_price?: number | null
          cash_pnl?: number | null
          created_at?: string | null
          current_price?: number | null
          current_value?: number | null
          id?: number
          initial_value?: number | null
          last_updated_at?: string | null
          market_id?: string
          outcome?: string
          percent_pnl?: number | null
          position_opened_at?: string | null
          realized_pnl?: number | null
          size?: number
          total_bought?: number | null
          total_sold?: number | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "trader_tracked_positions_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "trader_tracked_profiles"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      trader_tracked_profiles: {
        Row: {
          alpha_score: number | null
          avg_entry_odds: number | null
          avg_hold_days: number | null
          avg_position_size: number | null
          biggest_loss: number | null
          biggest_win: number | null
          category: string | null
          closed_position_count: number | null
          contrarian_percent: number | null
          conviction_score: number | null
          created_at: string | null
          crypto_percent: number | null
          current_rank: number | null
          current_streak: number | null
          days_since_last_trade: number | null
          diversification_score: number | null
          has_open_positions: boolean | null
          is_claimed: boolean | null
          last_synced_at: string | null
          long_hold_percent: number | null
          max_drawdown_percent: number | null
          max_position_size: number | null
          other_percent: number | null
          politics_percent: number | null
          position_count: number | null
          profile_image: string | null
          profit_factor: number | null
          realized_pnl: number | null
          roi: number | null
          sharpe_ratio: number | null
          sports_percent: number | null
          time_period: string | null
          total_pnl: number | null
          total_volume: number | null
          trade_count: number | null
          unique_markets: number | null
          unrealized_pnl: number | null
          updated_at: string | null
          username: string | null
          verified_badge: boolean | null
          wallet_address: string
          wallet_age_days: number | null
          whale_trades_count: number | null
          whale_volume: number | null
          win_rate: number | null
          win_streak: number | null
          x_username: string | null
        }
        Insert: {
          alpha_score?: number | null
          avg_entry_odds?: number | null
          avg_hold_days?: number | null
          avg_position_size?: number | null
          biggest_loss?: number | null
          biggest_win?: number | null
          category?: string | null
          closed_position_count?: number | null
          contrarian_percent?: number | null
          conviction_score?: number | null
          created_at?: string | null
          crypto_percent?: number | null
          current_rank?: number | null
          current_streak?: number | null
          days_since_last_trade?: number | null
          diversification_score?: number | null
          has_open_positions?: boolean | null
          is_claimed?: boolean | null
          last_synced_at?: string | null
          long_hold_percent?: number | null
          max_drawdown_percent?: number | null
          max_position_size?: number | null
          other_percent?: number | null
          politics_percent?: number | null
          position_count?: number | null
          profile_image?: string | null
          profit_factor?: number | null
          realized_pnl?: number | null
          roi?: number | null
          sharpe_ratio?: number | null
          sports_percent?: number | null
          time_period?: string | null
          total_pnl?: number | null
          total_volume?: number | null
          trade_count?: number | null
          unique_markets?: number | null
          unrealized_pnl?: number | null
          updated_at?: string | null
          username?: string | null
          verified_badge?: boolean | null
          wallet_address: string
          wallet_age_days?: number | null
          whale_trades_count?: number | null
          whale_volume?: number | null
          win_rate?: number | null
          win_streak?: number | null
          x_username?: string | null
        }
        Update: {
          alpha_score?: number | null
          avg_entry_odds?: number | null
          avg_hold_days?: number | null
          avg_position_size?: number | null
          biggest_loss?: number | null
          biggest_win?: number | null
          category?: string | null
          closed_position_count?: number | null
          contrarian_percent?: number | null
          conviction_score?: number | null
          created_at?: string | null
          crypto_percent?: number | null
          current_rank?: number | null
          current_streak?: number | null
          days_since_last_trade?: number | null
          diversification_score?: number | null
          has_open_positions?: boolean | null
          is_claimed?: boolean | null
          last_synced_at?: string | null
          long_hold_percent?: number | null
          max_drawdown_percent?: number | null
          max_position_size?: number | null
          other_percent?: number | null
          politics_percent?: number | null
          position_count?: number | null
          profile_image?: string | null
          profit_factor?: number | null
          realized_pnl?: number | null
          roi?: number | null
          sharpe_ratio?: number | null
          sports_percent?: number | null
          time_period?: string | null
          total_pnl?: number | null
          total_volume?: number | null
          trade_count?: number | null
          unique_markets?: number | null
          unrealized_pnl?: number | null
          updated_at?: string | null
          username?: string | null
          verified_badge?: boolean | null
          wallet_address?: string
          wallet_age_days?: number | null
          whale_trades_count?: number | null
          whale_volume?: number | null
          win_rate?: number | null
          win_streak?: number | null
          x_username?: string | null
        }
        Relationships: []
      }
      tradeschool_lab_steps: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          lab_id: number
          step_number: number
          title: string
          updated_at: string | null
          verification_criteria: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          lab_id: number
          step_number: number
          title: string
          updated_at?: string | null
          verification_criteria?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          lab_id?: number
          step_number?: number
          title?: string
          updated_at?: string | null
          verification_criteria?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tradeschool_lab_steps_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "tradeschool_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      tradeschool_labs: {
        Row: {
          agent_config: Json | null
          created_at: string | null
          description: string | null
          first_message: string | null
          id: number
          system_prompt: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agent_config?: Json | null
          created_at?: string | null
          description?: string | null
          first_message?: string | null
          id?: number
          system_prompt?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agent_config?: Json | null
          created_at?: string | null
          description?: string | null
          first_message?: string | null
          id?: number
          system_prompt?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          agent_id: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          project_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      upwork_automation_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          id: string
          level: string | null
          log_type: string
          message: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          level?: string | null
          log_type: string
          message: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          level?: string | null
          log_type?: string
          message?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      upwork_automation_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          user_id: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          user_id?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          user_id?: string | null
          value?: Json
        }
        Relationships: []
      }
      upwork_filter_prompts: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          system_prompt: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          system_prompt: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      upwork_followup_qa: {
        Row: {
          created_at: string | null
          generation_time_ms: number | null
          id: string
          job_id: string
          model: string | null
          proposal_id: string
          qa_pairs: Json
          raw_questions: string
          system_prompt: string | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string | null
          user_prompt: string | null
        }
        Insert: {
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          job_id: string
          model?: string | null
          proposal_id: string
          qa_pairs?: Json
          raw_questions: string
          system_prompt?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_prompt?: string | null
        }
        Update: {
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          job_id?: string
          model?: string | null
          proposal_id?: string
          qa_pairs?: Json
          raw_questions?: string
          system_prompt?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upwork_followup_qa_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "upwork_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upwork_followup_qa_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "upwork_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      upwork_gmail_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          refresh_token: string
          token_expiry: string
          updated_at: string | null
          user_id: string
          user_uuid: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token: string
          token_expiry: string
          updated_at?: string | null
          user_id?: string
          user_uuid?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string
          token_expiry?: string
          updated_at?: string | null
          user_id?: string
          user_uuid?: string | null
        }
        Relationships: []
      }
      upwork_jobs: {
        Row: {
          budget: string | null
          category: string | null
          client_info: Json | null
          created_at: string | null
          description: string | null
          experience_level: string | null
          id: string
          job_id: string
          job_type: string | null
          job_url: string
          posted_date: string | null
          project_length: string | null
          proposals: string | null
          raw_data: Json | null
          scrape_method: string | null
          skills: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget?: string | null
          category?: string | null
          client_info?: Json | null
          created_at?: string | null
          description?: string | null
          experience_level?: string | null
          id?: string
          job_id: string
          job_type?: string | null
          job_url: string
          posted_date?: string | null
          project_length?: string | null
          proposals?: string | null
          raw_data?: Json | null
          scrape_method?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: string | null
          category?: string | null
          client_info?: Json | null
          created_at?: string | null
          description?: string | null
          experience_level?: string | null
          id?: string
          job_id?: string
          job_type?: string | null
          job_url?: string
          posted_date?: string | null
          project_length?: string | null
          proposals?: string | null
          raw_data?: Json | null
          scrape_method?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      upwork_processed_emails: {
        Row: {
          archived_at: string | null
          created_at: string | null
          error_message: string | null
          filter_result: Json | null
          id: string
          is_archived: boolean
          job_id: string | null
          job_url: string | null
          message_id: string
          processed_at: string | null
          processing_status: string | null
          received_at: string | null
          source: string
          subject: string | null
          thread_id: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          error_message?: string | null
          filter_result?: Json | null
          id?: string
          is_archived?: boolean
          job_id?: string | null
          job_url?: string | null
          message_id: string
          processed_at?: string | null
          processing_status?: string | null
          received_at?: string | null
          source?: string
          subject?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          error_message?: string | null
          filter_result?: Json | null
          id?: string
          is_archived?: boolean
          job_id?: string | null
          job_url?: string | null
          message_id?: string
          processed_at?: string | null
          processing_status?: string | null
          received_at?: string | null
          source?: string
          subject?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upwork_processed_emails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "upwork_jobs"
            referencedColumns: ["job_id"]
          },
        ]
      }
      upwork_profile: {
        Row: {
          case_studies: string | null
          certifications: string[] | null
          created_at: string | null
          custom_fields: Json | null
          detailed_background: string | null
          experience_highlights: string[] | null
          expertise_areas: string[] | null
          external_projects: string | null
          hourly_rate: string | null
          id: string
          overview: string | null
          portfolio_items: Json | null
          skills: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
          user_uuid: string | null
          work_preferences: string | null
        }
        Insert: {
          case_studies?: string | null
          certifications?: string[] | null
          created_at?: string | null
          custom_fields?: Json | null
          detailed_background?: string | null
          experience_highlights?: string[] | null
          expertise_areas?: string[] | null
          external_projects?: string | null
          hourly_rate?: string | null
          id?: string
          overview?: string | null
          portfolio_items?: Json | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          user_uuid?: string | null
          work_preferences?: string | null
        }
        Update: {
          case_studies?: string | null
          certifications?: string[] | null
          created_at?: string | null
          custom_fields?: Json | null
          detailed_background?: string | null
          experience_highlights?: string[] | null
          expertise_areas?: string[] | null
          external_projects?: string | null
          hourly_rate?: string | null
          id?: string
          overview?: string | null
          portfolio_items?: Json | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          user_uuid?: string | null
          work_preferences?: string | null
        }
        Relationships: []
      }
      upwork_prompt_improvements: {
        Row: {
          analysis_model: string | null
          analysis_time_ms: number | null
          created_at: string | null
          differences: Json | null
          id: string
          insights: string | null
          prompt_id: string
          status: string | null
          submission_id: string
          suggested_changes: string[] | null
          tokens_used: number | null
          updated_at: string | null
          user_feedback: string | null
          user_id: string | null
        }
        Insert: {
          analysis_model?: string | null
          analysis_time_ms?: number | null
          created_at?: string | null
          differences?: Json | null
          id?: string
          insights?: string | null
          prompt_id: string
          status?: string | null
          submission_id: string
          suggested_changes?: string[] | null
          tokens_used?: number | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_model?: string | null
          analysis_time_ms?: number | null
          created_at?: string | null
          differences?: Json | null
          id?: string
          insights?: string | null
          prompt_id?: string
          status?: string | null
          submission_id?: string
          suggested_changes?: string[] | null
          tokens_used?: number | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upwork_prompt_improvements_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "upwork_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upwork_prompt_improvements_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "upwork_proposal_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      upwork_prompts: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          system_prompt: string
          updated_at: string | null
          user_directions: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          system_prompt: string
          updated_at?: string | null
          user_directions?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          system_prompt?: string
          updated_at?: string | null
          user_directions?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      upwork_proposal_submissions: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          proposal_id: string
          submission_notes: string | null
          submission_outcome: string | null
          submitted_at: string | null
          submitted_content: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          proposal_id: string
          submission_notes?: string | null
          submission_outcome?: string | null
          submitted_at?: string | null
          submitted_content: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          proposal_id?: string
          submission_notes?: string | null
          submission_outcome?: string | null
          submitted_at?: string | null
          submitted_content?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upwork_proposal_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "upwork_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upwork_proposal_submissions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "upwork_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      upwork_proposals: {
        Row: {
          content: string
          created_at: string | null
          generation_time_ms: number | null
          id: string
          job_id: string | null
          model: string | null
          prompt_id: string | null
          system_prompt: string | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string | null
          user_prompt: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          job_id?: string | null
          model?: string | null
          prompt_id?: string | null
          system_prompt?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_prompt?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          job_id?: string | null
          model?: string | null
          prompt_id?: string | null
          system_prompt?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upwork_proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "upwork_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upwork_proposals_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "upwork_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      upwork_user_videos: {
        Row: {
          created_at: string | null
          description: string
          id: string
          updated_at: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          updated_at?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      upwork_video_jobs: {
        Row: {
          client_name: string | null
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          file_size_bytes: number | null
          final_video_url: string | null
          heygen_segment_url: string | null
          heygen_status: string | null
          heygen_video_id: string | null
          id: string
          intro_segment_url: string | null
          job_id: string | null
          job_screenshot_url: string | null
          mermaid_chart_url: string | null
          mermaid_code: string | null
          metadata: Json | null
          outro_segment_url: string | null
          processing_completed_at: string | null
          processing_started_at: string | null
          proposal_id: string | null
          public_video_url: string | null
          screen_share_url: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_size_bytes?: number | null
          final_video_url?: string | null
          heygen_segment_url?: string | null
          heygen_status?: string | null
          heygen_video_id?: string | null
          id?: string
          intro_segment_url?: string | null
          job_id?: string | null
          job_screenshot_url?: string | null
          mermaid_chart_url?: string | null
          mermaid_code?: string | null
          metadata?: Json | null
          outro_segment_url?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          proposal_id?: string | null
          public_video_url?: string | null
          screen_share_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_size_bytes?: number | null
          final_video_url?: string | null
          heygen_segment_url?: string | null
          heygen_status?: string | null
          heygen_video_id?: string | null
          id?: string
          intro_segment_url?: string | null
          job_id?: string | null
          job_screenshot_url?: string | null
          mermaid_chart_url?: string | null
          mermaid_code?: string | null
          metadata?: Json | null
          outro_segment_url?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          proposal_id?: string | null
          public_video_url?: string | null
          screen_share_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upwork_video_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "upwork_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upwork_video_jobs_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "upwork_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      upwork_video_segments: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          name: string
          public_url: string
          segment_type: string
          storage_path: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          public_url: string
          segment_type: string
          storage_path: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          public_url?: string
          segment_type?: string
          storage_path?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      upwork_video_settings: {
        Row: {
          key: string
          updated_at: string | null
          user_id: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          user_id?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          user_id?: string | null
          value?: Json
        }
        Relationships: []
      }
      valuation_adjustments: {
        Row: {
          adjustment_reason: string
          created_at: string
          id: string
          milestone_id: string
          new_value: number
          outcome_id: string
          previous_value: number
        }
        Insert: {
          adjustment_reason: string
          created_at?: string
          id?: string
          milestone_id: string
          new_value: number
          outcome_id: string
          previous_value: number
        }
        Update: {
          adjustment_reason?: string
          created_at?: string
          id?: string
          milestone_id?: string
          new_value?: number
          outcome_id?: string
          previous_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "valuation_adjustments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valuation_adjustments_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_agent_versions: {
        Row: {
          agent_id: string
          config_snapshot: Json
          created_at: string | null
          id: string
          published_by: string | null
          tenant_id: string
          version_number: number
        }
        Insert: {
          agent_id: string
          config_snapshot: Json
          created_at?: string | null
          id?: string
          published_by?: string | null
          tenant_id: string
          version_number: number
        }
        Update: {
          agent_id?: string
          config_snapshot?: Json
          created_at?: string | null
          id?: string
          published_by?: string | null
          tenant_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "voice_agent_versions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "voice_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_agent_versions_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "voice_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_agent_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_agents: {
        Row: {
          config_version: number
          context_prompt: string | null
          created_at: string | null
          fallback_responses: Json | null
          flow_settings: Json | null
          goodbye_message: string | null
          greeting_message: string | null
          hold_message: string | null
          id: string
          name: string
          personality_prompt: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["voice_agent_status"]
          tenant_id: string
          transfer_prompt: string | null
          updated_at: string | null
          voice_config: Json | null
        }
        Insert: {
          config_version?: number
          context_prompt?: string | null
          created_at?: string | null
          fallback_responses?: Json | null
          flow_settings?: Json | null
          goodbye_message?: string | null
          greeting_message?: string | null
          hold_message?: string | null
          id?: string
          name: string
          personality_prompt?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["voice_agent_status"]
          tenant_id: string
          transfer_prompt?: string | null
          updated_at?: string | null
          voice_config?: Json | null
        }
        Update: {
          config_version?: number
          context_prompt?: string | null
          created_at?: string | null
          fallback_responses?: Json | null
          flow_settings?: Json | null
          goodbye_message?: string | null
          greeting_message?: string | null
          hold_message?: string | null
          id?: string
          name?: string
          personality_prompt?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["voice_agent_status"]
          tenant_id?: string
          transfer_prompt?: string | null
          updated_at?: string | null
          voice_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_appointments: {
        Row: {
          attendee_email: string | null
          call_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          lead_id: string | null
          location: string | null
          start_time: string
          status: Database["public"]["Enums"]["voice_appointment_status"] | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendee_email?: string | null
          call_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          start_time: string
          status?:
            | Database["public"]["Enums"]["voice_appointment_status"]
            | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendee_email?: string | null
          call_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          start_time?: string
          status?:
            | Database["public"]["Enums"]["voice_appointment_status"]
            | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_appointments_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "voice_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "voice_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_calendar_connections: {
        Row: {
          access_token_encrypted: string | null
          availability_config: Json | null
          calendar_id: string | null
          connected_at: string | null
          id: string
          provider:
            | Database["public"]["Enums"]["voice_calendar_provider"]
            | null
          refresh_token_encrypted: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          availability_config?: Json | null
          calendar_id?: string | null
          connected_at?: string | null
          id?: string
          provider?:
            | Database["public"]["Enums"]["voice_calendar_provider"]
            | null
          refresh_token_encrypted?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          availability_config?: Json | null
          calendar_id?: string | null
          connected_at?: string | null
          id?: string
          provider?:
            | Database["public"]["Enums"]["voice_calendar_provider"]
            | null
          refresh_token_encrypted?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_calendar_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calendar_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voice_users"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_calls: {
        Row: {
          agent_id: string
          callee_number: string | null
          caller_number: string | null
          created_at: string | null
          direction: Database["public"]["Enums"]["voice_call_direction"]
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_id: string | null
          recording_url: string | null
          sentiment: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["voice_call_status"]
          summary: string | null
          tenant_id: string
          transfer_destination: string | null
          transfer_reason: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string | null
          direction: Database["public"]["Enums"]["voice_call_direction"]
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          recording_url?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["voice_call_status"]
          summary?: string | null
          tenant_id: string
          transfer_destination?: string | null
          transfer_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["voice_call_direction"]
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          recording_url?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["voice_call_status"]
          summary?: string | null
          tenant_id?: string
          transfer_destination?: string | null
          transfer_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "voice_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "voice_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_entity_tags: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["voice_entity_type"]
          id: string
          tag_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["voice_entity_type"]
          id?: string
          tag_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["voice_entity_type"]
          id?: string
          tag_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_entity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "voice_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_entity_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["voice_user_role"]
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["voice_user_role"]
          tenant_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["voice_user_role"]
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "voice_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_keyword_alerts: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          is_phrase: boolean | null
          keyword: string
          priority: Database["public"]["Enums"]["voice_keyword_priority"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          is_phrase?: boolean | null
          keyword: string
          priority?:
            | Database["public"]["Enums"]["voice_keyword_priority"]
            | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          is_phrase?: boolean | null
          keyword?: string
          priority?:
            | Database["public"]["Enums"]["voice_keyword_priority"]
            | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_keyword_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_knowledge_base: {
        Row: {
          answer: string | null
          category: string | null
          content: string | null
          created_at: string | null
          file_name: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          metadata: Json | null
          question: string | null
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["voice_kb_type"]
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          question?: string | null
          tenant_id: string
          title: string
          type?: Database["public"]["Enums"]["voice_kb_type"]
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          question?: string | null
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["voice_kb_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_knowledge_base_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_leads: {
        Row: {
          company: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          id: string
          name: string | null
          notes: string | null
          phone: string | null
          sms_opt_out: boolean | null
          source: string | null
          stage: Database["public"]["Enums"]["voice_lead_stage"]
          status: Database["public"]["Enums"]["voice_lead_status"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          sms_opt_out?: boolean | null
          source?: string | null
          stage?: Database["public"]["Enums"]["voice_lead_stage"]
          status?: Database["public"]["Enums"]["voice_lead_status"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          sms_opt_out?: boolean | null
          source?: string | null
          stage?: Database["public"]["Enums"]["voice_lead_stage"]
          status?: Database["public"]["Enums"]["voice_lead_status"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notification_preferences: {
        Row: {
          channel_email: boolean | null
          channel_in_app: boolean | null
          channel_sms: boolean | null
          channel_webhook: boolean | null
          created_at: string | null
          event_type: Database["public"]["Enums"]["voice_notification_type"]
          frequency:
            | Database["public"]["Enums"]["voice_notification_frequency"]
            | null
          id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_email?: boolean | null
          channel_in_app?: boolean | null
          channel_sms?: boolean | null
          channel_webhook?: boolean | null
          created_at?: string | null
          event_type: Database["public"]["Enums"]["voice_notification_type"]
          frequency?:
            | Database["public"]["Enums"]["voice_notification_frequency"]
            | null
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_email?: boolean | null
          channel_in_app?: boolean | null
          channel_sms?: boolean | null
          channel_webhook?: boolean | null
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["voice_notification_type"]
          frequency?:
            | Database["public"]["Enums"]["voice_notification_frequency"]
            | null
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voice_users"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          read: boolean | null
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["voice_notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["voice_notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["voice_notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voice_users"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_phone_numbers: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string
          phone_number: string
          purchased_at: string
          released_at: string | null
          status: Database["public"]["Enums"]["voice_phone_status"]
          telnyx_phone_id: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          phone_number: string
          purchased_at?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["voice_phone_status"]
          telnyx_phone_id: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string
          purchased_at?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["voice_phone_status"]
          telnyx_phone_id?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_phone_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_plans: {
        Row: {
          created_at: string | null
          data_retention_days: number
          features: Json | null
          id: string
          max_agents: number
          max_leads: number
          max_phone_numbers: number
          minutes_included: number
          name: string
          price_annual: number | null
          price_monthly: number | null
          stripe_price_id_annual: string | null
          stripe_price_id_monthly: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_retention_days?: number
          features?: Json | null
          id?: string
          max_agents?: number
          max_leads?: number
          max_phone_numbers?: number
          minutes_included?: number
          name: string
          price_annual?: number | null
          price_monthly?: number | null
          stripe_price_id_annual?: string | null
          stripe_price_id_monthly?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_retention_days?: number
          features?: Json | null
          id?: string
          max_agents?: number
          max_leads?: number
          max_phone_numbers?: number
          minutes_included?: number
          name?: string
          price_annual?: number | null
          price_monthly?: number | null
          stripe_price_id_annual?: string | null
          stripe_price_id_monthly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voice_sms_messages: {
        Row: {
          body: string
          created_at: string | null
          direction: Database["public"]["Enums"]["voice_sms_direction"]
          from_number: string
          id: string
          lead_id: string | null
          provider_message_id: string | null
          status: Database["public"]["Enums"]["voice_sms_status"] | null
          template_id: string | null
          tenant_id: string
          to_number: string
        }
        Insert: {
          body: string
          created_at?: string | null
          direction: Database["public"]["Enums"]["voice_sms_direction"]
          from_number: string
          id?: string
          lead_id?: string | null
          provider_message_id?: string | null
          status?: Database["public"]["Enums"]["voice_sms_status"] | null
          template_id?: string | null
          tenant_id: string
          to_number: string
        }
        Update: {
          body?: string
          created_at?: string | null
          direction?: Database["public"]["Enums"]["voice_sms_direction"]
          from_number?: string
          id?: string
          lead_id?: string | null
          provider_message_id?: string | null
          status?: Database["public"]["Enums"]["voice_sms_status"] | null
          template_id?: string | null
          tenant_id?: string
          to_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sms_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "voice_sms_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_sms_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "voice_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_sms_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_sms_templates: {
        Row: {
          body: string
          category:
            | Database["public"]["Enums"]["voice_sms_template_category"]
            | null
          created_at: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          category?:
            | Database["public"]["Enums"]["voice_sms_template_category"]
            | null
          created_at?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          category?:
            | Database["public"]["Enums"]["voice_sms_template_category"]
            | null
          created_at?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_sms_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: Database["public"]["Enums"]["voice_subscription_status"]
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: Database["public"]["Enums"]["voice_subscription_status"]
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: Database["public"]["Enums"]["voice_subscription_status"]
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "voice_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_tenants: {
        Row: {
          business_transfer_phone: string | null
          created_at: string | null
          id: string
          name: string
          plan_tier: string
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_transfer_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          plan_tier?: string
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_transfer_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          plan_tier?: string
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voice_transcripts: {
        Row: {
          call_id: string
          content: Json | null
          created_at: string | null
          full_text: string | null
          id: string
          searchable_content: unknown
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          call_id: string
          content?: Json | null
          created_at?: string | null
          full_text?: string | null
          id?: string
          searchable_content?: unknown
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          call_id?: string
          content?: Json | null
          created_at?: string | null
          full_text?: string | null
          id?: string
          searchable_content?: unknown
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "voice_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transcripts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_transfer_rules: {
        Row: {
          agent_id: string
          business_hours: Json | null
          created_at: string | null
          default_number: string | null
          department_routing: Json | null
          id: string
          priority_routing: Json | null
          tenant_id: string
          transfer_type:
            | Database["public"]["Enums"]["voice_transfer_type"]
            | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          business_hours?: Json | null
          created_at?: string | null
          default_number?: string | null
          department_routing?: Json | null
          id?: string
          priority_routing?: Json | null
          tenant_id: string
          transfer_type?:
            | Database["public"]["Enums"]["voice_transfer_type"]
            | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          business_hours?: Json | null
          created_at?: string | null
          default_number?: string | null
          department_routing?: Json | null
          id?: string
          priority_routing?: Json | null
          tenant_id?: string
          transfer_type?:
            | Database["public"]["Enums"]["voice_transfer_type"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_transfer_rules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "voice_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transfer_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_usage_tracking: {
        Row: {
          call_count: number | null
          call_minutes_used: number | null
          created_at: string | null
          id: string
          leads_count: number | null
          overage_minutes: number | null
          period_end: string
          period_start: string
          sms_count: number | null
          storage_bytes_used: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          call_count?: number | null
          call_minutes_used?: number | null
          created_at?: string | null
          id?: string
          leads_count?: number | null
          overage_minutes?: number | null
          period_end: string
          period_start: string
          sms_count?: number | null
          storage_bytes_used?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          call_count?: number | null
          call_minutes_used?: number | null
          created_at?: string | null
          id?: string
          leads_count?: number | null
          overage_minutes?: number | null
          period_end?: string
          period_start?: string
          sms_count?: number | null
          storage_bytes_used?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_usage_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_users: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["voice_user_role"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["voice_user_role"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["voice_user_role"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_webhook_configs: {
        Row: {
          active: boolean | null
          created_at: string | null
          events: Json | null
          id: string
          last_triggered_at: string | null
          signing_secret: string
          tenant_id: string
          updated_at: string | null
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          events?: Json | null
          id?: string
          last_triggered_at?: string | null
          signing_secret?: string
          tenant_id: string
          updated_at?: string | null
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          events?: Json | null
          id?: string
          last_triggered_at?: string | null
          signing_secret?: string
          tenant_id?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_webhook_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "voice_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_webhook_deliveries: {
        Row: {
          attempt: number | null
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          status_code: number | null
          webhook_config_id: string
        }
        Insert: {
          attempt?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          status_code?: number | null
          webhook_config_id: string
        }
        Update: {
          attempt?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          status_code?: number | null
          webhook_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_webhook_deliveries_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "voice_webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_ai_responses: {
        Row: {
          ai_response: string
          completion_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
          user_message: string | null
        }
        Insert: {
          ai_response: string
          completion_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          user_message?: string | null
        }
        Update: {
          ai_response?: string
          completion_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          user_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_ai_responses_completion_id_fkey"
            columns: ["completion_id"]
            isOneToOne: false
            referencedRelation: "workout_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_ai_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "workout_users"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_ai_runs: {
        Row: {
          assistant_response: string | null
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          messages_sent: Json
          model: string
          status: string
          steps: Json
          user_id: string
          user_message: string
          workout_context: string | null
        }
        Insert: {
          assistant_response?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          messages_sent?: Json
          model?: string
          status?: string
          steps?: Json
          user_id: string
          user_message: string
          workout_context?: string | null
        }
        Update: {
          assistant_response?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          messages_sent?: Json
          model?: string
          status?: string
          steps?: Json
          user_id?: string
          user_message?: string
          workout_context?: string | null
        }
        Relationships: []
      }
      workout_completion_exercises: {
        Row: {
          actual_reps: number
          actual_weight: number | null
          completed_at: string | null
          completion_id: string | null
          created_at: string | null
          exercise_id: string | null
          id: string
          notes: string | null
          set_number: number
        }
        Insert: {
          actual_reps: number
          actual_weight?: number | null
          completed_at?: string | null
          completion_id?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          set_number: number
        }
        Update: {
          actual_reps?: number
          actual_weight?: number | null
          completed_at?: string | null
          completion_id?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          set_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_completion_exercises_completion_id_fkey"
            columns: ["completion_id"]
            isOneToOne: false
            referencedRelation: "workout_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_completion_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_completions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          started_at: string
          user_id: string | null
          workout_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at: string
          user_id?: string | null
          workout_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          user_id?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "workout_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_completions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_duration_based: boolean
          name: string
          requires_weight: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_duration_based?: boolean
          name: string
          requires_weight?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_duration_based?: boolean
          name?: string
          requires_weight?: boolean | null
        }
        Relationships: []
      }
      workout_stretches: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          name: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          name: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      workout_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string | null
          id: string
          order_index: number
          rest_period_seconds: number | null
          target_reps: number
          target_sets: number
          target_weight: number | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          order_index: number
          rest_period_seconds?: number | null
          target_reps: number
          target_sets: number
          target_weight?: number | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          order_index?: number
          rest_period_seconds?: number | null
          target_reps?: number
          target_sets?: number
          target_weight?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_workout_stretches: {
        Row: {
          created_at: string | null
          duration_override: number | null
          id: string
          order_index: number
          stretch_id: string | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_override?: number | null
          id?: string
          order_index: number
          stretch_id?: string | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_override?: number | null
          id?: string
          order_index?: number
          stretch_id?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_workout_stretches_stretch_id_fkey"
            columns: ["stretch_id"]
            isOneToOne: false
            referencedRelation: "workout_stretches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_workout_stretches_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_workouts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "workout_users"
            referencedColumns: ["id"]
          },
        ]
      }
      wtf_conversations: {
        Row: {
          created_at: string | null
          id: string
          summary: string | null
          updated_at: string | null
          user_id: string | null
          user_question: string | null
          video_id: string
          video_title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          summary?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_question?: string | null
          video_id: string
          video_title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          summary?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_question?: string | null
          video_id?: string
          video_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wtf_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "wtf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wtf_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "wtf_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "wtf_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      wtf_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wtf_text_matches: {
        Row: {
          created_at: string | null
          highlighted_text: string
          id: string
          matches: Json
          updated_at: string | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          highlighted_text: string
          id?: string
          matches: Json
          updated_at?: string | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          highlighted_text?: string
          id?: string
          matches?: Json
          updated_at?: string | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wtf_text_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "wtf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wtf_transcripts: {
        Row: {
          channel_name: string | null
          created_at: string | null
          id: string
          transcript: string
          updated_at: string | null
          video_id: string
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          channel_name?: string | null
          created_at?: string | null
          id?: string
          transcript: string
          updated_at?: string | null
          video_id: string
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          channel_name?: string | null
          created_at?: string | null
          id?: string
          transcript?: string
          updated_at?: string | null
          video_id?: string
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      icwt_submission_votes: {
        Row: {
          created_at: string | null
          demo_url: string | null
          description: string | null
          github_url: string | null
          id: string | null
          status: string | null
          submission_url: string | null
          team_members: string | null
          team_name: string | null
          title: string | null
          user_id: string | null
          vote_count: number | null
        }
        Relationships: []
      }
      invoice_invoice_payment_summary: {
        Row: {
          amount_paid: number | null
          invoice_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_cycle_time: { Args: { task_id: string }; Returns: string }
      calculate_lead_time: { Args: { task_id: string }; Returns: string }
      calculate_task_duration: { Args: { task_uuid: string }; Returns: number }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_org_id: { Args: never; Returns: string }
      delete_faq_tag: { Args: { tag: string }; Returns: undefined }
      er_activate_prompt_version: { Args: { p_id: string }; Returns: undefined }
      er_claim_or_insert_user: {
        Args: { p_email: string; p_phone: string; p_user_id: string }
        Returns: {
          id: string
          role: string
        }[]
      }
      er_create_prompt_version: {
        Args: { p_content: Json; p_created_by_email: string; p_notes: string }
        Returns: {
          id: string
          version_number: number
        }[]
      }
      er_log_level_counts: {
        Args: never
        Returns: {
          count: number
          level: string
        }[]
      }
      get_current_voice_tenant_id: { Args: never; Returns: string }
      get_table_schema: {
        Args: { table_name: string }
        Returns: {
          column_default: string
          column_name: string
          data_type: string
          is_nullable: boolean
          is_primary: boolean
        }[]
      }
      get_user_org: { Args: { p_user_id: string }; Returns: string }
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      invoice_calculate_totals: {
        Args: { target_invoice_id: string }
        Returns: undefined
      }
      invoice_duplicate: {
        Args: { source_invoice_id: string }
        Returns: string
      }
      invoice_update_payment_status: {
        Args: { target_invoice_id: string }
        Returns: undefined
      }
      invoke_poll_gmail_edge_function: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_org_admin: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_superadmin: { Args: { p_user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_admin_user_id: string
          p_details?: Json
          p_ip_address?: string
          p_organization_id: string
          p_target_user_id?: string
          p_user_agent?: string
        }
        Returns: string
      }
      match_faqs: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          answer: string
          question: string
          similarity: number
          source: string
        }[]
      }
      match_ideas: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          idea_key: string
          similarity: number
        }[]
      }
      merge_faq_tags: {
        Args: { source_tag: string; target_tag: string }
        Returns: undefined
      }
      neighbors_is_admin: { Args: { uid: string }; Returns: boolean }
      neighbors_is_event_participant: {
        Args: { evt: string; uid: string }
        Returns: boolean
      }
      news_run_daily_job: { Args: never; Returns: undefined }
      register_get_user_org_ids: { Args: never; Returns: string[] }
      register_get_user_role: { Args: { p_org_id: string }; Returns: string }
      rename_faq_tag: {
        Args: { new_tag: string; old_tag: string }
        Returns: undefined
      }
      update_task_duration: { Args: { task_uuid: string }; Returns: undefined }
      update_user_last_seen: { Args: { user_uuid: string }; Returns: undefined }
      user_belongs_to_org: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      workout_exec_sql: { Args: { query: string }; Returns: Json }
    }
    Enums: {
      admin_validation_priority: "critical" | "normal" | "low"
      admin_validation_status: "pending" | "passed" | "failed" | "skipped"
      admin_validation_type: "automated" | "manual"
      change_type: "create" | "modify" | "delete"
      dependency_type: "blocks" | "blocked-by" | "related" | "duplicate"
      reference_type: "docs" | "pr" | "issue" | "design" | "slack" | "other"
      task_complexity: "trivial" | "simple" | "moderate" | "complex" | "epic"
      task_type:
        | "bug"
        | "feature"
        | "refactor"
        | "chore"
        | "investigation"
        | "documentation"
      user_role: "admin" | "member"
      validation_method:
        | "manual"
        | "unit-test"
        | "integration-test"
        | "e2e-test"
        | "visual-review"
        | "performance-benchmark"
      voice_agent_status: "draft" | "published"
      voice_appointment_status: "scheduled" | "cancelled" | "completed"
      voice_calendar_provider: "google"
      voice_call_direction: "inbound" | "outbound"
      voice_call_status:
        | "ringing"
        | "in_progress"
        | "completed"
        | "missed"
        | "failed"
        | "transferred"
      voice_entity_type: "lead" | "call" | "knowledge_base" | "sms"
      voice_kb_type: "faq" | "document" | "link" | "company_info"
      voice_keyword_priority: "high" | "medium" | "low"
      voice_lead_stage:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "won"
        | "lost"
      voice_lead_status: "active" | "inactive" | "archived"
      voice_notification_frequency: "immediate" | "daily" | "weekly"
      voice_notification_type:
        | "call_started"
        | "call_ended"
        | "call_missed"
        | "call_transferred"
        | "lead_created"
        | "lead_stage_changed"
        | "keyword_detected"
        | "appointment_created"
        | "appointment_cancelled"
        | "usage_limit_warning"
        | "trial_ending"
        | "sms_received"
      voice_phone_status: "available" | "active" | "reserved" | "suspended"
      voice_sms_direction: "inbound" | "outbound"
      voice_sms_status:
        | "queued"
        | "sent"
        | "delivered"
        | "failed"
        | "undelivered"
      voice_sms_template_category:
        | "greeting"
        | "reminder"
        | "follow_up"
        | "link"
        | "confirmation"
      voice_subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "trialing"
        | "incomplete"
      voice_transfer_type: "warm" | "cold"
      voice_user_role: "owner" | "admin" | "manager" | "viewer"
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
      admin_validation_priority: ["critical", "normal", "low"],
      admin_validation_status: ["pending", "passed", "failed", "skipped"],
      admin_validation_type: ["automated", "manual"],
      change_type: ["create", "modify", "delete"],
      dependency_type: ["blocks", "blocked-by", "related", "duplicate"],
      reference_type: ["docs", "pr", "issue", "design", "slack", "other"],
      task_complexity: ["trivial", "simple", "moderate", "complex", "epic"],
      task_type: [
        "bug",
        "feature",
        "refactor",
        "chore",
        "investigation",
        "documentation",
      ],
      user_role: ["admin", "member"],
      validation_method: [
        "manual",
        "unit-test",
        "integration-test",
        "e2e-test",
        "visual-review",
        "performance-benchmark",
      ],
      voice_agent_status: ["draft", "published"],
      voice_appointment_status: ["scheduled", "cancelled", "completed"],
      voice_calendar_provider: ["google"],
      voice_call_direction: ["inbound", "outbound"],
      voice_call_status: [
        "ringing",
        "in_progress",
        "completed",
        "missed",
        "failed",
        "transferred",
      ],
      voice_entity_type: ["lead", "call", "knowledge_base", "sms"],
      voice_kb_type: ["faq", "document", "link", "company_info"],
      voice_keyword_priority: ["high", "medium", "low"],
      voice_lead_stage: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "won",
        "lost",
      ],
      voice_lead_status: ["active", "inactive", "archived"],
      voice_notification_frequency: ["immediate", "daily", "weekly"],
      voice_notification_type: [
        "call_started",
        "call_ended",
        "call_missed",
        "call_transferred",
        "lead_created",
        "lead_stage_changed",
        "keyword_detected",
        "appointment_created",
        "appointment_cancelled",
        "usage_limit_warning",
        "trial_ending",
        "sms_received",
      ],
      voice_phone_status: ["available", "active", "reserved", "suspended"],
      voice_sms_direction: ["inbound", "outbound"],
      voice_sms_status: [
        "queued",
        "sent",
        "delivered",
        "failed",
        "undelivered",
      ],
      voice_sms_template_category: [
        "greeting",
        "reminder",
        "follow_up",
        "link",
        "confirmation",
      ],
      voice_subscription_status: [
        "active",
        "past_due",
        "canceled",
        "trialing",
        "incomplete",
      ],
      voice_transfer_type: ["warm", "cold"],
      voice_user_role: ["owner", "admin", "manager", "viewer"],
    },
  },
} as const
