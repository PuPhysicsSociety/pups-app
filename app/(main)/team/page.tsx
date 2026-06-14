'use client';
import React, { useState } from 'react';
import { Linkedin, Mail, User, ChevronDown, ChevronUp } from 'lucide-react';
import teamData from '../../../data/team.json';

/* ── Types ── */
interface TeamMember {
  id: number;
  name: string;
  role: string;
  linkedin_url?: string;
  email?: string;
  image?: string;
}

/* ── Classification ── */
const EXEC_KEYWORDS = ['president', 'vice-president', 'secretary', 'assistant secretary', 'treasurer'];
const HEAD_KEYWORDS = ['head'];
const PHD_KEYWORDS  = ['phd scholar', 'phd'];
// const PHD_KEYWORDS  = ['Academic committee'];

function classify(member: TeamMember): 'exec' | 'head' | 'phd' | 'member' {
  const r = (member.role || '').toLowerCase();
  if (EXEC_KEYWORDS.some(k => r.includes(k))) return 'exec';
  if (HEAD_KEYWORDS.some(k => r.includes(k)))  return 'head';
  if (PHD_KEYWORDS.some(k  => r.includes(k)))  return 'phd';
  return 'member';
}

/* ── Avatar / Photo ── */
function MemberAvatar({ member, size = 'lg' }: { member: TeamMember; size?: 'lg' | 'sm' }) {
  const [imgError, setImgError] = useState(false);
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasImage = member.image && !imgError;

  if (size === 'lg') {
    return (
      <div className="team-avatar-wrap">
        {hasImage ? (
          <img
            src={member.image}
            alt={member.name}
            className="team-avatar-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="team-avatar-placeholder">
            <User className="team-avatar-icon" size={28} strokeWidth={1} />
          </div>
        )}
      </div>
    );
  }

  // small inline avatar for member list rows
  return (
    <div className="team-avatar-sm">
      {hasImage ? (
        <img
          src={member.image}
          alt={member.name}
          className="team-avatar-img-sm"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="team-avatar-initials-sm">{initials}</span>
      )}
    </div>
  );
}

/* ── Card (for exec / heads / phd) ── */
function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="team-card">
      <MemberAvatar member={member} size="lg" />
      <div className="team-card-body">
        <h3 className="team-card-name">{member.name}</h3>
        <p className="team-card-role">{member.role}</p>
        <div className="team-card-links">
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="team-link"
              aria-label={`${member.name} on LinkedIn`}
            >
              <Linkedin size={13} strokeWidth={1.8} />
              <span>LinkedIn</span>
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="team-link"
              aria-label={`Email ${member.name}`}
            >
              <Mail size={13} strokeWidth={1.8} />
              <span>Email</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Inline row (for committee members) ── */
