import { auth } from "./firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "firebase/auth";

export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("signInWithGoogle error:", error);
        throw error;
    }
}

export async function signInWithEmail(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("signInWithEmail error:", error);
        throw error;
    }
}

export async function signUpWithEmail(email, password, name) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
    } catch (error) {
        console.error("signUpWithEmail error:", error);
        throw error;
    }
}

export async function signOut() {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("signOut error:", error);
        throw error;
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}
