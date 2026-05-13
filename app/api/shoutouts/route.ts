import { NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { MessageType } from "@/types/shoutout.types";

const PAGE_SIZE = 20;

// Allowed MIME types for uploads
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/** Strip HTML tags from user-submitted text to prevent XSS */
function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

// requires: SUPABASE_SERVICE_ROLE_KEY
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const offset = (page - 1) * PAGE_SIZE;

    const supabaseAdmin = createSupabaseAdminClient();

    // Fetch total count of approved shoutouts
    const { count, error: countError } = await supabaseAdmin
      .from("shoutouts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    if (countError) {
      return Response.json({ error: countError.message }, { status: 500 });
    }

    const total = count ?? 0;

    // Fetch paginated approved shoutouts
    const { data, error } = await supabaseAdmin
      .from("shoutouts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const shoutouts = data ?? [];
    const hasMore = offset + shoutouts.length < total;

    return Response.json({ shoutouts, total, hasMore });
  } catch {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
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
    const rawYoutubeUrl = formData.get("youtube_url");

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
    let youtubeUrl: string | null = null;

    if (messageType === "text") {
      if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
        return Response.json(
          { error: "A message is required for text shoutouts." },
          { status: 400 }
        );
      }
      textContent = sanitize(rawText).slice(0, 500);
    }

    if (messageType === "photo" || messageType === "video") {
      const hasFile = mediaFile instanceof File && mediaFile.size > 0;
      const hasYoutubeUrl =
        messageType === "video" &&
        rawYoutubeUrl &&
        typeof rawYoutubeUrl === "string" &&
        rawYoutubeUrl.trim().length > 0;

      if (!hasFile && !hasYoutubeUrl) {
        return Response.json(
          {
            error:
              messageType === "photo"
                ? "A photo file is required."
                : "A video file or YouTube URL is required.",
          },
          { status: 400 }
        );
      }

      // ── Upload file to Supabase Storage ──
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

        // Validate file size
        if (messageType === "photo" && mediaFile.size > MAX_IMAGE_SIZE) {
          return Response.json(
            { error: "Photo must be under 5MB." },
            { status: 400 }
          );
        }
        if (messageType === "video" && mediaFile.size > MAX_VIDEO_SIZE) {
          return Response.json(
            { error: "Video must be under 50MB." },
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

      // ── YouTube URL ──
      if (hasYoutubeUrl && typeof rawYoutubeUrl === "string") {
        youtubeUrl = rawYoutubeUrl.trim();
      }
    }

    // ── Insert shoutout record ──
    const supabaseAdmin = createSupabaseAdminClient();

    const { error: insertError } = await supabaseAdmin
      .from("shoutouts")
      .insert({
        sender_name: senderName,
        message_type: messageType,
        text_content: textContent,
        media_url: mediaUrl,
        youtube_url: youtubeUrl,
        status: "pending",
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
  } catch {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
