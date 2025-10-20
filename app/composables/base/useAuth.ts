import { signInWithPopup, GoogleAuthProvider, type User as FirebaseUser } from "firebase/auth";
import { useFirebase } from "./useFirebase";

export const useAuth = () => {
  const { auth } = useFirebase();
  const userStore = useUserStore();

  const loading = ref(false);

  const signInWithGoogle = async () => {
    loading.value = true;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      userStore.setUser(
        result.user.uid ?? '',
        result.user.displayName || 'User',
        result.user.email || '',
        result.user.photoURL || null
      );
      return result.user;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      userStore.clearUser();
    } catch (error: any) {
      throw error;
    }
  };

  const checkAuthState = (): Promise<FirebaseUser | null> => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((currentUser: FirebaseUser | null) => {
        if (currentUser) {
          userStore.setUser(
            currentUser.uid ?? '',
            currentUser.displayName || 'User',
            currentUser.email || '',
            currentUser.photoURL || null
          );
          resolve(currentUser);
        } else {
          userStore.clearUser();
          resolve(null);
        }
        unsubscribe();
      });
    });
  };

  const initAuthListener = () => {
    auth.onAuthStateChanged((currentUser: FirebaseUser | null) => {
      if (currentUser) {
        userStore.setUser(
          currentUser.uid ?? '',
          currentUser.displayName || 'User',
          currentUser.email || '',
          currentUser.photoURL || null
        );
      } else {
        userStore.clearUser();
      }
    });
  };

  return {
    loading,
    signInWithGoogle,
    signOut,
    checkAuthState,
    initAuthListener,
  };
};
