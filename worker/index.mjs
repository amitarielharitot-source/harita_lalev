const SCHEMA = `CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL,
  email TEXT NOT NULL, gift_type TEXT NOT NULL, quantity INTEGER NOT NULL,
  engraving TEXT NOT NULL, desired_date TEXT NOT NULL
)`;

function validInquiry(input) {
  if (!input || typeof input !== 'object' || input.website) return false;
  const {id, name, email, type, quantity, engraving, date} = input;
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)
    && typeof name === 'string' && name.trim().length > 0 && name.length <= 80
    && typeof email === 'string' && email.length <= 180 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && ['מתנה אישית', 'לעסק או לאירוע', 'מזכרת לסדנה', 'מתנה לצוות', 'מזכרת עץ קטנה'].includes(type)
    && typeof quantity === 'string' && /^\d{1,4}$/.test(quantity) && +quantity >= 1 && +quantity <= 5000
    && typeof engraving === 'string' && engraving.trim().length > 0 && engraving.length <= 28
    && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && Number.isFinite(Date.parse(date));
}

async function acceptInquiry(request, database) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return Response.json({ok:false}, {status:403});
  }
  const body = await request.text();
  if (body.length > 4096) return Response.json({ok:false}, {status:413});
  let input;
  try { input = JSON.parse(body); } catch { return Response.json({ok:false}, {status:400}); }
  if (!validInquiry(input)) return Response.json({ok:false}, {status:400});
  try {
    await database.prepare(SCHEMA).run();
    await database.prepare(`INSERT INTO inquiries
      (id,created_at,name,email,gift_type,quantity,engraving,desired_date)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`)
      .bind(input.id, new Date().toISOString(), input.name.trim(), input.email.trim(),
        input.type, Number(input.quantity), input.engraving.trim(), input.date).run();
    return Response.json({ok:true}, {status:201, headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    console.error('Inquiry storage failed', error.message);
    return Response.json({ok:false}, {status:503});
  }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/inquiries' && request.method === 'POST') return acceptInquiry(request, env.DB);
    if (path === '/' && request.method === 'GET') {
      const phone = env.WHATSAPP_PHONE || "972543534225";
      const contact = typeof phone === 'string' && /^972\d{8,9}$/.test(phone)
        ? '<a href="https://wa.me/' + phone + '?text='
          + encodeURIComponent('היי חריטה ללב, אשמח לשמוע על חריטה אישית.')
          + '" target="_blank" rel="noopener">שליחת WhatsApp</a>'
        : '';
      return new Response(PAGE.replace('<!-- whatsapp-link -->', contact), {headers:{'Content-Type':'text/html; charset=utf-8'}});
    }
    const asset = MEDIA[path];
    if (asset && ['GET', 'HEAD'].includes(request.method)) {
      return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(asset.data), c => c.charCodeAt(0)), {
        headers:{'Content-Type':asset.type,'Content-Length':String(asset.size),'Cache-Control':'public, max-age=86400'}
      });
    }
    return new Response('Not found', {status:404});
  }
};
