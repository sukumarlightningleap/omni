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
    <div className="space-y-12 font-sans text-neutral-900">
      {/* Header - Integrated */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 italic">User Database</h2>
          <p className="text-sm text-neutral-500 font-medium">Manage customer identities, classifications and internal notes.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          {filteredUsers.length} Users Cataloged
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search identity databanks by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-neutral-200/60 rounded-3xl text-sm font-semibold px-14 py-5 text-neutral-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm"
        />
      </div>

      {/* Grid List */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Identity</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black w-48 text-center">Classification</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black w-40">Purchase LTV</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Internal intelligence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="p-6 align-top">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                        <UserIcon size={20} className="text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-neutral-900 group-hover:text-indigo-600 transition-colors uppercase italic">{user.name || "UNREGISTERED"}</p>
                        <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">{user.email}</p>
                        <p className="text-[9px] text-neutral-300 font-medium">UID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Role Dropdown */}
                  <td className="p-6 align-top">
                    <div className="flex justify-center">
                      <select
                        disabled={savingId === user.id}
                        value={user.role}
                        onChange={(e) => handleUpdate(user.id, "role", e.target.value)}
                        className={`min-w-[140px] bg-neutral-50 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer text-center ${
                          user.role === 'ADMIN' ? 'text-rose-600 border-rose-100' : 
                          user.role === 'VIP' ? 'text-amber-600 border-amber-100' : 'text-neutral-500 border-neutral-100'
                        }`}
                      >
                        <option value="CUSTOMER">Customer Account</option>
                        <option value="VIP">VIP Privileged</option>
                        <option value="ADMIN">System Administrator</option>
                      </select>
                    </div>
                  </td>

                  {/* LTV */}
                  <td className="p-6 align-top">
                    <div className="flex items-center gap-2 bg-emerald-50 w-fit px-4 py-2 rounded-xl border border-emerald-100">
                      <DollarSign size={14} className="text-emerald-600" />
                      <span className="text-sm font-black text-emerald-700 tracking-tight">{user.totalSpent.toFixed(2)}</span>
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
      placeholder="Append internal intel regarding this user protocol..."
      className="w-full min-h-[80px] bg-neutral-50 border border-neutral-100 hover:border-indigo-200 text-xs p-4 text-neutral-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all rounded-2xl placeholder:text-neutral-300 font-medium tracking-wide resize-none"
    />
  );
};
