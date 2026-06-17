import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(
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

    const { pin_type } = await request.json();

    if (pin_type !== null && pin_type !== "captured_in_time" && pin_type !== "featured") {
      return NextResponse.json({ error: "Invalid pin type" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    if (pin_type === "captured_in_time") {
      // Check existing captured_in_time items count
      const { data, error: countError } = await supabaseAdmin
        .from("gallery_items")
        .select("id")
        .eq("pin_type", "captured_in_time");

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      const existingCount = data?.length || 0;
      const alreadyHasThisItem = data?.some((item) => item.id === id);

      if (existingCount >= 4 && !alreadyHasThisItem) {
        return NextResponse.json(
          { error: "Maximum 4 Captured in Time pins reached" },
          { status: 400 }
        );
      }
    }

    // Update gallery_items set pin_type = $pin_type where id = $id
    const { error: updateError } = await supabaseAdmin
      .from("gallery_items")
      .update({ pin_type })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery pin toggle error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
