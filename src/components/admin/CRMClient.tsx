"use client";

import React, { useState } from "react";
import { Search, Save, User as UserIcon, Loader2, DollarSign } from "lucide-react";
import { updateUserCRM } from "@/app/actions/crm";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "CUSTOMER" | "VIP";
  totalSpent: number;
  internalNotes: string | null;
};

export default function CRMClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUpdate = async (userId: string, field: "role" | "internalNotes", value: string) => {
    setSavingId(userId);

    // Optimistic cache update
    setUsers((prev) => 
      prev.map((u) => u.id === userId ? { ...u, [field]: value } : u)
    );

    try {
      await updateUserCRM(userId, { [field]: value as any });
    } catch (error) {
      alert("Failed to synchronize user protocol.");
      // Rollback logic would go here in production
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="SEARCH IDENTITY DATABANKS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black border border-white/20 text-xs px-12 py-4 text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-neutral-600 uppercase tracking-widest"
        />
      </div>

      {/* Grid List */}
      <div className="bg-white/5 border border-white/10 overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 bg-black/50">
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal">Identity</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal w-40">Classification</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal w-32">LTV</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal w-1/3">Internal Intel</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors relative group">
                  <td className="p-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 border border-white/20 flex items-center justify-center shrink-0 bg-black">
                        <UserIcon size={14} className="text-neutral-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest">{user.name || "UNKNOWN"}</p>
                        <p className="text-[10px] text-neutral-500 tracking-widest">{user.email}</p>
                        <p className="text-[8px] text-neutral-600 tracking-widest">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Role Dropdown */}
                  <td className="p-4 align-top">
                    <select
                      disabled={savingId === user.id}
                      value={user.role}
                      onChange={(e) => handleUpdate(user.id, "role", e.target.value)}
                      className={`w-full bg-black border border-white/20 text-[10px] uppercase tracking-widest p-2 focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer ${
                        user.role === 'ADMIN' ? 'text-red-500 border-red-500/30' : 
                        user.role === 'VIP' ? 'text-yellow-500 border-yellow-500/30' : 'text-neutral-300'
                      }`}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="VIP">VIP</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  {/* LTV */}
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-green-500" />
                      <span className="text-xs tracking-widest">{user.totalSpent.toFixed(2)}</span>
                    </div>
                  </td>

                  {/* Notes TextArea */}
                  <td className="p-4 align-top relative">
                    <NotesEditor user={user} onSave={(id, val) => handleUpdate(id, "internalNotes", val)} />
                    {savingId === user.id && (
                      <div className="absolute top-6 right-6">
                        <Loader2 size={12} className="animate-spin text-neutral-500" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                    NO IDENTITIES FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const NotesEditor = ({ user, onSave }: { user: UserData, onSave: (id: string, notes: string) => void }) => {
  const [notes, setNotes] = useState(user.internalNotes || "");
  return (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={() => {
        if (notes !== (user.internalNotes || "")) {
          onSave(user.id, notes);
        }
      }}
      placeholder="ADD INTEL..."
      className="w-full min-h-[60px] bg-black border border-white/10 hover:border-white/30 text-[10px] p-3 text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-neutral-600 uppercase tracking-widest resize-none custom-scrollbar"
    />
  );
};
