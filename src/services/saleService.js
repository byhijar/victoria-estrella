import { collection, addDoc, runTransaction, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "sales";

export const subscribeToSales = (callback) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(sales);
  });
};

export const registerSale = async (saleData) => {
  const { materialId, materialName, gramsSold } = saleData;
  const grams = parseFloat(gramsSold);

  return await runTransaction(db, async (transaction) => {
    const materialRef = doc(db, "materials", materialId);
    const materialDoc = await transaction.get(materialRef);

    if (!materialDoc.exists()) {
      throw new Error("Material does not exist!");
    }

    const currentStock = materialDoc.data().currentStockGrams;
    const newStock = currentStock - grams;

    if (newStock < 0) {
      throw new Error("Insufficient stock!");
    }

    // 1. Create sale record
    const saleRef = doc(collection(db, COLLECTION_NAME));
    transaction.set(saleRef, {
      materialId,
      materialName,
      gramsSold: grams,
      type: 'sale', // New field to distinguish
      createdAt: new Date().toISOString()
    });

    // 2. Update material stock
    transaction.update(materialRef, {
      currentStockGrams: newStock
    });
  });
};

export const restockMaterial = async (restockData) => {
  const { materialId, materialName, gramsAdded } = restockData;
  const grams = parseFloat(gramsAdded);

  return await runTransaction(db, async (transaction) => {
    const materialRef = doc(db, "materials", materialId);
    const materialDoc = await transaction.get(materialRef);

    if (!materialDoc.exists()) {
      throw new Error("Material does not exist!");
    }

    const currentStock = materialDoc.data().currentStockGrams;
    const newStock = currentStock + grams;

    // 1. Create movement record in history (using sales collection for now as "movements")
    const movementRef = doc(collection(db, COLLECTION_NAME));
    transaction.set(movementRef, {
      materialId,
      materialName,
      gramsSold: grams, // Reusing field name for compatibility, but type defines it
      type: 'restock',
      createdAt: new Date().toISOString()
    });

    // 2. Update material stock
    transaction.update(materialRef, {
      currentStockGrams: newStock
    });
  });
};
