'use client';
import React, { useEffect, useState } from 'react';
import { getSiteContent, updateSiteContent, resetSiteContent } from '../../lib/api';
import { DEFAULT_HOME, DEFAULT_ABOUT, DEFAULT_CONTACT, HomeContent, AboutContent, ContactContent } from '../../lib/defaultSiteContent';

// ── helpers ───────────────────────────────────────────────────────────────────

function Msg({ ok, err }: { ok?: string; err?: string }) {
  if (ok)  return <div className="adm-msg-ok">✓ {ok}</div>;
  if (err) return <div className="adm-msg-err">{err}</div>;
  return null;
}

function AField({ label, children, col2 = false, hint }: {
  label: string; children: React.ReactNode; col2?: boolean; hint?: string;
}) {
  return (
    <div className={`adm-field${col2 ? ' adm-col2' : ''}`}>
      <label className="adm-label">{label}</label>
      {children}
      {hint && <div style={{ fontSize: 10.5, color: 'var(--tx4)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const EMPHASIS_HINT = 'Wrap a word in **double asterisks** to italicise it, matching the site style.';

const SUB_TABS = [
  { id: 'home',    label: 'Home' },
  { id: 'about',   label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

export default function PagesPanel() {
  const [sub, setSub] = useState<typeof SUB_TABS[number]['id']>('home');
  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Pages</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            className={`adm-btn ${sub === t.id ? '' : 'ghost'}`}
            onClick={() => setSub(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === 'home'    && <HomeEditor />}
      {sub === 'about'   && <AboutEditor />}
      {sub === 'contact' && <ContactEditor />}
    </div>
  );
}

// ── shared save/reset bar ───────────────────────────────────────────────────

function SaveBar({ busy, onSave, onReset }: { busy: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className="adm-form-btns">
      <button type="button" disabled={busy} className="adm-btn" onClick={onSave}>{busy ? 'Saving…' : 'Save changes'}</button>
      <button type="button" className="adm-btn ghost" onClick={onReset}>Reset to default</button>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

function HomeEditor() {
  const [form, setForm] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(''); const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    getSiteContent('home').then(d => setForm(d.data || DEFAULT_HOME)).catch(() => setErr('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = (k: keyof HomeContent, v: any) => setForm(f => ({ ...f, [k]: v }));

  const updatePillar = (i: number, key: 'title' | 'description', v: string) => {
    const pillars = [...form.pillars];
    pillars[i] = { ...pillars[i], [key]: v };
    s('pillars', pillars);
  };
  const addPillar = () => s('pillars', [...form.pillars, { title: '', description: '' }]);
  const removePillar = (i: number) => s('pillars', form.pillars.filter((_, idx) => idx !== i));

  const save = async () => {
    setBusy(true); setErr('');
    try { await updateSiteContent('home', form); setOk('Saved'); setTimeout(() => setOk(''), 3000); }
    catch (e: any) { setErr(e.message || 'Save failed'); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    if (!confirm('Reset the Home page to its default content? This discards your customisations.')) return;
    setBusy(true); setErr('');
    try { const d = await resetSiteContent('home'); setForm(d.data); setOk('Reset to default'); setTimeout(() => setOk(''), 3000); }
    catch (e: any) { setErr(e.message || 'Reset failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="adm-empty">Loading…</div>;

  return (
    <div className="adm-form" style={{ marginTop: 0 }}>
      <Msg ok={ok} err={err} />
      <div className="adm-form-title">Hero</div>
      <div className="adm-grid">
        <AField label="Kicker" col2><input className="adm-input" value={form.kicker} onChange={e => s('kicker', e.target.value)} /></AField>
        <AField label="Headline" col2 hint={EMPHASIS_HINT}>
          <textarea rows={3} className="adm-textarea" value={form.heroTitle} onChange={e => s('heroTitle', e.target.value)} />
        </AField>
        <AField label="Lede" col2><textarea rows={3} className="adm-textarea" value={form.heroLede} onChange={e => s('heroLede', e.target.value)} /></AField>
        <AField label="Primary button label"><input className="adm-input" value={form.ctaPrimary.label} onChange={e => s('ctaPrimary', { ...form.ctaPrimary, label: e.target.value })} /></AField>
        <AField label="Primary button link"><input className="adm-input" value={form.ctaPrimary.href} onChange={e => s('ctaPrimary', { ...form.ctaPrimary, href: e.target.value })} /></AField>
        <AField label="Secondary button label"><input className="adm-input" value={form.ctaSecondary.label} onChange={e => s('ctaSecondary', { ...form.ctaSecondary, label: e.target.value })} /></AField>
        <AField label="Secondary button link"><input className="adm-input" value={form.ctaSecondary.href} onChange={e => s('ctaSecondary', { ...form.ctaSecondary, href: e.target.value })} /></AField>
      </div>

      <div className="adm-form-title" style={{ marginTop: 24 }}>"What We Do" section</div>
      <div className="adm-grid">
        <AField label="Roman numeral label"><input className="adm-input" value={form.whatWeDoLabel} onChange={e => s('whatWeDoLabel', e.target.value)} /></AField>
        <AField label="Section title" hint={EMPHASIS_HINT}><input className="adm-input" value={form.whatWeDoTitle} onChange={e => s('whatWeDoTitle', e.target.value)} /></AField>
      </div>

      <div style={{ marginTop: 16 }}>
        {form.pillars.map((p, i) => (
          <div key={i} style={{ border: '1px solid var(--rule)', padding: 14, marginBottom: 10 }}>
            <div className="adm-grid">
              <AField label={`Pillar ${i + 1} title`}><input className="adm-input" value={p.title} onChange={e => updatePillar(i, 'title', e.target.value)} /></AField>
              <AField label="Description" col2><textarea rows={2} className="adm-textarea" value={p.description} onChange={e => updatePillar(i, 'description', e.target.value)} /></AField>
            </div>
            <button type="button" className="adm-action del" onClick={() => removePillar(i)}>Remove pillar</button>
          </div>
        ))}
        <button type="button" className="adm-btn ghost" onClick={addPillar}>+ Add pillar</button>
      </div>

      <SaveBar busy={busy} onSave={save} onReset={reset} />
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutEditor() {
  const [form, setForm] = useState<AboutContent>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(''); const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    getSiteContent('about').then(d => setForm(d.data || DEFAULT_ABOUT)).catch(() => setErr('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = (k: keyof AboutContent, v: any) => setForm(f => ({ ...f, [k]: v }));

  const updateFact = (i: number, key: 'label' | 'value' | 'href', v: string) => {
    const facts = [...form.facts];
    facts[i] = { ...facts[i], [key]: v };
    s('facts', facts);
  };
  const addFact = () => s('facts', [...form.facts, { label: '', value: '' }]);
  const removeFact = (i: number) => s('facts', form.facts.filter((_, idx) => idx !== i));

  const save = async () => {
    setBusy(true); setErr('');
    try { await updateSiteContent('about', form); setOk('Saved'); setTimeout(() => setOk(''), 3000); }
    catch (e: any) { setErr(e.message || 'Save failed'); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    if (!confirm('Reset the About page to its default content? This discards your customisations.')) return;
    setBusy(true); setErr('');
    try { const d = await resetSiteContent('about'); setForm(d.data); setOk('Reset to default'); setTimeout(() => setOk(''), 3000); }
    catch (e: any) { setErr(e.message || 'Reset failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="adm-empty">Loading…</div>;

  return (
    <div className="adm-form" style={{ marginTop: 0 }}>
      <Msg ok={ok} err={err} />
      <div className="adm-grid">
        <AField label="Roman numeral label"><input className="adm-input" value={form.sectionLabel} onChange={e => s('sectionLabel', e.target.value)} /></AField>
        <AField label="Section title" hint={EMPHASIS_HINT}><input className="adm-input" value={form.title} onChange={e => s('title', e.target.value)} /></AField>
      </div>

      <div className="adm-form-title" style={{ marginTop: 20 }}>Facts</div>
      {form.facts.map((f, i) => (
        <div key={i} style={{ border: '1px solid var(--rule)', padding: 14, marginBottom: 10 }}>
          <div className="adm-grid">
            <AField label="Label"><input className="adm-input" value={f.label} onChange={e => updateFact(i, 'label', e.target.value)} /></AField>
            <AField label="Value"><input className="adm-input" value={f.value} onChange={e => updateFact(i, 'value', e.target.value)} /></AField>
            <AField label="Link (optional)" col2><input className="adm-input" value={f.href || ''} onChange={e => updateFact(i, 'href', e.target.value)} placeholder="https://…" /></AField>
          </div>
          <button type="button" className="adm-action del" onClick={() => removeFact(i)}>Remove fact</button>
        </div>
      ))}
      <button type="button" className="adm-btn ghost" onClick={addFact}>+ Add fact</button>

      <div className="adm-form-title" style={{ marginTop: 24 }}>Body text</div>
      <div className="adm-grid">
        <AField label="Column 1" col2 hint="Separate paragraphs with a blank line."><textarea rows={6} className="adm-textarea" value={form.column1} onChange={e => s('column1', e.target.value)} /></AField>
        <AField label="Column 2" col2 hint="Separate paragraphs with a blank line."><textarea rows={6} className="adm-textarea" value={form.column2} onChange={e => s('column2', e.target.value)} /></AField>
      </div>

      <SaveBar busy={busy} onSave={save} onReset={reset} />
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────

function ContactEditor() {
  const [form, setForm] = useState<ContactContent>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(''); const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    getSiteContent('contact').then(d => setForm(d.data || DEFAULT_CONTACT)).catch(() => setErr('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = (k: keyof ContactContent, v: any) => setForm(f => ({ ...f, [k]: v }));

  const updateSocial = (i: number, key: 'label' | 'href', v: string) => {
    const socials = [...form.socials];
    socials[i] = { ...socials[i], [key]: v };
    s('socials', socials);
  };
  const addSocial = () => s('socials', [...form.socials, { label: '', href: '' }]);
  const removeSocial = (i: number) => s('socials', form.socials.filter((_, idx) => idx !== i));

  const save = async () => {
    setBusy(true); setErr('');
    try { await updateSiteContent('contact', form); setOk('Saved'); setTimeout(() => setOk(''), 3000); }
    catch (e: any) { setErr(e.message || 'Save failed'); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    if (!confirm('Reset the Contact page to its default content? This discards your customisations.')) return;
    setBusy(true); setErr('');
    try { const d = await resetSiteContent('contact'); setForm(d.data); setOk('Reset to default'); setTimeout(() => setOk(''), 3000); }
    catch (e: any) { setErr(e.message || 'Reset failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="adm-empty">Loading…</div>;

  return (
    <div className="adm-form" style={{ marginTop: 0 }}>
      <Msg ok={ok} err={err} />
      <div className="adm-grid">
        <AField label="Roman numeral label"><input className="adm-input" value={form.sectionLabel} onChange={e => s('sectionLabel', e.target.value)} /></AField>
        <AField label="Section title" hint={EMPHASIS_HINT}><input className="adm-input" value={form.title} onChange={e => s('title', e.target.value)} /></AField>
        <AField label="Intro heading" col2 hint={EMPHASIS_HINT}><input className="adm-input" value={form.introTitle} onChange={e => s('introTitle', e.target.value)} /></AField>
        <AField label="Intro body" col2 hint="Separate paragraphs with a blank line. The email line below is added automatically — no need to repeat it here.">
          <textarea rows={4} className="adm-textarea" value={form.introBody} onChange={e => s('introBody', e.target.value)} />
        </AField>
        <AField label="Contact email"><input type="email" className="adm-input" value={form.contactEmail} onChange={e => s('contactEmail', e.target.value)} /></AField>
        <AField label="Address" col2><input className="adm-input" value={form.address} onChange={e => s('address', e.target.value)} /></AField>
        <AField label="Colloquia venue"><input className="adm-input" value={form.colloquiaVenue} onChange={e => s('colloquiaVenue', e.target.value)} /></AField>
        <AField label="Events venue"><input className="adm-input" value={form.eventsVenue} onChange={e => s('eventsVenue', e.target.value)} /></AField>
        <AField label="Department display name"><input className="adm-input" value={form.departmentName} onChange={e => s('departmentName', e.target.value)} /></AField>
        <AField label="Department link"><input className="adm-input" value={form.departmentUrl} onChange={e => s('departmentUrl', e.target.value)} /></AField>
      </div>

      <div className="adm-form-title" style={{ marginTop: 20 }}>Social links</div>
      {form.socials.map((soc, i) => (
        <div key={i} style={{ border: '1px solid var(--rule)', padding: 14, marginBottom: 10 }}>
          <div className="adm-grid">
            <AField label="Platform" hint="Facebook, Instagram, LinkedIn or YouTube get their icon automatically; anything else shows a generic link icon.">
              <input className="adm-input" value={soc.label} onChange={e => updateSocial(i, 'label', e.target.value)} />
            </AField>
            <AField label="URL"><input className="adm-input" value={soc.href} onChange={e => updateSocial(i, 'href', e.target.value)} /></AField>
          </div>
          <button type="button" className="adm-action del" onClick={() => removeSocial(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="adm-btn ghost" onClick={addSocial}>+ Add social link</button>

      <SaveBar busy={busy} onSave={save} onReset={reset} />
    </div>
  );
}
