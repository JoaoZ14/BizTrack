import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, where, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const criarUsuarioNoFirestore = async (email, password) => {
  try {
    // Criação do usuário com email e senha
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Criar um documento no Firestore para o novo usuário
    await setDoc(doc(db, 'usuarios', user.uid), {
      email: user.email,
      nome: '', // Adicione outros campos que você achar necessário
      createdAt: new Date(),
    });
    
    console.log('Usuário criado e salvo no Firestore');
  } catch (error) {
    console.error('Erro ao criar usuário: ', error);
  }
};

export const loginOuCriarUsuarioNoFirestore = async (email, password) => {
    try {
      // Faz login com o Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Verificar se o usuário já existe no Firestore
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        // Se não existir, cria um novo usuário
        await setDoc(userDocRef, {
          email: user.email,
          nome: '', // Você pode adicionar mais campos aqui, como nome, etc.
          createdAt: new Date(),
        });
        console.log('Usuário criado no Firestore');
      } else {
        console.log('Usuário já existe no Firestore');
      }
  
      // Agora o usuário está logado e os dados estão no Firestore
    } catch (error) {
      console.error('Erro ao fazer login: ', error);
    }
  };


  
  export const buscarMetasUsuario = async (userId) => {
    try {
      const q = query(
        collection(db, 'metas'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const metas = {};
      querySnapshot.forEach((doc) => {
        const { tipo, valor, createDate } = doc.data();
        // Armazena o ID do documento
        metas[tipo] = {
          id: doc.id,
          valor,
          createDate: createDate?.toMillis() || Date.now()
        };
      });
  
      return metas;
  
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      return {};
    }
  };
  
  export const atualizarMetasUsuario = async (userId, tipo, valor, docId = null) => {
    try {
      if (docId) {
        // Atualiza documento existente
        await updateDoc(doc(db, 'metas', docId), {
          valor,
          createDate: serverTimestamp()
        });
      } else {
        // Cria novo documento se não existir
        await addDoc(collection(db, 'metas'), {
          userId,
          tipo,
          valor,
          createDate: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      throw error;
    }
  };