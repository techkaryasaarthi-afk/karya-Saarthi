'use client'

import Link from 'next/link'
import { DEPARTMENT_HUBS } from '@/lib/org'

export default function DepartmentHubs() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-navy font-heading">Department Structure</h3>
          <p className="text-xs text-slate-400">Each department now has a direct workspace route and a meeting hosting link.</p>
        </div>
        <Link href="/admin/board/meetings" className="rounded-xl bg-navy px-3 py-2 text-xs font-bold text-white">
          Open Meetings
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DEPARTMENT_HUBS.map(hub => (
          <div key={hub.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-semibold text-navy">{hub.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={hub.route} className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                Department Hub
              </Link>
              <Link href={hub.meetingRoute} className="rounded-lg bg-accent/10 px-3 py-1.5 text-[11px] font-semibold text-accent">
                Meeting Hosting
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
