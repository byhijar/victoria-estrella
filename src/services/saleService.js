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

    const materialData = materialDoc.data();
    const currentStock = materialData.currentStockGrams;
    const newStock = currentStock - grams;

    if (newStock < 0) {
      throw new Error("Insufficient stock!");
    }

    // 1. Create sale record
    const saleRef = doc(collection(db, COLLECTION_NAME));
    transaction.set(saleRef, {
      ...saleData,
      gramsSold: grams,
      type: 'sale',
      costPriceAtTimeOfSale: parseFloat(materialData.costPricePerGram || 0),
      sellPriceAtTimeOfSale: parseFloat(materialData.sellPricePerGram || materialData.pricePerGram || 0),
      createdAt: new Date().toISOString()
    });

    // 2. Update material stock
    transaction.update(materialRef, {
      currentStockGrams: newStock
    });
  });
};

export const restockMaterial = async (restockData) => {
  const { materialId, materialName, gramsAdded, sellerName } = restockData;
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
      sellerName,
      createdAt: new Date().toISOString()
    });

    // 2. Update material stock
    transaction.update(materialRef, {
      currentStockGrams: newStock
    });
  });
};
export const voidSale = async (saleId, materialId, gramsToRestore, voidData) => {
  const { reason, sellerName } = voidData;

  return await runTransaction(db, async (transaction) => {
    // 1. Get current material stock
    const materialRef = doc(db, "materials", materialId);
    const materialDoc = await transaction.get(materialRef);

    if (!materialDoc.exists()) {
      throw new Error("Material no existe");
    }

    const currentStock = materialDoc.data().currentStockGrams;
    const newStock = currentStock + gramsToRestore;

    // 2. Update sale record
    const saleRef = doc(db, COLLECTION_NAME, saleId);
    transaction.update(saleRef, {
      isVoided: true,
      voidedAt: new Date().toISOString(),
      voidReason: reason,
      voidedBy: sellerName
    });

    // 3. Restore material stock
    transaction.update(materialRef, {
      currentStockGrams: newStock
    });
  });
};
export const updateSale = async (saleId, materialId, originalGrams, newData, auditData) => {
  const { gramsSold: newGrams, totalPrice: newTotal, sellPriceAtTimeOfSale: newPrice } = newData;
  const { reason, sellerName } = auditData;

  const diffGrams = parseFloat(newGrams) - parseFloat(originalGrams);

  return await runTransaction(db, async (transaction) => {
    // 1. Get current material stock
    const materialRef = doc(db, "materials", materialId);
    const materialDoc = await transaction.get(materialRef);

    if (!materialDoc.exists()) {
      throw new Error("Material no existe");
    }

    const currentStock = materialDoc.data().currentStockGrams;
    const newStock = currentStock - diffGrams; // If diff is negative (grams decreased), stock increases

    if (newStock < 0) {
      throw new Error("Stock insuficiente para este ajuste");
    }

    // 2. Update sale record
    const saleRef = doc(db, COLLECTION_NAME, saleId);
    const saleDoc = await transaction.get(saleRef);
    const saleData = saleDoc.data();
    
    const editEntry = {
      timestamp: new Date().toISOString(),
      reason,
      editedBy: sellerName,
      before: {
        grams: originalGrams,
        total: saleData.totalPrice,
        price: saleData.sellPriceAtTimeOfSale
      },
      after: {
        grams: newGrams,
        total: newTotal,
        price: newPrice
      }
    };

    transaction.update(saleRef, {
      gramsSold: parseFloat(newGrams),
      totalPrice: parseFloat(newTotal),
      sellPriceAtTimeOfSale: parseFloat(newPrice),
      isEdited: true,
      lastEditedAt: new Date().toISOString(),
      editHistory: [...(saleData.editHistory || []), editEntry]
    });

    // 3. Update material stock
    transaction.update(materialRef, {
      currentStockGrams: newStock
    });
  });
};
