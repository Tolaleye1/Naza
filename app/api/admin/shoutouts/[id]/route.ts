import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Get shoutout to retrieve URLs for media/profile-picture deletion
    const { data: shoutout, error: fetchError } = await supabaseAdmin
      .from("shoutouts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !shoutout) {
      return NextResponse.json({ error: "Shoutout not found" }, { status: 404 });
    }

    // 2. Delete file from shoutouts-media if exists
    if (shoutout.media_url) {
      const filename = shoutout.media_url.split("shoutouts-media/").pop();
      if (filename) {
        await supabaseAdmin.storage.from("shoutouts-media").remove([filename]);
      }
    }

    // 3. Delete file from profile-pictures if exists
    if (shoutout.profile_picture_url) {
      const filename = shoutout.profile_picture_url.split("profile-pictures/").pop();
      if (filename) {
        await supabaseAdmin.storage.from("profile-pictures").remove([filename]);
      }
    }

    // 4. Delete shoutout from database
    const { error: deleteError } = await supabaseAdmin
      .from("shoutouts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete shoutout error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
