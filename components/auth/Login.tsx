import React, { useState, useRef } from 'react';
import { useAuthor } from '../../context/AuthorContext';
import { PencilIcon } from '../Icons';
import useClickSpark from '../../hooks/useClickSpark';

interface LoginProps {
  onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthor();
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  useClickSpark(loginButtonRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background text-brand-text-primary p-4 aurora-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <PencilIcon className="w-12 h-12 text-brand-primary mx-auto" />
          <h1 className="text-4xl font-bold font-serif mt-4">Bem-vindo de Volta</h1>
          <p className="text-brand-text-secondary mt-2">Entre para continuar sua jornada literária.</p>
        </div>
        <div className="bg-brand-surface p-8 rounded-xl border border-brand-secondary shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-400 bg-red-900/20 p-3 rounded-lg text-center text-sm">{error}</p>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary mb-2">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              ref={loginButtonRef}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-sm text-brand-text-secondary mt-6">
            Não tem uma conta?{' '}
            <button onClick={onSwitchToSignUp} className="font-semibold text-brand-primary hover:underline">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;