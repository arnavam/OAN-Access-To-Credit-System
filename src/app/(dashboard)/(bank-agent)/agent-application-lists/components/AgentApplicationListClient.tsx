'use client';

import AgentApplicationTable from './AgentApplicationTable';
import StatCards from './KPICards';

export default function AgentApplicationListClient() {
  return (
    <div className="mx-auto w-full space-y-4">


      {/* Stat Cards Row */}
      <StatCards />

      <div className="bg-white border border-[#F1F3F4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Table */}
        <AgentApplicationTable />
      </div>
    </div>
  );
}
