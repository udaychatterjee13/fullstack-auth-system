import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import bgImage from '../assets/Images/page2-bg.jpg';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        else if (formData.username.length < 3) newErrors.username = 'At least 3 characters';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'At least 8 characters';
        if (!formData.password2) newErrors.password2 = 'Confirm your password';
        else if (formData.password !== formData.password2) newErrors.password2 = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setErrors({});

        try {
            await register(formData);
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            if (error.response?.data) {
                const apiErrors = error.response.data;
                const formatted = {};
                Object.keys(apiErrors).forEach((key) => {
                    formatted[key] = Array.isArray(apiErrors[key]) ? apiErrors[key].join(', ') : apiErrors[key];
                });
                setErrors(formatted);
            } else {
                setErrors({ general: 'Unable to connect. Please try again.' });
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

            {/* Register Form */}
            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>Join Us</h2>
                        <p className="text-white/90">Create your account to get started</p>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-4 p-4 bg-green-500/20 backdrop-blur-sm border-l-4 border-green-400 rounded-r-lg">
                            <p className="text-white text-sm">{success}</p>
                        </div>
                    )}
                    {errors.general && (
                        <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 rounded-r-lg">
                            <p className="text-white text-sm">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username & Email Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField name="username" label="Username *" value={formData.username} onChange={handleChange} error={errors.username} placeholder="johndoe" />
                            <InputField name="email" type="email" label="Email *" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                        </div>

                        {/* Name Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} placeholder="John" />
                            <InputField name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} placeholder="Doe" />
                        </div>

                        {/* Password Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField name="password" type="password" label="Password *" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                            <InputField name="password2" type="password" label="Confirm *" value={formData.password2} onChange={handleChange} error={errors.password2} placeholder="••••••••" />
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isLoading}
                            className="w-full py-4 px-6 mt-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isLoading ? (
                                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Creating...</span></>
                            ) : (
                                <><span>Create Account</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-white/90">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-300 hover:text-emerald-200 font-semibold hover:underline transition-colors">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Input Field
const InputField = ({ name, type = 'text', label, value, onChange, error, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-white mb-1 drop-shadow">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder}
            className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 ${error ? 'border-red-300' : 'border-white/40'} rounded-xl text-gray-800 placeholder-gray-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-emerald-300 text-sm`} />
        {error && <p className="mt-1 text-xs text-red-200 drop-shadow">{error}</p>}
    </div>
);

export default Register;
