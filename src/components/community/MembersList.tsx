'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, Star } from 'lucide-react';
import api from '@/lib/axios';
import { format } from 'date-fns';

const ROLE_INFO: Record<string, { label: string; Icon: any; color: string }> = {
  admin:     { label: 'অ্যাডমিন',    Icon: Crown,  color: '#f59e0b' },
  moderator: { label: 'মডারেটর',    Icon: Shield, color: '#06b6d4' },
  member:    { label: 'সদস্য',       Icon: Star,   color: '#7c3aed' },
};

export default function MembersList({ shopId }: { shopId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['community-members', shopId],
    queryFn: () => api.get(`/community-shop/${shopId}/members`).then((r) => r.data),
    enabled: !!shopId,
  });

  const members = data?.members ?? [];

  if (isLoading) {
    return (
      <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-3" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Users className="w-5 h-5 text-purple-500" />
          সদস্য তালিকা ({members.length})
        </h3>
      </div>

      {members.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {members.map((m: any, i: number) => {
            const roleInfo = ROLE_INFO[m.role] || ROLE_INFO.member;
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 text-center hover:shadow-md transition"
              >
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-2.5 flex items-center justify-center text-white font-black text-xl"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                >
                  {m.profilePhoto?.url
                    ? <img src={m.profilePhoto.url} alt={m.user?.name} className="w-full h-full object-cover" />
                    : m.user?.name?.[0]
                  }
                </div>

                {/* Name */}
                <p className="font-bold text-xs truncate mb-1" style={{ color: 'var(--color-text)' }}>
                  {m.user?.name}
                </p>

                {/* Member ID */}
                {m.memberId && (
                  <p className="text-[10px] font-mono text-purple-500 mb-1">{m.memberId}</p>
                )}

                {/* Role badge */}
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${roleInfo.color}18`, color: roleInfo.color }}
                >
                  <roleInfo.Icon className="w-2.5 h-2.5" />
                  {roleInfo.label}
                </span>

                {/* Join date */}
                {m.joinedAt && (
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {format(new Date(m.joinedAt), 'MMM yyyy')}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p style={{ color: 'var(--color-text-secondary)' }}>কোনো সদস্য নেই</p>
        </div>
      )}
    </div>
  );
}