import React, { useState } from 'react';
import { Share2, Copy } from 'lucide-react';
import type { Guest } from '../types';
import { encodeGuestName } from '../utils/guestCode';
import QRCode from 'qrcode';

interface Props {
  guests: Guest[];
  onSelect?: (guest: Guest) => void;
}

const getName = (g: Guest) => (g as any).Name || (g as any).name || String(Object.values(g)[0] || '');

export default function AdminGuestList({ guests, onSelect }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied link');
    } catch {
      alert('Copy failed');
    }
  };

  const toggleSelect = (idx: number) => setSelected(s => ({ ...s, [idx]: !s[idx] }));
  const selectAll = () => {
    const all: Record<number, boolean> = {};
    guests.forEach((_, i) => all[i] = true);
    setSelected(all);
  };
  const clearSelection = () => setSelected({});

  const generateFor = async (indices: number[]) => {
    if (indices.length === 0) return alert('No guests selected');

    // Build a lightweight preview payload (guest names) and navigate to QR panel
    const previewGuests = indices.map(i => {
      const row = guests[i];
      const name = (row as any).Name || (row as any).name || Object.values(row)[0] || '';
      return { Name: String(name) };
    });

    try {
      sessionStorage.setItem('qrPreview', JSON.stringify(previewGuests));
    } catch (e) {
      console.error('Failed to save preview', e);
    }

    // navigate to QR panel which will read the preview payload
    window.location.href = '/qr?preview=1';
  };

  const generateSelected = () => {
    const indices = Object.keys(selected).filter(k => selected[Number(k)]).map(k => Number(k));
    generateFor(indices);
  };
  const generateAll = () => generateFor(guests.map((_,i) => i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2">
          <button onClick={selectAll} className="px-2 py-1 bg-wedding-gold/20 rounded">Select all</button>
          <button onClick={clearSelection} className="px-2 py-1 bg-wedding-gold/10 rounded">Clear</button>
        </div>
        <div className="flex gap-2">
          <button onClick={generateSelected} className="px-3 py-1 bg-blue-600 text-white rounded">Download selected QR</button>
          <button onClick={generateAll} className="px-3 py-1 bg-green-600 text-white rounded">Download all QR</button>
        </div>
      </div>

      {guests.map((g, i) => {
        const name = getName(g);
        const code = encodeGuestName(name);
        const url = `${window.location.origin}/u/${code}`;
        const open = openIdx === i;
        return (
          <div key={i} className="bg-white border rounded p-2 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <input type="checkbox" checked={!!selected[i]} onChange={() => toggleSelect(i)} />
                <div>
                  <div className="font-bold truncate">{name}</div>
                  <div className="text-xs text-wedding-tan truncate">{url}</div>
                </div>
              </div>
              <div className="ml-2 flex items-center gap-2">
                <button
                  onClick={() => { setOpenIdx(open ? null : i); }}
                  className="p-2 rounded hover:bg-wedding-gold/10"
                  title="Show links"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(url)}
                  className="p-2 rounded hover:bg-wedding-gold/10"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelect && onSelect(g)}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
                >Open</button>
              </div>
            </div>

            {open && (
              <div className="mt-2 bg-wedding-cream p-2 rounded">
                <a href={url} target="_blank" rel="noreferrer" className="text-sm text-wedding-brown truncate block">{url}</a>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleCopy(url)} className="px-2 py-1 bg-wedding-gold/10 rounded">Copy</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {guests.length === 0 && (
        <div className="text-center text-wedding-tan italic py-10">មិនមានឈ្មោះភ្ញៀវក្នុងបញ្ជី</div>
      )}
    </div>
  );
}
