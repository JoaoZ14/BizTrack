import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    getDoc
  } from "firebase/firestore";
  import { db } from '../config/firebase';
  import { getAuth } from "firebase/auth";

  
  // 1. Criar Produto (incluindo userId)
  export const criarProduto = async (produto) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        throw new Error("Usuário não autenticado.");
      }
  
      const userId = user.uid; // Obtém o ID do usuário autenticado
  
      // Verificar se já existe um produto com o mesmo nome para o usuário
      const produtosQuery = query(
        collection(db, "produtos"),
        where("userId", "==", userId),
        where("nome", "==", produto.nome.trim()) // Filtra por nome e userId
      );
  
      const querySnapshot = await getDocs(produtosQuery);
  
      if (!querySnapshot.empty) {
        throw new Error("Já existe um produto com o mesmo nome.");
      }
  
      // Se não encontrar produto com o mesmo nome, cria o novo produto
      const docRef = await addDoc(collection(db, "produtos"), {
        ...produto,
        userId, // Inclui o userId ao criar o produto
        createdAt: new Date().toISOString(),
      });
  
      return docRef.id; // Retorna o ID do produto criado
    } catch (error) {
      console.error("Erro ao criar produto: ", error);
      throw error;
    }
  };
  
  
  // 2. Listar Produtos (somente do usuário autenticado)
  export const listarProdutos = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;  // Verifica o usuário logado
  
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
  
      const userId = user.uid;  // Obtém o ID do usuário autenticado
      const produtosQuery = query(collection(db, 'produtos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(produtosQuery);
  
      const produtos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return produtos;
    } catch (error) {
      console.error("Erro ao listar produtos: ", error);
      throw error;
    }
  };
  
  // 3. Atualizar Produto (verifica userId)
  export const atualizarProduto = async (id, novoProduto) => {
    try {
      const produtoDoc = doc(db, "produtos", id);
      await updateDoc(produtoDoc, novoProduto);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar produto: ", error);
      throw error;
    }
  };
  
  
  // 4. Deletar Produto (verifica userId)
 // 4. Deletar Produto (verifica userId)
 export const deletarProduto = async (id) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;  // Verifica o usuário logado
  
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
  
      const userId = user.uid; // Obtém o ID do usuário autenticado
      const produtoDoc = doc(db, 'produtos', id);
      const produtoSnapshot = await getDoc(produtoDoc);
  
      if (!produtoSnapshot.exists()) {
        throw new Error('Produto não encontrado');
      }
  
      const produtoData = produtoSnapshot.data();
      if (produtoData.userId !== userId) {
        throw new Error('Ação não permitida: Você não é o dono deste produto');
      }
  
      // Se o userId for o mesmo, deleta o produto
      await deleteDoc(produtoDoc);
      console.log('Produto deletado com sucesso');
      return true;
  
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  };