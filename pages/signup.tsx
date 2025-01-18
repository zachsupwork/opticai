import React, { useState } from 'react';
import { useAuth } from '~/common/auth/AuthContext';
import { useRouter } from 'next/router';
import '~/common/styles/Auth.css';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';
import { getAuth } from 'firebase/auth';

const Signup = () => {
    const { signup, emailVerification } = useAuth();
    const router = useRouter();
    const [data, setData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const auth = getAuth();

    interface SignupData {
        email: string;
        password: string;
        confirmPassword: string;
    }

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (data.password !== data.confirmPassword) {
            addSnackbar({ key: 'password-mismatch', message: 'Passwords do not match', type: 'warning' });
            return;
        }
        try {
            console.log(data);
            
            await signup(data.email, data.password);
            router.push('/login');
            addSnackbar({ key: 'register-success', message: 'Register successful!', type: 'success' });
        } catch (err) {
            addSnackbar({ key: 'unexpected', message: String(err), type: 'warning' });
            console.error(err);
        }
        await emailVerification(auth.currentUser);
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Join Us</h2>
                <form onSubmit={handleSignup}>
                    <label>Email address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        value={data.email}
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Create a password"
                        required
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        value={data.password}
                    />
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        required
                        onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                        value={data.confirmPassword}
                    />
                    <button type="submit">Sign Up</button>
                </form>
                <div className="link-text">
                    Already have an account? <span onClick={() => router.push('/login')}>Log In</span>
                </div>
            </div>
        </div>
    );
};

export default Signup;