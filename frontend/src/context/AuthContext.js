import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from backend
        try {
          const response = await axios.get(`${API}/users/${firebaseUser.uid}`);
          setUserProfile(response.data);
        } catch (error) {
          // If user doesn't exist in backend, create them
          if (error.response?.status === 404) {
            try {
              const newUser = await axios.post(`${API}/users`, {
                firebase_uid: firebaseUser.uid,
                email: firebaseUser.email,
                display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                role: 'user'
              });
              setUserProfile(newUser.data);
            } catch (createError) {
              console.error('Error creating user:', createError);
            }
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

const register = async (email, password, displayName, farmLocation) => {
  // Firebase auth create user here...

  const response = await fetch(`${API}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firebase_uid: user.uid,
      email,
      display_name: displayName,
      farm_location: farmLocation, // ✅ THIS LINE
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save user profile");
  }
};


  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // Create new user in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        role: 'user',
        createdAt: new Date().toISOString()
      });
    }
    
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    
    const response = await axios.put(`${API}/users/${user.uid}`, updates);
    setUserProfile(response.data);
    
    // Update Firestore as well
    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    
    return response.data;
  };

  const isAdmin = userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
