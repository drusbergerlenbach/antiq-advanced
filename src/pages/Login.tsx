import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Logo } from '../components/Logo';
import { AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const signIn = useStore((state) => state.signIn);
  const signUp = useStore((state) => state.signUp);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !name.trim()) return;

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      navigate('/');
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-antiq-gray flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-soft-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo size={64} className="mb-4" />
          <h1 className="text-3xl font-bold text-antiq-blue">Anti<span className="text-antiq-amber">Q</span></h1>
          <p className="text-gray-600 mt-2 text-center">
            Organize with intelligence.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ihr Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent transition"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? 'Mindestens 6 Zeichen' : 'Ihr Passwort'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent transition"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim() || (isSignUp && !name.trim())}
            className="w-full bg-antiq-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-antiq-amber focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isSignUp ? 'Registrieren...' : 'Anmelden...') : (isSignUp ? 'Registrieren' : 'Anmelden')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-antiq-blue hover:text-antiq-amber transition"
          >
            {isSignUp ? 'Bereits ein Konto? Anmelden' : 'Noch kein Konto? Registrieren'}
          </button>
        </div>
      </div>
    </div>
  );
}
