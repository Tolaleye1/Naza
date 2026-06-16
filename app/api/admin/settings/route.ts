import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "shoutouts_visible")
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is code for no rows returned
      console.error("Error reading settings from database:", error);
    }

    const visible = data ? data.value === "true" : true;
    return NextResponse.json({ visible });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ visible: true });
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

    const { visible } = await request.json();
    const supabaseAdmin = createSupabaseAdminClient();

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "shoutouts_visible", value: String(visible) });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST settings error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
