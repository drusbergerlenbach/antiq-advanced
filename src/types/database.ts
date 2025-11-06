export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string;
          status: string;
          priority: string;
          due_at: string | null;
          snoozed_until: string | null;
          assignee: string;
          interval_type: string;
          interval_mode: string;
          is_all_day: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string;
          status?: string;
          priority?: string;
          due_at?: string | null;
          snoozed_until?: string | null;
          assignee?: string;
          interval_type?: string;
          interval_mode?: string;
          is_all_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          due_at?: string | null;
          snoozed_until?: string | null;
          assignee?: string;
          interval_type?: string;
          interval_mode?: string;
          is_all_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          author: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          author: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          author?: string;
          text?: string;
          created_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          name: string;
          size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          name: string;
          size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          name?: string;
          size?: number;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          filter_categories: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filter_categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filter_categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