function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="team-row">
      <MemberAvatar member={member} size="sm" />
      <div className="team-row-info">
        <span className="team-row-name">{member.name}</span>
        <span className="team-row-role">{member.role}</span>
      </div>
      <div className="team-row-links">
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="team-icon-link"
            aria-label={`${member.name} on LinkedIn`}
          >
            <Linkedin size={14} strokeWidth={1.8} />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="team-icon-link"
            aria-label={`Email ${member.name}`}
          >
            <Mail size={14} strokeWidth={1.8} />
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Collapsible committee group ── */
function CommitteeGroup({ title, members }: { title: string; members: TeamMember[] }) {
  const [open, setOpen] = useState(true);
  const head    = members.find(m => classify(m) === 'head');
  const regular = members.filter(m => classify(m) !== 'head');

  return (
    <div className="team-committee">
      <button
        className="team-committee-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="team-committee-title">{title}</span>
        <span className="team-committee-count">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronUp size={14} strokeWidth={1.8} /> : <ChevronDown size={14} strokeWidth={1.8} />}
      </button>

      {open && (
        <div className="team-committee-body">
          {head && (
            <div className="team-committee-head-card">
              <MemberCard member={head} />
            </div>
          )}
          {regular.length > 0 && (
            <div className="team-committee-members">
              {regular.map((m, i) => (
                <MemberRow key={m.id || i} member={m} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Group committee members ── */
function groupByCommittee(members: TeamMember[]) {
  const groups: Record<string, TeamMember[]> = {};

  members.forEach(m => {
    const r = m.role.toLowerCase();
    let group = 'Other';

    if (r.includes('pr') || r.includes('media')) group = 'PR & Media';
    else if (r.includes('event')) group = 'Event Coordination';
    else if (r.includes('technical') || r.includes('tech')) group = 'Technical';
    else if (r.includes('academic')) group = 'Academic';
    else if (r.includes('outreach')) group = 'Outreach';

    if (!groups[group]) groups[group] = [];
    groups[group].push(m);
  });

  return groups;
}

/* ── Page ── */
export default function TeamPage() {
  const members = teamData as TeamMember[];

  const exec    = members.filter(m => classify(m) === 'exec');
  const heads   = members.filter(m => classify(m) === 'head');
  const phd     = members.filter(m => classify(m) === 'phd');
  // "committee members" = heads + their members, grouped
  const committeeMembers = members.filter(m => classify(m) === 'head' || (classify(m) === 'member' && !classify(m).includes('phd')));
  // For grouping, include heads too so each committee has its head
  const nonExecNonPhd = members.filter(m => classify(m) === 'head' || classify(m) === 'member');
  const committeeGroups = groupByCommittee(nonExecNonPhd);

  const totalCount = members.length;

  return (
    <>
      <style>{`
        /* ── Team page styles ── */
        .team-hero {
          padding: 72px 0 56px;
          border-bottom: 1px solid var(--rule);
        }
        .team-hero-kicker {
          font-size: 9.5px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: var(--tx4);
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .team-hero-kicker::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: var(--cr2);
        }
        .team-hero-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(36px, 4.2vw, 56px);
          line-height: 1.07;
          letter-spacing: -.025em;
          margin-bottom: 18px;
          max-width: 22ch;
        }
        .team-hero-h1 em { font-style: italic; color: var(--cr); }
        .team-hero-lede {
          font-size: 12.5px;
          line-height: 1.85;
          color: var(--tx3);
          max-width: 52ch;
          margin-bottom: 28px;
        }
        .team-stats {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        .team-stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .team-stat-n {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 28px;
          font-weight: 300;
          color: var(--tx);
          line-height: 1;
        }
        .team-stat-l {
          font-size: 9px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--tx4);
        }
        .team-stat-sep {
          width: 1px;
          background: var(--rule);
          align-self: stretch;
          margin: 4px 0;
        }

        /* ── Section wrapper ── */
        .team-section {
          padding: 56px 0;
          border-bottom: 1px solid var(--rule);
        }
        .team-section.alt { background: var(--bg); }
        .team-section-head {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 36px;
        }
        .team-section-label {
          font-size: 9.5px;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: var(--tx4);
          flex-shrink: 0;
        }
        .team-section-label b {
          display: block;
          font-size: 10.5px;
          color: var(--tx3);
          margin-bottom: 2px;
        }
        .team-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(24px, 2.8vw, 36px);
          line-height: 1.1;
        }
        .team-section-title em { font-style: italic; color: var(--cr); }

        /* ── Cards grid ── */
        .team-cards-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }
        .team-card {
          flex: 0 0 200px;
          background: var(--s2);
          border: 1px solid var(--rule);
          transition: background .15s, box-shadow .15s;
        }
        .team-card:hover {
          background: var(--s1);
        }
        .team-avatar-wrap {
          width: 100%;
          aspect-ratio: 1;
          background:
            repeating-linear-gradient(45deg, var(--rule) 0 1px, transparent 1px 9px),
            var(--s2);
          border-bottom: 1px solid var(--rule);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .team-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .team-avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .team-avatar-icon {
          color: var(--tx4);
        }

        .team-card-body {
          padding: 14px 16px 16px;
        }
        .team-card-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 17px;
          font-weight: 400;
          line-height: 1.2;
          margin-bottom: 3px;
          color: var(--tx);
        }
        .team-card-role {
          font-size: 9px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--tx3);
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .team-card-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .team-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 9px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--tx3);
          border-bottom: 1px solid var(--rule);
          padding-bottom: 1px;
          transition: color .12s, border-color .12s;
          text-decoration: none;
        }
        .team-link:hover {
          color: var(--cr);
          border-color: var(--cr2);
        }

        /* ── Committee groups ── */
        .team-committees {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .team-committee {
          border: 1px solid var(--rule);
          margin-bottom: -1px;
        }
        .team-committee-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: none;
          border: 0;
          cursor: pointer;
          text-align: left;
          font-family: 'IBM Plex Mono', monospace;
          transition: background .12s;
        }
        .team-committee-header:hover { background: var(--s2); }
        .team-committee-title {
          font-size: 10.5px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--tx);
          font-family: 'IBM Plex Mono', monospace;
          flex: 1;
        }
        .team-committee-count {
          font-size: 9px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--tx4);
          font-family: 'IBM Plex Mono', monospace;
        }
        .team-committee-body {
          border-top: 1px solid var(--rule);
          padding: 24px 20px;
          background: var(--s1);
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 28px;
          align-items: start;
        }
        .team-committee-head-card {}
        .team-committee-head-card .team-card {
          flex: 1 1 auto;
        }
        .team-committee-members {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Member rows ── */
        .team-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid var(--rule);
          transition: background .1s;
        }
        .team-row:last-child { border-bottom: 0; }
        .team-row:hover { background: var(--s2); }
        .team-avatar-sm {
          width: 34px;
          height: 34px;
          border-radius: 0;
          background: repeating-linear-gradient(45deg, var(--rule) 0 1px, transparent 1px 7px), var(--s2);
          border: 1px solid var(--rule);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .team-avatar-img-sm {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .team-avatar-initials-sm {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 12px;
          color: var(--tx3);
        }
        .team-row-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .team-row-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          color: var(--tx2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .team-row-role {
          font-size: 9px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--tx4);
        }
        .team-row-links {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .team-icon-link {
          color: var(--tx4);
          display: flex;
          align-items: center;
          transition: color .12s;
          text-decoration: none;
        }
        .team-icon-link:hover { color: var(--cr); }

        /* ── PhD scholars ── */
        .team-phd-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .team-phd-card {
          flex: 0 0 220px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid var(--rule);
          padding: 14px 16px;
          background: var(--s2);
          transition: background .12s;
        }
        .team-phd-card:hover { background: var(--s1); }
        .team-phd-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 17px;
          color: var(--tx2);
          margin-bottom: 2px;
        }
        .team-phd-role {
          font-size: 9px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--tx4);
        }
        .team-phd-links {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .team-committee-body {
            grid-template-columns: 1fr;
          }
          .team-committee-head-card .team-card {
            max-width: 200px;
          }
          .team-card { flex: 0 0 calc(50% - 10px); }
          .team-phd-card { flex: 0 0 calc(100% - 0px); }
          .team-stats { gap: 20px; }
        }
        @media (max-width: 480px) {
          .team-card { flex: 0 0 100%; max-width: 260px; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="team-hero">
        <div className="wrap">
          <div className="team-hero-kicker">Society · Est. 2025</div>
          <h1 className="team-hero-h1">
            The people <em>behind</em><br />the society.
          </h1>
          <p className="team-hero-lede">
            PUPS is driven by a passionate group of students, researchers, and scholars committed
            to fostering a vibrant physics community at Presidency University.
          </p>
          <div className="team-stats">
            <div className="team-stat">
              <span className="team-stat-n">{exec.length}</span>
              <span className="team-stat-l">Core Committee</span>
            </div>
            <div className="team-stat-sep" />
            <div className="team-stat">
              <span className="team-stat-n">{nonExecNonPhd.length}</span>
              <span className="team-stat-l">Sub Committee</span>
            </div>
            <div className="team-stat-sep" />
            <div className="team-stat">
              <span className="team-stat-n">{phd.length}</span>
              <span className="team-stat-l">Academic Committee</span>
            </div>
            <div className="team-stat-sep" />
            <div className="team-stat">
              <span className="team-stat-n">{totalCount}</span>
              <span className="team-stat-l">Total Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Executive Committee ── */}
      {exec.length > 0 && (
        <section className="team-section">
          <div className="wrap">
            <div className="team-section-head">
              <div className="team-section-label">
                <b>i</b>
                
              </div>
              <h2 className="team-section-title">Core <em>committee</em>.</h2>
            </div>
            <div className="team-cards-grid">
              {exec.map((m, i) => (
                <MemberCard key={m.id ?? i} member={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Committees ── */}
      {Object.keys(committeeGroups).length > 0 && (
        <section className="team-section alt">
          <div className="wrap">
            <div className="team-section-head">
              <div className="team-section-label">
                <b>ii</b>
                
              </div>
              <h2 className="team-section-title">Sub <em>committees</em>.</h2>
            </div>
            <div className="team-committees">
              {Object.entries(committeeGroups).map(([groupName, groupMembers]) => (
                <CommitteeGroup key={groupName} title={groupName} members={groupMembers} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PhD Scholars ── */}
      {phd.length > 0 && (
        <section className="team-section">
          <div className="wrap">
            <div className="team-section-head">
              <div className="team-section-label">
                <b>iii</b>
                
              </div>
              <h2 className="team-section-title">Academic <em>committee</em>.</h2>
            </div>
            <div className="team-phd-grid">
              {phd.map((m, i) => (
                <div key={m.id ?? i} className="team-phd-card">
                  <MemberAvatar member={m} size="sm" />
                  <div>
                    <div className="team-phd-name">{m.name}</div>
                    {/* <div className="team-phd-role">{m.role}</div> */}
                    <div className="team-phd-role">Academic Committee Member</div>
                    <div className="team-phd-links">
                      {m.linkedin_url && (
                        <a
                          href={m.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="team-icon-link"
                          aria-label={`${m.name} on LinkedIn`}
                        >
                          <Linkedin size={14} strokeWidth={1.8} />
                        </a>
                      )}
                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          className="team-icon-link"
                          aria-label={`Email ${m.name}`}
                        >
                          <Mail size={14} strokeWidth={1.8} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
