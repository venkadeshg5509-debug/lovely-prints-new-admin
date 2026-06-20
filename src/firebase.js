import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL 
} from "firebase/storage";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "./mockData";

// Retrieve saved config from localStorage
const LOCAL_STORAGE_CONFIG_KEY = "lovely_prints_firebase_config";

export const getFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Error reading Firebase config from localStorage:", e);
    return null;
  }
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
};

// Check if Firebase can be initialized
let firebaseApp = null;
let firestoreDb = null;
let firebaseStorage = null;
let isFirebaseConfigured = false;

// Check environment variables first (standard for production hosting like Vercel)
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const config = (envConfig.apiKey && envConfig.projectId) ? envConfig : getFirebaseConfig();

if (config && config.apiKey && config.projectId) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

export { isFirebaseConfigured, firestoreDb as db, firebaseStorage as storage };

// --- LocalStorage Fallback Helper Functions ---

const getLocalCategories = () => {
  const local = localStorage.getItem("lovely_prints_categories");
  if (!local) {
    localStorage.setItem("lovely_prints_categories", JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(local);
};

const saveLocalCategories = (categories) => {
  localStorage.setItem("lovely_prints_categories", JSON.stringify(categories));
};

const getLocalProducts = () => {
  const local = localStorage.getItem("lovely_prints_products");
  if (!local) {
    localStorage.setItem("lovely_prints_products", JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(local);
};

const saveLocalProducts = (products) => {
  localStorage.setItem("lovely_prints_products", JSON.stringify(products));
};

// --- Unified Data Access Layer (Dynamic switch between Firebase & LocalStorage) ---

export const getStoredCategories = async () => {
  if (isFirebaseConfigured && firestoreDb) {
    try {
      const querySnapshot = await getDocs(collection(firestoreDb, "categories"));
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      // If Firestore is empty, seed it with mock data
      if (categories.length === 0) {
        console.log("Firestore categories empty. Seeding...");
        for (const cat of INITIAL_CATEGORIES) {
          await setDoc(doc(firestoreDb, "categories", cat.id), {
            name: cat.name,
            description: cat.description,
            imageUrl: cat.imageUrl
          });
          categories.push(cat);
        }
      }
      return categories;
    } catch (err) {
      console.error("Error fetching categories from Firestore, falling back:", err);
      return getLocalCategories();
    }
  } else {
    return getLocalCategories();
  }
};

export const saveStoredCategory = async (category) => {
  if (isFirebaseConfigured && firestoreDb) {
    try {
      // Firebase document set
      const docRef = doc(firestoreDb, "categories", category.id);
      await setDoc(docRef, {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl
      });
    } catch (err) {
      console.error("Error saving category to Firestore:", err);
      throw err;
    }
  } else {
    const categories = getLocalCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index > -1) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    saveLocalCategories(categories);
  }
};

export const deleteStoredCategory = async (categoryId) => {
  if (isFirebaseConfigured && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "categories", categoryId));
    } catch (err) {
      console.error("Error deleting category from Firestore:", err);
      throw err;
    }
  } else {
    const categories = getLocalCategories();
    const filtered = categories.filter((c) => c.id !== categoryId);
    saveLocalCategories(filtered);
    
    // Also delete products in that category locally
    const products = getLocalProducts();
    const filteredProducts = products.filter((p) => p.categoryId !== categoryId);
    saveLocalProducts(filteredProducts);
  }
};

export const getStoredProducts = async () => {
  if (isFirebaseConfigured && firestoreDb) {
    try {
      const querySnapshot = await getDocs(collection(firestoreDb, "products"));
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      // If Firestore is empty, seed it with mock products
      if (products.length === 0) {
        console.log("Firestore products empty. Seeding...");
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(firestoreDb, "products", prod.id), {
            categoryId: prod.categoryId,
            name: prod.name,
            description: prod.description,
            price: prod.price,
            imageUrl: prod.imageUrl
          });
          products.push(prod);
        }
      }
      return products;
    } catch (err) {
      console.error("Error fetching products from Firestore, falling back:", err);
      return getLocalProducts();
    }
  } else {
    return getLocalProducts();
  }
};

export const saveStoredProduct = async (product) => {
  if (isFirebaseConfigured && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "products", product.id);
      await setDoc(docRef, {
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl
      });
    } catch (err) {
      console.error("Error saving product to Firestore:", err);
      throw err;
    }
  } else {
    const products = getLocalProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    saveLocalProducts(products);
  }
};

export const deleteStoredProduct = async (productId) => {
  if (isFirebaseConfigured && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "products", productId));
    } catch (err) {
      console.error("Error deleting product from Firestore:", err);
      throw err;
    }
  } else {
    const products = getLocalProducts();
    const filtered = products.filter((p) => p.id !== productId);
    saveLocalProducts(filtered);
  }
};

// --- Firebase Storage Image Upload Helper ---
export const uploadProductImage = async (productId, base64String) => {
  if (isFirebaseConfigured && firebaseStorage) {
    try {
      // Create a reference to the image path in Firebase Storage
      const storageRef = ref(firebaseStorage, `products/${productId}`);
      // Upload Base64 data string
      await uploadString(storageRef, base64String, 'data_url');
      // Get downoadable URL
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (err) {
      console.error("Error uploading image to Firebase Storage:", err);
      throw err;
    }
  } else {
    // If local mode, we just return the base64 string directly (since we already compress it)
    return base64String;
  }
};

// Helper to migrate local storage data to Firebase once config is added
export const migrateLocalDataToFirebase = async (userDb) => {
  if (!userDb) return;
  try {
    const localCats = getLocalCategories();
    const localProds = getLocalProducts();
    
    // Seed Categories to Firestore
    for (const cat of localCats) {
      await setDoc(doc(userDb, "categories", cat.id), {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl
      });
    }
    
    // Seed Products to Firestore
    for (const prod of localProds) {
      await setDoc(doc(userDb, "products", prod.id), {
        categoryId: prod.categoryId,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        imageUrl: prod.imageUrl
      });
    }
    console.log("Migration to Firebase completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
};
