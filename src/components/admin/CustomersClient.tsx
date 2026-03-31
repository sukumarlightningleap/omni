"use client";

import React, { useState } from "react";
import { Search, ChevronDown, CheckSquare, Square, User, UserCheck, Coins, MapPin, Loader2, Edit3 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { updateUserRole, saveInternalNotes } from "@/app/actions/admin/customers";
import { Role } from "@prisma/client";

type CustomerData = {
  id: string;
  name: string | null;
  email: string;
  totalSpent: number;
  ordersCount: number;
  role: Role;
  internalNotes?: string | null;
};

export default function CustomersClient({ initialCustomers }: { initialCustomers: CustomerData[] }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  
  // Sort LTV descending by default
  const sortedCustomers = [...initialCustomers].sort((a, b) => b.totalSpent - a.totalSpent);

  const filteredCustomers = sortedCustomers.filter((c) =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleRoleChange = async (id: string, role: Role) => {
    setLoadingIds(prev => new Set(prev).add(id));
    await updateUserRole(id, role);
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleNotesChange = async (id: string, notes: string) => {
    // Fire and forget autosave
    await saveInternalNotes(id, notes);
  };

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-4">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase">CRM & VIP Tracker</h2>
        <div className="flex gap-4">
          <button className="text-[10px] bg-white text-black font-black uppercase tracking-widest px-6 py-2 hover:bg-neutral-200 transition-colors">
            Invite Customer
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 bg-black border border-[#1A1A1A] p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="FILTER CUSTOMERS BY NAME OR EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[10px] uppercase tracking-widest text-white pl-10 pr-4 py-2 focus:outline-none placeholder:text-neutral-600"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#1A1A1A] text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">
          Tier <ChevronDown size={12} />
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-black border border-[#1A1A1A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                <th className="p-3 w-12 text-center cursor-pointer" onClick={toggleAll}>
                  {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 ? (
                    <CheckSquare size={14} className="text-white mx-auto" />
                  ) : (
                    <Square size={14} className="text-neutral-600 hover:text-white mx-auto transition-colors" />
                  )}
                </th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Identity</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Tier / Role</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Origin</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold text-center">Orders</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">LTV (Spent)</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Internal Intel</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const isSelected = selectedIds.has(customer.id);
                const isUpdating = loadingIds.has(customer.id);

                return (
                  <tr 
                    key={customer.id} 
                    className={`border-b border-[#1A1A1A] transition-colors group ${isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="p-3 text-center cursor-pointer" onClick={(e) => toggleOne(customer.id, e)}>
                      {isSelected ? (
                        <CheckSquare size={14} className="text-white mx-auto" />
                      ) : (
                        <Square size={14} className="text-neutral-600 group-hover:text-white mx-auto transition-colors" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${customer.role === 'VIP' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-white/5 border-white/10'}`}>
                          {customer.role === "VIP" ? <UserCheck size={12} className="text-yellow-500" /> : <User size={12} className="text-neutral-500" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest block">
                            {customer.name || "UNKNOWN"}
                          </span>
                          <span className="text-[8px] text-neutral-500 tracking-widest block lowercase">
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 relative">
                      {isUpdating && <Loader2 size={12} className="absolute left-1 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />}
                      <select
                        value={customer.role}
                        onChange={(e) => handleRoleChange(customer.id, e.target.value as Role)}
                        disabled={isUpdating}
                        className={`bg-black border text-[10px] uppercase tracking-widest px-3 py-1 focus:outline-none w-28 ${customer.role === 'VIP' ? 'border-yellow-500 text-yellow-500' : 'border-[#1A1A1A] text-neutral-400'}`}
                      >
                        <option value="CUSTOMER">Standard</option>
                        <option value="VIP">VIP Tier</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <MapPin size={10} />
                        Global
                      </div>
                    </td>
                    <td className="p-3 text-[10px] text-white text-center font-bold">
                      {customer.ordersCount}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-[10px] tracking-widest text-white uppercase font-bold">
                        <Coins size={10} className={customer.totalSpent > 1000 ? "text-green-500" : "text-neutral-500"} />
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-3 w-48">
                      <div className="relative group/intel">
                        <Edit3 size={10} className="absolute right-2 top-2 text-neutral-600 group-hover/intel:text-white pointer-events-none transition-colors" />
                        <textarea
                          defaultValue={customer.internalNotes || ""}
                          onBlur={(e) => handleNotesChange(customer.id, e.target.value)}
                          placeholder="Tactical Notes..."
                          className="w-full bg-[#050505] border border-[#1A1A1A] text-[8px] uppercase tracking-widest text-neutral-400 p-2 pr-6 focus:outline-none focus:border-white resize-none h-10 custom-scrollbar"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[10px] uppercase tracking-widest text-neutral-600 bg-[#050505]">
                    NO NETWORK IDENTITIES FOUND
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
