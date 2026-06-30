import { NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_BUCKETS = ["shoutouts-media", "profile-pictures"] as const;

type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, bucket } = body as {
      fileName?: string;
      fileType?: string;
      bucket?: string;
    };

    // ── Validate inputs ──
    if (!fileName || typeof fileName !== "string") {
      return Response.json(
        { error: "fileName is required." },
        { status: 400 }
      );
    }

    if (!fileType || typeof fileType !== "string") {
      return Response.json(
        { error: "fileType is required." },
        { status: 400 }
      );
    }

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
      return Response.json(
        { error: "Invalid storage bucket." },
        { status: 400 }
      );
    }

    // ── Validate MIME type based on bucket ──
    if (bucket === "profile-pictures") {
      if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
        return Response.json(
          { error: "Only JPG, PNG, and WebP images are allowed for profile pictures." },
          { status: 400 }
        );
      }
    } else if (bucket === "shoutouts-media") {
      const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
      if (!allAllowed.includes(fileType)) {
        return Response.json(
          { error: "Unsupported file type. Allowed: JPG, PNG, WebP, MP4, MOV, WebM." },
          { status: 400 }
        );
      }
    }

    // ── Generate unique path ──
    const ext = fileName.split(".").pop() || "bin";
    const uniquePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // ── Create signed upload URL ──
    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(uniquePath);

    if (error || !data) {
      console.error("Failed to create signed upload URL:", error);
      return Response.json(
        { error: "Could not prepare upload. Please try again." },
        { status: 500 }
      );
    }

    // ── Build the public URL for this path ──
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uniquePath);

    return Response.json({
      signedUrl: data.signedUrl,
      path: uniquePath,
      token: data.token,
      publicUrl: urlData.publicUrl,
    });
  } catch (e) {
    console.error("upload-url route error:", e);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
