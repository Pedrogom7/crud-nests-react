import { useState, useEffect } from "react";

const API = "http://localhost:5001";

function App() {
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Função para mostrar notificações
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Validação do formulário
  const validateForm = (formData, isEdit = false) => {
    const newErrors = {};

    if (!isLoginMode || isEdit) {
      if (!formData.name?.trim()) {
        newErrors.name = "Nome é obrigatório";
      } else if (formData.name.length < 2) {
        newErrors.name = "Nome deve ter pelo menos 2 caracteres";
      }
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!isEdit && !formData.password?.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = async () => {
    if (!validateForm(form)) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setForm({ name: "", email: "", password: "" });
        showNotification(`Bem-vindo de volta! 🎉`, "success");
      } else {
        setErrors({ submit: data.message || "Credenciais inválidas" });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErrors({ submit: "Erro de conexão. Verifique sua internet e tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!validateForm(form)) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setForm({ name: "", email: "", password: "" });
        setIsLoginMode(true);
        showNotification("Conta criada com sucesso! Agora faça login para continuar. ✨", "success");
      } else {
        setErrors({ submit: data.message || "Erro no registro" });
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      setErrors({ submit: "Erro de conexão. Verifique sua internet e tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!validateForm(form)) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setForm({ name: "", email: "", password: "" });
        setIsCreating(false);
        fetchUsers();
        showNotification(`Usuário ${form.name} criado com sucesso! 🎉`, "success");
      } else {
        setErrors({ submit: data.message || "Erro ao criar usuário" });
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      setErrors({ submit: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        showNotification("Erro ao carregar usuários", "error");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      showNotification("Erro de conexão ao carregar usuários", "error");
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCreating) {
      createUser();
    } else {
      isLoginMode ? login() : register();
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;

    try {
      setLoading(true);
      const response = await fetch(`${API}/users/${showDeleteModal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers((prev) => prev.filter(u => u.id !== showDeleteModal.id));
        showNotification(`Usuário ${showDeleteModal.name} removido com sucesso! 🗑️`, "success");
      } else {
        showNotification("Erro ao deletar usuário", "error");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      showNotification("Erro de conexão ao deletar usuário", "error");
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  const openEdit = (user) => {
    setEditing(user);
    setEditForm({ name: user.name, email: user.email, password: "" });
    setErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editing) return;

    if (!validateForm(editForm, true)) return;

    try {
      setLoading(true);
      const body = { name: editForm.name, email: editForm.email };
      if (editForm.password) body.password = editForm.password;

      const response = await fetch(`${API}/users/${editing.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(u =>
          u.id === editing.id ? updatedUser.user || { ...u, ...body } : u
        ));
        setEditing(null);
        setEditForm({ name: "", email: "", password: "" });
        setErrors({});
        showNotification(`Usuário ${body.name} atualizado com sucesso! ✨`, "success");
      } else {
        const data = await response.json();
        setErrors({ submit: data.message || "Erro ao atualizar usuário" });
      }
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setErrors({ submit: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente de Notificação
  const Notification = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
      <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-3 animate-fade-in backdrop-blur-xl max-w-md ${notification.type === 'success'
          ? 'bg-green-900/90 border-green-400/50 text-green-100'
          : 'bg-red-900/90 border-red-400/50 text-red-100'
        }`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${notification.type === 'success' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
          }`}>
          {notification.type === 'success' ? '✓' : '!'}
        </div>
        <span className="flex-1">{notification.message}</span>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity p-1 text-lg leading-none"
        >
          ×
        </button>
      </div>
    );
  };

  // Modal de confirmação de exclusão
  const DeleteModal = ({ user, onConfirm, onCancel, loading }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <div className="text-red-400 text-xl">🗑️</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Confirmar exclusão</h3>
                <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-200">
                Tem certeza que deseja deletar o usuário <span className="font-semibold text-white">"{user.name}"</span>?
              </p>
              <p className="text-red-300/70 text-sm mt-1">{user.email}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-500/20 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-white hover:scale-105 transition flex items-center space-x-2 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>🗑️</span>
                )}
                <span>Deletar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Efeitos de fundo animados */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>

      {/* Notificação */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Modal de exclusão */}
      <DeleteModal
        user={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(null)}
        loading={loading}
      />

      <div className="relative z-10 p-6">
        {!token ? (
          <div className="w-full max-w-md mx-auto mt-20">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <div className="text-3xl">{isLoginMode ? '🔐' : '👤'}</div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {isLoginMode ? "Bem-vindo!" : "Criar Conta"}
                </h1>
                <p className="text-gray-400">
                  {isLoginMode ? "Acesse sua conta para continuar" : "Preencha seus dados para começar"}
                </p>
              </div>

              <div className="space-y-6">
                {!isLoginMode && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="text-gray-400 group-focus-within:text-purple-400 transition-colors">👤</div>
                    </div>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      className={`w-full pl-10 pr-4 py-4 rounded-xl bg-white/5 border transition-all duration-200 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-400 ${errors.name ? 'border-red-400 bg-red-500/5' : 'border-white/10 focus:bg-white/10'
                        }`}
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                    />
                    {errors.name && (
                      <div className="flex items-center space-x-2 mt-2 text-red-400">
                        <span className="text-red-400">⚠️</span>
                        <p className="text-sm">{errors.name}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="text-gray-400 group-focus-within:text-purple-400 transition-colors">📧</div>
                  </div>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className={`w-full pl-10 pr-4 py-4 rounded-xl bg-white/5 border transition-all duration-200 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-400 ${errors.email ? 'border-red-400 bg-red-500/5' : 'border-white/10 focus:bg-white/10'
                      }`}
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                  />
                  {errors.email && (
                    <div className="flex items-center space-x-2 mt-2 text-red-400">
                      <span className="text-red-400">⚠️</span>
                      <p className="text-sm">{errors.email}</p>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="text-gray-400 group-focus-within:text-purple-400 transition-colors">🔒</div>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    className={`w-full pl-10 pr-12 py-4 rounded-xl bg-white/5 border transition-all duration-200 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-400 ${errors.password ? 'border-red-400 bg-red-500/5' : 'border-white/10 focus:bg-white/10'
                      }`}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                  {errors.password && (
                    <div className="flex items-center space-x-2 mt-2 text-red-400">
                      <span className="text-red-400">⚠️</span>
                      <p className="text-sm">{errors.password}</p>
                    </div>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center space-x-2">
                    <span className="text-red-400">⚠️</span>
                    <span>{errors.submit}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-xl font-semibold hover:scale-105 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLoginMode ? '🔐' : '👤'}</span>
                      <span>{isLoginMode ? "Entrar" : "Criar conta"}</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setForm({ name: "", email: "", password: "" });
                      setErrors({});
                    }}
                    className="text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline"
                  >
                    {isLoginMode ? "Não tem conta? Criar uma nova" : "Já tem conta? Fazer login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            {/* Header do Dashboard */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <div className="text-2xl">👥</div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Dashboard
                  </h2>
                  <p className="text-gray-400 flex items-center mt-1">
                    <span className="mr-2">📅</span>
                    {filteredUsers.length} usuário(s) {searchTerm && "encontrado(s)"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                {/* Campo de busca */}
                <div className="relative flex-1 sm:flex-none">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
                  <input
                    type="text"
                    placeholder="Buscar usuários..."
                    className="w-full sm:w-80 pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 focus:bg-white/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3">
                  {/* Botão Criar Usuário */}
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setForm({ name: "", email: "", password: "" });
                      setErrors({});
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
                  >
                    <span>➕</span>
                    <span className="hidden sm:inline">Novo Usuário</span>
                  </button>

                  {/* Botão Sair */}
                  <button
                    onClick={() => {
                      setToken(null);
                      setUsers([]);
                      setSearchTerm("");
                      showNotification("Logout realizado com sucesso! 👋", "success");
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-400/50 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de usuários */}
            {loading && users.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-xl text-gray-300 mb-2">Carregando usuários...</p>
                <p className="text-gray-500">Aguarde um momento</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-4xl">👥</div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum usuário cadastrado'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Tente ajustar os termos da sua busca' : 'Comece criando o primeiro usuário'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setForm({ name: "", email: "", password: "" });
                      setErrors({});
                    }}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2 mx-auto"
                  >
                    <span>➕</span>
                    <span>Criar Primeiro Usuário</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="group bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] hover:bg-white/10 hover:border-purple-500/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="text-2xl text-white">👤</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300 truncate">
                            {user.name}
                          </h3>
                          <p className="text-gray-400 flex items-center mt-1 truncate">
                            <span className="mr-2 flex-shrink-0">📧</span>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3 flex-shrink-0">
                        <button
                          onClick={() => openEdit(user)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-md"
                          disabled={loading}
                        >
                          <span>✏️</span>
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(user)}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-md"
                          disabled={loading}
                        >
                          <span>🗑️</span>
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal de Criação de Usuário */}
            {isCreating && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900/95 backdrop-blur-xl border border-green-500/30 rounded-2xl w-full max-w-md shadow-2xl">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-green-400 flex items-center space-x-2">
                        <span>➕</span>
                        <span>Criar Novo Usuário</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setErrors({});
                          setForm({ name: "", email: "", password: "" });
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-1 text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">👤</div>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => {
                            setForm({ ...form, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: null });
                          }}
                          placeholder="Nome completo"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-black/50 text-white transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-green-500/30'
                            }`}
                        />
                      </div>
                      {errors.name && (
                        <div className="flex items-center space-x-2 mt-2 text-red-400">
                          <span>⚠️</span>
                          <p className="text-sm">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">📧</div>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => {
                            setForm({ ...form, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: null });
                          }}
                          placeholder="Email"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-black/50 text-white transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-green-500/30'
                            }`}
                        />
                      </div>
                      {errors.email && (
                        <div className="flex items-center space-x-2 mt-2 text-red-400">
                          <span>⚠️</span>
                          <p className="text-sm">{errors.email}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">🔒</div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => {
                            setForm({ ...form, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: null });
                          }}
                          placeholder="Senha"
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-black/50 text-white transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-green-500/30'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors text-lg"
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="flex items-center space-x-2 mt-2 text-red-400">
                          <span>⚠️</span>
                          <p className="text-sm">{errors.password}</p>
                        </div>
                      )}
                    </div>

                    {errors.submit && (
                      <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>{errors.submit}</span>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setErrors({});
                          setForm({ name: "", email: "", password: "" });
                        }}
                        className="px-4 py-2 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-500/20 transition-colors flex items-center space-x-2"
                      >
                        <span>×</span>
                        <span>Cancelar</span>
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg text-white hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        onClick={createUser}
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <span>➕</span>
                        )}
                        <span>Criar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Edição */}
            {editing && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl w-full max-w-md shadow-2xl">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-blue-400 flex items-center space-x-2">
                        <span>✏️</span>
                        <span>Editar Usuário</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setErrors({});
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-1 text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">👤</div>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => {
                            setEditForm({ ...editForm, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: null });
                          }}
                          placeholder="Nome"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-black/50 text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-blue-500/30'
                            }`}
                        />
                      </div>
                      {errors.name && (
                        <div className="flex items-center space-x-2 mt-2 text-red-400">
                          <span>⚠️</span>
                          <p className="text-sm">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">📧</div>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => {
                            setEditForm({ ...editForm, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: null });
                          }}
                          placeholder="Email"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-black/50 text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-blue-500/30'
                            }`}
                        />
                      </div>
                      {errors.email && (
                        <div className="flex items-center space-x-2 mt-2 text-red-400">
                          <span>⚠️</span>
                          <p className="text-sm">{errors.email}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">🔒</div>
                        <input
                          type={showEditPassword ? "text" : "password"}
                          value={editForm.password}
                          onChange={(e) => {
                            setEditForm({ ...editForm, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: null });
                          }}
                          placeholder="Nova senha (opcional)"
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-black/50 text-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-blue-500/30'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors text-lg"
                        >
                          {showEditPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="flex items-center space-x-2 mt-2 text-red-400">
                          <span>⚠️</span>
                          <p className="text-sm">{errors.password}</p>
                        </div>
                      )}
                    </div>

                    {errors.submit && (
                      <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>{errors.submit}</span>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setErrors({});
                        }}
                        className="px-4 py-2 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-500/20 transition-colors flex items-center space-x-2"
                      >
                        <span>×</span>
                        <span>Cancelar</span>
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        onClick={handleEditSubmit}
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <span>💾</span>
                        )}
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;