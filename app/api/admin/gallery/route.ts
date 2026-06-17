import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Generate unique filename inside gallery/ directory of the bucket
    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const storagePath = `gallery/${timestamp}-${random}.${ext}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const supabaseAdmin = createSupabaseAdminClient();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("gallery")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("gallery")
      .getPublicUrl(storagePath);

    // Determine media type
    const lowerName = file.name.toLowerCase();
    const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];
    let mediaType: "photo" | "video" = "photo";
    if (VIDEO_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
      mediaType = "video";
    }

    // Derive caption
    const caption = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // Insert into gallery_items
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from("gallery_items")
      .insert({
        storage_path: storagePath,
        url: urlData.publicUrl,
        media_type: mediaType,
        caption: caption,
        pin_type: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Gallery db insert error:", insertError.message);
      // Rollback uploaded file from storage
      await supabaseAdmin.storage.from("gallery").remove([storagePath]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      name: storagePath.split("/").pop(),
      id: insertedData.id,
    });
  } catch (error) {
    console.error("Gallery upload error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
