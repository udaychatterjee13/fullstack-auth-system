import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import bgImage from '../assets/Images/page2-bg.jpg';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name] || errors.general) {
            setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Please enter your username';
        if (!formData.password) newErrors.password = 'Please enter your password';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setErrors({});

        try {
            const response = await login(formData);
            if (response.data?.access) {
                localStorage.setItem('token', response.data.access);
                if (response.data?.refresh) localStorage.setItem('refreshToken', response.data.refresh);
                navigate('/dashboard');
            } else if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response?.data) {
                const apiErrors = error.response.data;
                if (apiErrors.detail) setErrors({ general: apiErrors.detail });
                else setErrors({ general: 'Invalid credentials. Please try again.' });
            } else {
                setErrors({ general: 'Unable to connect. Please try again later.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Login Form Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Card with transparent glassmorphism design */}
                <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
                            Welcome Back
                        </h2>
                        <p className="text-white/90">Sign in to continue your journey</p>
                    </div>

                    {/* Error Message */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 rounded-r-lg">
                            <p className="text-white text-sm">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="group">
                            <label htmlFor="username" className="block text-sm font-medium text-white mb-2 drop-shadow">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 ${errors.username ? 'border-red-300' : 'border-white/40'
                                        } rounded-xl text-gray-800 placeholder-gray-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-emerald-300`}
                                    placeholder="Enter your username"
                                />
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-200 drop-shadow">{errors.username}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <label htmlFor="password" className="block text-sm font-medium text-white mb-2 drop-shadow">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 ${errors.password ? 'border-red-300' : 'border-white/40'
                                        } rounded-xl text-gray-800 placeholder-gray-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-emerald-300`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-200 drop-shadow">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center">
                        <p className="text-white/90">
                            New here?{' '}
                            <Link
                                to="/register"
                                className="text-emerald-300 hover:text-emerald-200 font-semibold hover:underline transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
