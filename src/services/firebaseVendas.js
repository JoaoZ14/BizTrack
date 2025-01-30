import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '../config/firebase';

const vendasCollection = collection(db, "vendas");
const produtosCollection = collection(db, "produtos");

// 1. Registrar Venda e Atualizar Estoque
export const registrarVenda = async ({ usuarioId, clienteId, produtos, total }) => {
  try {
      if (!usuarioId) {
          throw new Error("Usuário não autenticado");
      }

      // Verificar se todos os produtos têm estoque suficiente
      for (const item of produtos) {
          const produtoDoc = doc(db, "produtos", item.produtoId);
          const produtoSnapshot = await getDoc(produtoDoc);

          if (!produtoSnapshot.exists()) {
              throw new Error(`Produto ${item.produtoId} não encontrado`);
          }

          const produtoData = produtoSnapshot.data();
          if (produtoData.estoque < item.quantidade) {
              throw new Error(`Estoque insuficiente para o produto ${produtoData.nome}`);
          }
      }

      // Criar a venda com múltiplos produtos
      const novaVenda = {
          clienteId,
          usuarioId,
          produtos, // Lista de produtos vendidos
          total,
          dataVenda: Timestamp.now(),
      };

      const docRef = await addDoc(vendasCollection, novaVenda);

      // Atualizar o estoque de todos os produtos
      for (const item of produtos) {
          const produtoDoc = doc(db, "produtos", item.produtoId);
          await updateDoc(produtoDoc, {
              estoque: (await getDoc(produtoDoc)).data().estoque - item.quantidade,
          });
      }

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
export const listarVendas = async (usuarioId) => {
  try {
    const vendasQuery = query(vendasCollection, where("usuarioId", "==", usuarioId));
    const querySnapshot = await getDocs(vendasQuery);
    const vendas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Converter Firestore Timestamp para Date
      dataVenda: doc.data().dataVenda?.toDate() || new Date()
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

