import React, { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';  // Corrigido aqui
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
          // Criando o usuário no Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Salvando o usuário no Firestore
          await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
            email: email,
            nome: '',  // Adicione o nome ou outros dados, se necessário
            createdAt: new Date(),
          });
  
          // Redirecionar para o dashboard ou página inicial após criação
          console.log('Usuário criado e salvo no Firestore');
        } catch (error) {
          setError(error.message);
        }
      };
  
    return (
      <div>
        <h2>Criar Conta</h2>
        <form onSubmit={handleSignup}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">Criar Conta</button>
        </form>
        {error && <p>{error}</p>}
      </div>
    );
};

export default Signup;
