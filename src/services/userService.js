import { doc, getDoc, updateDoc, collection, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "users";

export const getUser = async (username) => {
  const userRef = doc(db, COLLECTION_NAME, username.toLowerCase());
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
};

export const updateUserProfile = async (username, data) => {
  const userRef = doc(db, COLLECTION_NAME, username.toLowerCase());
  await updateDoc(userRef, data);
};

export const authenticateUser = async (username, password) => {
  const user = await getUser(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const initializeUsers = async () => {
  const users = [
    { id: 'romi', username: 'romi', password: 'romi2025', displayName: 'Romi' },
    { id: 'patricia', username: 'patricia', password: 'paty2025', displayName: 'Patricia' },
    { id: 'admin', username: 'admin', password: 'vgn-cs140f', displayName: 'Vitor Admin' }
  ];

  for (const user of users) {
    try {
      const userRef = doc(db, COLLECTION_NAME, user.id);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, user);
      }
    } catch (e) {
      console.error("Error initializing user:", user.id, e);
    }
  }
};
