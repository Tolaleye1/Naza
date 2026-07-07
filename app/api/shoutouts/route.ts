import { NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { MessageType, Shoutout } from "@/types/shoutout.types";

export const runtime = "nodejs";
export const maxDuration = 60;

const PAGE_SIZE = 20;

// Allowed MIME types for uploads
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

/** Strip HTML tags from user-submitted text to prevent XSS */
function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

const MOCK_FALLBACK = [
  {
    id: "mock-1",
    sender_name: "Tolu",
    message_type: "text" as const,
    text_content: "Happy birthday Naza! You deserve the absolute best day. Hoping this year brings you infinite laughter and joy! 🌸",
    media_url: null,
    youtube_url: null,
    status: "approved" as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "mock-2",
    sender_name: "Chioma",
    message_type: "text" as const,
    text_content: "Naza, you shine brighter than any star in the galaxy. Have a beautiful birthday girl! Love you always! ✨💕",
    media_url: null,
    youtube_url: null,
    status: "approved" as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: "mock-3",
    sender_name: "David",
    message_type: "text" as const,
    text_content: "Cheers to another great year Naza! May your day be filled with wonderful memories and sweet moments. 🎂🌹",
    media_url: null,
    youtube_url: null,
    status: "approved" as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "mock-4",
    sender_name: "Amara",
    message_type: "text" as const,
    text_content: "Wishing you the happiest of birthdays, sweet Naza! You have the kindest soul and bring so much warmth to everyone around you. 🌸💖",
    media_url: null,
    youtube_url: null,
    status: "approved" as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
  },
  {
    id: "mock-5",
    sender_name: "Emeka",
    message_type: "text" as const,
    text_content: "Happy Birthday Naza! Hope you are getting spoiled today. You deserve all the good things! 🎉🍿",
    media_url: null,
    youtube_url: null,
    status: "approved" as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: "mock-6",
    sender_name: "Blessing",
    message_type: "text" as const,
    text_content: "To the most graceful person I know, Happy Birthday Naza! Hope this year brings you closer to all your dreams. 🌸💫",
    media_url: null,
    youtube_url: null,
    status: "approved" as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

// requires: SUPABASE_SERVICE_ROLE_KEY
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const all = searchParams.get("all") === "true";
    const offset = (page - 1) * PAGE_SIZE;

    let shoutouts: Shoutout[] = [];
    let total = 0;
    let hasMore = false;

    try {
      const supabaseAdmin = createSupabaseAdminClient();

      if (all) {
        const { data } = await supabaseAdmin
          .from("shoutouts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (data && data.length > 0) {
          shoutouts = data as unknown as Shoutout[];
          total = data.length;
        } else {
          shoutouts = MOCK_FALLBACK as unknown as Shoutout[];
          total = MOCK_FALLBACK.length;
        }
      } else {
        const { data, count } = await supabaseAdmin
          .from("shoutouts")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (data && data.length > 0) {
          shoutouts = data as unknown as Shoutout[];
          total = count ?? data.length;
          hasMore = offset + data.length < total;
        } else {
          shoutouts = MOCK_FALLBACK as unknown as Shoutout[];
          total = MOCK_FALLBACK.length;
          hasMore = false;
        }
      }
    } catch (dbErr) {
      console.error("Supabase unavailable, using mock fallback:", dbErr);
      shoutouts = MOCK_FALLBACK as unknown as Shoutout[];
      total = MOCK_FALLBACK.length;
      hasMore = false;
    }

    return Response.json(
      { shoutouts, total, hasMore },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    console.error("shoutouts route error:", e);
    return Response.json(
      { shoutouts: MOCK_FALLBACK, total: MOCK_FALLBACK.length, hasMore: false }
    );
  }
}

// requires: SUPABASE_SERVICE_ROLE_KEY
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ── Extract fields ──
    const rawName = formData.get("sender_name");
    const rawType = formData.get("message_type");
    const rawText = formData.get("text_content");
    const mediaFile = formData.get("media_file");

    // ── Validate sender_name ──
    if (!rawName || typeof rawName !== "string" || rawName.trim().length === 0) {
      return Response.json(
        { error: "Your name is required." },
        { status: 400 }
      );
    }
    const senderName = sanitize(rawName).slice(0, 60);

    // ── Validate message_type ──
    const validTypes: MessageType[] = ["text", "photo", "video"];
    if (
      !rawType ||
      typeof rawType !== "string" ||
      !validTypes.includes(rawType as MessageType)
    ) {
      return Response.json(
        { error: "Invalid message type." },
        { status: 400 }
      );
    }
    const messageType = rawType as MessageType;

    // ── Type-specific validation ──
    let textContent: string | null = null;
    let mediaUrl: string | null = null;

    if (messageType === "text") {
      if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
        return Response.json(
          { error: "A message is required for text shoutouts." },
          { status: 400 }
        );
      }
      textContent = sanitize(rawText).slice(0, 2000);
    }

    if (messageType === "photo" || messageType === "video") {
      // ── Check for pre-uploaded media URL (direct-to-Supabase flow) ──
      const rawMediaUrl = formData.get("media_url");
      if (rawMediaUrl && typeof rawMediaUrl === "string" && rawMediaUrl.trim().length > 0) {
        mediaUrl = rawMediaUrl.trim();
      } else {
        // ── Fallback: upload file through the serverless function ──
        const hasFile = mediaFile instanceof File && mediaFile.size > 0;

        if (!hasFile) {
          return Response.json(
            {
              error:
                messageType === "photo"
                  ? "A photo file is required."
                  : "A video file is required.",
            },
            { status: 400 }
          );
        }

        if (hasFile && mediaFile instanceof File) {
          // Validate MIME type
          if (messageType === "photo" && !ALLOWED_IMAGE_TYPES.includes(mediaFile.type)) {
            return Response.json(
              { error: "Only JPG, PNG, and WebP images are allowed." },
              { status: 400 }
            );
          }
          if (messageType === "video" && !ALLOWED_VIDEO_TYPES.includes(mediaFile.type)) {
            return Response.json(
              { error: "Only MP4, MOV, and WebM videos are allowed." },
              { status: 400 }
            );
          }

          // Generate unique filename
          const ext = mediaFile.name.split(".").pop() || "bin";
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

          const supabaseAdmin = createSupabaseAdminClient();

          const fileBuffer = Buffer.from(await mediaFile.arrayBuffer());

          const { error: uploadError } = await supabaseAdmin.storage
            .from("shoutouts-media")
            .upload(fileName, fileBuffer, {
              contentType: mediaFile.type,
              upsert: false,
            });

          if (uploadError) {
            return Response.json(
              { error: "Failed to upload file. Please try again." },
              { status: 500 }
            );
          }

          // Get public URL
          const { data: urlData } = supabaseAdmin.storage
            .from("shoutouts-media")
            .getPublicUrl(fileName);

          mediaUrl = urlData.publicUrl;
        }
      }
    }

    // ── Insert shoutout record ──
    const supabaseAdmin = createSupabaseAdminClient();

    // Handle optional profile picture — check for pre-uploaded URL first
    const rawProfileUrl = formData.get("profile_picture_url");
    let profilePictureUrl: string | null = null;

    if (rawProfileUrl && typeof rawProfileUrl === "string" && rawProfileUrl.trim().length > 0) {
      profilePictureUrl = rawProfileUrl.trim();
    } else {
      // Fallback: upload profile picture through the serverless function
      const profilePicFile = formData.get("profile_picture");

      if (profilePicFile instanceof File && profilePicFile.size > 0) {
        const ext = profilePicFile.name.split(".").pop() || "jpg";
        const pfpFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const pfpBuffer = Buffer.from(await profilePicFile.arrayBuffer());

        const { error: pfpError } = await supabaseAdmin.storage
          .from("profile-pictures")
          .upload(pfpFileName, pfpBuffer, {
            contentType: profilePicFile.type,
            upsert: false,
          });

        if (!pfpError) {
          const { data: pfpUrl } = supabaseAdmin.storage
            .from("profile-pictures")
            .getPublicUrl(pfpFileName);
          profilePictureUrl = pfpUrl.publicUrl;
        }
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from("shoutouts")
      .insert({
        sender_name: senderName,
        message_type: messageType,
        text_content: textContent,
        media_url: mediaUrl,
        profile_picture_url: profilePictureUrl,
      });

    if (insertError) {
      return Response.json(
        { error: "Failed to save shoutout. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Shoutout submitted!",
    });
  } catch (e) {
    console.error("shoutouts route DB error", e);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
