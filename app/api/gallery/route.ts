import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { GalleryItem } from "@/types/gallery.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = createSupabaseAdminClient();

    const all = searchParams.get("all");
    if (all === "true") {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("All gallery items fetch error:", error.message);
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    if (context === "homepage") {
      // Fetch only pin_type = 'captured_in_time' items, limit 4
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .eq("pin_type", "captured_in_time")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Homepage gallery fetch error:", error.message);
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // Fetch unpinned items with pagination
    const offset = (page - 1) * limit;

    // Fetch pinned items (captured_in_time first, then featured) on page 1
    let pinned: GalleryItem[] = [];
    if (page === 1) {
      const [capturedResult, featuredResult] = await Promise.all([
        supabase
          .from("gallery_items")
          .select("*")
          .eq("pin_type", "captured_in_time")
          .order("created_at", { ascending: false }),
        supabase
          .from("gallery_items")
          .select("*")
          .eq("pin_type", "featured")
          .order("created_at", { ascending: false })
      ]);

      if (capturedResult.error) {
        console.error("Captured pins fetch error:", capturedResult.error.message);
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
      }
      if (featuredResult.error) {
        console.error("Featured pins fetch error:", featuredResult.error.message);
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
      }

      pinned = [...(capturedResult.data || []), ...(featuredResult.data || [])];
    }

    // Fetch unpinned (pin_type = null) items with offset and limit + 1
    const { data: unpinnedData, error: unpinnedError } = await supabase
      .from("gallery_items")
      .select("*")
      .is("pin_type", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (unpinnedError) {
      console.error("Unpinned items fetch error:", unpinnedError.message);
      return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }

    const hasMore = (unpinnedData || []).length > limit;
    const unpinned = hasMore ? (unpinnedData || []).slice(0, limit) : (unpinnedData || []);

    return NextResponse.json({
      pinned,
      unpinned,
      hasMore
    });
  } catch (err) {
    console.error("Gallery API unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
