import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where 
  } from "firebase/firestore";
  import { db } from '../config/firebase';
  
  export const criarCategoria = async (categoria) => {
    try {
      const nomeNormalizado = categoria.nome.trim().toLowerCase();
      
      const q = query(
        collection(db, "categorias"),
        where("userId", "==", categoria.userId),
        where("nomeNormalizado", "==", nomeNormalizado)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error("Já existe uma categoria com este nome");
      }
  
      const docRef = await addDoc(collection(db, "categorias"), {
        ...categoria,
        nomeNormalizado // Adiciona campo normalizado
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Erro detalhado:", error);
      throw error;
    }
  };
  
  export const listarCategorias = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categorias"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  };