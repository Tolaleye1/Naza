export type MessageType = "text" | "photo" | "video";
export type ShoutoutStatus = "pending" | "approved" | "rejected";

export interface Shoutout {
  id: string;
  sender_name: string;
  message_type: MessageType;
  text_content?: string;
  media_url?: string;
  youtube_url?: string;
  status: ShoutoutStatus;
  created_at: string;
}
