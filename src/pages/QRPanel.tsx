import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Guest } from '../types';
import { encodeGuestName } from '../utils/guestCode';

function isKhmer(text: string) {
  return /[\u1780-\u17FF]/.test(text || '');
}

async function renderCardImage(name: string, code: string, url: string, width = 800, height = 1200) {
  // ensure fonts are loaded so exported PNGs render correctly
  if ((document as any).fonts && (document as any).fonts.ready) {
    try { await (document as any).fonts.ready; } catch { /* ignore */ }
  }

  // create canvas and draw landing-like card (background image + overlays + top asset + headings)
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // fill background with theme dark red (replace Cover.png)
  ctx.fillStyle = '#800020';
  ctx.fillRect(0, 0, width, height);

  // subtle overlay to add depth
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, 'rgba(0,0,0,0.35)');
  g.addColorStop(0.6, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // no ornate frame: keep background clean and use subtle overlays

  // draw top asset (abbreviationname)
    let assetY = 0;
    let assetH = 0;
    const assetImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = '/image/Asset/abbreviationname.png';
    }).catch(() => null as any);
    if (assetImg) {
      // make the abbreviation asset substantially larger (user requested increase)
      const maxW = Math.floor(width * 0.45);
      const w = Math.min(maxW, assetImg.width || maxW);
      assetH = Math.floor((w / (assetImg.width || w)) * (assetImg.height || (w * 0.6)));
      assetY = 40; // reduce top padding so asset sits higher but larger
      ctx.drawImage(assetImg, Math.floor((width - w) / 2), assetY, w, assetH);
    }

  // headings: h3 (Khmer) and h5
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#d4af37';
  const h3Size = Math.floor(Math.max(22, Math.min(48, width * 0.04)));
  ctx.font = `${h3Size}px Moulpali, sans-serif`;
    const headerPadding = Math.floor(width * 0.02);
    const headerY = assetY + assetH + headerPadding;
    ctx.fillText('លិខិតអញ្ជើញ', width / 2, headerY);

  const h5Size = Math.floor(Math.max(12, Math.min(20, width * 0.02)));
  ctx.font = `${h5Size}px Koulen, sans-serif`;
  ctx.fillStyle = '#f3e7d6';
    const subheaderY = headerY + h3Size + Math.floor(headerPadding / 2);
    ctx.fillText('SCAN TO OPEN', width / 2, subheaderY);

  // draw QR center area (slightly smaller to allow larger asset and name)
  const qrSize = Math.floor(width * 0.42);
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 0, width: qrSize });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = qrDataUrl;
  });

  const qrX = Math.floor((width - qrSize) / 2);
  const qrY = subheaderY + h5Size + Math.floor(width * 0.03);
  ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

  // guest name below QR — scale font to fit, ellipsize only if needed
  const nameY = qrY + qrSize + Math.floor(height * 0.035);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxWidth = Math.floor(width * 0.94);
  // increase max font size so names are larger by default
  let fontSize = Math.floor(Math.max(22, Math.min(72, width * 0.08)));
  const minFont = isKhmer(name) ? 20 : 18;
  ctx.font = `${fontSize}px ${isKhmer(name) ? 'Moulpali' : 'Koulen'}, sans-serif`;

  // reduce font size until the full name fits or reach minimum
  while (ctx.measureText(name).width > maxWidth && fontSize > minFont) {
    fontSize -= 2;
    ctx.font = `${fontSize}px ${isKhmer(name) ? 'Moulpali' : 'Koulen'}, sans-serif`;
  }

  // fallback: ellipsize if still too long
  let displayName = name;
  if (ctx.measureText(displayName).width > maxWidth) {
    while (ctx.measureText(displayName + '...').width > maxWidth && displayName.length > 3) {
      displayName = displayName.slice(0, -1);
    }
    displayName = displayName + '...';
  }

  // draw name placeholder behind the name (subtle)
  const namePlaceholder = await new Promise<HTMLImageElement>((resolve) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null as any);
    i.src = '/image/Asset/name_placeholder.png';
  }).catch(() => null as any);
  if (namePlaceholder) {
    const nw = Math.min(540, Math.floor(width * 0.6));
    const nh = Math.floor((nw / (namePlaceholder.width || nw)) * (namePlaceholder.height || 40));
    ctx.globalAlpha = 0.55;
    ctx.drawImage(namePlaceholder, Math.floor((width - nw) / 2), nameY - nh / 2 - 8, nw, nh);
    ctx.globalAlpha = 1;
  }

  ctx.fillText(displayName, width / 2, nameY);

  // small code text
  ctx.font = `16px sans-serif`;
  ctx.fillStyle = '#dcdcdc';
  ctx.fillText(code, width / 2, nameY + 40);

  return canvas.toDataURL('image/png');
}

