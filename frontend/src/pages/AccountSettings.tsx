import { useState } from 'react';
import { useUser, useLogout, useUpdateProfile, useChangePassword } from '../features/auth/queries';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const AccountSettings = () => {
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfileMutation.mutate(
      { name },
      {
        onSuccess: () => {
          toast('Profile updated successfully', 'success');
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to update profile', 'error');
        }
      }
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      toast('New password must be at least 8 characters', 'error');
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          toast('Password changed successfully', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to change password', 'error');
        }
      }
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-8 animate-in fade-in duration-200 pb-20">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Account Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* PROFILE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            <p className="text-sm text-gray-500">Your personal information</p>
          </div>
          
          <div className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Email Address</p>
                <p className="text-base text-gray-900 truncate">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  disabled={updateProfileMutation.isPending}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-md text-gray-900 shadow-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  required
                  minLength={2}
                />
              </div>
              
              <div>
                <Button 
                  type="submit" 
                  disabled={name === user.name || updateProfileMutation.isPending || !name.trim()}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            <p className="text-sm text-gray-500">Keep your account secure</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-md text-gray-900 shadow-sm transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-md text-gray-900 shadow-sm transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-md text-gray-900 shadow-sm transition-colors"
                  required
                  minLength={8}
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* SESSION SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Session</h3>
              <p className="text-sm text-gray-500">Signed in as <span className="font-medium text-gray-700">{user.email}</span></p>
            </div>
            <Button 
              variant="danger" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
