
import React, { useState } from 'react';
import type { Author } from '../types';
import { PencilIcon } from './Icons';

interface AuthorProfileProps {
  onProfileCreate: (author: Author) => void;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({ onProfileCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onProfileCreate({ name: name.trim() });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background text-brand-text-primary p-4">
      <div className="w-full max-w-md text-center">
        <PencilIcon className="w-16 h-16 mx-auto text-brand-primary mb-6" />
        <h1 className="text-4xl font-bold font-serif mb-2">Simulador de Escritor</h1>
        <p className="text-brand-text-secondary mb-8">Crie seu perfil de autor para começar sua jornada literária.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="authorName" className="sr-only">Nome do Autor</label>
            <input
              id="authorName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome de autor"
              className="w-full px-4 py-3 bg-brand-surface border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Começar a Escrever
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthorProfile;
