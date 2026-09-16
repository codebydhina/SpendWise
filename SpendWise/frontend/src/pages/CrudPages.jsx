import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
} from 'recharts';

/* ── shared helpers ─────────────────────────────── */
const money = v => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const PIE_COLORS = ['#0f766e', '#f59e0b', '#e76f51', '#2563eb', '#8b5cf6', '#14b8a6', '#ef4444', '#64748b', '#f43f5e', '#10b981'];

function Spinner() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#70827d', fontSize: 14 }}>
      <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e2e9e4', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ marginTop: 12 }}>Loading data…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="error" style={{ margin: '24px 0' }}>
      ⚠ {msg || 'Something went wrong. Please try again.'}
    </div>
  );
}

/* Custom tooltip for charts */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e9e4', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,.08)' }}>
      <p style={{ margin: 0, color: '#70827d', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: '4px 0 0', color: '#0f766e', fontWeight: 700 }}>{money(payload[0].value)}</p>
    </div>
  );
}

/* ── AddExpense ─────────────────────────────────── */
export function AddExpense() {
  return (
    <>
      <div className="eyebrow">Record transaction</div>
      <div className="pagehead">
        <div>
          <h1>Add New Expense</h1>
          <p>Record a transaction and keep your budget on track.</p>
        </div>
        <Link className="secondary" to="/expenses">← Back to list</Link>
      </div>
      <div className="panel">
        <ExpenseForm />
      </div>
    </>
  );
}

/* ── EditExpense ────────────────────────────────── */
export function EditExpense() {
  const { id } = useParams();
  const [x, setX] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`expenses/${id}/`)
      .then(r => setX(r.data))
      .catch(() => setErr('Could not load expense. It may have been deleted.'));
  }, [id]);

  return (
    <>
      <div className="pagehead">
        <h1>Edit Expense</h1>
        <Link className="secondary" to={`/expenses/${id}`}>Cancel</Link>
      </div>
      <div className="panel">
        {err ? <ErrorBox msg={err} /> : x ? <ExpenseForm initial={x} /> : <Spinner />}
      </div>
    </>
  );
}

