import { getAuth, applyActionCode } from "firebase/auth";
import '~/common/styles/Auth.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';
import { sendEmailVerification } from "firebase/auth";

const EmailVerificationCheck: React.FC = () => {
    const auth = getAuth();
    const router = useRouter();

    const [data, setData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [verificationStatus, setVerificationStatus] = useState<boolean>(false);

    function getParameterByName(name: string): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    console.log(verificationStatus)

    useEffect(() => {
        const actionCode = getParameterByName('oobCode');
        const lang = getParameterByName('lang') || 'en';

        if (actionCode) {
            applyActionCode(auth, actionCode).then(() => {
                addSnackbar({ key: 'email-verification', message: 'Your email verified successfully', type: 'success' });
                setVerificationStatus(true);
            }).catch(() => {
                addSnackbar({ key: 'email-verification', message: 'Email verification faild', type: 'warning' });
                setVerificationStatus(false);
            });
        }
    }, []);

    return (
        <div className="signup-container">
            <div className="signup-card">
                {!verificationStatus && (
                    <form>
                        <h2>Your email is verified successfully</h2>
                        <div className="continue-text">
                            <span onClick={() => router.push('/login')}>Continue</span>
                        </div>
                    </form>
                )}
                {verificationStatus && (
                    <form>
                        <h2>Email verification failed</h2>
                        <button onClick={(e) => {
                            e.preventDefault()
                            if (auth.currentUser) {
                                sendEmailVerification(auth.currentUser);
                                addSnackbar({ key: 'email-sent', message: 'Verification email sent!', type: 'success' });
                            }
                        }}>Resend Email</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationCheck;