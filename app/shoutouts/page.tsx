import type { Metadata } from "next";
import GalaxyShoutoutsSection from "@/components/sections/galaxy-shoutouts-section";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shoutouts — Naza's Special Day",
  description: "Love from everyone who adores Naza",
};

export default async function ShoutoutsPage() {
  let visible = true;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "shoutouts_visible")
      .single();
    if (data) {
      visible = data.value === "true";
    }
  } catch (e) {
    console.error("Error fetching visibility setting:", e);
  }

  return (
    <main>
      <GalaxyShoutoutsSection visible={visible} />
    </main>
  );
}
