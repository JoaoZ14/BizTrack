import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDC0mxBg5AHgviXGv0tyKtwVy8O7UYcF30",
    authDomain: "biztrack-d074d.firebaseapp.com",
    projectId: "biztrack-d074d",
    storageBucket: "biztrack-d074d.firebasestorage.app",
    messagingSenderId: "414264767564",
    appId: "1:414264767564:web:961f3926e7357f7761f0e9",
    measurementId: "G-XJ1PJSCR0N"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obter a instância de autenticação e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Função para criar um novo usuário
export { auth, createUserWithEmailAndPassword };

// Função para buscar produtos
export const fetchProdutos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'produtos'));
    const produtos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return produtos;
  } catch (error) {
    console.error("Erro ao buscar produtos: ", error);
    throw error;
  }
};

export { db };
