import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, UserX, UserPlus, Building, Briefcase, 
  Search, Shield, Check, X, ShieldAlert, Award, FileText, 
  Calendar, Phone, Mail, ChevronRight, RefreshCw, AlertCircle, 
  Trash2, Edit3, Settings, ClipboardList
} from 'lucide-react';

interface StaffMember {
  id: string;
  employeeId?: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  jobTitle: string;
  role: string;
  departmentId?: string;
  specialization?: string;
  biography?: string;
  skills?: string;
  qualifications?: string;
  certifications?: string;
  dateJoined?: string;
  profilePhotoKey?: string;
  status: string;
  isPublished?: number;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface AuditLog {
  id: string;
  operator_email?: string;
  action?: string;
  details?: string;
  created_at: string;
}

export const AdminStaffManagement: React.FC = () => {
  // State variables
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Member for Modal View/Edit
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Staff Members
      const staffRes = await fetch('/api/staff');
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaffList(staffData);
      } else {
        throw new Error("Failed to retrieve staff directory.");
      }

      // Fetch Departments
      const deptRes = await fetch('/api/departments');
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData);
      }

      // Fetch Audit Logs
      const logsRes = await fetch('/api/staff/logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData);
      }
    } catch (err: any) {
      setError(err.message || "Ecosystem handshake refused.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (staffId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/staff/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          status: newStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Account status updated to ${newStatus} successfully!`);
      fetchInitialData();
      if (selectedMember && selectedMember.id === staffId) {
        setSelectedMember({ ...selectedMember, status: newStatus });
      }
    } catch (err: any) {
      setError(err.message || "Failed to update member status.");
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/staff/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedMember.id,
          employeeId: editEmployeeId,
          jobTitle: editJobTitle,
          role: editRole,
          departmentId: editDeptId,
          status: editStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Ecosystem properties saved and synchronized successfully.");
      setIsEditing(false);
      setSelectedMember(null);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || "Handshake rejected by database nodes.");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!window.confirm("Are you sure you want to completely expunge this staff member profile from the network?")) return;

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/staff?id=${staffId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess("Staff member successfully deleted from ecosystem ledger.");
        setSelectedMember(null);
        fetchInitialData();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Delete command rejected.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (member: StaffMember) => {
    setSelectedMember(member);
    setEditEmployeeId(member.employeeId || '');
    setEditJobTitle(member.jobTitle || '');
    setEditRole(member.role || 'Staff Member');
    setEditDeptId(member.departmentId || '');
    setEditStatus(member.status || 'Active');
    setIsEditing(true);
  };

  const getDepartmentName = (id?: string) => {
    if (!id) return 'Unassigned';
    return departments.find(d => d.id === id)?.name || 'Ecosystem Node';
  };

  // Filter staff list
  const filteredStaff = staffList.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (member.employeeId && member.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !deptFilter || member.departmentId === deptFilter;
    const matchesStatus = !statusFilter || member.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const pendingApprovals = staffList.filter(m => m.status === 'Pending Approval' || m.status === 'Pending');

  return (
    <div className="space-y-8 p-6 bg-[#0a0c10] text-[#f1f3f7] min-h-screen">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f131a] border border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Directory</span>
            <span className="text-3xl font-black">{staffList.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f131a] border border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Pending Review</span>
            <span className={`text-3xl font-black ${pendingApprovals.length > 0 ? 'text-yellow-500' : ''}`}>
              {pendingApprovals.length}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${pendingApprovals.length > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
            <UserPlus size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f131a] border border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Active Employees</span>
            <span className="text-3xl font-black text-emerald-500">
              {staffList.filter(m => m.status === 'Active').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f131a] border border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Suspended Channels</span>
            <span className="text-3xl font-black text-red-500">
              {staffList.filter(m => m.status === 'Suspended').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <UserX size={24} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-xs flex items-center gap-2 border border-red-500/20">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2 border border-emerald-500/20">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Pending Approvals Sub-View */}
      {pendingApprovals.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 space-y-4"
        >
          <div className="flex items-center gap-2 text-yellow-500">
            <ShieldAlert size={20} />
            <h3 className="font-extrabold text-base">Onboarding Registration Requests ({pendingApprovals.length})</h3>
          </div>

          <div className="divide-y divide-gray-800">
            {pendingApprovals.map(req => (
              <div key={req.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#f1f3f7]">{req.fullName}</span>
                    <span className="text-xs text-gray-500">({req.email})</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Position: <span className="font-semibold">{req.jobTitle}</span> • Department: <span className="font-semibold">{getDepartmentName(req.departmentId)}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'Active')}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check size={14} /> Approve & Activate
                  </button>
                  <button 
                    onClick={() => openEditModal(req)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Review details
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main filterable directory area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Staff Directory list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 border-gray-800">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Building size={20} className="text-blue-500" /> Employee Directory Control
            </h3>

            <div className="flex flex-wrap gap-2">
              <input 
                type="text" 
                placeholder="Search name, ID, title, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0f131a] border border-[#1f293d] text-xs px-3 py-1.5 rounded-lg outline-none text-white w-48"
              />
              <select 
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-[#0f131a] border border-[#1f293d] text-xs px-2 py-1.5 rounded-lg outline-none text-white"
              >
                <option value="">All Depts</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0f131a] border border-[#1f293d] text-xs px-2 py-1.5 rounded-lg outline-none text-white"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending Approval">Pending Review</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-3">
              <RefreshCw size={32} className="animate-spin text-blue-500" />
              <span>Querying network nodes...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
              No matching employees registered.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaff.map(member => (
                <div 
                  key={member.id} 
                  className={`p-5 rounded-2xl border transition-all duration-300 ${selectedMember?.id === member.id ? 'border-blue-500 bg-[#0f131a]' : 'border-[#1f293d] bg-[#0f131a]/60 hover:bg-[#0f131a]'}`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-500">
                        {member.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#f1f3f7]">{member.fullName}</span>
                          <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                            {member.employeeId || 'STF-Pending'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 block">{member.jobTitle} • {getDepartmentName(member.departmentId)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : member.status === 'Suspended' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {member.status}
                      </span>
                      <button 
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                        title="Edit Properties"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Security Edit Modal/Panel */}
        <div>
          <AnimatePresence mode="wait">
            {isEditing && selectedMember ? (
              <motion.div 
                key="edit-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 rounded-2xl border border-blue-500/20 bg-[#0f131a] space-y-6"
              >
                <div className="flex justify-between items-center border-b pb-3 border-gray-800">
                  <div>
                    <h4 className="font-extrabold text-sm uppercase text-blue-500">Security Control Console</h4>
                    <span className="text-xs font-bold text-[#f1f3f7]">{selectedMember.fullName}</span>
                  </div>
                  <button onClick={() => { setIsEditing(false); setSelectedMember(null); }} className="text-gray-500 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Employee ID Assignment</label>
                    <input 
                      type="text" 
                      value={editEmployeeId}
                      onChange={(e) => setEditEmployeeId(e.target.value)}
                      placeholder="e.g. STF-2093"
                      className="w-full bg-gray-800 border border-gray-700 text-xs px-3 py-2 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Official Job Title</label>
                    <input 
                      type="text" 
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-xs px-3 py-2 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Ecosystem Security Role</label>
                    <select 
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-xs px-2 py-2 rounded-lg text-white"
                    >
                      <option value="Staff Member">Staff Member</option>
                      <option value="HR Officer">HR Officer</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Head of Department">Head of Department</option>
                      <option value="CEO">CEO</option>
                      <option value="Managing Director">Managing Director</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Ecosystem Department Assignment</label>
                    <select 
                      value={editDeptId}
                      onChange={(e) => setEditDeptId(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-xs px-2 py-2 rounded-lg text-white"
                    >
                      <option value="">Unassigned</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Account Activation Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-xs px-2 py-2 rounded-lg text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    Commit Changes
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="audit-logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl border border-gray-850 bg-[#0f131a] space-y-4"
              >
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-500" /> Recent Security Activity logs
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No logs recorded.</p>
                  ) : (
                    auditLogs.map(log => (
                      <div key={log.id} className="text-[10px] border-b border-dashed border-gray-800 pb-2">
                        <div className="flex justify-between items-center text-gray-500 mb-1">
                          <span className="font-bold">{log.operator_email}</span>
                          <span>{log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}</span>
                        </div>
                        <span className="font-bold uppercase text-[9px] bg-gray-800 text-gray-300 px-1 py-0.2 rounded inline-block mb-1">{log.action}</span>
                        <p className="text-gray-400 mt-0.5">{log.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
