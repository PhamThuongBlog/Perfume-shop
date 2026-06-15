import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================
// AURA AI ADVISOR v3
// Primary: Gemini 2.0 Flash | Fallback: Local matching engine
// ============================================================

const GEMINI_MODEL = 'gemini-2.0-flash';
const API_KEY = process.env.GEMINI_API_KEY;

// ============================================================
// TOKENIZER
// ============================================================
function tokenize(text: string): string[] {
  const stopWords = ['toi','muon','mua','cho','nao','co','khong','voi','va','cua',
    'duoc','trong','nhung','nay','kia','do','la','tim','giup','minh','ban',
    'nuoc','hoa','gia','bao','nhieu','the','nao','cac','loai','dung'];
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-z0-9\s]/g,'')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.includes(w));
}

// ============================================================
// TYPES
// ============================================================
interface PV { volume: number; price: number; discountPercent: number; stock: number; }
interface PR { rating: number; text: string; name: string; }
interface Prod {
  id: string; name: string; brand: string; description: string; imageUrl: string | null;
  concentration: string | null; origin: string | null; gender: string | null;
  scentGroup: string | null; season: string[]; style: string[]; occasion: string[];
  topNotes: string[]; heartNotes: string[]; baseNotes: string[];
  longevity: string | null; sillage: string | null;
  accords: string[]; whenToWear: string[];
  variants: PV[]; reviews: PR[]; category: { name: string };
}

// ============================================================
// SCORE PRODUCT
// ============================================================
function scoreProduct(p: Prod, keywords: string[]): number {
  let s = 0;
  const txt = [p.name,p.brand,p.description||'',p.concentration||'',p.gender||'',
    p.scentGroup||'',...p.topNotes,...p.heartNotes,...p.baseNotes,
    ...p.season,...p.style,...p.occasion,...p.accords,
    ...p.whenToWear,p.origin||'',p.longevity||'',p.category?.name||'']
    .join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  for (const kw of keywords) {
    if (txt.includes(kw)) s += 10;
    for (const n of [...p.topNotes,...p.heartNotes,...p.baseNotes,...p.accords]) {
      const nn = n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
      if (nn.includes(kw) || kw.includes(nn)) s += 5;
    }
  }
  if (p.reviews.length > 0) s += p.reviews.reduce((a,r)=>a+r.rating,0)/p.reviews.length * 2;
  if (p.variants.some(v=>v.stock>0)) s += 3;
  return s + 1;
}

// ============================================================
// FORMAT PRODUCT CARD
// ============================================================
function card(p: Prod, idx: number): string {
  const v = p.variants[0];
  const price = v ? (v.discountPercent>0?Math.round(v.price*(1-v.discountPercent/100)):v.price) : 0;
  const stock = p.variants.reduce((a,v)=>a+v.stock,0);
  const avg = p.reviews.length>0 ? (p.reviews.reduce((a,r)=>a+r.rating,0)/p.reviews.length).toFixed(1) : null;
  const g = p.gender==='Nam'?'Nam':p.gender==='Nu'?'Nu':'Unisex';
  const notes = [...new Set([...p.topNotes,...p.heartNotes,...p.baseNotes])].slice(0,5).join(', ');
  const lines = [
    `[${idx}] ${p.name} (${p.brand}) - ${g}`,
    `  Gia: ${price.toLocaleString('vi-VN')}d | ${v?.volume||'?'}ml | ${p.concentration||'N/A'}`,
    `  Kho: ${stock} chai | ${p.longevity||'?'} luu huong`,
    `  Notes: ${notes||'Dang cap nhat'}`,
    `  ${avg?avg+'/5 ('+p.reviews.length+' danh gia)':'Chua co danh gia'}`,
    `  ${(p.description||'').slice(0,120)}`,
  ];
  if (p.reviews.length>0) lines.push(`  Review: "${p.reviews[0].text.slice(0,80)}" - ${p.reviews[0].name}`);
  return lines.join('\n');
}

