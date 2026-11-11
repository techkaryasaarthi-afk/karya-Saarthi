import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_API_URL || "https://crm.karyasaarthi.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzrnashgdonblrpuxqcd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_cvpMCr0b6_QmnbtdUDvP8A_KOnwzfxc";

const dataFilePath = path.join(process.cwd(), "src", "data", "appointments.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, budget, message, notes, meetingType, date, timeSlot } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: "Name and either Email or Phone are required." },
        { status: 400 }
      );
    }

    const payload = {
      name,
      email,
      phone,
      service: service || "Portfolio Consultation",
      budget: budget || "₹30,000 - ₹85,000",
      message: message || notes || "Inquiry from Portfolio website",
      meetingType: meetingType || "Consultation Call",
      date,
      timeSlot,
      source: "Portfolio Website",
    };

    let crmSynced = false;
    let leadId = "lead-pf-" + Date.now();

    // 1. Forward directly to CRM Controller API
    try {
      const crmRes = await fetch(`${CRM_API_URL}/api/portfolio/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (crmRes.ok) {
        const crmJson = await crmRes.json();
        crmSynced = true;
        if (crmJson.leadId) leadId = crmJson.leadId;
      }
    } catch (crmErr) {
      console.warn("[Portfolio Enquiry] CRM API direct sync notice:", crmErr);
    }

    // 2. Fallback: Direct Supabase Lead Insertion
    if (!crmSynced && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const personId = crypto.randomUUID();
        const clientEmail = (email ? email.trim().toLowerCase() : `portfolio.${Date.now()}@inbound.karyasaarthi.com`);

        // Check or create person
        await fetch(`${SUPABASE_URL}/rest/v1/Person`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            id: personId,
            fullName: name.trim(),
            email: clientEmail,
            phone: phone ? phone.trim() : null,
            type: "LEAD",
            firstTouchSource: "SITE_COM",
          }),
        });

        // Insert lead with Source = "Portfolio"
        const leadRes = await fetch(`${SUPABASE_URL}/rest/v1/Lead`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            personId,
            title: `${name.trim()} - ${service || "Portfolio Enquiry"}`,
            stage: "NEW",
            urgency: "HIGH",
            estimatedValue: 25000,
            serviceType: service || "Portfolio Website",
            sourceSurface: "SITE_COM",
            source: "Portfolio Website",
            notes: `[Portfolio Website] ${message || notes || ""}`.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });

        if (leadRes.ok) {
          crmSynced = true;
        }
      } catch (dbErr) {
        console.warn("[Portfolio Enquiry] Supabase direct fallback notice:", dbErr);
      }
    }

    // 3. Local JSON backup
    try {
      let appointments = [];
      if (fs.existsSync(dataFilePath)) {
        appointments = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      }
      appointments.unshift({
        id: "pf-" + Date.now(),
        ...payload,
        leadId,
        crmSynced,
        createdAt: new Date().toISOString(),
      });
      fs.writeFileSync(dataFilePath, JSON.stringify(appointments.slice(0, 100), null, 2), "utf8");
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been successfully routed to Karya Saarthi CRM. Our engineering team will reach out within 24 hours.",
      leadId,
      crmSynced,
    });
  } catch (err: any) {
    console.error("[Portfolio Enquiry] Server error:", err);
    return NextResponse.json({ success: false, error: "Server error processing enquiry." }, { status: 500 });
  }
}
