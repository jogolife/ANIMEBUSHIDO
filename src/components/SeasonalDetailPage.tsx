import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Share2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Send, 
  Check, 
  UserCheck, 
  Users, 
  Flame,
  Globe
} from "lucide-react";
import { Anime, PopularCharacter } from "../types";

interface SeasonalDetailPageProps {
  animeSlug: "one-piece" | "naruto";
  animeId: string;
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
  animes: Anime[];
  onVote: (animeId: string, event?: React.MouseEvent) => Promise<void>;
  onRate: (animeId: string, ratingValue: string, codes: string[]) => Promise<void>;
  onBack: () => void;
}

export default function SeasonalDetailPage({
  animeSlug,
  animeId,
  currentUser,
  animes,
  onVote,
  onRate,
  onBack
}: SeasonalDetailPageProps) {
  // Extract anime live state
  const anime = animes.find(a => a.id === animeId);

  // Character list belonging to this anime
  const [characters, setCharacters] = useState<PopularCharacter[]>([]);
  const [loadingChars, setLoadingChars] = useState(true);

  // New character form inside this anime page
  const [newCharName, setNewCharName] = useState("");
  const [newCharImage, setNewCharImage] = useState("");
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmittingChar, setIsSubmittingChar] = useState(false);
  const [deletingCharId, setDeletingCharId] = useState<string | null>(null);

  // Sharing links generated
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  const shareUrl = "https://animebushido.vercel.app";
  const shareMessage = `Votei no ${animeSlug === "one-piece" ? "One Piece" : "Naruto"} como melhor anime! ${shareUrl}`;

  const fetchCharacters = async () => {
    try {
      const res = await fetch("/api/popular-characters");
      if (res.ok) {
        const data = await res.json();
        const allChars: PopularCharacter[] = data.characters || [];
        
        // Filter characters that belong to this anime/manga
        const matched = allChars.filter(c => {
          const lowerName = c.animeOrManga.toLowerCase();
          if (animeSlug === "one-piece") {
            return lowerName.includes("one piece") || lowerName.includes("op") || lowerName.includes("luffy");
          } else {
            return lowerName.includes("naruto") || lowerName.includes("shippuden") || lowerName.includes("boruto");
          }
        });
        setCharacters(matched);
      }
    } catch (err) {
      console.error("Erro ao carregar personagens:", err);
    } finally {
      setLoadingChars(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [animeSlug]);

  const handleVoteCharacter = async (charId: string) => {
    if (!currentUser.isLoggedIn) {
      alert("Por favor, faça login no topo da página para votar no personagem! 🎌");
      return;
    }

    try {
      const res = await fetch(`/api/popular-characters/${charId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.uid })
      });

      if (res.ok) {
        // Reload characters
        fetchCharacters();
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao computar voto.");
      }
    } catch (err) {
      console.error("Erro na votação do personagem:", err);
    }
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    if (!newCharName.trim()) {
      setFormMsg({ type: "error", text: "Informe o nome do personagem." });
      return;
    }

    setIsSubmittingChar(true);
    try {
      const res = await fetch("/api/popular-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCharName.trim(),
          animeOrManga: animeSlug === "one-piece" ? "One Piece" : "Naruto",
          imageUrl: newCharImage.trim() || undefined
        })
      });

      if (res.ok) {
        await fetchCharacters();
        setFormMsg({
          type: "success",
          text: `"${newCharName}" foi adicionado com sucesso! Agora todos podem votar.`
        });
        setNewCharName("");
        setNewCharImage("");
      } else {
        const err = await res.json();
        setFormMsg({ type: "error", text: err.error || "Erro ao criar." });
      }
    } catch (err) {
      setFormMsg({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setIsSubmittingChar(false);
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    try {
      const res = await fetch(`/api/admin/popular-characters/${charId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await fetchCharacters();
        setDeletingCharId(null);
      } else {
        alert("Erro ao excluir personagem.");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  const handleRateSubmit = (stars: number) => {
    setUserRating(stars);
    // Directly submit rating to the parent backend trigger
    onRate(animeId, stars.toString(), []);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Preset designs
  const bannerImage = animeSlug === "one-piece"
    ? "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=80";

  const presetPortrait = animeSlug === "one-piece"
    ? "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80";

  const defaultSynopsis = animeSlug === "one-piece"
    ? "O indestrutível Monkey D. Luffy consome a fruta Akuma no Mi de elasticidade e parte com seu bando do Chapéu de Palha na maior aventura pirata de todos os tempos em busca do tesouro One Piece."
    : "A saga emocionante de Naruto Uzumaki, um jovem ninja que carrega a Raposa de Nove Caudas selada em seu corpo e faz de tudo para conquistar o respeito de sua vila e tornar-se o Hokage.";

  const synopsisText = anime?.description || defaultSynopsis;
  const ratingAvg = anime?.rating || (animeSlug === "one-piece" ? 9.3 : 9.0);
  const voteCount = anime?.votes || 0;

  // Social URLs
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;

  // Find if user has already voted for this char
  const userVotedCharId = characters.find(c => c.votedUserIds?.includes(currentUser.uid))?.id;

  return (
    <div className="space-y-8 animate-fade-in" id="seasonal-anime-detail">
      
      {/* NAVIGATION OUT */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg border border-zinc-850 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Portal
      </button>

      {/* AMBIENT HERO ACCENT COVER */}
      <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden border border-zinc-900 shadow-2xl" id="anime-hero-billboard">
        <img 
          src={bannerImage} 
          alt={`${animeSlug} cover`} 
          className="w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        
        {/* Floating title badges */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left w-full md:w-auto">
            
            {/* Portrait card overlay */}
            <div className="w-24 h-36 bg-zinc-900 border-2 border-zinc-800 rounded-lg overflow-hidden shrink-0 hidden sm:block shadow-lg">
              <img 
                src={anime?.image || presetPortrait} 
                alt={`${animeSlug} poster`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2">
              <span className="bg-purple-950/80 border border-purple-500/50 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full text-purple-400">
                ⭐ Ouro da Temporada • {animeSlug.toUpperCase()}
              </span>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tighter uppercase leading-none">
                {anime?.title || (animeSlug === "one-piece" ? "One Piece" : "Naruto")}
              </h1>
              <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
                Gêneros: {anime?.genres?.join(", ") || (animeSlug === "one-piece" ? "Aventura, Piratas" : "Ação, Ninja")}
              </p>
            </div>
          </div>

          {/* VOTE STAT BLOCK */}
          <div className="bg-black/70 border border-zinc-850 p-4 rounded-xl flex items-center gap-3 shrink-0 self-center md:self-end">
            <div className="text-right">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Votos Conquistados</span>
              <span className="text-xl font-mono font-black text-white">{voteCount}</span>
            </div>
            <button
              onClick={() => onVote(animeId)}
              className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-lg border border-purple-500 transition-colors cursor-pointer"
              title="Votar neste anime!"
            >
              <Heart className="h-5 w-5 fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* METRIC SPECS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SYNOPSIS PANEL */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-3.5 md:col-span-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            📰 Sinopse Oficial / Enredo
          </h2>
          <p className="text-zinc-200 text-sm leading-relaxed font-sans">
            {synopsisText}
          </p>

          {/* TRAILER EMBED (IF EXISTS) */}
          {anime?.trailerUrl && (
            <div className="pt-4 border-t border-zinc-900/60 mt-4">
              <h3 className="text-[10px] font-mono text-zinc-405 uppercase tracking-wider mb-2.5">
                📺 Trailer Oficial da Temporada
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden border border-zinc-900 bg-black">
                <iframe 
                  src={anime.trailerUrl}
                  title="Trailer YouTube"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE EVALUATION & SHARE */}
        <div className="space-y-6">
          
          {/* RATING NOTE CONTAINER */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              ⭐ Nota da Comunidade
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-mono font-black text-white leading-none">{ratingAvg}</span>
              <div>
                <span className="text-xs text-zinc-400 font-mono block">média global</span>
                <div className="flex gap-0.5 text-amber-500 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500 shrink-0" />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-905">
              <p className="text-[10px] font-sans text-zinc-400 mb-2">Avalie você também com sua nota pessoal:</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateSubmit(star)}
                    className={`flex-1 text-center py-1 rounded text-[9px] font-mono font-bold transition border cursor-pointer ${
                      userRating === star
                        ? "bg-amber-500 border-amber-450 text-black font-black"
                        : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SHARE WIDGET (USER REQUEST) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-purple-400" /> Adicionar Compartilhamento
              </h2>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
              Prefira convocar a guilda para votar no seu campeão da temporada!
            </p>

            <div className="bg-[#050505] p-3 rounded border border-zinc-905 text-zinc-400 font-mono text-[10px] leading-relaxed select-all">
              {shareMessage}
            </div>

            {/* SHARE BUTTONS */}
            <div className="grid grid-cols-2 gap-2">
              <a 
                href={waUrl} 
                target="_blank" 
                rel="noreferrer"
                className="py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                WhatsApp
              </a>
              <a 
                href={fbUrl} 
                target="_blank" 
                rel="noreferrer"
                className="py-2 px-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Facebook
              </a>
              <a 
                href={twUrl} 
                target="_blank" 
                rel="noreferrer"
                className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                X (Twitter)
              </a>
              <a 
                href={tgUrl} 
                target="_blank" 
                rel="noreferrer"
                className="py-2 px-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Telegram
              </a>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" /> Copiado!
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-purple-400" /> Copiar Mensagem
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* POPULAR CHARACTERS SUBSECTION (INTEGRATED) */}
      <div className="space-y-6 pt-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-900 pb-3">
          <div className="space-y-1">
            <h2 className="text-lg font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" /> Personagens de {animeSlug === "one-piece" ? "One Piece" : "Naruto"}
            </h2>
            <p className="text-xs text-zinc-500 font-mono">Batalha de popularidade dos heróis desta obra específicos</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-510 dark:text-zinc-500 bg-zinc-950 border border-zinc-900 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Total na Arena: {characters.length}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ALL DETAILED CHARACTERS GRID */}
          <div className="lg:col-span-8">
            {loadingChars ? (
              <p className="font-mono text-xs text-zinc-500 py-12 text-center animate-pulse">Carregando lutadores...</p>
            ) : characters.length === 0 ? (
              <div className="p-12 border border-dashed border-zinc-900 rounded-xl text-center bg-zinc-950/25 space-y-2">
                <p className="text-xs font-mono text-zinc-400">Nenhum personagem registrado especificamente para este anime ainda.</p>
                <p className="text-[10px] text-zinc-550 uppercase">Use o formulário ao lado para registrar o seu preferido!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {characters.map((c) => {
                  const hasVotedForThis = userVotedCharId === c.id;
                  return (
                    <div 
                      key={c.id}
                      className={`p-4 rounded-xl border bg-zinc-950/70 flex gap-4 relative transition-all duration-200 h-28 ${
                        hasVotedForThis ? "border-purple-600/70 shadow-lg shadow-purple-950/10" : "border-zinc-900 hover:border-zinc-850"
                      }`}
                    >
                      <div className="w-20 shrink-0 rounded-lg overflow-hidden border border-zinc-900 bg-zinc-900">
                        <img 
                          src={c.imageUrl} 
                          alt={c.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex flex-col justify-between flex-1 truncate">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-mono font-bold bg-purple-950/50 text-purple-400 px-1.5 py-0.5 rounded leading-none border border-purple-900/35">
                              {c.votes} {c.votes === 1 ? "voto" : "votos"}
                            </span>
                          </div>
                          <h4 className="font-display font-black text-sm uppercase text-white truncate mt-1">{c.name}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono">{c.animeOrManga}</span>
                        </div>

                        <button
                          onClick={() => handleVoteCharacter(c.id)}
                          className={`w-full py-1 rounded text-[9px] font-black uppercase text-center transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                            hasVotedForThis 
                              ? "bg-purple-950/40 text-purple-400 border-purple-900/40 hover:bg-purple-950/60"
                              : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white"
                          }`}
                        >
                          {hasVotedForThis ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5 text-purple-400" /> Voto Ativo
                            </>
                          ) : (
                            <>
                              <Heart className="h-3.5 w-3.5 text-rose-500" /> Votar
                            </>
                          )}
                        </button>
                      </div>

                      {/* ADMIN EXCLUDE SYSTEM TRIGGER */}
                      {currentUser.role === "admin" && (
                        <div className="absolute top-3 right-3">
                          {deletingCharId === c.id ? (
                            <div className="flex items-center gap-1 bg-black/90 p-1 border border-zinc-850 rounded animate-fade-in text-[9px]">
                              <button 
                                onClick={() => handleDeleteCharacter(c.id)}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono text-[8px] font-bold cursor-pointer"
                              >
                                Sim
                              </button>
                              <button 
                                onClick={() => setDeletingCharId(null)}
                                className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono text-[8px] font-bold cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingCharId(c.id)}
                              className="p-1.5 bg-zinc-950 hover:bg-rose-950/20 text-zinc-600 hover:text-rose-455 border border-zinc-900 hover:border-rose-950/30 rounded cursor-pointer transition-colors"
                              title="Remover personagem (Admin)"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ADD CHARACTER ACCENT PANEL */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-905 pb-3">
                <div className="bg-purple-955/30 p-1.5 rounded text-purple-450 border border-purple-900/30">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Adicionar Integro</h3>
                  <p className="text-[9px] text-zinc-500 font-mono">Deseja impulsionar mais um herói?</p>
                </div>
              </div>

              <form onSubmit={handleAddCharacter} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    Nome do Personagem *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Sanji, Kakashi Hatake"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-805 hover:border-zinc-800 text-zinc-300 text-xs p-2.5 rounded outline-none focus:border-purple-600 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    Origem do Personagem
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-[#050505] border border-zinc-805 text-zinc-500 text-xs p-2.5 rounded outline-none cursor-not-allowed"
                    value={animeSlug === "one-piece" ? "One Piece" : "Naruto"}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1 flex items-center justify-between">
                    <span>URL da Imagem</span>
                    <span className="text-[7.5px] text-zinc-600 font-bold uppercase">(Opcional)</span>
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://exemplo.com/hero.jpg"
                    value={newCharImage}
                    onChange={(e) => setNewCharImage(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-805 hover:border-zinc-800 text-zinc-300 text-xs p-2.5 rounded outline-none focus:border-purple-600 transition"
                  />
                </div>

                {formMsg && (
                  <p className={`text-[10px] font-mono uppercase p-2 border rounded leading-relaxed animate-fade-in ${
                    formMsg.type === "success" 
                      ? "bg-emerald-950/20 border-emerald-500/10 text-emerald-450 font-bold" 
                      : "bg-rose-950/20 border-rose-500/10 text-rose-455"
                  }`}>
                    {formMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingChar}
                  className="w-full py-2 bg-purple-650 hover:bg-purple-600 text-white font-black uppercase text-xs rounded tracking-widest cursor-pointer transition disabled:opacity-40"
                >
                  {isSubmittingChar ? "Registrando..." : "Registrar"}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
