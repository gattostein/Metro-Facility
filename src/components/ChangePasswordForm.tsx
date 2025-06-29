'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Ensure the path is correct

export default function ChangePasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('The passwords do not match.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('The password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        // Supabase updates the password of the currently authenticated user
        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });
        if (updateError) {
            setError(updateError.message);
        } else {
            setMessage('Your password has been successfully changed.');
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };
    return (
        <div className="mt-6">
            <h4 className="text-xl font-semibold mb-4">Change Password</h4>
            <button onClick={() => setIsVisible(!isVisible)} className="mb-4">
                {isVisible ? 'Hide Form' : 'Show Form'}
            </button>
            {isVisible && (
                <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="new-password"
                            placeholder="Enter your new password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-new-password">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirm-new-password"
                            placeholder="Confirm your new password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>
                    {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}