// Supabase Edge Function: send-booking-confirmation
// Διαβάζει το booking, στέλνει email επιβεβαίωσης μέσω Resend.
// Καλείται από το frontend με body: { booking_id: "uuid" }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAYS = ["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"];
const MONS = ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"];

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS[dt.getDay()]}, ${d} ${MONS[m - 1]} ${y}`;
}

function esc(s: string): string {
  return String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function renderEmail(booking: any, shop: any): { html: string; text: string } {
  const accent = shop?.theme_color || "#C8924A";
  const shopName = shop?.name || booking.shop_slug;
  const dateLong = formatDate(booking.date);
  const address = shop?.address ? `${shop.address}${shop.city ? ", " + shop.city : ""}` : "";
  const phone = shop?.phone || "";

  const html = `<!DOCTYPE html>
<html lang="el">
<head><meta charset="UTF-8"><title>Επιβεβαίωση Κράτησης</title></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <tr><td style="background:#1a1a1a;padding:32px 28px;text-align:center;">
          <div style="color:${accent};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Επιβεβαίωση Κράτησης</div>
          <div style="color:#fff;font-size:28px;font-weight:600;letter-spacing:0.02em;">${esc(shopName)}</div>
        </td></tr>
        <tr><td style="padding:32px 28px 8px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Γεια σου <strong>${esc(booking.customer_name)}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555;">Η κράτησή σου επιβεβαιώθηκε. Σε περιμένουμε!</p>
        </td></tr>
        <tr><td style="padding:0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f0;border-radius:8px;padding:20px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #ebe6dc;"><span style="display:inline-block;width:40%;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Υπηρεσία</span><span style="font-size:15px;font-weight:500;">${esc(booking.service_name)}</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #ebe6dc;"><span style="display:inline-block;width:40%;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Ημερομηνία</span><span style="font-size:15px;font-weight:500;">${dateLong}</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #ebe6dc;"><span style="display:inline-block;width:40%;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Ώρα</span><span style="font-size:15px;font-weight:500;">${booking.slot_time}</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #ebe6dc;"><span style="display:inline-block;width:40%;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Διάρκεια</span><span style="font-size:15px;font-weight:500;">${booking.duration_min} λεπτά</span></td></tr>
            <tr><td style="padding:8px 0;"><span style="display:inline-block;width:40%;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Κόστος</span><span style="font-size:17px;font-weight:600;color:${accent};">${booking.price_eur}€</span></td></tr>
          </table>
        </td></tr>
        ${address || phone ? `<tr><td style="padding:24px 28px 8px;"><div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Που θα μας βρεις</div>${address ? `<div style="font-size:14px;margin-bottom:4px;">${esc(address)}</div>` : ""}${phone ? `<div style="font-size:14px;color:#555;">Τηλ: <a href="tel:${esc(phone.replace(/\s/g,""))}" style="color:${accent};text-decoration:none;">${esc(phone)}</a></div>` : ""}</td></tr>` : ""}
        <tr><td style="padding:24px 28px 32px;">
          <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">Αν πρέπει να ακυρώσεις, επικοινώνησε μαζί μας τηλεφωνικά.</p>
        </td></tr>
        <tr><td style="background:#f9f6f0;padding:16px 28px;text-align:center;font-size:11px;color:#aaa;">
          © ${new Date().getFullYear()} ${esc(shopName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Επιβεβαίωση Κράτησης — ${shopName}

Γεια σου ${booking.customer_name},

Η κράτησή σου επιβεβαιώθηκε.

Υπηρεσία: ${booking.service_name}
Ημερομηνία: ${dateLong}
Ώρα: ${booking.slot_time}
Διάρκεια: ${booking.duration_min} λεπτά
Κόστος: ${booking.price_eur}€
${address ? `\nΔιεύθυνση: ${address}` : ""}${phone ? `\nΤηλέφωνο: ${phone}` : ""}

— ${shopName}`;

  return { html, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    // Accept either { booking: {...} } from frontend, or webhook-style { record: {...} }
    const booking = body.booking || body.record;

    if (!booking || !booking.shop_slug || !booking.email) {
      return new Response(JSON.stringify({ ok: true, skipped: "no booking or no email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: shop } = await supa
      .from("shops")
      .select("*")
      .eq("slug", booking.shop_slug)
      .single();

    const { html, text } = renderEmail(booking, shop);
    const from = shop?.email_from || "onboarding@resend.dev";
    const shopName = shop?.name || booking.shop_slug;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${shopName} <${from}>`,
        to: [booking.email],
        subject: `Επιβεβαίωση κράτησης — ${shopName}`,
        html,
        text,
      }),
    });

    const result = await resp.json();
    if (!resp.ok) {
      console.error("Resend error", result);
      return new Response(
        JSON.stringify({ error: "send failed", detail: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, email_id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
