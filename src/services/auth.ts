import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class AuthService {
  // Register a new user
  async register(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Login an existing user
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Logout current user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Convert Firebase User to AuthUser
  toAuthUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  }

  // Handle Firebase Auth errors
  private handleAuthError(error: any): Error {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('This email is already registered');
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/operation-not-allowed':
        return new Error('Operation not allowed');
      case 'auth/weak-password':
        return new Error('Password is too weak (minimum 6 characters)');
      case 'auth/user-disabled':
        return new Error('This account has been disabled');
      case 'auth/user-not-found':
        return new Error('No account found with this email');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/invalid-credential':
        return new Error('Invalid email or password');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection');
      default:
        return new Error(error.message || 'An error occurred during authentication');
    }
  }
}

export const authService = new AuthService();

