import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json({ error: "Filename parameter is missing" }, { status: 400 });
    }

    const storagePath = `gallery/${filename}`;
    const supabaseAdmin = createSupabaseAdminClient();

    const { error: deleteError } = await supabaseAdmin.storage
      .from("gallery")
      .remove([storagePath]);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery file delete error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
