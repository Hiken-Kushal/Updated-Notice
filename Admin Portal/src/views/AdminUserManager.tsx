import React, { useState, useEffect, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import type { AdminUser } from '../services/adminApi';

export const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminApiService.listUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchTerm,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      } else {
        setError(res.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    if (status === 'REJECTED') {
      const user = users.find((candidate) => candidate.id === userId);
      const name = user?.fullName || user?.username || 'this account';
      if (!window.confirm(`Reject the access request for "${name}"?`)) return;
    }

    setActionLoadingId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await AdminApiService.updateUserStatus(userId, status);
      if (res.success) {
        setSuccessMsg(`User status updated to ${status}`);
        await fetchUsers();
      } else {
        setError(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    setActionLoadingId(userId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await AdminApiService.deleteUser(userId);
      if (res.success) {
        setSuccessMsg('User deleted successfully');
        await fetchUsers();
      } else {
        setError(res.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00275a] to-[#003c84] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-amber-400">admin_panel_settings</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Superadmin Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Account Requests & User Management</h1>
          <p className="text-sm text-blue-100/80 mt-1">
            Review pending Admin and Faculty access requests and manage user accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <div className="text-xl font-bold">{totalCount}</div>
            <div className="text-[11px] text-blue-200 uppercase font-medium">Matching Accounts</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#e2e6ec] shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737782] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8fafc] border border-[#e2e6ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003c84]/20 focus:border-[#003c84]"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-[#f8fafc] border border-[#e2e6ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003c84]/20 focus:border-[#003c84] text-[#1c1b1b] font-medium"
          >
            <option value="all">All Roles</option>
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN">Admin</option>
            <option value="FACULTY">Faculty</option>
            <option value="STUDENT">Student</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-[#f8fafc] border border-[#e2e6ec] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003c84]/20 focus:border-[#003c84] text-[#1c1b1b] font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#003c84] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#e2e6ec] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
            <div className="w-8 h-8 border-3 border-[#003c84] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">group_off</span>
            <p className="text-base font-semibold text-gray-700">No users found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1c1b1b]">
              <thead className="bg-[#f8fafc] border-b border-[#e2e6ec] text-[11px] font-bold uppercase tracking-wider text-[#5c6470]">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Request Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e6ec]">
                {users.map((user) => {
                  const isActioning = actionLoadingId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#003c84] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{user.fullName || user.username}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                            <span className="text-[10px] text-gray-400">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-semibold ${
                            user.role === 'SUPERADMIN'
                              ? 'text-purple-800'
                              : user.role === 'ADMIN'
                              ? 'text-blue-800'
                              : user.role === 'FACULTY'
                              ? 'text-amber-800'
                              : 'text-emerald-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Status Badge & Selector */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {user.status || 'APPROVED'}
                          </span>

                          {user.status === 'PENDING' && (
                            <div className="flex items-center gap-1">
                              <button
                                disabled={isActioning}
                                onClick={() => handleStatusChange(user.id, 'APPROVED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                                title="Approve Account"
                              >
                                Approve
                              </button>
                              <button
                                disabled={isActioning}
                                onClick={() => handleStatusChange(user.id, 'REJECTED')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                                title="Reject Account"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4 text-xs text-gray-600">
                        {user.department || <span className="text-gray-400 italic">N/A</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'APPROVED' && (
                            <button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(user.id, 'REJECTED')}
                              className="px-2.5 py-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}

                          {user.status === 'REJECTED' && (
                            <button
                              disabled={isActioning}
                              onClick={() => handleStatusChange(user.id, 'APPROVED')}
                              className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            disabled={isActioning}
                            onClick={() => handleDeleteUser(user.id, user.fullName || user.username)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#e2e6ec] bg-[#f8fafc] flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-800">{page}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({totalCount} total users)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#e2e6ec] rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#e2e6ec] rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
