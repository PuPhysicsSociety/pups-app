'use client';
import React, { useEffect, useState } from 'react';
import { getTeam, getImageUrl } from '@/lib/api';
import { TeamMember } from '../../../types';

const EXEC_ROLES = ['president', 'vice-president', 'vice president', 'secretary', 'asst. secretary', 'assistant secretary', 'treasurer'];
const HEAD_ROLES = ['head', 'co-head'];
const PHD_ROLES = ['phd', 'phd scholar', 'scholar'];

function classify(member: TeamMember) {
  const r = (member.role || '').toLowerCase();
  if (EXEC_ROLES.some(x => r.includes(x.split(' ')[0]) && (r.includes('president') || r.includes('secretary') || r.includes('treasurer'))) || r === 'president' || r === 'treasurer') return 'exec';
  if (HEAD_ROLES.some(x => r.includes(x))) return 'head';
  if (PHD_ROLES.some(x => r.includes(x))) return 'phd';
  return 'member';
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="mem">
      <div className="frame" style={{ height: 210 }}>
        {member.photo ? (
          <img
            src={getImageUrl(member.photo)}
            alt={member.name}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
        )}
      </div>
      <h4>{member.name}</h4>
      <div className="role">{member.role}</div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTeam()
      .then(data => setMembers(data.data || []))
      .catch(() => setError('Could not load team members.'))
      .finally(() => setLoading(false));
  }, []);

  const exec    = members.filter(m => classify(m) === 'exec');
  const heads   = members.filter(m => classify(m) === 'head');
  const phd     = members.filter(m => classify(m) === 'phd');
  const regular = members.filter(m => classify(m) === 'member');

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>v</b>Team</div>
          <h2 className="sec-title">The people <em>behind</em> the society.</h2>
        </div>

        {loading && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '40px 0' }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ color: '#8c1c1c', fontSize: 12, padding: '40px 0' }}>{error}</div>
        )}

        {!loading && !error && members.length === 0 && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, padding: '40px 0' }}>No team members listed yet.</div>
        )}

        {!loading && !error && members.length > 0 && (
          <>
            {exec.length > 0 && (
              <>
                <div className="t-sub">Executive Committee</div>
                <div className="exec-g">
                  {exec.map((m, i) => <MemberCard key={m.id || i} member={m} />)}
                </div>
              </>
            )}

            {heads.length > 0 && (
              <>
                <div className="t-sub">Committee Heads</div>
                <div className="heads-g">
                  {heads.map((m, i) => <MemberCard key={m.id || i} member={m} />)}
                </div>
              </>
            )}

            {phd.length > 0 && (
              <>
                <div className="t-sub">PhD Scholars</div>
                <div className="scholars-g">
                  {phd.map((m, i) => <MemberCard key={m.id || i} member={m} />)}
                </div>
              </>
            )}

            {regular.length > 0 && (
              <>
                <div className="t-sub">All Members</div>
                <div className="mem-list">
                  {regular.map((m, i) => (
                    <div key={m.id || i} className="mr">
                      <span className="mr-nm">{m.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {exec.length === 0 && heads.length === 0 && phd.length === 0 && regular.length === 0 && (
              <div className="exec-g">
                {members.map((m, i) => <MemberCard key={m.id || i} member={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