export default function QRPanel(): JSX.Element {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('preview')) {
          const payload = sessionStorage.getItem('qrPreview');
          if (payload) {
            const parsed = JSON.parse(payload);
            if (!cancelled) return setGuests(parsed);
          }
        }
        const res = await fetch('/api/guests');
        if (!res.ok) throw new Error('Failed to load guests');
        const data = await res.json();
        if (!cancelled) setGuests(data);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggle = (i: number) => setSelected(s => ({ ...s, [i]: !s[i] }));

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const generateAndDownload = async (indices: number[]) => {
    if (indices.length === 0) return alert('No guests selected');
    setLoading(true);
    try {
      for (let j = 0; j < indices.length; j++) {
        const i = indices[j];
        const row = guests[i];
        const name = (row as any).Name || (row as any).name || Object.values(row)[0] || `guest${i}`;
        const code = encodeGuestName(String(name));
        const url = `${window.location.origin}/u/${code}`;
        const dataUrl = await renderCardImage(String(name), code, url);
        let safeName = String(name).replace(/[\/\\\?\%\*\:\|"<>\x00-\x1F]/g, '').trim().slice(0, 40);
        const prefix = String(j + 1).padStart(2, '0');
        if (!safeName) safeName = `guest ${prefix}`;
        downloadDataUrl(dataUrl, `${prefix}.${safeName} - ${code}.png`);
        // small delay so browser can handle multiple downloads
        await new Promise(r => setTimeout(r, 200));
      }
    } finally {
      setLoading(false);
    }
  };

  // when preview mode is used (Admin saved preview and navigated to /qr?preview=1), auto-start downloads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') && guests.length > 0 && !autoStarted) {
      setAutoStarted(true);
      // generate for all preview guests automatically after small delay
      setTimeout(() => {
        generateAndDownload(guests.map((_, i) => i));
      }, 500);
    }
  }, [guests, autoStarted]);

  const generateSelected = () => {
    const indices = Object.keys(selected).filter(k => selected[Number(k)]).map(k => Number(k));
    generateAndDownload(indices);
  };

  const generateAll = () => generateAndDownload(guests.map((_,i) => i));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">QR Panel</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => { const all: Record<number, boolean> = {}; guests.forEach((_,i)=> all[i]=true); setSelected(all); }} className="px-3 py-1 bg-wedding-gold/20 rounded">Select all</button>
          <button onClick={() => setSelected({})} className="px-3 py-1 bg-wedding-gold/10 rounded">Clear</button>
        </div>
        <div className="flex gap-2">
          <button onClick={generateSelected} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">Download selected</button>
          <button onClick={generateAll} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded">Download all</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {guests.map((g, i) => {
          const name = (g as any).Name || (g as any).name || Object.values(g)[0] || '';
          const code = encodeGuestName(String(name));
          const url = `${window.location.origin}/u/${code}`;
          return (
            <div key={i} className="bg-white rounded shadow p-4 flex gap-3 items-center">
              <input type="checkbox" checked={!!selected[i]} onChange={() => toggle(i)} />
              <div className="flex-1">
                <div className="font-semibold truncate">{String(name)}</div>
                <div className="text-xs text-wedding-tan truncate">{url}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={async ()=>{
                  const dataUrl = await renderCardImage(String(name), code, url);
                  let safeName = String(name).replace(/[\/\\\?\%\*\:\|"<>\x00-\x1F]/g, '').trim().slice(0, 40);
                  const prefix = String(i + 1).padStart(2, '0');
                  if (!safeName) safeName = `guest ${prefix}`;
                  downloadDataUrl(dataUrl, `${prefix}.${safeName} - ${code}.png`);
                }} className="px-2 py-1 bg-wedding-gold/20 rounded">Download</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
