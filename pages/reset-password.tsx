
import { getAuth, confirmPasswordReset, checkActionCode, applyActionCode } from "firebase/auth";
import '~/common/styles/Auth.css';
import { ReactHTMLElement, useState } from 'react';
import { useRouter } from 'next/router';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';

const ResetPassword: React.FC = () => {
    const auth = getAuth();
    const router = useRouter();

    const [data, setData] = useState({
        email: '',
        password: '',
        confirmPassword: '',

    });
    function getParameterByName(name: string): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    const actionCode = getParameterByName('oobCode');
    // (Optional) Get the language code if available.
    const lang = getParameterByName('lang') || 'en';

    const handleResetPassword = async (auth: ReturnType<typeof getAuth>, actionCode: string, lang: string, password: string) => {
        if (data.password !== data.confirmPassword) {
            addSnackbar({ key: 'password-mismatch', message: 'Passwords do not match', type: 'warning' });
            return;
        }
        else {
            // Verify the password reset code is valid.
            try {
                const info = await checkActionCode(auth, actionCode)
                console.log('this is info-->', info)
                // Show the reset screen with the user's email address.
                const email = info.data.email;
                if (password) {
                    // Save the new password.
                    confirmPasswordReset(auth, actionCode, password).then((resp) => {
                        console.log('this is response of the reset password-->', resp)
                        // Password reset has been confirmed and new password updated.
                        // TODO: Display a success message and redirect to continueUrl.
                        addSnackbar({ key: 'password-reset', message: 'Password has been reset successfully.', type: 'success' });
                        router.push('/login');
                    }).catch((error) => {
                        addSnackbar({ key: 'password-reset', message: 'Password is too weak', type: 'warning' });
                    });
                } else {
                    console.error('Password cannot be null.');
                }
            } catch (error) {
                // Invalid or expired action code. Ask user to try to reset the password.
                addSnackbar({ key: 'password-reset', message: 'Invalid or expired action code. Please try again.', type: 'warning' });
            }
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Reset Password</h2>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    handleResetPassword(auth, actionCode || '', lang, data.password);
                }}>
                    <label>New Password</label>
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
                    <button type="submit">Reset</button>
                </form>
            </div>
        </div>
    )
};

export default ResetPassword;