// ============================================================
// SMART RESPONSE ENGINE
// ============================================================
function respond(query: string, products: Prod[]): string {
  const q = query.toLowerCase();

  // --- GREETING ---
  const isGreeting = /^(chao|hello|hi|hey|alo|ee|ei)[\s!.,]*$/i.test(query.trim()) && query.length < 25;
  const isQuickGreet = query.length < 40 && /\b(chao|hello|hi)\b/i.test(q) &&
    !/\b(tu van|nuoc hoa|tim|mua|loai|mui|gia|tien)\b/i.test(q);

  if (isGreeting || isQuickGreet) {
    return `Chao ban! Minh la Aura AI, tro ly tu van nuoc hoa cua AURA Signature ${String.fromCodePoint(0x1F60A)}

Cua hang minh co ${products.length} dong nuoc hoa cho Nam, Nu va Unisex.

Ban muon tim nuoc hoa cho dip nao? Goi y ne:
${String.fromCodePoint(0x1F338)} Nuoc hoa nu tinh, quyen ru
${String.fromCodePoint(0x1F4AA)} Nuoc hoa nam manh me, lich lam
${String.fromCodePoint(0x2600)} Nuoc hoa mua he tuoi mat
${String.fromCodePoint(0x1F381)} Nuoc hoa lam qua tang
${String.fromCodePoint(0x1F4BC)} Nuoc hoa di lam cong so`;
  }

  // --- OFFLINE / NON-PERFUME ---
  const isOffTopic = q.length > 20 &&
    !/\b(nuoc hoa|mui|huong|thom|xin|tu van|perfume|fragrance|scent|edp|edt|parfum|ban chai|goi y|recommend)\b/i.test(q) &&
    !/\b(nam|nu|unisex|dip|tiec|lam viec|cong so|qua|tang|sinh nhat|mua he|mua dong|xuan|thu|gia)\b/i.test(q);

  if (isOffTopic) {
    return `Minh chuyen tu van nuoc hoa ban nhe ${String.fromCodePoint(0x1F33F)} Ban muon tim nuoc hoa cho dip nao? Minh san sang giup ban kham pha ${products.length} dong nuoc hoa cua AURA Signature!`;
  }

  const keywords = tokenize(query);

  // --- INTENTS ---
  const wantMale = /\bnam\b|cho nam|dan ong|con trai|phai manh|cho chong|cho ban trai|cho anh\b|cho em trai|cho bo|cho ba/i.test(q);
  const wantFemale = /\bnu\b|cho nu|phu nu|con gai|phai dep|cho vo|cho ban gai|cho chi\b|cho em gai|cho me|cho co|cho ba/i.test(q);
  const wantUnisex = /unisex|ca nam va nu|cho ca hai|phi gioi tinh/i.test(q);
  const wantSummer = /\b(he|nong|ha|summer)\b|tuoi mat|mat me|mat lanh/i.test(q);
  const wantWinter = /\b(dong|lanh|winter)\b|am ap|giu am/i.test(q);
  const wantSpring = /\b(xuan)\b/i.test(q);
  const wantAutumn = /\b(thu)\b/i.test(q);
  const wantOffice = /di lam|cong so|van phong|lich su|lich lam|chuyen nghiep/i.test(q);
  const wantParty = /tiec|da tiec|party|hen ho|buoi toi|quyen ru|sang trong|dem/i.test(q);
  const wantDaily = /hang ngay|hang ngay|thuong ngay|moi ngay|di choi|dao pho/i.test(q);
  const wantSport = /the thao|nang dong|gym|chay bo/i.test(q);
  const wantWoody = /go|woody|oud|tram|tuyet tung|sandalwood|dan huong|hoac huong/i.test(q);
  const wantFresh = /tuoi|mat|chanh|cam|citrus|bergamot|bien|ocean|aqua|bac ha/i.test(q);
  const wantFloral = /hoa|hong|nhai|lavender|oai huong|floral|mau don/i.test(q);
  const wantSweet = /ngot|vani|vanilla|caramel|keo|ho phach/i.test(q);
  const wantSpicy = /cay|tieu|gung|que|spicy/i.test(q);
  const wantLeather = /da thuoc|leather|thuoc la|khoi/i.test(q);
  const wantCheap = /re|duoi 1 trieu|duoi 2 trieu|gia thap|sinh vien|hoc sinh/i.test(q);
  const wantMid = /tam 2|tam 3|khoang 2|khoang 3|2 trieu|3 trieu|trung binh/i.test(q);
  const wantLuxury = /cao cap|sang|dat|hang hieu|tren 3 trieu|tren 4 trieu|5 trieu/i.test(q);
  const isGift = /qua|tang|bieu|set qua|hop qua|sinh nhat|ky niem/i.test(q);
  const wantLong = /lau|ben|luu|luu huong|giu mui|8 tieng|12 tieng|bam/i.test(q);

  // Score + intent boosts
  let scored = products.map(p => ({ p, s: scoreProduct(p, keywords) }));
  for (const x of scored) {
    const ns = [...(x.p.topNotes||[]),...(x.p.heartNotes||[]),...(x.p.baseNotes||[])].join(' ').toLowerCase();
    const ss = (x.p.season||[]).join(' ').toLowerCase();
    const sts = (x.p.style||[]).join(' ').toLowerCase();
    const ds = (x.p.description||'').toLowerCase();
    const g = x.p.gender;

    if (wantMale && g==='Nam') x.s += 90;
    if (wantFemale && g==='Nu') x.s += 90;
    if (wantUnisex && g==='Unisex') x.s += 90;
    if (/(ban gai|vo|cho chi|cho me|cho co)/i.test(q) && g==='Nu') x.s += 110;
    if (/(ban trai|chong|cho anh|cho bo)/i.test(q) && g==='Nam') x.s += 110;

    if (wantSummer && /\b(he|ha)\b/i.test(ss)) x.s += 70;
    if (wantWinter && /\b(dong)\b/i.test(ss)) x.s += 70;
    if (wantSpring && /\b(xuan)\b/i.test(ss)) x.s += 70;
    if (wantAutumn && /\b(thu)\b/i.test(ss)) x.s += 70;

    if (wantOffice && /(lich lam|lich su|thanh lich|cong so)/i.test(sts+ds)) x.s += 60;
    if (wantParty && /(quyen ru|sang trong|bi an|tiec|dem)/i.test(sts+ds)) x.s += 60;
    if (wantDaily && /(hang ngay|tu nhien|nhe nhang)/i.test(sts+ds)) x.s += 60;
    if (wantSport && /(nang dong|the thao|tu do)/i.test(sts+ds)) x.s += 60;

    if (wantWoody && /(go|tuyet tung|tram|oud|dan huong|hoac huong)/i.test(ns)) x.s += 50;
    if (wantFresh && /(chanh|cam|citrus|bergamot|bien|ocean|aqua|bac ha|tuoi)/i.test(ns)) x.s += 50;
    if (wantFloral && /(hoa|hong|nhai|lavender|oai huong|mau don)/i.test(ns)) x.s += 50;
    if (wantSweet && /(vani|vanilla|ngot|caramel|ho phach)/i.test(ns)) x.s += 50;
    if (wantSpicy && /(tieu|gung|que|cay)/i.test(ns)) x.s += 50;
    if (wantLeather && /(da thuoc|leather|thuoc)/i.test(ns)) x.s += 50;

    const mp = x.p.variants[0]?.price||0;
    if (wantCheap && mp<2000000) x.s += 35;
    else if (wantCheap && mp>=2000000) x.s -= 25;
    if (wantLuxury && mp>=3000000) x.s += 35;
    if (wantMid && mp>=1500000 && mp<=3500000) x.s += 25;

    if (isGift) {
      if (x.p.variants.length>1) x.s += 30;
      if (/(sang trong|cao cap|quyen ru|tinh te)/i.test(sts+ds)) x.s += 25;
      if (x.p.reviews.length>0 && x.p.reviews.reduce((a,r)=>a+r.rating,0)/x.p.reviews.length>=4) x.s += 20;
    }
    if (wantLong) {
      if (x.p.concentration==='Parfum') x.s += 35;
      if (x.p.concentration==='EDP') x.s += 25;
      if ((x.p.longevity||'').includes('8')||(x.p.longevity||'').includes('12')) x.s += 30;
    }
    if (x.p.reviews.length>0) x.s += x.p.reviews.reduce((a,r)=>a+r.rating,0)/x.p.reviews.length*3;
    if (x.p.variants.some(v=>v.stock>5)) x.s += 2;
  }

  scored.sort((a,b)=>b.s-a.s);
  const top = scored.slice(0,5).filter(x=>x.s>0);
  if (!top.length) {
    return `Minh chua tim thay sp phu hop ${String.fromCodePoint(0x1F615)} AURA co ${products.length} sp. Ban mo ta them nhe: thich mui gi? Cho nam hay nu? Dip nao? Ngan sach bao nhieu?`;
  }

  // Build response
  const conf = top[0].s;
  let r = conf>60
    ? `Dua tren ${products.length} sp tai AURA, day la goi y tot nhat:\n\n`
    : conf>25
    ? `Minh da loc va tim thay:\n\n`
    : `Yeu cau kha dac biet! Day la sp gan nhat:\n\n`;

  r += top.slice(0,4).map(x=>card(x.p,scored.indexOf(x)+1)).join('\n\n');
  const best = top[0].p;
  const bp = best.variants[0]?.price||0;
  r += `\n\n${String.fromCodePoint(0x2728)} Noi bat: **${best.name}** - ${(best.description||'').slice(0,80)} - gia ${bp.toLocaleString('vi-VN')}d.`;
  if (top.length>4) r += `\n\nCon ${top.length-4} sp khac. Loc them tieu chi nao khong?`;
  return r;
}

