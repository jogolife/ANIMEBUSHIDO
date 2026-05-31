import React, { useState } from "react";
import { 
  Swords, 
  Award, 
  Bell, 
  User, 
  Newspaper, 
  Heart, 
  Settings, 
  Sparkles,
  LogOut,
  ShieldCheck,
  Chrome,
  Mail,
  Lock,
  ArrowRight,
  Hash,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { PushNotification } from "../types";
import VipButton from "./VipButton";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
  setCurrentUser: React.Dispatch<React.SetStateAction<{
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  }>>;
  notifications: PushNotification[];
  onClearNotifications: () => void;
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  setCurrentUser,
  notifications,
  onClearNotifications
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Login form states
  const [loginTab, setLoginTab] = useState<"google" | "admin">("google");
  const [googleEmail, setGoogleEmail] = useState("");
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleInstantGoogleLogin = async (email: string) => {
    setLoginError("");
    const localPart = email.split("@")[0];
    const cleanName = localPart
      .split(/[-_.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: cleanName || "Otaku Bushidô"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao conectar.");
      }

      const userData = await response.json();
      setCurrentUser(userData);
      setGoogleEmail("");
      setLoginError("");
      setShowUserMenu(false);
    } catch (err: any) {
      setLoginError(err.message || "Erro ao efetuar login.");
    }
  };

  const handleGoogleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!googleEmail.trim()) {
      setLoginError("Por favor, digite seu e-mail do Google.");
      return;
    }
    if (!googleEmail.includes("@")) {
      setGoogleEmail("");
      setLoginError("E-mail inválido. Por favor, inclua o caractere '@'.");
      return;
    }

    // Extract name from Gmail
    const localPart = googleEmail.split("@")[0];
    const cleanName = localPart
      .split(/[-_.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: cleanName || "Otaku Bushidô"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao conectar.");
      }

      const userData = await response.json();
      setCurrentUser(userData);

      // Reset inputs
      setGoogleEmail("");
      setLoginError("");
      setShowUserMenu(false);
    } catch (err: any) {
      setLoginError(err.message || "Erro ao efetuar login.");
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError("Email e senha são obrigatórios.");
      return;
    }

    // Verification check as requested: admin@bushido.com / bushido100
    const targetEmail = "admin@bushido.com";
    const targetPassword = "bushido100";

    if (adminEmail.trim().toLowerCase() === targetEmail && adminPassword === targetPassword) {
      setCurrentUser({
        uid: "admin_superuser",
        email: targetEmail,
        name: "Admin Bushidô 👑",
        role: "admin",
        isLoggedIn: true
      });
      
      setAdminEmail("");
      setAdminPassword("");
      setLoginError("");
      setShowUserMenu(false);
      setActiveTab("admin"); // automatically switch to admin console on success login
    } else {
      setLoginError("Credenciais de Administrador incorretas.");
    }
  };

  const handleLogout = () => {
    setCurrentUser({
      uid: "anonymous_user",
      email: "",
      name: "Otaku Anônimo",
      role: "user",
      isLoggedIn: false
    });
    setShowUserMenu(false);
    setActiveTab("catalog");
  };

  return (
    <nav className="bg-[#080808] border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-md px-4 py-3" id="main-navigation">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => setActiveTab("catalog")} 
          className="flex items-center space-x-3 cursor-pointer group"
          id="nav-logo"
        >
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-md text-purple-500 shadow-lg shadow-purple-500/10">
            <Swords className="h-5 w-5 group-hover:rotate-12 transition-transform text-purple-500" />
          </div>
          <div className="flex flex-col">
            <div className="font-display font-black text-2xl tracking-tighter text-purple-400 leading-none">
              Anime <span className="text-white">Bushidô</span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mt-0.5">🎌 HONRA, NOTAS & CARACterísticas</div>
          </div>
        </div>

        {/* NAV ITEMS */}
        <div className="hidden md:flex items-center space-x-6 h-full self-stretch" id="nav-actions">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 py-2 cursor-pointer ${
              activeTab === "catalog"
                ? "border-purple-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            Catálogo
          </button>

          <button
            onClick={() => setActiveTab("az-codes")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "az-codes"
                ? "border-purple-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Hash className="h-4 w-4 text-purple-400" />
            A-Z & Códigos
          </button>
          
          <button
            onClick={() => setActiveTab("ranking")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "ranking"
                ? "border-purple-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Award className="h-4 w-4 text-purple-400" />
            Ranking Geral
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "news"
                ? "border-purple-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Newspaper className="h-4 w-4 text-purple-400" />
            Novidades
          </button>

          <button
            onClick={() => setActiveTab("watchlist")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "watchlist"
                ? "border-purple-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500/10" />
            Minha Área
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "chat"
                ? "border-purple-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4 text-purple-400" />
            Chat da Tribo 💬
          </button>

          <button
            onClick={() => setActiveTab("manga-piece")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "manga-piece"
                ? "border-emerald-500 text-white font-extrabold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4 text-emerald-400 animate-pulse" />
            Manga Piece 🏴‍☠️
          </button>

          <button
            onClick={() => setActiveTab("popular-characters")}
            className={`font-display text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-b-2 py-2 cursor-pointer ${
              activeTab === "popular-characters"
                ? "border-purple-500 text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            Votação Pop 👑
          </button>


        </div>

        {/* NOTIFICATIONS & PROFILE ACCENTS */}
        <div className="flex items-center space-x-3">
          
          {/* ONLINE COUNTER SIMULATOR INDICATION */}
          <div className="hidden sm:flex bg-zinc-905 border border-zinc-850 px-2.5 py-1.5 rounded-lg items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Bushidô Hub</span>
          </div>

          {/* NOTIFICATION TRIGGER */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-all relative cursor-pointer"
              id="notif-bell-btn"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
              )}
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full border border-zinc-905" />
              )}
            </button>

            {/* NOTIFICATIONS POPOVER */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 text-white animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
                  <span className="font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-450">
                    <Sparkles className="h-4 w-4" />
                    Alertas & Avisos ({notifications.length})
                  </span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        onClearNotifications();
                        setShowNotifications(false);
                      }} 
                      className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Limpar tudo
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                      Nenhum alerta recente.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 transition-all">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-bold text-xs text-zinc-100">{n.title}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER MENU TRIGGER (INTERACTIVE AUTHS) */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-1.5 pl-2.5 bg-[#0c0c0c] border border-zinc-800 hover:border-zinc-750 rounded-lg transition-all cursor-pointer"
              id="user-profile-btn"
            >
              {currentUser.isLoggedIn ? (
                <>
                  {currentUser.role === "admin" && (
                    <span className="bg-purple-950/40 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 text-[9px] font-mono rounded font-black uppercase tracking-wider">
                      👑 ADM
                    </span>
                  )}
                  {currentUser.role === "vip" && (
                    <span className="bg-amber-950/40 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider animate-bounce">
                      ⭐ VIP
                    </span>
                  )}
                  {currentUser.role === "user" && (
                    <span className="bg-zinc-900 border border-zinc-805 text-zinc-400 px-1.5 py-0.5 text-[9px] font-mono rounded uppercase tracking-wider">
                      FÃ
                    </span>
                  )}
                  <span className="text-zinc-200 font-semibold text-xs max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                </>
              ) : (
                <span className="text-purple-400 font-bold text-xs px-2 py-0.5">
                  Fazer Login ⚡
                </span>
              )}
              <div className="bg-zinc-900 border border-zinc-800 p-1 rounded text-zinc-400">
                <User className="h-4 w-4" />
              </div>
            </button>

            {/* HIGH-FIDELITY REGISTER/LOGIN FORM POPOVER */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-purple-500/20 rounded-xl shadow-2xl p-5 z-50 text-white animate-fade-in" id="auth-popover-panel">
                
                {currentUser.isLoggedIn ? (
                  /* LOGGED-IN SUITE */
                  <div className="space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                      <div className="font-display font-black text-sm text-zinc-100 uppercase tracking-tight">
                        {currentUser.name}
                      </div>
                      {currentUser.email && (
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">{currentUser.email}</div>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Credencial:</span>
                        <span className="text-xs bg-zinc-950 border border-zinc-850 text-purple-400 font-bold font-mono px-2 py-0.5 rounded">
                          {currentUser.role === "admin" ? "Administrador" : currentUser.role === "vip" ? "Premium VIP" : "Usuário Comum"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-purple-950/20 rounded-lg p-3 border border-purple-900/40 text-[11px] text-zinc-400 leading-normal">
                      {currentUser.role === "admin" ? (
                        <span>Você possui acesso irrestrito ao catálogo do **Anime Bushidô**. Crie novos animes, altere fotos e resumos ou gerencie códigos.</span>
                      ) : currentUser.role === "vip" ? (
                        <span>Seu status **Premium VIP** permite votar, avaliar com peso e comentar com distintivo neon de destaque! ⭐</span>
                      ) : (
                        <div className="space-y-3">
                          <span>Você está conectado! Agora pode dar notas de Absolute Cinema e associar códigos característicos. 🎌</span>
                          <div className="pt-2 border-t border-purple-900/35">
                            <p className="text-[10.5px] font-bold text-amber-300 mb-2 uppercase tracking-wider text-center flex items-center justify-center gap-1">⭐ Torne-se Membro Premium ⭐</p>
                            <VipButton userId={currentUser.uid} className="w-full" />
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleLogout} 
                      className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-950/45 flex items-center justify-center gap-2 border border-rose-500/10 cursor-pointer transition-all"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sair da Conta (Logout)
                    </button>
                  </div>
                ) : (
                  /* AUTHENTICATION INTERFACE */
                  <div className="space-y-4">
                    
                    {/* G LOGO HEADER */}
                    <div className="flex flex-col items-center gap-1.5 pt-2 text-center select-none">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg border border-zinc-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12.24 10.285V14.4h6.887C18.2 16.92 15.645 18.6 12.24 18.6c-3.636 0-6.6-2.964-6.6-6.6s2.964-6.6 6.6-6.6c1.636 0 3.123.6 4.27 1.636l3.122-3.122C17.585 1.956 15.055 1 12.24 1c-6.122 0-11.1 4.978-11.1 11.1s4.978 11.1 11.1 11.1c5.808 0 11.1-4.148 11.1-11.1 0-.696-.06-1.375-.175-2.025H12.24z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-display font-black text-xs uppercase text-white tracking-wider mt-1.5">
                        Conectar com Conta Google
                      </h4>
                      <p className="text-[10.5px] text-zinc-500 max-w-[240px] leading-normal">
                        No Bushidô, sua honra e prestígio são associados à sua conta oficial.
                      </p>
                    </div>

                    {!showManualEmailInput ? (
                      <div className="space-y-3 pt-1">
                        {/* 1-CLICK GOOGLE ACCOUNT SIGN IN BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleInstantGoogleLogin("narutofamilyhinata@gmail.com")}
                          className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-md border border-zinc-200 transition-all scale-100 hover:scale-[1.01]"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12.24 10.285V14.4h6.887C18.2 16.92 15.645 18.6 12.24 18.6c-3.636 0-6.6-2.964-6.6-6.6s2.964-6.6 6.6-6.6c1.636 0 3.123.6 4.27 1.636l3.122-3.122C17.585 1.956 15.055 1 12.24 1c-6.122 0-11.1 4.978-11.1 11.1s4.978 11.1 11.1 11.1c5.808 0 11.1-4.148 11.1-11.1 0-.696-.06-1.375-.175-2.025H12.24z"
                            />
                          </svg>
                          narutofamilyhinata@gmail.com
                        </button>

                        {loginError && (
                          <div className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/10 p-2 rounded leading-tight">
                            ⚠️ {loginError}
                          </div>
                        )}

                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => setShowManualEmailInput(true)}
                            className="text-[10.5px] font-mono text-zinc-500 hover:text-purple-400 underline transition-colors cursor-pointer"
                          >
                            Usar outro e-mail do Google
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* MANUAL GMAIL INPUT FIELD */
                      <form onSubmit={handleGoogleLoginSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5 flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-purple-400" /> Endereço do Google Email
                          </label>
                          <input
                            type="email"
                            placeholder="exemplo@gmail.com"
                            value={googleEmail}
                            onChange={(e) => setGoogleEmail(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 p-2.5 rounded-lg outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        {loginError && (
                          <div className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/10 p-2 rounded leading-tight">
                            ⚠️ {loginError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          Entrar com Google <ArrowRight className="h-3.5 w-3.5" />
                        </button>

                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => { setShowManualEmailInput(false); setLoginError(""); }}
                            className="text-[10.5px] font-mono text-zinc-500 hover:text-purple-400 transition-colors cursor-pointer"
                          >
                            ← Voltar ao início
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                )}
                
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MOBILE NAV BAR LINKS (FLEX ONCE EXPANDED) */}
      <div className="flex md:hidden items-center justify-around mt-3 border-t border-zinc-900 pt-2.5" id="mobile-nav-panel">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "catalog" ? "text-purple-400 font-semibold" : "text-zinc-500"}`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab("az-codes")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "az-codes" ? "text-purple-400 font-semibold" : "text-zinc-500"}`}
        >
          A-Z & Códigos
        </button>
        <button
          onClick={() => setActiveTab("ranking")}
          className={`px-2 py-1 text-xs font-medium flex items-center gap-1 cursor-pointer ${activeTab === "ranking" ? "text-purple-400 font-semibold" : "text-zinc-500"}`}
        >
          Ranking
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "news" ? "text-purple-400 font-semibold" : "text-zinc-500"}`}
        >
          Novidades
        </button>
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "watchlist" ? "text-purple-400 font-semibold" : "text-zinc-500"}`}
        >
          Favoritos
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "chat" ? "text-purple-400 font-semibold" : "text-zinc-500"}`}
        >
          Chat 💬
        </button>
        <button
          onClick={() => setActiveTab("manga-piece")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "manga-piece" ? "text-emerald-450 font-semibold animate-pulse" : "text-zinc-500"}`}
        >
          Manga Piece 🏴‍☠️
        </button>
        <button
          onClick={() => setActiveTab("popular-characters")}
          className={`px-2 py-1 text-xs font-medium cursor-pointer ${activeTab === "popular-characters" ? "text-purple-450 font-semibold" : "text-zinc-500"}`}
        >
          Votação Pop 👑
        </button>

      </div>
    </nav>
  );
}
