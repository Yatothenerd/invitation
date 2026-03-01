import React from 'react';
import type { Guest } from '../types';

interface AdminGuestListProps {
  guests: Guest[];
  onSelect: (guest: Guest) => void;
}

const AdminGuestList: React.FC<AdminGuestListProps> = ({ guests, onSelect }) => {
  return (
    <ul className="space-y-2">
      {guests.map((guest, i) => (
        <li
          key={i}
          onClick={() => onSelect(guest)}
          className="cursor-pointer hover:text-wedding-tan"
        >
          {guest.Name || guest.name || String(Object.values(guest)[0])}
        </li>
      ))}
    </ul>
  );
};

export default AdminGuestList;