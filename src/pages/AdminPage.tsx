import React, { useEffect, useState } from 'react';
import AdminGuestList from '../components/AdminGuestList';
import { encodeGuestName } from '../utils/guestCode';
import type { Guest } from '../types';

const getName = (g: Guest) =>
  (g as any).Name || (g as any).name || String(Object.values(g)[0] || '');

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/guests');
        if (!res.ok) throw new Error('Failed to fetch guests from API');
        const data = await res.json();
        if (!cancelled) setGuests(data.guests); // ✅ use data.guests
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load guests');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (guest: Guest) => {
    const name = getName(guest);
    const code = encodeGuestName(name);
    const href = `${window.location.origin}/u/${code}`;
    window.location.href = href;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin — Guest List</h1>
      {loading && <div>Loading guests…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <AdminGuestList guests={guests} onSelect={handleSelect} />
      )}
      <p className="mt-6 text-sm text-wedding-tan">
        Click a guest to open the invitation with their name.
      </p>
    </div>
  );
}