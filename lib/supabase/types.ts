export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shoutouts: {
        Row: {
          id: string;
          sender_name: string;
          message_type: "text" | "photo" | "video";
          text_content: string | null;
          media_url: string | null;
          youtube_url: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          sender_name: string;
          message_type: "text" | "photo" | "video";
          text_content?: string | null;
          media_url?: string | null;
          youtube_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          sender_name?: string;
          message_type?: "text" | "photo" | "video";
          text_content?: string | null;
          media_url?: string | null;
          youtube_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