/* ── Details ────────────────────────────────────── */
export function Details() {
  const { id } = useParams();
  const nav = useNavigate();
  const [x, setX] = useState(null);
  const [err, setErr] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`expenses/${id}/`)
      .then(r => setX(r.data))
      .catch(() => setErr('Could not load this expense.'));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this expense?')) return;
    setDeleting(true);
    try {
      await api.delete(`expenses/${id}/`);
      nav('/expenses');
    } catch {
      setErr('Delete failed. Please try again.');
      setDeleting(false);
    }
  };

  if (err) return <ErrorBox msg={err} />;
  if (!x) return <Spinner />;

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="eyebrow">Expense detail</div>
          <h1>{x.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="secondary" to="/expenses">← Back</Link>
          <Link className="primary" to={`/expenses/${id}/edit`}>Edit</Link>
          <button
            style={{ border: 0, borderRadius: 9, padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            onClick={handleDelete} disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      <div className="panel detail">
        <div><span>Amount</span><b>{money(x.amount)}</b></div>
        <div><span>Category</span><b>{x.category}</b></div>
        <div><span>Payment Method</span><b>{x.payment_method}</b></div>
        <div><span>Date</span><b>{x.date}</b></div>
        <div><span>Added on</span><b>{new Date(x.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</b></div>
        <div><span>Notes</span><b>{x.notes || '—'}</b></div>
      </div>
    </>
  );
}

/* ── Categories ─────────────────────────────────── */
export function Categories() {
  const [catStats, setCatStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('expenses/category-stats/')
      .then(r => setCatStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills & Utilities', 'Health', 'Travel', 'Subscriptions', 'Other'];
  const statMap = Object.fromEntries(catStats.map(s => [s.label, s.total]));

  return (
    <>
      <div className="eyebrow">Spending groups</div>
      <div className="pagehead herohead">
        <div>
          <h1>Categories</h1>
          <p>Your spending groups, calculated from real transactions.</p>
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="cards">
          {categories.map((x, i) => (
            <div className="panel" key={x} style={{ borderTop: `3px solid ${PIE_COLORS[i % PIE_COLORS.length]}` }}>
              <h3>{x}</h3>
              <p style={{ color: '#70827d', fontSize: 13, margin: '8px 0 14px' }}>
                {statMap[x] ? money(statMap[x]) : 'No spend yet'}
              </p>
              <Link to={`/expenses?category=${encodeURIComponent(x)}`} style={{ fontSize: 13, color: '#0f766e', fontWeight: 700 }}>
                View expenses →
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Budget ─────────────────────────────────────── */
export function Budget() {
  const [b, setB] = useState(null);
  const [s, setS] = useState({});
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('budget/'), api.get('expenses/stats/')])
      .then(([a, c]) => {
        const bdata = (a.data.results || a.data)[0] || null;
        setB(bdata);
        setAmount(bdata ? bdata.amount : '');
        setS(c.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!amount) return;
    setSaving(true); setMsg('');
    try {
      const data = { month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount };
      if (b) await api.put(`budget/${b.id}/`, data);
      else await api.post('budget/', data);
      setMsg('Budget saved!');
      load();
    } catch (e) {
      setMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pct = b ? Math.min(100, ((s.monthly_expenses || 0) / b.amount) * 100) : 0;

  return (
    <>
      <div className="eyebrow">Monthly guardrail</div>
      <div className="pagehead herohead">
        <div><h1>Budget Management</h1><p>Set your monthly spending limit and track progress.</p></div>
      </div>
      {loading ? <Spinner /> : (
        <div className="panel budget">
          <h3>Monthly Budget</h3>
          <strong>{money(b?.amount || 0)}</strong>
          <p>Spent {money(s.monthly_expenses || 0)} · Remaining {money(s.remaining || 0)}</p>
          <div className="progress"><i style={{ width: `${pct}%`, background: pct > 90 ? '#ef4444' : '#0f766e' }} /></div>
          <p style={{ fontSize: 12, color: '#70827d', marginTop: 6 }}>{Math.round(pct)}% of budget used this month</p>
          <div className="inline">
            <input
              type="number" placeholder="Enter new budget amount" value={amount}
              onChange={e => setAmount(e.target.value)} min="1" step="100"
            />
            <button className="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : b ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
          {msg && <p style={{ marginTop: 12, fontSize: 12, color: msg.includes('Failed') ? '#b91c1c' : '#0f766e', fontWeight: 700 }}>{msg}</p>}
        </div>
      )}
    </>
  );
}

/* ── Analytics ──────────────────────────────────── */
export function Analytics() {
  const [catData, setCatData] = useState([]);
  const [payData, setPayData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('expenses/category-stats/'),
      api.get('expenses/payment-stats/'),
      api.get('expenses/monthly-stats/'),
      api.get('expenses/stats/'),
    ])
      .then(([a, b, d, s]) => {
        setCatData(a.data);
        setPayData(b.data);
        setMonthData(d.data);
        setStats(s.data);
      })
      .catch(() => setError('Failed to load analytics. Make sure you are logged in.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><div className="eyebrow">Insights</div><h1>Analytics</h1><Spinner /></>;
  if (error) return <><h1>Analytics</h1><ErrorBox msg={error} /></>;

  const totalCat = catData.reduce((s, x) => s + x.total, 0);

  return (
    <>
      <div className="eyebrow">Insights</div>
      <div className="pagehead herohead">
        <div>
          <h1>Analytics</h1>
          <p>A deep look at where your money goes.</p>
        </div>
        <Link className="secondary" to="/expenses/add"><span>+</span> Add expense</Link>
      </div>

      {/* Summary cards */}
      <div className="stats" style={{ marginBottom: 22 }}>
        {[
          ['Total spent', stats.total_expenses, '#0f766e'],
          ['This month', stats.monthly_expenses, '#f59e0b'],
          ['Monthly budget', stats.budget, '#2563eb'],
          ['Remaining', stats.remaining, stats.remaining < 0 ? '#ef4444' : '#10b981'],
        ].map(([label, val, color]) => (
          <div className="panel" key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#70827d', fontWeight: 700, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{money(val)}</div>
          </div>
        ))}
      </div>

      {/* Monthly Area Chart */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="paneltitle">
          <div>
            <span className="sectionkicker">Trend</span>
            <h3>Monthly Spending</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e9e4" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#70827d' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#70827d' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="total" stroke="#0f766e" strokeWidth={2.5} fill="url(#tealGrad)" dot={{ fill: '#0f766e', r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="charts" style={{ marginBottom: 18 }}>
        {/* Category Bar Chart */}
        <div className="panel">
          <div className="paneltitle">
            <div>
              <span className="sectionkicker">Where it goes</span>
              <h3>Spending by Category</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={catData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#70827d' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#18312f' }} width={110} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={16}>
                {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Pie Chart */}
        <div className="panel">
          <div className="paneltitle">
            <div>
              <span className="sectionkicker">How you pay</span>
              <h3>Payment Method Split</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={payData} dataKey="total" nameKey="label"
                cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3}
              >
                {payData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => money(v)} />
              <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#18312f' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="panel">
        <div className="paneltitle">
          <div>
            <span className="sectionkicker">Full breakdown</span>
            <h3>Category Summary</h3>
          </div>
        </div>
        {catData.map((x, i) => {
          const pct = totalCat ? (x.total / totalCat) * 100 : 0;
          return (
            <div key={x.label} style={{ padding: '12px 0', borderBottom: '1px solid #edf1ee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                  <b>{x.label}</b>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ fontSize: 13 }}>{money(x.total)}</b>
                  <span style={{ fontSize: 11, color: '#70827d', marginLeft: 8 }}>{pct.toFixed(1)}%</span>
                </div>
              </div>
              <div style={{ height: 5, background: '#e2e9e4', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 4 }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Simple fallback ────────────────────────────── */
export function Simple({ title, text }) {
  return (
    <>
      <h1>{title}</h1>
      <div className="panel"><p>{text}</p></div>
    </>
  );
}
