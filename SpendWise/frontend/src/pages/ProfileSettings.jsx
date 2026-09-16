import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Receipt, TrendingUp, Edit3, Check, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const money = v => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function Spinner() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#70827d' }}>
      <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e2e9e4', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ marginTop: 12, fontSize: 14 }}>Loading profile…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Inline editable field ────────────────────────── */
function EditableField({ label, value, onSave, type = 'text' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={{ borderBottom: '1px solid #edf1ee', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 140 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: '#70827d', fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {editing ? (
          <input
            type={type}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            style={{ border: '1px solid #67ae99', borderRadius: 7, padding: '8px 10px', fontSize: 14, color: '#18312f', outline: 'none', width: '100%', boxShadow: '0 0 0 3px #dff2e9' }}
          />
        ) : (
          <div style={{ fontSize: 15, color: '#18312f', fontWeight: 600 }}>{value || <span style={{ color: '#9aa9a4', fontStyle: 'italic' }}>Not set</span>}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {editing ? (
          <>
            <button onClick={handleSave} disabled={saving} style={{ border: 0, background: '#dcefe8', color: '#0f766e', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
              <Check size={14} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setDraft(value); setEditing(false); }} style={{ border: 0, background: '#fee2e2', color: '#b91c1c', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <X size={14} />
            </button>
          </>
        ) : (
          <button onClick={() => { setDraft(value); setEditing(true); }} style={{ border: 0, background: 'none', color: '#9aa9a4', cursor: 'pointer', padding: '6px', borderRadius: 7, display: 'flex', alignItems: 'center' }} title="Edit">
            <Edit3 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════════════ */
export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('auth/me/')
      .then(r => setProfile(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateField = async (field, value) => {
    try {
      const r = await api.patch('auth/me/update/', { [field]: value });
      setProfile(prev => ({ ...prev, ...r.data, full_name: `${r.data.first_name} ${r.data.last_name}`.trim() || r.data.username }));
      setMsg('✓ Profile updated');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('✗ Failed to update. Try again.');
      setTimeout(() => setMsg(''), 4000);
    }
  };

  if (loading) return <><div className="eyebrow">Your account</div><h1>Profile</h1><Spinner /></>;

  const initials = (profile?.full_name || profile?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <div className="eyebrow">Your account</div>
      <div className="pagehead herohead">
        <div><h1>Profile</h1><p>Manage your personal information and account details.</p></div>
      </div>

      {msg && (
        <div style={{ marginBottom: 18, padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✓') ? '#dcefe8' : '#fee2e2', color: msg.startsWith('✓') ? '#0b4f4a' : '#b91c1c', fontSize: 13, fontWeight: 700 }}>
          {msg}
        </div>
      )}

      {/* Avatar + name hero */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 18, background: 'linear-gradient(135deg,#0b4f4a 0%,#0f766e 100%)', color: '#fff', border: 0 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f5b942', color: '#24443e', display: 'grid', placeItems: 'center', fontSize: 26, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{profile?.full_name || profile?.username}</div>
          <div style={{ fontSize: 13, color: '#94beb0', marginTop: 4 }}>@{profile?.username}</div>
          <div style={{ fontSize: 12, color: '#77d6af', marginTop: 6 }}>Member since {profile?.date_joined}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{profile?.expense_count}</div>
            <div style={{ fontSize: 11, color: '#94beb0', marginTop: 2 }}>Expenses</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{money(profile?.total_spent)}</div>
            <div style={{ fontSize: 11, color: '#94beb0', marginTop: 2 }}>Total Spent</div>
          </div>
        </div>
      </div>

      {/* Editable info */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 4 }}>Personal Information</h3>
        <p style={{ color: '#70827d', fontSize: 13, marginTop: 0, marginBottom: 8 }}>Click the pencil icon to edit any field.</p>

        <EditableField label="First Name" value={profile?.first_name || ''} onSave={v => updateField('first_name', v)} />
        <EditableField label="Last Name" value={profile?.last_name || ''} onSave={v => updateField('last_name', v)} />
        <EditableField label="Email Address" value={profile?.email || ''} onSave={v => updateField('email', v)} type="email" />

        <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: '#70827d', fontWeight: 700, marginBottom: 4 }}>Username</div>
            <div style={{ fontSize: 15, color: '#18312f', fontWeight: 600 }}>{profile?.username}</div>
          </div>
          <span style={{ fontSize: 11, color: '#9aa9a4', background: '#f3f7f5', padding: '4px 10px', borderRadius: 20 }}>Cannot change</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="panel">
        <h3 style={{ marginBottom: 16 }}>Account Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            [Receipt, 'Total Expenses', profile?.expense_count + ' transactions', '#0f766e', '#dcefe8'],
            [TrendingUp, 'Total Spent', money(profile?.total_spent), '#f59e0b', '#fef3c7'],
            [Calendar, 'Member Since', profile?.date_joined, '#2563eb', '#eff6ff'],
          ].map(([Icon, label, val, color, bg]) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <Icon size={20} style={{ color, marginBottom: 8 }} />
              <div style={{ fontSize: 11, color: '#70827d', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#18312f', marginTop: 4, fontFamily: "'Space Grotesk',sans-serif" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════════════════ */
export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Password change state
  const [pw, setPw] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Appearance
  const [theme] = useState('Light');
  const [currency] = useState('INR (₹)');

  const changePassword = async e => {
    e.preventDefault();
    setPwMsg('');
    if (pw.new_password !== pw.confirm) {
      setPwMsg('✗ New passwords do not match.');
      return;
    }
    if (pw.new_password.length < 6) {
      setPwMsg('✗ Password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await api.post('auth/change-password/', { old_password: pw.old_password, new_password: pw.new_password });
      setPwMsg('✓ Password changed successfully!');
      setPw({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwMsg('✗ ' + (err.response?.data?.error || 'Failed to change password.'));
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <div className="eyebrow">Preferences</div>
      <div className="pagehead herohead">
        <div><h1>Settings</h1><p>Manage your account security and app preferences.</p></div>
      </div>

      {/* Security */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#dcefe8', display: 'grid', placeItems: 'center', color: '#0f766e' }}>
            🔒
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Security</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#70827d' }}>Update your password to keep your account safe.</p>
          </div>
        </div>

        <form onSubmit={changePassword} style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
          {[
            ['old_password', 'Current Password'],
            ['new_password', 'New Password'],
            ['confirm', 'Confirm New Password'],
          ].map(([key, label]) => (
            <label key={key} style={{ fontWeight: 700, fontSize: 12, color: '#70827d', display: 'grid', gap: 7 }}>
              {label}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw[key]}
                  onChange={e => setPw({ ...pw, [key]: e.target.value })}
                  required
                  style={{ width: '100%', border: '1px solid #e2e9e4', background: '#fcfdfc', borderRadius: 8, padding: '11px 40px 11px 12px', color: '#18312f', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </label>
          ))}

          <label style={{ fontSize: 12, color: '#70827d', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox" checked={showPw} onChange={() => setShowPw(p => !p)} style={{ width: 'auto' }} />
            Show passwords
          </label>

          {pwMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, background: pwMsg.startsWith('✓') ? '#dcefe8' : '#fee2e2', color: pwMsg.startsWith('✓') ? '#0b4f4a' : '#b91c1c' }}>
              {pwMsg}
            </div>
          )}

          <div>
            <button type="submit" className="primary" disabled={pwLoading} style={{ minWidth: 160 }}>
              {pwLoading ? 'Updating…' : '🔑 Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* App preferences */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>⚙️</div>
          <div>
            <h3 style={{ margin: 0 }}>App Preferences</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#70827d' }}>Customize how SpendWise looks and works.</p>
          </div>
        </div>

        {[
          ['Theme', theme, '🌤', 'Light mode is active. Dark mode coming soon.'],
          ['Currency', currency, '💱', 'Default currency for displaying amounts.'],
          ['Language', 'English', '🌐', 'Interface language.'],
          ['Date Format', 'DD/MM/YYYY', '📅', 'Format used throughout the app.'],
        ].map(([label, val, icon, hint]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #edf1ee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#18312f' }}>{label}</div>
                <div style={{ fontSize: 11, color: '#9aa9a4', marginTop: 2 }}>{hint}</div>
              </div>
            </div>
            <span style={{ fontSize: 12, background: '#f3f7f5', color: '#0f766e', padding: '5px 12px', borderRadius: 20, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef3c7', display: 'grid', placeItems: 'center' }}>🔔</div>
          <div>
            <h3 style={{ margin: 0 }}>Notifications</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#70827d' }}>Choose what alerts you'd like to receive.</p>
          </div>
        </div>
        {[
          ['Budget alerts', 'Notify when spending exceeds 80% of budget', true],
          ['Monthly summary', 'Receive a monthly spending report', true],
          ['New expense reminders', 'Daily reminder to log expenses', false],
        ].map(([label, hint, def]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #edf1ee' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#18312f' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#9aa9a4', marginTop: 2 }}>{hint}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={def} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} onChange={() => {}} />
              <span style={{ position: 'absolute', inset: 0, background: def ? '#0f766e' : '#dce8df', borderRadius: 24, transition: '.3s' }}>
                <span style={{ position: 'absolute', width: 18, height: 18, top: 3, left: def ? 23 : 3, background: '#fff', borderRadius: '50%', transition: '.3s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="panel" style={{ border: '1px solid #fecaca' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fee2e2', display: 'grid', placeItems: 'center' }}>⚠️</div>
          <div>
            <h3 style={{ margin: 0, color: '#b91c1c' }}>Danger Zone</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#70827d' }}>Irreversible account actions.</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', borderRadius: 9, padding: '11px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          🚪 Sign out of SpendWise
        </button>
      </div>
    </>
  );
}

