'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Department, ComplaintCategory } from '@/lib/db/types';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Users,
  ShieldCheck,
  AlertCircle,
  Save,
  Plus,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';

export default function DepartmentsPage() {
  const { user, role, switchDemoUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCategoriesDept, setExpandedCategoriesDept] = useState<string | null>(null);

  // New Department Form State
  const [newDeptForm, setNewDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    sla_days_normal: 7,
    sla_days_high: 3,
    sla_days_emergency: 1,
    icon_name: 'Building2',
  });
  const [creating, setCreating] = useState(false);

  const fetchDeptsAndCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.warn('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptsAndCategories();
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !user) return;
    setSaving(true);

    try {
      const res = await fetch('/api/departments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          id: editingDept.id,
          name: editingDept.name,
          description: editingDept.description,
          sla_days_normal: Number(editingDept.sla_days_normal),
          sla_days_high: Number(editingDept.sla_days_high),
          sla_days_emergency: Number(editingDept.sla_days_emergency),
          is_active: editingDept.is_active,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEditingDept(null);
        await fetchDeptsAndCategories();
      } else {
        alert(json.error || 'Failed to update department');
      }
    } catch (err) {
      alert('Error saving department settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;
    setCreating(true);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(newDeptForm),
      });

      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        setNewDeptForm({
          name: '',
          code: '',
          description: '',
          sla_days_normal: 7,
          sla_days_high: 3,
          sla_days_emergency: 1,
          icon_name: 'Building2',
        });
        await fetchDeptsAndCategories();
      } else {
        alert(json.error || 'Failed to create department');
      }
    } catch (err) {
      alert('Error creating department');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Role notice */}
      {role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>
              You are currently viewing as <strong>{user?.name}</strong> ({role}). Only administrators can edit department configurations.
            </span>
          </div>
          <button
            onClick={() => switchDemoUser('user-admin-1')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer"
          >
            Switch to Admin (Vikramaditya Verma)
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Governance Hierarchy & SLA Controls
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Department Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure municipal departments, review categories and subcategories, and tune statutory SLA redressal timeframes.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-md card-hover cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Department</span>
          </button>
        )}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300">
        <strong>Demonstration Note:</strong> These sample departments demonstrate how Indian municipal corporations manage multi-department SLAs without claiming unverified central government integration.
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading civic departments...
          </div>
        ) : (
          departments.map((dept) => {
            const deptCategories = categories.filter((c) => c.department_id === dept.id);
            const isCatExpanded = expandedCategoriesDept === dept.id;

            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {dept.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {dept.name}
                        </h3>
                        {!dept.is_active && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Officers: {dept.officer_count || 12}</span>
                        <span>•</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          Open Cases: {dept.open_complaints_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {role === 'admin' && (
                    <button
                      onClick={() => setEditingDept(dept)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer"
                      title="Edit department SLA and settings"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {dept.description}
                </p>

                {/* SLA Metrics Pills */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Statutory SLA Deadlines:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      Normal: {dept.sla_days_normal}d
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      High: {dept.sla_days_high}d
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      Emerg: {dept.sla_days_emergency}d
                    </span>
                  </div>
                </div>

                {/* Categories & Subcategories Section */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setExpandedCategoriesDept(isCatExpanded ? null : dept.id)}
                    className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1 cursor-pointer"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <Tag size={13} className="text-blue-600" />
                      <span>Configured Categories ({deptCategories.length})</span>
                    </span>
                    {isCatExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isCatExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                      {deptCategories.length === 0 ? (
                        <p className="text-slate-400 text-[11px]">No specific subcategories registered.</p>
                      ) : (
                        deptCategories.map((cat) => (
                          <div key={cat.id} className="space-y-1">
                            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>{cat.name}</span>
                            </div>
                            {cat.subcategories && cat.subcategories.length > 0 && (
                              <div className="flex flex-wrap gap-1 pl-3">
                                {cat.subcategories.map((sub, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] border border-slate-200 dark:border-slate-700"
                                  >
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Edit Department: {editingDept.name}
              </h2>
              <button
                onClick={() => setEditingDept(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Department Name</label>
                <input
                  type="text"
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editingDept.description}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Normal SLA (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDept.sla_days_normal}
                    onChange={(e) =>
                      setEditingDept({ ...editingDept, sla_days_normal: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">High SLA (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDept.sla_days_high}
                    onChange={(e) =>
                      setEditingDept({ ...editingDept, sla_days_high: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Emerg SLA (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDept.sla_days_emergency}
                    onChange={(e) =>
                      setEditingDept({ ...editingDept, sla_days_emergency: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveDept"
                  checked={editingDept.is_active}
                  onChange={(e) => setEditingDept({ ...editingDept, is_active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="isActiveDept" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Department is currently active and receiving public grievances
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Register New Municipal Department
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urban Forestry"
                    value={newDeptForm.name}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UF"
                    value={newDeptForm.code}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Mandate and scope of service redressal..."
                  value={newDeptForm.description}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Normal (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDeptForm.sla_days_normal}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, sla_days_normal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">High (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDeptForm.sla_days_high}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, sla_days_high: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Emergency (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDeptForm.sla_days_emergency}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, sla_days_emergency: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
