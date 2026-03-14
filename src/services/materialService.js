import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "materials";

export const subscribeToMaterials = (callback) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(materials);
  });
};

export const addMaterial = async (material) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...material,
    initialStockGrams: parseFloat(material.initialStockGrams),
    currentStockGrams: parseFloat(material.initialStockGrams),
    createdAt: new Date().toISOString()
  });
};

export const updateMaterial = async (id, data) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, data);
};

export const deleteMaterial = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  // Note: For a complete system, we should probably check if there are sales associated before deleting
  // but for the MVP simple delete is fine.
  return await updateDoc(docRef, { deleted: true }); // Prefer soft-delete for history integrity
};
