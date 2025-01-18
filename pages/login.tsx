import React, { useState } from 'react';
import { useAuth } from '~/common/auth/AuthContext';
import { useRouter } from 'next/router';
import '~/common/styles/Auth.css';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const Login = () => {
    const auth = getAuth();
    const router = useRouter();
    const { user, login } = useAuth();
    const [data, setData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(user);
        try {
            await login(data.email, data.password);
            addSnackbar({ key: 'chat-draw-empty', message: 'Login successful!', type: 'success' });
            router.push('/');
        } catch (err) {
            addSnackbar({ key: 'unexpected', message: 'Please check your credential again', type: 'warning' });
            console.error(err);
        }
    };

    const hadleResetPassword = async() => {
        try {
            await sendPasswordResetEmail(auth, data.email);
            addSnackbar({ key: 'chat-draw-empty', message: `Password reset email sent to ${data.email}`, type: 'success' });
        } catch (err) {
            addSnackbar({ key: 'unexpected', message: 'Unregistered email address!', type: 'warning' });
            console.error(err);
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
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
                        placeholder="Enter your password"
                        required
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        value={data.password}
                    />
                    <div className="forgot-password">
                        <span onClick={hadleResetPassword}>Forgot Password?</span>
                    </div>
                    <button type="submit">Login</button>
                </form>
                <div className="link-text">
                    Don&apos;t have an account? <span onClick={() => router.push('/signup')}>Sign Up</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
