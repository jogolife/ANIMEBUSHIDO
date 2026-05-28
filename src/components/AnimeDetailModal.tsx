import React, { useState, useEffect } from "react";
import { 
  X, 
  ThumbsUp, 
  Calendar, 
  Star, 
  Film, 
  Heart, 
  Bookmark, 
  Sparkles, 
  ExternalLink,
  Plus,
  Compass,
  CheckCircle2,
  FileCheck2
} from "lucide-react";
import { Anime, Comment, Code } from "../types";
import CommentSection from "./CommentSection";

interface AnimeDetailModalProps {
  anime: Anime;
  onClose: () => void;
  onVote: (id: string, e?: React.MouseEvent) => void | Promise<void>;
  votedAnimes: string[];
  favorites: string[];
  watchlist: string[];
  onToggleFavorite: (id: string) => void;
  onToggleWatchlist: (id: string) => void;
  comments: Comment[];
  onSubmitComment: (commentText: string) => void;
  onLikeComment: (commentId: string) => void;
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
  onRateAnime: (animeId: string, ratingValue: string, codes: string[]) => Promise<void>;
  availableCodes: Code[];
}

export default function AnimeDetailModal({
  anime,
  onClose,
  onVote,
  votedAnimes,
  favorites,
  watchlist,
  onToggleFavorite,
  onToggleWatchlist,
  comments,
  onSubmitComment,
  onLikeComment,
  currentUser,
  onRateAnime,
  availableCodes
}: AnimeDetailModalProps) {
  const hasVoted = votedAnimes.includes(anime.id);
  const isFavorite = favorites.includes(anime.id);
  const inWatchlist = watchlist.includes(anime.id);

  const [localRatingSelection, setLocalRatingSelection] = useState<string>("Ótimo");
  const [localCodesSelection, setLocalCodesSelection] = useState<string[]>([]);
  
  // Custom code generator states
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [newCodeTxt, setNewCodeTxt] = useState("");
  const [newCodeMeaning, setNewCodeMeaning] = useState("");
  const [codeSuccessMsg, setCodeSuccessMsg] = useState("");
  const [codeErrorMsg, setCodeErrorMsg] = useState("");

  const ratingOptions = ["Péssimo", "Ruim", "OK", "Bom", "Ótimo", "Absolute Cinema"];

  // Pre-fill active selections if available
  useEffect(() => {
    if (anime.topCodes) {
      setLocalCodesSelection(anime.topCodes.slice(0, 2));
    }
  }, [anime]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.isLoggedIn) {
      return;
    }
    await onRateAnime(anime.id, localRatingSelection, localCodesSelection);
    // Visual alert feedback
    const originalText = document.getElementById("rating-save-btn");
    if (originalText) {
      originalText.innerText = "✓ Enviado com Sucesso!";
      originalText.classList.add("bg-green-700");
      setTimeout(() => {
        originalText.innerText = "Salvar Minha Avaliação";
        originalText.classList.remove("bg-green-700");
      }, 1500);
    }
  };

  const toggleSelectedCode = (codeStr: string) => {
    if (localCodesSelection.includes(codeStr)) {
      setLocalCodesSelection(localCodesSelection.filter(c => c !== codeStr));
    } else {
      setLocalCodesSelection([...localCodesSelection, codeStr]);
    }
  };

  const handleSuggestCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeSuccessMsg("");
    setCodeErrorMsg("");

    if (!newCodeTxt.trim() || !newCodeMeaning.trim()) {
      setCodeErrorMsg("Preencha todos os campos da sugestão.");
      return;
    }

    try {
      const response = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCodeTxt.toUpperCase().trim(),
          meaning: newCodeMeaning.trim()
        })
      });

      const body = await response.json();
      if (!response.ok) {
        setCodeErrorMsg(body.error || "Erro ao postar código");
      } else {
        setCodeSuccessMsg(`Código '${body.code}' enviado para análise da moderação!`);
        setNewCodeTxt("");
        setNewCodeMeaning("");
        setTimeout(() => setShowCodeForm(false), 2000);
      }
    } catch {
      setCodeErrorMsg("Falha crítica no envio da sugestão.");
    }
  };

  const formatStars = (ratingStr?: string) => {
    if (!ratingStr) return "OK";
    if (ratingStr === "Absolute Cinema") return "⭐ Absolute Cinema";
    if (ratingStr === "Ótimo") return "⭐⭐ Ótimo";
    if (ratingStr === "Bom") return "⭐⭐⭐ Bom";
    return ratingStr;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto leading-normal">
      <div 
        className="bg-[#080808] border border-zinc-805 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto relative text-zinc-100 shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        id="anime-modal-container"
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-white bg-zinc-950/80 hover:bg-purple-950 border border-zinc-800 hover:border-purple-900 rounded-full transition-all outline-none cursor-pointer"
          id="modal-close-btn"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HERO BANNER SECTION */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img 
            src={anime.image} 
            alt={anime.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent" />
          
          {/* OVERLAY BADGES */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {anime.genres.map((g) => (
                <span key={g} className="text-[9px] bg-black/85 border border-zinc-900 text-purple-305 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-bold">
                  {g}
                </span>
              ))}
            </div>
            
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tighter uppercase drop-shadow">
              {anime.title}
            </h2>
          </div>
        </div>

        {/* WORKSUITE INTERFACES */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLUMNS - DESCRIPTION, TRAILER, SEASONS & COMMUNITY CHATS */}
            <div className="md:col-span-2 space-y-6">
              
              {/* SYNOPSIS */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-mono text-purple-500 font-black mb-2 border-b border-zinc-850 pb-1">
                  Sinopse Oficial
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {anime.description}
                </p>
              </div>

              {/* TRAILER IFRAME */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-mono text-purple-500 font-black mb-3 flex items-center gap-1.5">
                  <Film className="h-4 w-4" />
                  Trailer Oficial do Anime
                </h3>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-850 shadow-inner">
                  <iframe
                    src={anime.trailerUrl}
                    title={`${anime.title} Official Trailer`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* CHRONOLOGY SET */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-mono text-purple-500 font-black mb-3">
                  Cronologia de Temporadas
                </h3>
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-3">
                  {anime.seasonsCatalog.length === 0 ? (
                    <div className="text-zinc-500 text-xs font-mono">Nenhuma temporada informada.</div>
                  ) : (
                    anime.seasonsCatalog.map((s) => (
                      <div 
                        key={s.seasonNumber}
                        className="flex items-center justify-between border-b border-zinc-900 pb-2.5 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="font-bold text-xs text-zinc-250">
                            Temporada {s.seasonNumber}: {s.title}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Ano de Lançamento: {s.year}
                          </div>
                        </div>

                        <span className="text-[10px] bg-purple-950/40 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded font-mono">
                          {s.episodes} episódios
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DISCUSSION CORNER COMMENTS */}
              <CommentSection
                animeId={anime.id}
                comments={comments}
                onLikeComment={onLikeComment}
                onSubmitComment={onSubmitComment}
                currentUser={currentUser}
              />

            </div>

            {/* RIGHT SIDEBAR - USER PERSISTENT ACTIONS & TIERS VOTES */}
            <div className="space-y-4">
              
              {/* PRIMARY COMMUNITY REVIEWS STATUS CARD */}
              <div className="bg-[#0c0c0c] border border-zinc-850 p-4 rounded-xl space-y-3 text-center">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                  Avaliação da Comunidade
                </div>
                
                <div className="flex flex-col items-center py-2 bg-zinc-950/60 rounded-lg border border-zinc-900">
                  <div className="flex items-center space-x-1 justify-center">
                    <span className="text-3xl font-display font-black text-amber-300">
                      {formatStars(anime.communityRating)}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
                    Consenso Geral Bushidô
                  </div>
                </div>

                <div className="flex justify-around items-center py-2.5 border-t border-b border-zinc-900 text-center">
                  <div>
                    <span className="block text-xl font-mono font-black text-zinc-100">
                      {anime.rating.toFixed(1)}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-zinc-500">Média (10)</span>
                  </div>
                  <div className="w-[1px] h-6 bg-zinc-850" />
                  <div>
                    <span className="block text-xl font-mono font-black text-zinc-100">
                      {anime.votes}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-zinc-500">Votos</span>
                  </div>
                </div>

                <button
                  onClick={(e) => onVote(anime.id, e)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transform active:scale-95 transition-all outline-none cursor-pointer ${
                    hasVoted 
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-850 hover:bg-zinc-800 hover:text-white"
                  }`}
                  id={`modal-vote-btn-${anime.id}`}
                >
                  <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-white" : ""}`} />
                  {hasVoted ? "Registrado no Ranking!" : "Votar no Ranking"}
                </button>
              </div>

              {/* 6-TIER ACTIVE VOTING CORNER FOR AUTHENTICATED */}
              <div className="bg-[#0b0b0b] border border-zinc-850 p-4 rounded-xl space-y-3">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Sua Nota & Características
                </div>

                {currentUser.isLoggedIn ? (
                  <form onSubmit={handleRatingSubmit} className="space-y-4">
                    
                    {/* Tier Selection Radio Group */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] text-zinc-400 font-mono uppercase">Escolha o Nível da Obra:</span>
                      
                      <div className="grid grid-cols-2 gap-1.5">
                        {ratingOptions.map(rOpt => {
                          const isSelected = localRatingSelection === rOpt;
                          return (
                            <button
                              key={rOpt}
                              type="button"
                              onClick={() => setLocalRatingSelection(rOpt)}
                              className={`py-1.5 px-2 rounded font-semibold text-[10px] transition-all text-left truncate cursor-pointer ${
                                isSelected 
                                  ? "bg-purple-900/40 text-purple-300 border border-purple-500/50" 
                                  : "bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
                              }`}
                            >
                              {rOpt === "Absolute Cinema" && "🎬 Absolute Cinema"}
                              {rOpt === "Ótimo" && "⭐ Ótimo"}
                              {rOpt === "Bom" && "✔️ Bom"}
                              {rOpt === "OK" && "👌 OK"}
                              {rOpt === "Ruim" && "👎 Ruim"}
                              {rOpt === "Péssimo" && "🗑️ Péssimo"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Code Multi-selection list */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] text-zinc-400 font-mono uppercase">Vincular Códigos:</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setShowCodeForm(!showCodeForm);
                            setCodeSuccessMsg("");
                            setCodeErrorMsg("");
                          }}
                          className="text-[9px] text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Sugerir Novo
                        </button>
                      </div>

                      {showCodeForm ? (
                        /* Suggest Code Miniature Form Drawer */
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-purple-900/30 space-y-2 mt-1 animate-fade-in text-[11px]">
                          <div className="font-bold text-[10px] uppercase font-mono text-purple-450">Sugerir Código à Moderação</div>
                          
                          <div>
                            <input 
                              type="text" 
                              maxLength={4}
                              placeholder="Código (Ex: LT)" 
                              value={newCodeTxt}
                              onChange={(e) => setNewCodeTxt(e.target.value.toUpperCase())}
                              className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-xs text-white rounded outline-none"
                            />
                          </div>
                          <div>
                            <input 
                              type="text" 
                              placeholder="Significado (Ex: Lutas Top)" 
                              value={newCodeMeaning}
                              onChange={(e) => setNewCodeMeaning(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-xs text-white rounded outline-none"
                            />
                          </div>

                          {codeErrorMsg && <div className="text-[9px] text-rose-450 leading-tight">⚠️ {codeErrorMsg}</div>}
                          {codeSuccessMsg && <div className="text-[9px] text-green-450 leading-tight">✓ {codeSuccessMsg}</div>}

                          <div className="flex gap-1.5 justify-end pt-1">
                            <button 
                              type="button" 
                              onClick={() => setShowCodeForm(false)}
                              className="px-2 py-1 text-[9px] text-zinc-500 hover:text-white cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button 
                              type="button" 
                              onClick={handleSuggestCodeSubmit}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 font-bold text-[9px] rounded text-white cursor-pointer"
                            >
                              Sugerir
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Chip list */
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                          {availableCodes.map(codeData => {
                            const isSelected = localCodesSelection.includes(codeData.code);
                            return (
                              <button
                                key={codeData.id}
                                type="button"
                                onClick={() => toggleSelectedCode(codeData.code)}
                                title={codeData.meaning}
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                                  isSelected 
                                    ? "bg-purple-600 text-white font-bold border border-purple-500"
                                    : "bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-zinc-900"
                                }`}
                              >
                                {codeData.code}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      id="rating-save-btn"
                      className="w-full py-2 bg-purple-600 hover:bg-[#aa4af0] text-center text-white font-extrabold text-[10px] rounded uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Salvar Minha Avaliação
                    </button>

                  </form>
                ) : (
                  <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-center text-zinc-500 text-xs py-5 leading-normal">
                    <Compass className="h-6 w-6 text-zinc-650 mx-auto mb-2" />
                    Por favor, faça Login usando sua <strong>Conta do Google</strong> no painel superior para destrancar a submissão de notas e códigos.
                  </div>
                )}
              </div>

              {/* TIMELINE CALENDAR DETAILS */}
              <div className="bg-zinc-900/45 border border-zinc-805 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  Transmissão no Calendário
                </div>
                <div className="font-bold text-xs text-zinc-150">
                  {anime.releaseCalendar || "Sem transmissões na grade técnica."}
                </div>
              </div>

              {/* TOGGLERS WATCHLIST / FAVORITES */}
              <div className="bg-zinc-900/20 border border-zinc-805 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider pb-1">
                  Minha Área
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleFavorite(anime.id)}
                    className={`p-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isFavorite 
                        ? "bg-rose-950/40 text-rose-455 border border-rose-500/30 font-extrabold" 
                        : "bg-zinc-955 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                    Favorito
                  </button>

                  <button
                    onClick={() => onToggleWatchlist(anime.id)}
                    className={`p-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      inWatchlist 
                        ? "bg-amber-955/40 text-amber-455 border border-amber-500/30 font-extrabold font-black" 
                        : "bg-zinc-955 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800"
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${inWatchlist ? "fill-amber-500 text-amber-500" : ""}`} />
                    Watchlist
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
