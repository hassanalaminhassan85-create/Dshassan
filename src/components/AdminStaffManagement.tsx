import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, UserX, UserPlus, Building, Briefcase, 
  Search, Shield, Check, X, ShieldAlert, Award, FileText, 
  Calendar, Phone, Mail, ChevronRight, RefreshCw, AlertCircle, 
  Trash2, Edit3, Settings, ClipboardList, Upload, Plus
} from 'lucide-react';
import { apiSaveStaff, apiUploadStaffFile, resolveStaffImageUrl } from '../lib/api';

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
  status: 'Active' | 'Pending' | 'On Leave' | 'Suspended' | 'Archived';
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

  // Add Staff Modal State
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('Senior Security Architect');
  const [newRole, setNewRole] = useState('Staff Member');
  const [newDeptId, setNewDeptId] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newBiography, setNewBiography] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newQualifications, setNewQualifications] = useState('');
  const [newCertifications, setNewCertifications] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        if (deptData.length > 0 && !newDeptId) {
          setNewDeptId(deptData[0].id);
        }
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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      setError("Full Name and Email are required to register staff.");
      return;
    }

    setError(null);
    setSuccess(null);
    setUploadingImage(true);

    try {
      let profilePhotoKey = '';
      if (newFile) {
        const uploadRes = await apiUploadStaffFile(newFile);
        if (uploadRes && uploadRes.success) {
          profilePhotoKey = uploadRes.r2_object_key;
        }
      }

      const payload = {
        fullName: newFullName,
        email: newEmail,
        phone: newPhone,
        jobTitle: newJobTitle || 'Software Engineer',
        role: newRole || 'Staff Member',
        departmentId: newDeptId || null,
        specialization: newSpecialization,
        biography: newBiography,
        skills: newSkills,
        qualifications: newQualifications,
        certifications: newCertifications,
        employeeId: newEmployeeId || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
        profilePhotoKey,
        status: 'Active' as StaffMember['status'],
        isPublished: 1
      };

      const res = await apiSaveStaff(payload);
      if (res && res.success) {
        setSuccess(`Staff member ${newFullName} successfully added and synchronized with 'Meet Our Team' roster!`);
        setIsAddingStaff(false);
        // Reset form
        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
        setNewJobTitle('Senior Security Architect');
        setNewRole('Staff Member');
        setNewSpecialization('');
        setNewBiography('');
        setNewSkills('');
        setNewQualifications('');
        setNewCertifications('');
        setNewEmployeeId('');
        setNewFile(null);
        fetchInitialData();
      } else {
        throw new Error("Failed to save staff record.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create staff member.");
    } finally {
      setUploadingImage(false);
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
    <div className="space-y-8 p-6 bg-white dark:bg-[#0a0c10] text-slate-900 dark:text-[#f1f3f7] min-h-screen">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0f131a] border border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider block">Total Directory</span>
            <span className="text-3xl font-black">{staffList.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0f131a] border border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider block">Pending Review</span>
            <span className={`text-3xl font-black ${pendingApprovals.length > 0 ? 'text-yellow-500' : ''}`}>
              {pendingApprovals.length}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${pendingApprovals.length > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
            <UserPlus size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0f131a] border border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider block">Active Employees</span>
            <span className="text-3xl font-black text-emerald-500">
              {staffList.filter(m => m.status === 'Active').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0f131a] border border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider block">Suspended Channels</span>
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
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
            <ShieldAlert size={20} />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Onboarding Registration Requests ({pendingApprovals.length})</h3>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-gray-800">
            {pendingApprovals.map(req => (
              <div key={req.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-[#f1f3f7]">{req.fullName}</span>
                    <span className="text-xs text-slate-500 dark:text-gray-500">({req.email})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
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
                    className="bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-[#0f131a] p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Building size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Employee Directory Control</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Manage team dossiers, department assignments, and public roster sync.</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingStaff(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg"
          >
            <Plus size={16} /> Add New Team Member
          </button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Staff Directory list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 border-slate-200 dark:border-gray-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Registered Staff Roster ({filteredStaff.length})
            </h3>

            <div className="flex flex-wrap gap-2">
              <input 
                type="text" 
                placeholder="Search name, ID, title, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-[#0f131a] border border-slate-300 dark:border-[#1f293d] text-xs px-3 py-1.5 rounded-lg outline-none text-slate-900 dark:text-white w-48"
              />
              <select 
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-white dark:bg-[#0f131a] border border-slate-300 dark:border-[#1f293d] text-xs px-2 py-1.5 rounded-lg outline-none text-slate-900 dark:text-white"
              >
                <option value="">All Depts</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-[#0f131a] border border-slate-300 dark:border-[#1f293d] text-xs px-2 py-1.5 rounded-lg outline-none text-slate-900 dark:text-white"
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
                  className={`p-5 rounded-2xl border transition-all duration-300 ${selectedMember?.id === member.id ? 'border-blue-500 bg-slate-100 dark:bg-[#0f131a]' : 'border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#0f131a]/60 hover:bg-slate-50 dark:hover:bg-[#0f131a]'}`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-500">
                        {member.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-[#f1f3f7]">{member.fullName}</span>
                          <span className="text-[10px] bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                            {member.employeeId || 'STF-Pending'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-500 block">{member.jobTitle} • {getDepartmentName(member.departmentId)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : member.status === 'Suspended' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
                        {member.status}
                      </span>
                      <button 
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-gray-800 hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 transition-colors"
                        title="Edit Properties"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 transition-colors"
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

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f131a] border border-[#1f293d] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b pb-4 border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Add New Team Member & Dossier</h3>
                    <p className="text-xs text-gray-400">Syncs immediately to 'Meet Our Team' home navigation.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddingStaff(false)}
                  className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="e.g. Dr. Samuel Vance"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. s.vance@dstech.org"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Phone Number</label>
                    <input 
                      type="text" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Employee ID</label>
                    <input 
                      type="text" 
                      value={newEmployeeId}
                      onChange={(e) => setNewEmployeeId(e.target.value)}
                      placeholder="e.g. STF-2026-09"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Job Title</label>
                    <input 
                      type="text" 
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="e.g. Senior Security Architect"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Organizational Role</label>
                    <select 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    >
                      <option value="Staff Member">Staff Member</option>
                      <option value="Department Head">Department Head (HOD)</option>
                      <option value="CEO">CEO</option>
                      <option value="HR Officer">HR Officer</option>
                      <option value="Senior Specialist">Senior Specialist</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Assigned Department</label>
                    <select 
                      value={newDeptId}
                      onChange={(e) => setNewDeptId(e.target.value)}
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1 text-gray-300">Area of Specialization</label>
                  <input 
                    type="text" 
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="e.g. Zero Trust Architecture & Cloud Encryption"
                    className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1 text-gray-300">Profile Image (Upload Photo)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2 rounded-xl text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                    />
                  </div>
                  {newFile && (
                    <span className="text-[10px] text-emerald-400 mt-1 block">Selected file: {newFile.name}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1 text-gray-300">Full Personal Biography</label>
                  <textarea 
                    rows={3}
                    value={newBiography}
                    onChange={(e) => setNewBiography(e.target.value)}
                    placeholder="Detailed background summary, academic history, and professional achievements..."
                    className="w-full bg-[#161c28] border border-[#27354f] text-xs p-3 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Core Skills (comma-separated)</label>
                    <input 
                      type="text" 
                      value={newSkills}
                      onChange={(e) => setNewSkills(e.target.value)}
                      placeholder="React, TypeScript, Cloudflare, Python"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Academic Qualifications</label>
                    <input 
                      type="text" 
                      value={newQualifications}
                      onChange={(e) => setNewQualifications(e.target.value)}
                      placeholder="M.Sc Computer Science"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-300">Professional Certifications</label>
                    <input 
                      type="text" 
                      value={newCertifications}
                      onChange={(e) => setNewCertifications(e.target.value)}
                      placeholder="CISSP, AWS Certified Architect"
                      className="w-full bg-[#161c28] border border-[#27354f] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                  <button 
                    type="button"
                    onClick={() => setIsAddingStaff(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Uploading & Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save & Publish Staff</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
