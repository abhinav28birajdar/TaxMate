import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'customer' | 'ca' | 'business' | null;

interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt?: string;
  lastLogin?: string;
  onboardingCompleted?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  stripeConnectAccountId?: string;
  businessName?: string; // For business accounts
  businessType?: string; // For business accounts
  businessSize?: string; // For business accounts
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const userProfileDoc = await getDoc(doc(firestore, 'userProfiles', userId));
      if (userProfileDoc.exists()) {
        return userProfileDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profileData = await fetchUserProfile(user.uid);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Get the ID token to check custom claims
        const idTokenResult = await authUser.getIdTokenResult();
        const userRole = idTokenResult.claims.role as UserRole;
        const isUserAdmin = idTokenResult.claims.admin === true;
        
        // Fetch user profile data
        const profileData = await fetchUserProfile(authUser.uid);
        
        setUser(authUser);
        setRole(userRole);
        setProfile(profileData);
        setIsAdmin(isUserAdmin);
      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      profile, 
      loading, 
      isAdmin,
      refreshUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
