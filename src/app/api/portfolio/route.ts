import { NextResponse } from "next/server";
import { CASE_STUDIES } from "@/data/portfolioData";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzrnashgdonblrpuxqcd.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_cvpMCr0b6_QmnbtdUDvP8A_KOnwzfxc";
const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_API_URL || "https://crm.karyasaarthi.com";

export async function GET() {
  try {
    // 1. Try fetching from Supabase directly
    const res = await fetch(`${SUPABASE_URL}/rest/v1/Portfolio_Items?select=*&order=order_index.asc,created_at.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        return NextResponse.json({
          success: true,
          source: "supabase",
          count: items.length,
          data: items,
        });
      }
    }

    // 2. Fallback: try fetching from CRM API
    const crmRes = await fetch(`${CRM_API_URL}/api/portfolio`, {
      next: { revalidate: 60 },
    });
    if (crmRes.ok) {
      const crmJson = await crmRes.json();
      if (crmJson.success && Array.isArray(crmJson.data) && crmJson.data.length > 0) {
        return NextResponse.json({
          success: true,
          source: "crm",
          count: crmJson.data.length,
          data: crmJson.data,
        });
      }
    }
  } catch (error) {
    console.warn("[Portfolio Route] Live fetch notice, falling back to static:", error);
  }

  // 3. Graceful fallback: return initial static case studies formatted as portfolio items
  const fallbackItems = CASE_STUDIES.map((c, idx) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    image_url: `/projects/${c.id}.png`,
    description: c.challenge,
    tech_stack: c.techStack,
    live_link: c.liveLinks?.[0]?.url || null,
    order_index: idx + 1,
    is_featured: true,
    client_name: c.client,
    industry: c.industry,
    budget: c.budget,
  }));

  return NextResponse.json({
    success: true,
    source: "static_fallback",
    count: fallbackItems.length,
    data: fallbackItems,
  });
}
