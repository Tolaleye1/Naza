import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("homepage_gallery")
      .select("*")
      .order("slot", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Homepage gallery GET error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slot, filename } = await request.json();

    if (!slot || slot < 1 || slot > 4) {
      return NextResponse.json({ error: "Slot must be between 1 and 4" }, { status: 400 });
    }

    const ext = filename?.split(".").pop() || "jpg";
    const storagePath = `homepage/slot-${slot}-${Date.now()}.${ext}`;

    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from("gallery")
      .createSignedUploadUrl(storagePath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      storage_path: storagePath,
    });
  } catch (error) {
    console.error("Homepage gallery POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slot, storage_path } = await request.json();

    if (!slot || slot < 1 || slot > 4) {
      return NextResponse.json({ error: "Slot must be between 1 and 4" }, { status: 400 });
    }

    if (!storage_path) {
      return NextResponse.json({ error: "Storage path is required" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // Get public URL of the uploaded image
    const { data: urlData } = supabaseAdmin.storage
      .from("gallery")
      .getPublicUrl(storage_path);

    const publicUrl = urlData.publicUrl;

    // Upsert into homepage_gallery table
    const { error: upsertError } = await supabaseAdmin
      .from("homepage_gallery")
      .upsert({
        slot,
        url: publicUrl,
        storage_path,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Homepage gallery PUT error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get slot from URL query or request body
    const url = new URL(request.url);
    let slotStr = url.searchParams.get("slot");
    
    if (!slotStr) {
      try {
        const body = await request.json();
        slotStr = body.slot;
      } catch {}
    }

    const slot = parseInt(slotStr || "", 10);

    if (isNaN(slot) || slot < 1 || slot > 4) {
      return NextResponse.json({ error: "Invalid slot number" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Get the row to find the storage path
    const { data: row, error: fetchError } = await supabaseAdmin
      .from("homepage_gallery")
      .select("*")
      .eq("slot", slot)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Slot is already empty" }, { status: 404 });
    }

    // 2. Remove the file from storage
    if (row.storage_path) {
      await supabaseAdmin.storage.from("gallery").remove([row.storage_path]);
    }

    // 3. Delete row from table
    const { error: deleteError } = await supabaseAdmin
      .from("homepage_gallery")
      .delete()
      .eq("slot", slot);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Homepage gallery DELETE error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
