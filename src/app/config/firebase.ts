import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Fonction helper pour accéder aux variables d'environnement de manière sûre
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore - import.meta.env peut ne pas être disponible dans tous les environnements
    return import.meta?.env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// Configuration Firebase
// Pour la production, configurez ces valeurs dans votre fichier .env
const firebaseConfig = {
  apiKey: "AIzaSyBKwRkvYmyHUdsTs7akXev8VF-mTlqCft8",
  authDomain: "resiweb1.firebaseapp.com",
  projectId: "resiweb1",
  storageBucket: "resiweb1.firebasestorage.app",
  messagingSenderId: "918727327847",
  appId: "1:918727327847:web:eee070ed06034763a614c2",
  measurementId: "G-RCRGP6E1KF"
};

let app;
let auth;

try {
  // Initialiser Firebase
  app = initializeApp(firebaseConfig);
  // Initialiser Firebase Auth
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Créer des objets mock pour éviter les crashes
  app = {} as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
  } as any;
}

export { auth };
export default app;
