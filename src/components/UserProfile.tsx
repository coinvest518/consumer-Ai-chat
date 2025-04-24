import { useAuth } from '@/contexts/AuthContext';

export function UserProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{user.email}</h2>
          <p className="text-gray-500">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 