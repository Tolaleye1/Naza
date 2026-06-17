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
    
    if (!id) {
      return NextResponse.json({ error: "ID parameter is missing" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Fetch item by ID to get storage path
    const { data: item, error: fetchError } = await supabaseAdmin
      .from("gallery_items")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !item) {
      console.error("Gallery item not found in DB for deletion:", fetchError?.message);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const storagePath = item.storage_path;

    // 2. Delete from database first
    const { error: dbDeleteError } = await supabaseAdmin
      .from("gallery_items")
      .delete()
      .eq("id", id);

    if (dbDeleteError) {
      console.error("DB deletion failed:", dbDeleteError.message);
      return NextResponse.json({ error: dbDeleteError.message }, { status: 500 });
    }

    // 3. Delete from storage
    const { error: storageDeleteError } = await supabaseAdmin.storage
      .from("gallery")
      .remove([storagePath]);

    if (storageDeleteError) {
      console.warn("Storage deletion failed, but DB was updated:", storageDeleteError.message);
      // We still return success since the database entry is gone
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery file delete error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
