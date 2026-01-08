import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getUsers, updateUser, deleteUser } from '../api/auth';
import bgImage from '../assets/Images/page2-bg.jpg';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Admin state
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const response = await getProfile();
                setUser(response.data);
                // Check if user is admin (is_staff or is_superuser)
                setIsAdmin(response.data.is_staff || response.data.is_superuser);
            } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // Fetch users when admin and search changes
    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, searchQuery]);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await getUsers(searchQuery);
            setUsers(response.data.users || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load users.' });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleEditClick = (userToEdit) => {
        setEditingUser(userToEdit);
        setEditForm({
            username: userToEdit.username,
            email: userToEdit.email,
            first_name: userToEdit.first_name,
            last_name: userToEdit.last_name,
            is_active: userToEdit.is_active,
            is_staff: userToEdit.is_staff,
        });
        setMessage({ type: '', text: '' });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(editingUser.id, editForm);
            setMessage({ type: 'success', text: 'User updated successfully!' });
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            const errorMsg = err.response?.data?.error ||
                Object.values(err.response?.data || {}).flat().join(', ') ||
                'Failed to update user.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleDeleteUser = async (userToDelete) => {
        if (!window.confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) {
            return;
        }
        try {
            await deleteUser(userToDelete.id);
            setMessage({ type: 'success', text: `User "${userToDelete.username}" deleted successfully!` });
            fetchUsers();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to delete user.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-green-700 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Dashboard Content */}
            <div className="relative z-10 min-h-screen p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full ${isAdmin ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-green-400 to-emerald-600'} flex items-center justify-center shadow-lg`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isAdmin ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                )}
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
                                {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                            </h1>
                            <p className="text-white/80 text-sm">
                                {isAdmin ? 'Manage users and system' : 'Welcome to your space'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="px-5 py-2.5 bg-white/20 hover:bg-red-500/80 backdrop-blur-md border border-white/30 text-white font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 hover:scale-105">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`max-w-6xl mx-auto mb-4 p-4 rounded-xl backdrop-blur-sm ${message.type === 'success' ? 'bg-green-500/30 border border-green-400' : 'bg-red-500/30 border border-red-400'}`}>
                        <p className="text-white">{message.text}</p>
                    </div>
                )}

                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Welcome Card */}
                    <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-xl">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className={`w-20 h-20 ${isAdmin ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-green-400 to-emerald-600'} rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0`}>
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-3xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
                                    Hello, {user?.username || 'Friend'}!
                                </h2>
                                <p className="text-white/80">
                                    {isAdmin ? 'You have admin privileges' : 'Your journey continues here'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Card (for both admin and regular users) */}
                    <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/40">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>Profile Details</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <ProfileCard label="User ID" value={user?.id || 'N/A'} icon="🆔" />
                            <ProfileCard label="Username" value={user?.username || 'N/A'} icon="👤" />
                            <ProfileCard label="Email" value={user?.email || 'N/A'} icon="📧" />
                            <ProfileCard label="First Name" value={user?.first_name || 'N/A'} icon="✨" />
                            <ProfileCard label="Last Name" value={user?.last_name || 'N/A'} icon="🌟" />
                            <ProfileCard label="Status" value="Active" icon="🌿" isStatus />
                        </div>
                    </div>

                    {/* Admin Panel - User Management */}
                    {isAdmin && (
                        <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/40">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                                        User Management
                                    </h3>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="w-full sm:w-64 px-4 py-2 pl-10 bg-white/70 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Users Table */}
                            {usersLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-gray-600 border-b border-gray-200">
                                                <th className="pb-3 px-2">ID</th>
                                                <th className="pb-3 px-2">Username</th>
                                                <th className="pb-3 px-2 hidden sm:table-cell">Email</th>
                                                <th className="pb-3 px-2 hidden md:table-cell">Name</th>
                                                <th className="pb-3 px-2">Status</th>
                                                <th className="pb-3 px-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                                                    <td className="py-3 px-2 text-gray-800">{u.id}</td>
                                                    <td className="py-3 px-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-gray-800">{u.username}</span>
                                                            {u.is_staff && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Staff</span>}
                                                            {u.is_superuser && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Super</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">{u.email}</td>
                                                    <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{u.full_name || '-'}</td>
                                                    <td className="py-3 px-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {u.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditClick(u)}
                                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            {!u.is_superuser && u.id !== user?.id && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(u)}
                                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {users.length === 0 && (
                                        <p className="text-center py-8 text-gray-500">No users found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editForm.username || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={editForm.first_name || ''}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={editForm.last_name || ''}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={editForm.is_active || false}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_staff"
                                        checked={editForm.is_staff || false}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Staff</span>
                                </label>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Profile Card Component
const ProfileCard = ({ label, value, icon, isStatus }) => (
    <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
        <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
        {isStatus ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {value}
            </span>
        ) : (
            <p className="text-lg font-semibold text-gray-800 truncate group-hover:text-emerald-600 transition-colors">{value}</p>
        )}
    </div>
);

export default Dashboard;
