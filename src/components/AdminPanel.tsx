import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Bell, 
  Newspaper, 
  Database, 
  BarChart, 
  Check, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  Edit2,
  Tag,
  ListPlus,
  Eye,
  Settings,
  HelpCircle,
  Film,
  Lock,
  Mail,
  Key,
  ArrowRight
} from "lucide-react";
import { NewsItem, Anime, Code } from "../types";

interface AdminPanelProps {
  animes: Anime[];
  onTriggerNotification: (title: string, message: string, animeId?: string) => Promise<void>;
  onPostNews: (newsData: { title: string; content: string; category: string; imageUrl?: string; author: string }) => Promise<void>;
  currentUserRole: "admin" | "vip" | "user";
  onRefreshData: () => void | Promise<void>;
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
}

export default function AdminPanel({
  animes,
  onTriggerNotification,
  onPostNews,
  currentUserRole,
  onRefreshData,
  currentUser,
  setCurrentUser
}: AdminPanelProps) {
  // Stats state from back end
  const [stats, setStats] = useState({
    totalAnimes: 0,
    totalVotes: 0,
    totalComments: 0,
    totalNews: 0
  });

  const [loading, setLoading] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"stats" | "animes" | "codes" | "news" | "notif">("animes");
  const [globalCodes, setGlobalCodes] = useState<Code[]>([]);

  // CRUD Anime State
  const [isAnimeFormOpen, setIsAnimeFormOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  
  const [animeTitle, setAnimeTitle] = useState("");
  const [animeImage, setAnimeImage] = useState("");
  const [animeDescription, setAnimeDescription] = useState("");
  const [animeSeason, setAnimeSeason] = useState("");
  const [animeTrailer, setAnimeTrailer] = useState("");
  const [animeEpisodes, setAnimeEpisodes] = useState("12");
  const [animeRating, setAnimeRating] = useState("8.5");
  const [animeGenres, setAnimeGenres] = useState("Ação, Fantasia");
  const [animeCalendar, setAnimeCalendar] = useState("");
  const [animeSuccessMsg, setAnimeSuccessMsg] = useState("");
  const [animeErrorMsg, setAnimeErrorMsg] = useState("");
  const [fetchingExternal, setFetchingExternal] = useState(false);
  const [externalError, setExternalError] = useState("");

  // CRUD Code State
  const [codeName, setCodeName] = useState("");
  const [codeMeaning, setCodeMeaning] = useState("");
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [codeSuccessMsg, setCodeSuccessMsg] = useState("");
  const [codeErrorMsg, setCodeErrorMsg] = useState("");

  // Post news state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState("Novidade");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState("");
  const [newsStatus, setNewsStatus] = useState({ success: false, error: "" });

  // Notifications state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifAnimeId, setNotifAnimeId] = useState("");
  const [notifStatus, setNotifStatus] = useState({ success: false, error: "" });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Erro ao obter dados de estatísticas:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminCodes = async () => {
    try {
      const res = await fetch("/api/admin/codes");
      if (res.ok) {
        const data = await res.json();
        setGlobalCodes(data);
      }
    } catch (e) {
      console.error("Erro ao buscar códigos administrativos:", e);
    }
  };

  useEffect(() => {
    if (currentUserRole === "admin") {
      fetchStats();
      fetchAdminCodes();
    }
  }, [currentUserRole]);

  // ANIME ACTIONS: CREATE, UPDATE OR DELETE
  const handleOpenAddAnime = () => {
    setEditingAnime(null);
    setAnimeTitle("");
    setAnimeImage("");
    setAnimeDescription("");
    setAnimeSeason("Temporada de Inverno");
    setAnimeTrailer("");
    setAnimeEpisodes("12");
    setAnimeRating("8.5");
    setAnimeGenres("Ação, Fantasia");
    setAnimeCalendar("");
    setAnimeSuccessMsg("");
    setAnimeErrorMsg("");
    setIsAnimeFormOpen(true);
  };

  const handleOpenEditAnime = (anime: Anime) => {
    setEditingAnime(anime);
    setAnimeTitle(anime.title);
    setAnimeImage(anime.image);
    setAnimeDescription(anime.description);
    setAnimeSeason(anime.season);
    setAnimeTrailer(anime.trailerUrl);
    setAnimeEpisodes(String(anime.episodesCount));
    setAnimeRating(String(anime.rating));
    setAnimeGenres(anime.genres.join(", "));
    setAnimeCalendar(anime.releaseCalendar || "");
    setAnimeSuccessMsg("");
    setAnimeErrorMsg("");
    setIsAnimeFormOpen(true);
  };

  const handleAnimeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnimeSuccessMsg("");
    setAnimeErrorMsg("");

    if (!animeTitle.trim() || !animeDescription.trim()) {
      setAnimeErrorMsg("Título e Sinopse são de preenchimento obrigatório.");
      return;
    }

    const payload = {
      title: animeTitle.trim(),
      image: animeImage.trim() || undefined,
      description: animeDescription.trim(),
      season: animeSeason.trim() || undefined,
      trailerUrl: animeTrailer.trim() || undefined,
      episodesCount: Number(animeEpisodes) || 12,
      rating: Number(animeRating) || 8.0,
      genres: animeGenres.split(",").map(g => g.trim()).filter(Boolean),
      releaseCalendar: animeCalendar.trim() || undefined
    };

    try {
      const url = editingAnime ? `/api/admin/animes/${editingAnime.id}` : "/api/admin/animes";
      const method = editingAnime ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.json();
        setAnimeErrorMsg(body.error || "Operação falhou");
      } else {
        setAnimeSuccessMsg(editingAnime ? "Ficha do anime alterada com sucesso!" : "Novo anime adicionado ao catálogo!");
        setIsAnimeFormOpen(false);
        onRefreshData();
        fetchStats();
      }
    } catch {
      setAnimeErrorMsg("Erro de comunicação com o servidor.");
    }
  };

  const handleFetchExternalData = async () => {
    if (!animeTitle.trim()) {
      setExternalError("Por favor, digite o título da obra acima para podermos buscar.");
      return;
    }
    setFetchingExternal(true);
    setExternalError("");
    setAnimeSuccessMsg("");
    setAnimeErrorMsg("");
    try {
      const res = await fetch(`/api/admin/fetch-anime-external?title=${encodeURIComponent(animeTitle)}`);
      if (!res.ok) {
        throw new Error("Anime não localizado. Digite o nome em inglês ou japonês para melhores resultados.");
      }
      const data = await res.json();
      setAnimeTitle(data.title || animeTitle);
      if (data.image) setAnimeImage(data.image);
      if (data.description) setAnimeDescription(data.description);
      if (data.season) setAnimeSeason(data.season);
      if (data.genres) setAnimeGenres(Array.isArray(data.genres) ? data.genres.join(", ") : data.genres);
      if (data.episodesCount) setAnimeEpisodes(String(data.episodesCount));
      if (data.rating) setAnimeRating(String(data.rating));
      setAnimeSuccessMsg("Dados carregados com sucesso das APIs globais Jikan/AniList! Sinta-se livre para ajustar e registrar.");
    } catch (err: any) {
      setExternalError(err.message || "Erro de conexão ao buscar.");
    } finally {
      setFetchingExternal(false);
    }
  };

  const handleDeleteAnime = async (animeId: string) => {
    if (!window.confirm("Atenção: Ao excluir o anime, todos os votos e comentários associados serão permanentemente deletados. Prosseguir?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/animes/${animeId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        onRefreshData();
        fetchStats();
      } else {
        alert("Erro ao excluir o anime técnico.");
      }
    } catch {
      alert("Erro crítico ao apagar anime.");
    }
  };

  // CODES ACTIONS: ADD, EDIT, DELETE, APPROVE
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeSuccessMsg("");
    setCodeErrorMsg("");

    if (!codeName.trim() || !codeMeaning.trim()) {
      setCodeErrorMsg("Preencha código e significado.");
      return;
    }

    const upperCode = codeName.trim().toUpperCase().substring(0, 4);

    try {
      if (editingCodeId) {
        // Edit existing code
        const res = await fetch(`/api/admin/codes/${editingCodeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: upperCode, meaning: codeMeaning.trim(), approved: true })
        });
        if (res.ok) {
          setCodeSuccessMsg("Código atualizado!");
          setCodeName("");
          setCodeMeaning("");
          setEditingCodeId(null);
          fetchAdminCodes();
        } else {
          setCodeErrorMsg("Erro ao alterar o código.");
        }
      } else {
        // Insert new approved code
        const res = await fetch("/api/admin/codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: upperCode, meaning: codeMeaning.trim() })
        });
        if (res.ok) {
          setCodeSuccessMsg("Código gravado e aprovado!");
          setCodeName("");
          setCodeMeaning("");
          fetchAdminCodes();
        } else {
          const body = await res.json();
          setCodeErrorMsg(body.error || "Operação falhou.");
        }
      }
    } catch {
      setCodeErrorMsg("Falha na chamada com o servidor.");
    }
  };

  const handleApproveCode = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/codes/${id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        fetchAdminCodes();
      }
    } catch {
      alert("Falha ao aprovar código sugerido.");
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!window.confirm("Remover permanentemente esta tag de características?")) return;
    try {
      const res = await fetch(`/api/admin/codes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAdminCodes();
      }
    } catch {
      alert("Falha ao excluir.");
    }
  };


  const handlePostNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsStatus({ success: false, error: "" });

    if (!newsTitle.trim() || !newsContent.trim()) {
      setNewsStatus({ success: false, error: "Título e conteúdo são obrigatórios." });
      return;
    }

    try {
      await onPostNews({
        title: newsTitle,
        content: newsContent,
        category: newsCategory,
        imageUrl: newsImage || undefined,
        author: "Moderador Geral"
      });

      setNewsStatus({ success: true, error: "" });
      setNewsTitle("");
      setNewsContent("");
      setNewsImage("");
      fetchStats();
    } catch (err: any) {
      setNewsStatus({ success: false, error: err.message || "Erro desconhecido ao enviar notícia." });
    }
  };

  const handleTriggerNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus({ success: false, error: "" });

    if (!notifTitle.trim() || !notifMessage.trim()) {
      setNotifStatus({ success: false, error: "Título e mensagem de alerta são obrigatórios." });
      return;
    }

    try {
      await onTriggerNotification(
        notifTitle,
        notifMessage,
        notifAnimeId ? notifAnimeId : undefined
      );

      setNotifStatus({ success: true, error: "" });
      setNotifTitle("");
      setNotifMessage("");
      setNotifAnimeId("");
      fetchStats();
    } catch (err: any) {
      setNotifStatus({ success: false, error: err.message || "Erro desconhecido ao disparar alerta." });
    }
  };

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError("E-mail e senha seguras são obrigatórios.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Credenciais de administrador inválidas.");
      }

      const verifiedUser = await res.json();
      if (setCurrentUser) {
        setCurrentUser({
          uid: verifiedUser.uid,
          email: verifiedUser.email,
          name: verifiedUser.name,
          role: verifiedUser.role,
          isLoggedIn: true
        });
      }
    } catch (err: any) {
      setLoginError(err.message || "Erro de login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (currentUserRole !== "admin") {
    return (
      <div className="bg-[#0a0a0a]/80 border border-zinc-850 p-8 rounded-2xl text-center max-w-md mx-auto shadow-2xl animate-fade-in space-y-6" id="admin-unauthorized">
        <div className="mx-auto h-12 w-12 rounded-full bg-purple-950/40 text-purple-400 border border-purple-500/20 flex items-center justify-center">
          <Key className="h-6 w-6 animate-pulse" />
        </div>
        
        <div>
          <h2 className="font-display font-black uppercase text-lg tracking-tight text-white flex items-center justify-center gap-1.5">
            Console de Moderação Autorizada
          </h2>
          <p className="text-zinc-550 text-xs mt-1.5 leading-relaxed">
            Área de acesso restrito a moderadores e administradores da rede <strong>Anime Bushidô</strong>.
          </p>
        </div>

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-purple-400" /> E-mail do Administrador
            </label>
            <input
              type="text"
              placeholder="admin@bushido.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full bg-black border border-zinc-850 hover:border-zinc-805 text-xs text-zinc-350 p-2.5 rounded-lg outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-purple-400" /> Senha de Segurança
            </label>
            <input
              type="password"
              placeholder="Digite a chave mestre (Ex: bushido100)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-black border border-zinc-850 hover:border-zinc-805 text-xs text-zinc-350 p-2.5 rounded-lg outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {loginError && (
            <div className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-900/25 p-2 rounded flex items-center gap-1.5 font-mono">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-black font-black text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            {isLoggingIn ? "Autenticando..." : "Desbloquear Console"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto leading-normal animate-fade-in" id="admin-console">
      
      {/* HEADER PANELS BANNER */}
      <div className="bg-gradient-to-r from-purple-950/20 via-[#0a0a0a] to-[#040404] border border-zinc-800 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-900/40 text-purple-400 border border-purple-500/30 text-[9px] font-mono rounded font-black uppercase px-2 py-0.5 tracking-wider">
              Console Geral
            </span>
          </div>
          <h1 className="font-display font-black text-2xl tracking-tighter text-white mt-1 uppercase">
            Administração Anime Bushidô
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mt-1">
            Controle e moderação em tempo real. Adicione lançamentos de episódios, altere capas, aprove características sugeridas pelo fórum e publique notícias para a comunidade otaku brasileira.
          </p>
        </div>
        
        <button 
          onClick={() => { fetchStats(); fetchAdminCodes(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-350 cursor-pointer transition-colors"
          title="Recarregar Dados Operacionais"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      {/* CORE STATS TILES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "totalAnimes", label: "Animes Cadastrados", val: stats.totalAnimes, color: "text-purple-400" },
          { key: "totalVotes", label: "Votos Recebidos", val: stats.totalVotes, color: "text-purple-400" },
          { key: "totalComments", label: "Comentários no Fórum", val: stats.totalComments, color: "text-purple-450" },
          { key: "totalNews", label: "Notícias Veiculadas", val: stats.totalNews, color: "text-purple-450" }
        ].map(tile => (
          <div key={tile.key} className="bg-[#080808]/40 border border-zinc-850 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-950 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-550 block">{tile.label}</span>
              {loading ? (
                <div className="h-6 w-10 bg-zinc-900 animate-pulse rounded" />
              ) : (
                <span className={`text-2xl font-mono font-black ${tile.color}`}>{tile.val}</span>
              )}
            </div>
            <BarChart className="h-5 w-5 text-zinc-700" />
          </div>
        ))}
      </div>

      {/* WORKFLOW TABS CONTROL BAR */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-850 pb-1" id="admin-toggles-bar">
        {[
          { id: "animes", val: "🎬 Gerenciar Animes (CRUD)", badge: animes.length },
          { id: "codes", val: "🏷️ Controlar Códigos (Tags)", badge: globalCodes.length },
          { id: "news", val: "📢 Publicar Artigos", badge: null },
          { id: "notif", val: "🔔 Emitir Alertar Globais", badge: null }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setActiveAdminTab(tb.id as any)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer outline-none flex items-center gap-1.5 ${
              activeAdminTab === tb.id 
                ? "border-purple-500 text-white font-extrabold" 
                : "border-transparent text-zinc-450 hover:text-white"
            }`}
          >
            {tb.val}
            {tb.badge !== null && (
              <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold leading-none">
                {tb.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TABS MODULE: CRUD ANIMES */}
      {activeAdminTab === "animes" && (
        <div className="space-y-4 animate-fade-in" id="crud-animes-module">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-display font-black uppercase text-zinc-200 tracking-tight">Gestor de Obras do Catálogo</h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">CRUD - CREATE, READ, UPDATE, DELETE</p>
            </div>
            <button
              onClick={handleOpenAddAnime}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Cadastrar Novo Anime
            </button>
          </div>

          {/* ADD / EDIT ANIME INLINE DIALOGUE PANEL */}
          {isAnimeFormOpen && (
            <div className="bg-[#0b0b0b] border border-purple-500/20 p-5 rounded-2xl space-y-4 animate-scale-up">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs uppercase tracking-widest font-mono text-purple-400 font-black flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  {editingAnime ? `Editar Ficha - ${editingAnime.title}` : "Cadastrar Nova Obra"}
                </span>
                <button 
                  onClick={() => setIsAnimeFormOpen(false)}
                  className="text-xs text-zinc-500 hover:text-white font-mono cursor-pointer"
                >
                  X Fechar
                </button>
              </div>

              <form onSubmit={handleAnimeFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* JIKAN & ANILIST AUTOFILL ROW */}
                <div className="md:col-span-2 bg-[#040406] border border-zinc-900 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 mb-1">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-purple-305 block font-mono flex items-center gap-1 uppercase">
                      <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" /> Autocompletar Dados do Catálogo (Jikan / AniList)
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-normal">
                      Digite o nome aproximado do anime no campo <strong>"Título do Anime"</strong> abaixo, e clique no botão para capturar a capa original, sinopse, pontuação e episódios instantaneamente.
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleFetchExternalData}
                    disabled={fetchingExternal}
                    className="w-full md:w-auto px-4 py-2 font-black text-[10.5px] tracking-wide uppercase bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    {fetchingExternal ? "Carregando APIs..." : "⚡ Auto-Preencher Ficha"}
                  </button>
                </div>

                {externalError && (
                  <div className="md:col-span-2 text-rose-400 bg-rose-950/20 border border-rose-900/30 text-[10.5px] font-mono px-3 py-2 rounded-lg">
                    ⚠️ {externalError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Título do Anime</label>
                  <input
                    type="text"
                    required
                    placeholder="Solo Leveling"
                    value={animeTitle}
                    onChange={(e) => setAnimeTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">URL da Imagem de Capa</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={animeImage}
                    onChange={(e) => setAnimeImage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1 font-bold">Sinopse Resumida</label>
                  <textarea
                    required
                    placeholder="Resuma a história focado no impacto geral..."
                    value={animeDescription}
                    onChange={(e) => setAnimeDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white h-24 resize-none leading-normal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Temporada (Estação)</label>
                  <input
                    type="text"
                    placeholder="Temporada de Inverno 2026"
                    value={animeSeason}
                    onChange={(e) => setAnimeSeason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">URL Youtube Trailer Embed</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/embed/..."
                    value={animeTrailer}
                    onChange={(e) => setAnimeTrailer(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Gêneros (Separados por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ação, Fantasia, Lutas"
                    value={animeGenres}
                    onChange={(e) => setAnimeGenres(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Calendário / Horas</label>
                  <input
                    type="text"
                    placeholder="Sábados às 14:00"
                    value={animeCalendar}
                    onChange={(e) => setAnimeCalendar(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Total de Capítulos</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={animeEpisodes}
                      onChange={(e) => setAnimeEpisodes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Nota Inicial Cruzada</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="8.5"
                      value={animeRating}
                      onChange={(e) => setAnimeRating(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors text-white"
                    />
                  </div>
                </div>

                {animeErrorMsg && (
                  <div className="md:col-span-2 text-rose-450 bg-rose-950/20 border border-rose-900/30 text-xs p-2.5 rounded-lg">
                    ⚠️ {animeErrorMsg}
                  </div>
                )}
                
                {animeSuccessMsg && (
                  <div className="md:col-span-2 text-green-450 bg-green-950/20 border border-green-900/30 text-xs p-2.5 rounded-lg">
                    ✓ {animeSuccessMsg}
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAnimeFormOpen(false)}
                    className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-extrabold text-xs uppercase text-white cursor-pointer"
                  >
                    {editingAnime ? "Aplicar Alterações" : "Salvar Gravação"}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* LIST READ TABLE */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-900 font-display font-extrabold text-xs uppercase text-zinc-400">
              Obras no Banco de Dados
            </div>

            <div className="divide-y divide-zinc-900">
              {animes.length === 0 ? (
                <div className="text-center py-8 text-zinc-550 text-xs font-mono">
                  Nenhum registro de animes localizado.
                </div>
              ) : (
                animes.map(an => (
                  <div key={an.id} className="p-4 flex items-center justify-between hover:bg-zinc-950/75 transition-colors gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={an.image} 
                        alt={an.title} 
                        className="w-12 h-14 object-cover rounded-lg border border-zinc-850"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate flex items-center gap-1.5 header-clamp">
                          {an.title}
                          <span className="text-[9px] bg-zinc-900 text-purple-400 font-bold border border-zinc-800 px-1.5 py-0.5 rounded font-mono">
                            ID: {an.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 mt-1 leading-normal">
                          {an.description}
                        </p>
                        <div className="flex gap-2 flex-wrap items-center mt-1.5">
                          <span className="text-[9px] text-zinc-450 font-mono italic uppercase">⭐ Consenso: <strong className="text-amber-400 font-sans">{an.communityRating || "Nenhum"}</strong></span>
                          {an.topCodes && an.topCodes.length > 0 && (
                            <span className="text-[9px] text-zinc-450 font-mono"> | Tags: <strong className="text-purple-400 font-mono font-bold">{an.topCodes.join(" • ")}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleOpenEditAnime(an)}
                        className="p-2 bg-zinc-900 hover:bg-purple-950/20 text-zinc-400 hover:text-purple-400 border border-zinc-800 hover:border-purple-900/30 rounded-lg cursor-pointer transition-colors"
                        title="Modificar Detalhes ou Imagem"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAnime(an.id)}
                        className="p-2 bg-zinc-900 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/30 rounded-lg cursor-pointer transition-colors"
                        title="Deletar Anime permanentemente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TABS MODULE: MANAGE CODES (TAGS) */}
      {activeAdminTab === "codes" && (
        <div className="space-y-4 animate-fade-in" id="crud-codes-module">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col - Input Forms */}
            <div className="space-y-4 lg:col-span-1">
              <div className="bg-[#0a0a0a] border border-zinc-850 p-4 rounded-2xl space-y-3">
                <span className="text-xs uppercase tracking-widest font-mono text-purple-400 font-black flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {editingCodeId ? "Modificar Código" : "Novo Código Direto"}
                </span>
                
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Insira o acrônimo de 2-4 letras em maiúsculo (Ex: PO) e seu significado didático para ser instantaneamente associado nas fichas de votos.
                </p>

                <form onSubmit={handleCodeSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Acrônimo / Letra</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      placeholder="PO"
                      value={codeName}
                      onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Significado Estendido</label>
                    <input
                      type="text"
                      required
                      placeholder="Personagem Overpower"
                      value={codeMeaning}
                      onChange={(e) => setCodeMeaning(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white"
                    />
                  </div>

                  {codeErrorMsg && <div className="text-[10px] text-rose-455 bg-rose-950/20 border border-rose-900/10 p-2 rounded">⚠️ {codeErrorMsg}</div>}
                  {codeSuccessMsg && <div className="text-[10px] text-green-455 bg-green-950/20 border border-green-900/15 p-2 rounded">✓ {codeSuccessMsg}</div>}

                  <div className="flex gap-2 justify-end pt-1">
                    {editingCodeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCodeId(null);
                          setCodeName("");
                          setCodeMeaning("");
                        }}
                        className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] uppercase font-bold text-zinc-400 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] rounded uppercase tracking-wider cursor-pointer"
                    >
                      {editingCodeId ? "Gravar Edição" : "Aprovar Instanteamente"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 2 cols - Interactive list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-inner">
                <div className="p-4 border-b border-zinc-900 font-display font-extrabold text-xs uppercase text-zinc-300 flex items-center justify-between">
                  <span>Moderação técnica de Códigos</span>
                </div>

                <div className="divide-y divide-zinc-900 max-h-110 overflow-y-auto">
                  {globalCodes.length === 0 ? (
                    <div className="text-center py-10 font-mono text-xs text-zinc-500">
                      Nenhum código técnico registrado no banco.
                    </div>
                  ) : (
                    globalCodes.map(cd => {
                      const isPending = !cd.approved;
                      return (
                        <div key={cd.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-950/80 transition-all gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                                isPending 
                                  ? "bg-amber-950/40 text-amber-450 border border-amber-500/30" 
                                  : "bg-purple-950/40 text-purple-400 border border-purple-950/40"
                              }`}>
                                {cd.code}
                              </span>
                              <span className="font-bold text-xs text-zinc-200 truncate">{cd.meaning}</span>
                              {isPending && (
                                <span className="bg-amber-950/10 text-amber-500 text-[8px] font-mono font-bold uppercase tracking-widest px-1 mr-1 border border-amber-950 style-flash animate-pulse">
                                  SUGEstão Pendente
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isPending && (
                              <button
                                onClick={() => handleApproveCode(cd.id)}
                                className="px-2.5 py-1 text-[9px] bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white font-extrabold uppercase rounded border border-green-500/10 hover:border-transparent transition-all cursor-pointer"
                                title="Aprovar e Publicar esta tag"
                              >
                                Aprovar Tag
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingCodeId(cd.id);
                                setCodeName(cd.code);
                                setCodeMeaning(cd.meaning);
                              }}
                              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-purple-900/30 rounded-lg text-zinc-400 hover:text-purple-400 cursor-pointer transition-colors"
                              title="Editar acrônimo/significado"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCode(cd.id)}
                              className="p-1.5 bg-zinc-900 border border-zinc-805 hover:border-rose-900/30 rounded-lg text-zinc-400 hover:text-rose-405 cursor-pointer transition-colors"
                              title="Declinar/Apagar tag"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TABS MODULE: POST ARTICLES */}
      {activeAdminTab === "news" && (
        <div className="space-y-4 animate-fade-in" id="publish-news-module">
          <div className="bg-[#0b0b0b] border border-zinc-850 p-6 rounded-2xl max-w-2xl mx-auto space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <h2 className="text-base font-display font-black uppercase text-white flex items-center gap-1.5">
                <Newspaper className="h-5 w-5 text-purple-400" />
                Publicar Artigo & Notícia Oficial
              </h2>
              <p className="text-zinc-500 text-xs mt-1 leading-normal">
                Dispare artigos de novos episódios, trailers especiais ou curiosidades sobre os mangás líderes no ranking geral.
              </p>
            </div>

            <form onSubmit={handlePostNewsSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Título do Artigo</label>
                <input
                  type="text"
                  required
                  placeholder="EX: Jujutsu Kaisen 3 Divulga Pôster Explosivo!"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Categoria</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white"
                  >
                    <option value="Novidade">Novidade Geral</option>
                    <option value="Filme">Cinema / Filme</option>
                    <option value="Mangá">Mangá & Capítulos</option>
                    <option value="Curiosidade">Curiosidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">URL de Imagem de Destaque</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newsImage}
                    onChange={(e) => setNewsImage(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Conteúdo do Artigo</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Redija o texto em formato limpo..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white resize-none leading-relaxed"
                />
              </div>

              {newsStatus.error && (
                <div className="text-rose-450 bg-rose-950/25 border border-rose-900/30 text-xs p-2.5 rounded-lg">
                  ⚠️ {newsStatus.error}
                </div>
              )}
              {newsStatus.success && (
                <div className="text-green-455 bg-green-950/20 border border-green-900/30 text-xs p-2.5 rounded-lg">
                  ✓ Artigo de novidade publicado com sucesso para a comunidadade otaku!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                Divulgar Artigo <Check className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABS MODULE: EMIT NOTIFICATIONS */}
      {activeAdminTab === "notif" && (
        <div className="space-y-4 animate-fade-in" id="trigger-notifications-module">
          <div className="bg-[#0b0b0b] border border-zinc-850 p-6 rounded-2xl max-w-2xl mx-auto space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <h2 className="text-base font-display font-black uppercase text-white flex items-center gap-1.5">
                <Bell className="h-5 w-5 text-purple-400" />
                Disparar Alerta ou Comunicado Oficial
              </h2>
              <p className="text-zinc-500 text-xs mt-1 leading-normal">
                Envia lembretes piscantes no sininho de notificações de todos os leitores.
              </p>
            </div>

            <form onSubmit={handleTriggerNotifSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Título do Alerta</label>
                <input
                  type="text"
                  required
                  placeholder="EX: Votação da Semana Aberta!"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1 font-bold">Vincular a qual Anime? (Opcional)</label>
                <select
                  value={notifAnimeId}
                  onChange={(e) => setNotifAnimeId(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white"
                >
                  <option value="">Nenhum - Alerta Geral</option>
                  {animes.map(an => (
                    <option key={an.id} value={an.id}>{an.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Mensagem do Alerta</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Redija o informativo de rodapé..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 p-2.5 rounded-lg text-xs outline-none focus:border-purple-500 text-white resize-none leading-normal"
                />
              </div>

              {notifStatus.error && (
                <div className="text-rose-450 bg-rose-950/25 border border-rose-900/30 text-xs p-2.5 rounded-lg">
                  ⚠️ {notifStatus.error}
                </div>
              )}
              {notifStatus.success && (
                <div className="text-green-455 bg-green-950/20 border border-green-900/30 text-xs p-2.5 rounded-lg">
                  ✓ Alerta disparado! Os usuários visualizarão a bolha piscante lilás na barra superior.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                Disparar Alerta Geral <Check className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
