import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  Filter, 
  Heart, 
  Zap, 
  Tv2,
  Calendar,
  AlertCircle,
  BellRing,
  ArrowUpDown,
  Flame,
  LayoutGrid,
  ListOrdered,
  HelpCircle,
  Hash
} from "lucide-react";
import { Anime, Comment, NewsItem, PushNotification, Code } from "./types";
import Navbar from "./components/Navbar";
import AnimeCard from "./components/AnimeCard";
import Ranking from "./components/Ranking";
import NewsSection from "./components/NewsSection";
import WatchlistSection from "./components/WatchlistSection";
import AnimeDetailModal from "./components/AnimeDetailModal";
import AdminPanel from "./components/AdminPanel";
import AlphabeticalListCodes from "./components/AlphabeticalListCodes";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("catalog");
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [availableCodes, setAvailableCodes] = useState<Code[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  
  // View mode for the catalog (standard bento grid vs alphabetical indices)
  const [catalogViewMode, setCatalogViewMode] = useState<"grid" | "alphabetical">("grid");

  // Comments loaded for the active modal
  const [activeComments, setActiveComments] = useState<Comment[]>([]);

  // User States (Simulated Login context linked to Express backend preferences)
  const [currentUser, setCurrentUser] = useState({
    uid: "anonymous_user",
    email: "",
    name: "Otaku Anônimo",
    role: "user" as "admin" | "vip" | "user",
    isLoggedIn: false
  });

  // Saved ids
  const [votedAnimes, setVotedAnimes] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState("Todas");
  const [selectedPopularity, setSelectedPopularity] = useState("Todos");
  const [sortBy, setSortBy] = useState("votes_desc");

  // Filter tag codes checked by the user
  const [checkedCodes, setCheckedCodes] = useState<string[]>([]);

  // Push Notification Slide Alert
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Initial Fetches
  const fetchAllData = async () => {
    try {
      const animeRes = await fetch("/api/animes");
      if (animeRes.ok) {
        const data = await animeRes.json();
        setAnimes(data);
        
        // Auto-update modal if open
        if (selectedAnime) {
          const matching = data.find((a: Anime) => a.id === selectedAnime.id);
          if (matching) setSelectedAnime(matching);
        }
      }

      const newsRes = await fetch("/api/news");
      if (newsRes.ok) {
        const data = await newsRes.json();
        setNews(data);
      }

      const notifRes = await fetch("/api/notifications");
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data);
      }

      const codeRes = await fetch("/api/codes");
      if (codeRes.ok) {
        const data = await codeRes.json();
        setAvailableCodes(data);
      }
    } catch (err) {
      console.error("Erro ao sincronizar com servidor full-stack Express:", err);
    }
  };

  const fetchUserPrefs = async () => {
    if (!currentUser.isLoggedIn || currentUser.uid === "anonymous_user") {
      setFavorites([]);
      setWatchlist([]);
      return;
    }
    try {
      const favRes = await fetch(`/api/user/${currentUser.uid}/favorites`);
      if (favRes.ok) {
        const data = await favRes.json();
        setFavorites(data);
      }

      const watchRes = await fetch(`/api/user/${currentUser.uid}/watchlist`);
      if (watchRes.ok) {
        const data = await watchRes.json();
        setWatchlist(data);
      }
    } catch (err) {
      console.error("Erro ao buscar preferências do usuário:", err);
    }
  };

  // Poll notifications periodically to simulate Push Alerts
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchUserPrefs();
  }, [currentUser.uid, currentUser.isLoggedIn]);

  // Load comments for the selected anime detail modal
  useEffect(() => {
    if (selectedAnime) {
      fetchComments(selectedAnime.id);
    }
  }, [selectedAnime]);

  const fetchComments = async (animeId: string) => {
    try {
      const res = await fetch(`/api/animes/${animeId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setActiveComments(data);
      }
    } catch (err) {
      console.error("Erro ao obter comentários:", err);
    }
  };

  // Vote Trigger
  const handleVote = async (animeId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Avoid triggering details modal if clicked card
    }

    try {
      const res = await fetch(`/api/animes/${animeId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.uid })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update local items array
        setAnimes(prev => prev.map(a => a.id === animeId ? data.anime : a));
        
        // Update if currently selected in modal
        if (selectedAnime && selectedAnime.id === animeId) {
          setSelectedAnime(data.anime);
        }

        // Toggle vote tracking
        if (votedAnimes.includes(animeId)) {
          setVotedAnimes(prev => prev.filter(id => id !== animeId));
        } else {
          setVotedAnimes(prev => [...prev, animeId]);
        }
      }
    } catch (err) {
      console.error("Erro ao computar voto:", err);
    }
  };

  // Submit Rating & Special codes
  const handleRateAnime = async (animeId: string, ratingValue: string, codes: string[]) => {
    try {
      const res = await fetch(`/api/animes/${animeId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          ratingValue,
          codes
        })
      });

      if (res.ok) {
        const updatedAnime = await res.json();
        setAnimes(prev => prev.map(a => a.id === animeId ? updatedAnime : a));
        if (selectedAnime && selectedAnime.id === animeId) {
          setSelectedAnime(updatedAnime);
        }
        // Refresh codes and data in background
        fetchAllData();
      }
    } catch (err) {
      console.error("Erro ao cadastrar voto de nota e códigos:", err);
    }
  };

  // Toggle Favorites
  const handleToggleFavorite = async (animeId: string) => {
    if (!currentUser.isLoggedIn) {
      alert("Por favor, faça login utilizando seu e-mail para salvar favoritos.");
      return;
    }
    try {
      const res = await fetch(`/api/user/${currentUser.uid}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animeId })
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites);
      }
    } catch (e) {
      console.error("Erro ao favoritar:", e);
    }
  };

  // Toggle Watchlist
  const handleToggleWatchlist = async (animeId: string) => {
    if (!currentUser.isLoggedIn) {
      alert("Por favor, faça login utilizando seu e-mail para gerenciar sua watchlist.");
      return;
    }
    try {
      const res = await fetch(`/api/user/${currentUser.uid}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animeId })
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist);
      }
    } catch (e) {
      console.error("Erro ao gerenciar watchlist:", e);
    }
  };

  // Comments Post
  const handleSubmitComment = async (commentText: string) => {
    if (!selectedAnime) return;
    try {
      const res = await fetch(`/api/animes/${selectedAnime.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentUser.name,
          comment: commentText,
          isVip: currentUser.role === "vip" || currentUser.role === "admin"
        })
      });

      if (res.ok) {
        // Refresh comments list
        fetchComments(selectedAnime.id);
      }
    } catch (err) {
      console.error("Erro ao postar comentário:", err);
    }
  };

  // Like a Comment
  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      if (res.ok) {
        if (selectedAnime) {
          fetchComments(selectedAnime.id);
        }
      }
    } catch (e) {
      console.error("Erro ao curtir comentário:", e);
    }
  };

  // Admin Publish News
  const handlePostNews = async (newsData: { title: string; content: string; category: string; imageUrl?: string; author: string }) => {
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Erro desconhecido do servidor.");
    }

    const data = await res.json();
    setNews(prev => [data, ...prev]);
  };

  // Admin Push Notification Trigger
  const handleTriggerNotification = async (title: string, message: string, animeId?: string) => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, animeId })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Erro ao criar alerta.");
    }

    const data = await res.json();
    setNotifications(prev => [data, ...prev]);

    // Push interactive toast alerts on client screen immediately to simulate device alerts!
    setToastNotification(`${title} - ${message}`);
    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const toggleCheckedCode = (codeStr: string) => {
    if (checkedCodes.includes(codeStr)) {
      setCheckedCodes(checkedCodes.filter(c => c !== codeStr));
    } else {
      setCheckedCodes([...checkedCodes, codeStr]);
    }
  };

  // Helper to group animes for the Alphabetical listing view
  const getGroupedAlphabetical = (list: Anime[]) => {
    const groups: { [key: string]: Anime[] } = {};
    const sorted = [...list].sort((a, b) => a.title.localeCompare(b.title));

    sorted.forEach((an) => {
      const firstLetter = an.title.charAt(0).toUpperCase();
      const groupKey = /[A-Z]/.test(firstLetter) ? firstLetter : "#";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(an);
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  // Get Genres listed in seeded items dynamically
  const genresList = ["Todos", ...Array.from(new Set(animes.flatMap(a => a.genres)))];
  const seasonsList = ["Todas", ...Array.from(new Set(animes.map(a => a.season).filter(Boolean)))];

  // Advanced Filtering Engine: Handles Search query parsing, Tag Codes matching & criteria
  const filteredAnimes = animes.filter((anime) => {
    // 1. Search Logic supporting code combination search (Ex: "PO + LT" or "AL")
    const matchesSearchText = (() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      // Detect if user is entering traits (e.g. "PO + LT" or "+")
      const uppercaseTokens = query
        .split("+")
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0);

      const hasRegisteredCodeQuery = uppercaseTokens.some(token => 
        availableCodes.some(c => c.code === token)
      );

      // If it contains valid code tags in query, filter exclusively by code match!
      if (hasRegisteredCodeQuery) {
        return uppercaseTokens.every(token => (anime.topCodes || []).includes(token));
      }

      // Normal text matches title, genre or sinopse
      return anime.title.toLowerCase().includes(query) ||
             anime.description.toLowerCase().includes(query) ||
             anime.genres.some(g => g.toLowerCase().includes(query));
    })();

    // 2. Clickable tag code criteria filter
    const matchesCheckedCodes = checkedCodes.length === 0 || 
      checkedCodes.every(code => (anime.topCodes || []).includes(code));

    // 3. Metadata filters
    const matchesGenre = selectedGenre === "Todos" || anime.genres.includes(selectedGenre);
    const matchesSeason = selectedSeasonFilter === "Todas" || anime.season === selectedSeasonFilter;
    
    let matchesPopularity = true;
    if (selectedPopularity === "high") {
      matchesPopularity = anime.votes >= 180;
    } else if (selectedPopularity === "medium") {
      matchesPopularity = anime.votes >= 100 && anime.votes < 180;
    } else if (selectedPopularity === "low") {
      matchesPopularity = anime.votes < 100;
    } else if (selectedPopularity === "highly_rated") {
      matchesPopularity = anime.rating >= 9.0;
    }

    return matchesSearchText && matchesCheckedCodes && matchesGenre && matchesSeason && matchesPopularity;
  }).sort((a, b) => {
    if (sortBy === "votes_desc") {
      return b.votes - a.votes;
    } else if (sortBy === "votes_asc") {
      return a.votes - b.votes;
    } else if (sortBy === "rating_desc") {
      return b.rating - a.rating;
    } else if (sortBy === "title_asc") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#060408] text-zinc-100 flex flex-col font-sans" id="applet-viewport">
      
      {/* PUSH NOTIFICATION SIMULATED TOAST MESSAGE */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-[#110625] border-l-4 border-purple-500 border-t border-r border-b border-purple-900 shadow-2xl rounded-r-xl p-4 animate-scale-up">
          <div className="flex items-start space-x-3 text-white">
            <div className="bg-purple-950 p-2 rounded-xl text-purple-400 border border-purple-900">
              <BellRing className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-purple-405 block">NOTIFICAÇÃO EM TIME REAL</span>
              <h4 className="text-xs font-bold font-display text-white mt-1">{toastNotification.split(" - ")[0]}</h4>
              <p className="text-[11px] text-zinc-400 leading-normal mt-1">{toastNotification.split(" - ").slice(1).join(" - ")}</p>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-zinc-500 hover:text-white text-xs font-bold leading-none p-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* BANNER GREETINGS FOR ANIME COMMUNITY */}
      <header className="bg-black border-b border-zinc-900 py-2 shadow-inner" id="top-announcement">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-550">
          <div className="flex items-center space-x-1.5 font-bold">
            <Zap className="h-3.5 w-3.5 text-purple-450 animate-pulse fill-purple-600/10" />
            <span>🎌 HONRA, CARACTeRÍSTICAS & NOTAS DE COMBATE</span>
          </div>
          <span className="hidden md:inline-block">ANIME BUSHIDÔ • COMUNIDADE DE NOTAS DA TEMPORADA</span>
        </div>
      </header>

      {/* NAVBAR */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />

      {/* CORE WRAPPERS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6" id="core-wrapper">
        
        {/* 1. CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            
            {/* HERO HERO TITLE */}
            <div className="p-6 md:p-10 rounded-2xl bg-zinc-950 border border-zinc-850 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in" id="promotional-billboard">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-650/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-4 z-10 text-center md:text-left max-w-xl">
                <div className="inline-flex items-center space-x-2 bg-purple-900/20 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Caminho do Guerreiro Otaku</span>
                </div>
                <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tighter leading-none uppercase">
                  O Destino do <span className="text-purple-450">Melhor Anime</span> está em suas mãos
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
                  Vincule códigos como <strong>PO</strong> (Overpower), <strong>AL</strong> (Animação Linda) ou <strong>LT</strong> (Lutas Top). Ajude otakus pelo Brasil a encontrarem as melhores obras em segundos! 🎌
                </p>
              </div>

              {/* Leader Display Widget */}
              <div className="bg-black/40 border border-zinc-850 hover:border-purple-500/25 p-4 rounded-xl flex items-center space-x-4 max-w-sm w-full z-10 transition-colors">
                <div className="bg-purple-950/40 text-purple-400 p-3 rounded-lg border border-purple-900/30">
                  <Tv2 className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest leading-none">Voto do Trono Imperial</div>
                  <div className="font-black text-sm text-zinc-150 uppercase tracking-tight mt-1 truncate max-w-[200px]">
                    {animes.length > 0 ? [...animes].sort((a,b)=>b.votes-a.votes)[0]?.title : "..."}
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">Mais votado pela comunidade</span>
                </div>
              </div>
            </div>

            {/* FILTER SEARCH RIG */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850" id="filter-panel">
              
              {/* Prominent Search Bar with Traits parsing */}
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-purple-500 animate-pulse" />
                <input
                  type="text"
                  placeholder="Pesquise por nome, gêneros ou códigos de características (Ex: PO + LT)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#030303] text-sm text-zinc-100 pl-12 pr-12 py-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-zinc-600 font-mono tracking-wide"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-3.5 text-zinc-400 hover:text-white text-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 h-7 w-7 rounded flex items-center justify-center transition-colors font-mono cursor-pointer"
                    title="Limpar pesquisa"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Tag Codes Badge Selector */}
              <div className="pt-2 border-t border-zinc-900">
                <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">Filtrar Ativamente por Códigos:</span>
                <div className="flex flex-wrap gap-1.5">
                  {availableCodes.map(c => {
                    const isChecked = checkedCodes.includes(c.code);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCheckedCode(c.code)}
                        className={`text-[9.5px] font-mono px-2.5 py-1 rounded cursor-pointer transition-all flex items-center gap-1 border ${
                          isChecked 
                            ? "bg-purple-900/30 text-purple-300 border-purple-500/50 font-bold"
                            : "bg-black text-zinc-550 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                        }`}
                        title={c.meaning}
                      >
                        {c.code}
                        <span className="text-[8px] text-zinc-600 font-normal">({c.meaning})</span>
                      </button>
                    );
                  })}
                  {checkedCodes.length > 0 && (
                    <button
                      onClick={() => setCheckedCodes([])}
                      className="text-[9.5px] font-mono text-rose-455 px-2 py-1 hover:underline cursor-pointer"
                    >
                      Limpar tags [x]
                    </button>
                  )}
                </div>
              </div>

              {/* Filtering columns row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-zinc-900">
                {/* 1. Genre */}
                <div className="flex flex-col space-y-1.5 font-sans">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-purple-500" />
                    <span>Filtrar por Gênero</span>
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-[#030303] border border-zinc-800 text-xs text-zinc-350 p-2.5 rounded-lg outline-none cursor-pointer focus:border-purple-500 transition-colors"
                  >
                    {genresList.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Season */}
                <div className="flex flex-col space-y-1.5 font-sans">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                    <span>Filtrar por Estação</span>
                  </label>
                  <select
                    value={selectedSeasonFilter}
                    onChange={(e) => setSelectedSeasonFilter(e.target.value)}
                    className="w-full bg-[#030303] border border-zinc-805 text-xs text-zinc-350 p-2.5 rounded-lg outline-none cursor-pointer focus:border-purple-500 transition-colors"
                  >
                    {seasonsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Popularity */}
                <div className="flex flex-col space-y-1.5 font-sans">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
                    <span>Votação (Métrica)</span>
                  </label>
                  <select
                    value={selectedPopularity}
                    onChange={(e) => setSelectedPopularity(e.target.value)}
                    className="w-full bg-[#030303] border border-zinc-805 text-xs text-zinc-350 p-2.5 rounded-lg outline-none cursor-pointer focus:border-purple-500 transition-colors"
                  >
                    <option value="Todos">Qualquer Popularidade</option>
                    <option value="high">Super Populosos (+180 Votos 🔥)</option>
                    <option value="medium">Audiência Intermediária (100-179 Votos)</option>
                    <option value="low">Em Crescimento (&lt; 100 Votos)</option>
                    <option value="highly_rated">Mais Estrelados (Média 9.0+)</option>
                  </select>
                </div>

                {/* 4. Sorting */}
                <div className="flex flex-col space-y-1.5 font-sans">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5 text-purple-500" />
                    <span>Ordenar Catálogo por:</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-[#030303] border border-zinc-805 text-xs text-zinc-350 p-2.5 rounded-lg outline-none cursor-pointer focus:border-purple-500 transition-colors font-medium"
                  >
                    <option value="votes_desc">Arrecadação de Votos (Maior)</option>
                    <option value="votes_asc">Arrecadação de Votos (Menor)</option>
                    <option value="rating_desc">Mais Estrelas (Média 10/10)</option>
                    <option value="title_asc">Nome do Anime (A-Z Ordem Alfabética)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARDS HEADER / TOGGLE TAB VIEW MODE FOR ALPHABETICAL INDEXES */}
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 flex-wrap gap-3">
                <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight flex items-center gap-2">
                  🎌 Catálogo de Animes ({filteredAnimes.length})
                </h2>
                
                {/* INTERACTIVE TOGGLE: BENTO GRID VS ALPHABETICAL INDEX */}
                <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-850 text-xs">
                  <button
                    onClick={() => setCatalogViewMode("grid")}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                      catalogViewMode === "grid" 
                        ? "bg-purple-600 font-extrabold text-white" 
                        : "text-zinc-450 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" /> Cards
                  </button>
                  <button
                    onClick={() => setCatalogViewMode("alphabetical")}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                      catalogViewMode === "alphabetical" 
                        ? "bg-purple-600 font-extrabold text-white" 
                        : "text-zinc-450 hover:text-white"
                    }`}
                  >
                    <ListOrdered className="h-4 w-4" /> Ordem Alfabética (A-Z)
                  </button>
                </div>
              </div>

              {/* RENDER VIEW 1: BENTO CARDS */}
              {catalogViewMode === "grid" && (
                filteredAnimes.length === 0 ? (
                  <div className="py-24 text-center rounded-2xl border border-dashed border-zinc-900" id="catalog-empty">
                    <AlertCircle className="h-10 w-10 text-zinc-650 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Nenhum anime localizado com os filtros vigentes.</p>
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedGenre("Todos");
                        setSelectedSeasonFilter("Todas");
                        setSelectedPopularity("Todos");
                        setCheckedCodes([]);
                      }}
                      className="mt-4 px-3.5 py-1.5 text-xs text-purple-400 hover:text-white font-bold border border-zinc-800 rounded bg-[#030303] cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="catalog-grid">
                    {filteredAnimes.map((anime) => (
                      <AnimeCard 
                        key={anime.id} 
                        anime={anime} 
                        onVote={handleVote}
                        votedAnimes={votedAnimes}
                        isFavorite={favorites.includes(anime.id)}
                        onSelect={() => setSelectedAnime(anime)}
                      />
                    ))}
                  </div>
                )
              )}

              {/* RENDER VIEW 2: SLICK INDEXED ALPHABETICAL GROUPS (DIRECT METRIC MATCH REQUESTED) */}
              {catalogViewMode === "alphabetical" && (
                filteredAnimes.length === 0 ? (
                  <div className="py-24 text-center rounded-2xl border border-dashed border-zinc-900" id="catalog-empty">
                    <AlertCircle className="h-10 w-10 text-zinc-650 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Nenhum anime localizado na ordenação.</p>
                  </div>
                ) : (
                  <div className="space-y-6 bg-[#030303]/40 border border-zinc-900 rounded-2xl p-6" id="alphabetical-index-container">
                    {getAlphabeticalGroups(getGroupedAlphabetical(filteredAnimes))}
                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* GUIDED ALPHABETICAL & CODES REFERENCE TAB */}
        {activeTab === "az-codes" && (
          <AlphabeticalListCodes 
            animes={animes}
            availableCodes={availableCodes}
            onRateAnime={handleRateAnime}
            onSelectAnime={setSelectedAnime}
            currentUser={currentUser}
          />
        )}

        {/* 2. RANKING TAB */}
        {activeTab === "ranking" && (
          <Ranking 
            animes={animes} 
            onVote={handleVote} 
            votedAnimes={votedAnimes}
            onSelectAnime={setSelectedAnime}
          />
        )}

        {/* 3. NEWS TAB */}
        {activeTab === "news" && (
          <NewsSection 
            news={news} 
            animes={animes}
          />
        )}

        {/* 4. WATCHLIST TAB */}
        {activeTab === "watchlist" && (
          <WatchlistSection 
            animes={animes} 
            favorites={favorites} 
            watchlist={watchlist} 
            onToggleFavorite={handleToggleFavorite} 
            onToggleWatchlist={handleToggleWatchlist} 
            onSelectAnime={setSelectedAnime}
          />
        )}

        {/* 5. MODERATOR ADMIN PANEL PANEL */}
        {activeTab === "admin" && (
          <AdminPanel 
            animes={animes} 
            onTriggerNotification={handleTriggerNotification} 
            onPostNews={handlePostNews} 
            currentUserRole={currentUser.role}
            onRefreshData={fetchAllData}
          />
        )}

      </main>

      {/* COMPREHENSIVE FLOATING MODAL OVERLAY */}
      {selectedAnime && (
        <AnimeDetailModal 
          anime={selectedAnime} 
          onClose={() => setSelectedAnime(null)} 
          onVote={handleVote} 
          votedAnimes={votedAnimes} 
          favorites={favorites} 
          watchlist={watchlist} 
          onToggleFavorite={handleToggleFavorite} 
          onToggleWatchlist={handleToggleWatchlist}
          comments={activeComments}
          onSubmitComment={handleSubmitComment}
          onLikeComment={handleLikeComment}
          currentUser={currentUser}
          onRateAnime={handleRateAnime}
          availableCodes={availableCodes}
        />
      )}

      {/* FOOTER POLISHED */}
      <footer className="bg-black/90 border-t border-zinc-900 py-10 px-4 mt-16 text-zinc-550 text-xs" id="footer-section">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="font-display font-black text-base text-zinc-200 tracking-tighter uppercase">
              Anime <span className="text-purple-400">Bushidô</span>
            </span>
            <p className="text-[11px] text-zinc-550">© 2026 Anime Bushidô - Honra nipônica no ranking consensual de animes.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px] text-zinc-400">
            <a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab("catalog"); }} className="hover:text-purple-400 transition-colors">Portal Catálogo</a>
            <a href="#ranking" onClick={(e) => { e.preventDefault(); setActiveTab("ranking"); }} className="hover:text-purple-400 transition-colors">Templo da Votação</a>
            <a href="#news" onClick={(e) => { e.preventDefault(); setActiveTab("news"); }} className="hover:text-purple-400 transition-colors">Mundo Otaku Notícias</a>
            <a href="#watchlist" onClick={(e) => { e.preventDefault(); setActiveTab("watchlist"); }} className="hover:text-purple-400 transition-colors">Meu Bushidô Pessoal</a>
          </div>

          <div className="text-center sm:text-right font-mono text-[10px] text-zinc-600 block">
            <span>Sandboxed Cloud Container • Porte Escutado: 3000 • Estilo Editorial Premium Dark</span>
          </div>
        </div>
      </footer>

    </div>
  );

  // Helper inside code to render grouped indices beautifully in accordance to requested layout
  function getAlphabeticalGroups(alphabeticalData: [string, Anime[]][]) {
    return alphabeticalData.map(([letter, list]) => (
      <div key={letter} className="relative border-b border-zinc-900 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
        
        {/* BIG NEON LETTER BOX */}
        <div className="flex items-center space-x-3 mb-3.5">
          <div className="bg-purple-950/40 text-purple-400 border border-purple-500/30 text-base font-mono font-black rounded-lg h-9 w-9 flex items-center justify-center shadow">
            {letter}
          </div>
          <div className="h-[1px] flex-1 bg-zinc-900" />
        </div>

        {/* LIST OF ANIMES UNDER GROUP */}
        <ul className="space-y-3.5 pl-2">
          {list.map(an => (
            <li 
              key={an.id} 
              onClick={() => setSelectedAnime(an)}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950/40 hover:bg-[#07070a] border border-transparent hover:border-purple-500/10 cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-500 font-bold group-hover:translate-x-1 transition-transform">-</span>
                <span className="font-bold text-sm text-zinc-150 group-hover:text-purple-400 transition-colors">
                  {an.title}
                </span>
                
                {/* Meta consensus tag inside line listing */}
                <span className="text-[10px] text-zinc-550">
                  • Nota: <strong className="text-amber-400 font-sans">{an.communityRating || "OK"}</strong>
                </span>
              </div>

              {/* Tag Codes Joined inline */}
              {an.topCodes && an.topCodes.length > 0 && (
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="text-[9px] text-zinc-550 font-mono italic uppercase">Características:</span>
                  <span className="font-mono font-black text-xs text-purple-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                    {an.topCodes.join(" • ")}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>

      </div>
    ));
  }
}
