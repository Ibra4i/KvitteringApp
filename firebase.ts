import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAL9Cpqfd9-d0NqmsI6-hbGdxgLAadT_-A",
  authDomain: "kvittering-app-ed83b.firebaseapp.com",
  projectId: "kvittering-app-ed83b",
  storageBucket: "kvittering-app-ed83b.firebasestorage.app",
  messagingSenderId: "379340639540",
  appId: "1:379340639540:web:2806d1cc87fcdbb7b7e961"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);