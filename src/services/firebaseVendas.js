import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '../config/firebase';

const vendasCollection = collection(db, "vendas");
const produtosCollection = collection(db, "produtos");

// 1. Registrar Venda e Atualizar Estoque
export const registrarVenda = async ({ usuarioId, produtoId, quantidade, total }) => {
    try {
      // Verificar se o usuarioId é válido
      if (!usuarioId) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar o estoque do produto
      const produtoDoc = doc(db, "produtos", produtoId);
      const produtoSnapshot = await getDoc(produtoDoc);
  
      if (!produtoSnapshot.exists()) {
        throw new Error("Produto não encontrado");
      }
  
      const produtoData = produtoSnapshot.data();
      const estoqueAtual = produtoData.estoque;
  
      if (estoqueAtual < quantidade) {
        throw new Error("Estoque insuficiente");
      }
  
      // Registrar a venda
      const novaVenda = {
        produtoId,
        quantidade,
        total,
        dataVenda: Timestamp.now(), // Data/hora atual
        usuarioId, // Adicionando o usuarioId
      };
  
      const docRef = await addDoc(vendasCollection, novaVenda);
  
      // Atualizar o estoque do produto
      await atualizarEstoque(produtoId, estoqueAtual - quantidade);
  
      return docRef.id;
    } catch (error) {
      console.error("Erro ao registrar venda: ", error);
      throw error;
    }
};

// 2. Atualizar Estoque de Produto
export const atualizarEstoque = async (produtoId, novaQuantidade) => {
  try {
    const produtoDoc = doc(db, "produtos", produtoId);
    await updateDoc(produtoDoc, {
      estoque: novaQuantidade,
    });
    console.log(`Estoque do produto ${produtoId} atualizado para ${novaQuantidade}`);
  } catch (error) {
    console.error("Erro ao atualizar estoque: ", error);
    throw error;
  }
};

// 3. Listar Todas as Vendas
export const listarVendas = async () => {
  try {
    const querySnapshot = await getDocs(vendasCollection);
    const vendas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return vendas;
  } catch (error) {
    console.error("Erro ao listar vendas: ", error);
    throw error;
  }
};

// 4. Listar Vendas por Usuário
export const listarVendasPorUsuario = async (usuarioId) => {
  try {
    // Verificar se o usuarioId está presente
    if (!usuarioId) {
      throw new Error("Usuário não autenticado");
    }
    
    const vendasQuery = query(vendasCollection, where("usuarioId", "==", usuarioId));
    const querySnapshot = await getDocs(vendasQuery);
    const vendas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));  
    return vendas;
  } catch (error) {
    console.error("Erro ao listar vendas por usuário: ", error);
    throw error;
  }
};

// 5. Listar Vendas por Produto (Filtro)
export const listarVendasPorProduto = async (produtoId) => {
  try {
    const vendasQuery = query(vendasCollection, where("produtoId", "==", produtoId));
    const querySnapshot = await getDocs(vendasQuery);
    const vendas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return vendas;
  } catch (error) {
    console.error("Erro ao listar vendas por produto: ", error);
    throw error;
  }
};