// ============================================================
// BUILD PRODUCT CATALOG FOR AI
// ============================================================
function catalog(products: Prod[]): string {
  if (!products.length) return '(kho dang cap nhat)';
  let c = `TONG: ${products.length} san pham\n\n`;
  const byGender: Record<string,Prod[]> = {};
  for (const p of products) { const g = p.gender||'Khac'; if(!byGender[g]) byGender[g]=[]; byGender[g].push(p); }
  for (const [g,prods] of Object.entries(byGender)) {
    const gl = g==='Nam'?'NAM':g==='Nu'?'NU':'UNISEX';
    c += `== ${gl} (${prods.length}sp) ==\n`;
    for (const p of prods) {
      const v = p.variants[0];
      const price = v?(v.discountPercent>0?Math.round(v.price*(1-v.discountPercent/100)):v.price):0;
      const notes = [...p.topNotes,...p.heartNotes,...p.baseNotes].join(', ');
      const avg = p.reviews.length>0?(p.reviews.reduce((a,r)=>a+r.rating,0)/p.reviews.length).toFixed(1):'?';
      c += `- ${p.name} (${p.brand}): ${price.toLocaleString('vi-VN')}d | ${v?.volume||'?'}ml | ${p.concentration||'?'}`;
      c += ` | Notes: ${notes.slice(0,150)} | Style: ${p.style.join(',')} | Season: ${p.season.join(',')}`;
      c += ` | Rating: ${avg}/5 | Stock: ${p.variants.reduce((a,v)=>a+v.stock,0)}`;
      c += ` | ${(p.description||'').slice(0,100)}\n`;
    }
    c += '\n';
  }
  return c;
}

