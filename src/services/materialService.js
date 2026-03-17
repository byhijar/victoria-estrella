import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, orderBy, deleteDoc, writeBatch, getDoc } from "firebase/firestore";
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

export const addMaterial = async (material, creatorName) => {
  const sellPrice = parseFloat(material.sellPricePerGram || material.pricePerGram || 0);
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...material,
    initialStockGrams: parseFloat(material.initialStockGrams),
    currentStockGrams: parseFloat(material.initialStockGrams),
    costPricePerGram: parseFloat(material.costPricePerGram || 0),
    sellPricePerGram: sellPrice,
    pricePerGram: sellPrice, // Sync for legacy compatibility
    minStockThreshold: parseFloat(material.minStockThreshold || 20),
    createdAt: new Date().toISOString()
  });

  // Log movement
  await addDoc(collection(db, "sales"), {
    materialId: docRef.id,
    materialName: material.name,
    type: 'new_material',
    sellerName: creatorName,
    createdAt: new Date().toISOString()
  });

  return docRef;
};

export const updateMaterial = async (id, data) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updates = { ...data };
  
  if (data.sellPricePerGram !== undefined) {
    updates.pricePerGram = parseFloat(data.sellPricePerGram);
  } else if (data.pricePerGram !== undefined) {
    updates.sellPricePerGram = parseFloat(data.pricePerGram);
  }

  return await updateDoc(docRef, updates);
};

export const deleteMaterial = async (id, deleterName) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const materialSnap = await getDoc(docRef);
  const materialData = materialSnap.data();

  // Prefer soft-delete for history integrity
  await updateDoc(docRef, { deleted: true });

  // Log movement
  await addDoc(collection(db, "sales"), {
    materialId: id,
    materialName: materialData.name,
    type: 'delete_material',
    sellerName: deleterName,
    createdAt: new Date().toISOString()
  });
};

export const wipeAllData = async () => {
  const batch = writeBatch(db);
  
  // 1. Get all materials
  const materialsSnap = await getDocs(collection(db, "materials"));
  materialsSnap.forEach((d) => {
    batch.delete(d.ref); // Hard delete for the reset
  });

  // 2. Get all sales
  const salesSnap = await getDocs(collection(db, "sales"));
  salesSnap.forEach((d) => {
    batch.delete(d.ref);
  });

  return await batch.commit();
};
