import { authenticateUser } from '../services/userService';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedUser = username.trim().toLowerCase();

    try {
      const user = await authenticateUser(normalizedUser, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Acceso denegado. Credenciales incorrectas.');
      }
    } catch (err) {
      setError('Error de conexión. Revisa tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-10">
          <div className="bg-victoria-wine w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-victoria-wine/20">
            <Sparkles className="text-victoria-gold" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-victoria-wine leading-tight uppercase tracking-tighter">
            VICTORIA <span className="text-victoria-gold">ESTRELLA</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Joyas de Plata</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(139,0,0,0.08)] border border-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">Acceso Privado</h2>
              <p className="text-xs text-gray-400">Ingresa tus credenciales para continuar</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-victoria-gold group-focus-within:text-victoria-red transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg transition-all font-sans"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
                <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-victoria-wine text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-victoria-wine/20 hover:bg-victoria-red transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Entrar al Inventario'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-12 leading-loose">
          Victoria Estrella © 2026 • Acceso Restringido<br/>
          Propiedad de Romi Joyería
        </p>
      </div>
    </div>
  );
};

export default Login;