// ============================================================
// CALL GEMINI
// ============================================================
async function gemini(msgs: {role:string;text:string}[], sysPrompt:string): Promise<string> {
  if (!API_KEY) throw new Error('NO_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const payload = {
    contents: msgs.map(m=>({role:m.role==='model'?'model':'user',parts:[{text:m.text}]})),
    systemInstruction: { parts: [{ text: sysPrompt }] },
    generationConfig: { temperature: 0.7, maxOutputTokens: 512, topP: 0.9 }
  };
  const res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response');
  return text;
}

// ============================================================
// MAIN POST
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, isWelcome } = await req.json();
    if (isWelcome) {
      if (sessionId && messages?.[0]) {
        try { await prisma.message.create({data:{chatSessionId:sessionId,role:'model',text:messages[0].text}}); } catch {}
      }
      return NextResponse.json({ text: messages[0].text });
    }

    // Load products
    const products = await prisma.product.findMany({
      include: { variants: {orderBy:{price:'asc'}}, reviews: {orderBy:{createdAt:'desc'},take:5}, category: {select:{name:true}} },
      orderBy: { sortOrder: 'asc' }
    });

    // Save user msg
    const userMsg = messages?.[messages.length-1];
    if (sessionId && userMsg?.role==='user') {
      try { await prisma.message.create({data:{chatSessionId:sessionId,role:'user',text:userMsg.text}}); } catch {}
    }

    const query = userMsg?.text || '';
    const cat = catalog(products as Prod[]);

    let aiText: string;

    // Try Gemini first, fallback to local engine
    try {
      const sysPrompt = `Ban la Aura AI, tro ly tu van nuoc hoa cua cua hang AURA Signature. CHI su dung san pham trong catalog duoi day de tu van.

${cat}

NGUYEN TAC:
1. CHI goi y san pham CO THAT trong catalog tren
2. Neu gioi thieu san pham: neu ten, gia, dung tich, notes chinh
3. Neu san pham co danh gia >=4 sao, nhan manh dieu do
4. Neu co discount, de cap de kich thich mua
5. Tra loi ngan gon, tu nhien, 2-3 cau
6. Xung "minh", goi khach la "ban"
7. KHONG bay ra san pham khong co trong catalog
8. Neu khong co san pham phu hop, goi y sp gan nhat`;

      aiText = await gemini(messages, sysPrompt);
    } catch {
      // Local fallback
      aiText = respond(query, products as Prod[]);
    }

    // Save AI response
    if (sessionId) {
      try { await prisma.message.create({data:{chatSessionId:sessionId,role:'model',text:aiText}}); } catch {}
    }

    return NextResponse.json({ text: aiText });
  } catch (e: any) {
    return NextResponse.json({ text: 'He thong dang ban, ban thu lai sau nhe! Neu can gap, ghe cua hang AURA Signature hoac nhan tin qua Facebook nhe.' });
  }
}
