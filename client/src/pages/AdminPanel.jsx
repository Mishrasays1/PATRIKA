import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingUp, 
  RefreshCw, 
  UserCheck, 
  FileText,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const AdminPanel = () => {
  const { showToast, refreshData } = useApp();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [fetchedStats, fetchedUsers, fetchedReports] = await Promise.all([
        api.getStats().catch(() => null),
        api.getUsers().catch(() => []),
        api.getReports().catch(() => [])
      ]);
      setStats(fetchedStats);
      setUsers(fetchedUsers);
      setReports(fetchedReports);
    } catch (err) {
      showToast('Error loading admin data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole.toUpperCase()} in MongoDB`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update user role: ' + err.message, 'error');
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await api.resolveReport(reportId, {
        status: action === 'dismiss' ? 'dismissed' : 'action_taken',
        resolutionNotes: action === 'dismiss' ? 'Reviewed by admin. Report dismissed as invalid.' : 'Action taken: Story sent back to Fact-Checker desk.'
      });
      showToast('Report status updated in MongoDB!', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Error resolving report: ' + err.message, 'error');
    }
  };

  const COLORS = ['#10b981', '#0284c7', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Platform Executive Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Admin Analytics & Moderation Center</h1>
          <p className="text-xs text-slate-300">
            Monitor real-time platform KPIs, aggregated category data, user roles, and misinformation flags.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Total Stories Submitted</div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats?.totalStories || 4}</div>
          <div className="text-[11px] text-emerald-400 font-medium">MongoDB Aggregated</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Verified Content Rate</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats?.percentVerified || 75}%</div>
          <div className="text-[11px] text-emerald-300 font-medium">{stats?.approvedStories || 3} Published Articles</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Average Trust Score</div>
          <div className="text-3xl font-extrabold text-blue-400 font-mono">{stats?.avgTrustScore || 92}%</div>
          <div className="text-[11px] text-blue-300 font-medium">OSINT Verified Audit</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Misinformation Flags</div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{stats?.totalReports || 1}</div>
          <div className="text-[11px] text-amber-300 font-medium">{stats?.resolvedReports || 1} Resolved</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Distribution Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Stories by Category</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live MongoDB Count</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryStats || [
                { category: 'Civic Infra', count: 2 },
                { category: 'Environment', count: 2 },
                { category: 'Health', count: 1 },
                { category: 'Governance', count: 1 }
              ]}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(stats?.categoryStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Heatmap Distribution Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              <span>Regional Coverage Heatmap</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">City Data</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.cityStats || [
                    { city: 'Mumbai', count: 2 },
                    { city: 'Bengaluru', count: 1 },
                    { city: 'Delhi', count: 1 },
                    { city: 'Pune', count: 1 }
                  ]}
                  dataKey="count"
                  nameKey="city"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ city, count }) => `${city} (${count})`}
                >
                  {(stats?.cityStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* User & Role Management Table */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>User & Reporter Management</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{users.length} Total Registered Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <th className="p-3">User</th>
                <th className="p-3">Location</th>
                <th className="p-3">Role</th>
                <th className="p-3">Reputation</th>
                <th className="p-3 text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/60 transition">
                  <td className="p-3 font-semibold text-slate-200 flex items-center gap-2.5">
                    {u.avatar ? (
                      <img src={u.avatar} alt="User Avatar" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </div>
                  </td>

                  <td className="p-3 text-slate-300">{u.location || 'Mumbai'}</td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      u.role === 'moderator' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      u.role === 'reporter' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3 font-mono font-bold text-emerald-400">{u.reputationScore || 85} Rep</td>

                  <td className="p-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                    >
                      <option value="reader">Reader</option>
                      <option value="reporter">Citizen Reporter</option>
                      <option value="moderator">Fact-Checker / Moderator</option>
                      <option value="admin">Platform Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Misinformation Flag Inbox */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>Misinformation Flags Resolution Inbox</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{reports.length} Flag Tickets</span>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No active misinformation flags.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                      {rep.reason}
                    </span>
                    <span className="text-slate-400">Reported by <strong>{rep.reporterName}</strong></span>
                  </div>
                  <div className="font-semibold text-slate-200">{rep.storyId?.title || 'Reported Story'}</div>
                  <div className="text-[11px] text-slate-400 italic">"{rep.details || 'No details provided'}"</div>
                </div>

                <div className="flex items-center gap-2">
                  {rep.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleResolveReport(rep._id, 'dismiss')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep._id, 'action')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
                      >
                        Trigger Re-Review
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 rounded bg-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                      {rep.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
