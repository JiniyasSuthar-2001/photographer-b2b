import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import '../styles/Auth.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const toggleAuth = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setFormData({ username: '', password: '', confirmPassword: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isSignUp && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            if (isSignUp) {
                await authService.signup(formData.username, formData.password);
                alert('Account created! Please sign in.');
                setIsSignUp(false);
            } else {
                await authService.login(formData.username, formData.password);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.username) {
            setError("Please enter your username first to reset password.");
            return;
        }
        try {
            const response = await authService.forgotPassword(formData.username);
            alert(response.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to process request.');
        }
    };

    return (
        <div className="auth-container">
            <div className={`cont ${isSignUp ? 's--signup' : ''}`}>
                <div className="form sign-in">
                    <h2>Welcome</h2>
                    {error && !isSignUp && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
                    <label>
                        <span>Username</span>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            placeholder="Enter your username"
                        />
                    </label>
                    <label className="password-label">
                        <span>Password</span>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder="Enter your password"
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </label>
                    <div className="auth-options">
                        <label className="remember-me">
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                            />
                            <span>Remember me</span>
                        </label>
                        <p className="forgot-pass" onClick={handleForgotPassword}>Forgot password?</p>
                    </div>
                    <button type="button" className="submit" onClick={handleSubmit}>
                        Sign In
                    </button>
                </div>
                
                <div className="sub-cont">
                    <div className="img">
                        <div className="img__text m--up">
                            <h3>Don't have an account? Please Sign up!</h3>
                        </div>
                        <div className="img__text m--in">
                            <h3>If you already have an account, just sign in.</h3>
                        </div>
                        <div className="img__btn" onClick={toggleAuth}>
                            <span className="m--up">Sign Up</span>
                            <span className="m--in">Sign In</span>
                        </div>
                    </div>
                    
                    <div className="form sign-up">
                        <h2>Create Account</h2>
                        {error && isSignUp && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
                        <label>
                            <span>Username</span>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                placeholder="Choose a username"
                            />
                        </label>
                        <label className="password-label">
                            <span>Password</span>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Create a password"
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>
                        <label className="password-label">
                            <span>Confirm Password</span>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </label>
                        <button type="button" className="submit" onClick={handleSubmit}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
