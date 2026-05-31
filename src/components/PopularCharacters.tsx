import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Crown, 
  Trophy, 
  Plus, 
  Trash2, 
  Search, 
  Heart, 
  UserCheck, 
  Undo2, 
  BookOpen, 
  Tv, 
  AlertCircle 
} from "lucide-react";
import { PopularCharacter } from "../types";

interface PopularCharactersProps {
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
}

export default function PopularCharacters({ currentUser }: PopularCharactersProps) {
  const [characters, setCharacters] = useState<PopularCharacter[]>([]);
  const [top3, setTop3] = useState<PopularCharacter[]>([]);
  const [top10, setTop10] = useState<PopularCharacter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New character form
  const [newCharName, setNewCharName] = useState("");
  const [newCharOrigin, setNewCharOrigin] = useState("");
  const [newCharImage, setNewCharImage] = useState("");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stateful deletion confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load characters on focus/mount
  const fetchCharacters = async () => {
    try {
      const res = await fetch("/api/popular-characters");
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
        setTop3(data.top3 || []);
        setTop10(data.top10 || []);
      }
    } catch (err) {
      console.error("Erro ao carregar ranking de personagens:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleVote = async (charId: string) => {
    if (!currentUser.isLoggedIn) {
      alert("Por favor, faça login no topo da página para votar no seu personagem favorito! 🎌");
      return;
    }

    try {
      const res = await fetch(`/api/popular-characters/${charId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.uid })
      });

      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
        setTop3(data.top3 || []);
        setTop10(data.top10 || []);
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao computar voto.");
      }
    } catch (err) {
      console.error("Erro na votação:", err);
    }
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newCharName.trim()) {
      setFormError("Informe o nome do personagem.");
      return;
    }
    if (!newCharOrigin.trim()) {
      setFormError("Informe o anime ou mangá ao qual o personagem pertence.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/popular-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCharName,
          animeOrManga: newCharOrigin,
          imageUrl: newCharImage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
        setTop3(data.top3 || []);
        setTop10(data.top10 || []);
        setFormSuccess(`"${newCharName}" foi adicionado com sucesso e está pronto para receber votos!`);
        
        // Reset fields
        setNewCharName("");
        setNewCharOrigin("");
        setNewCharImage("");
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Erro ao adicionar personagem.");
      }
    } catch (err) {
      setFormError("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    try {
      const res = await fetch(`/api/admin/popular-characters/${charId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
        setTop3(data.top3 || []);
        setTop10(data.top10 || []);
        setDeletingId(null);
      } else {
        alert("Erro ao excluir personagem.");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.animeOrManga.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a user has already voted for this specific character
  const userVotedId = characters.find(c => c.votedUserIds?.includes(currentUser.uid))?.id;

  return (
    <div className="space-y-8 animate-fade-in" id="popular-characters-tab">
      
      {/* HEADER BANNER */}
      <div className="p-6 md:p-8 rounded-2xl bg-zinc-950 border border-zinc-900 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6" id="char-leaderboard-banner">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-650/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 z-10 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Votação de Elite</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tighter leading-none uppercase">
            Personagem <span className="text-purple-450">Mais Popular</span>
          </h1>
          <p className="text-xs text-zinc-405 leading-relaxed">
            Quem é o verdadeiro governante dos corações otaku? Adicione seus guerreiros, divindades ou heróis preferidos, confira a foto deles e vote no seu campeão absoluto. <span className="text-amber-450">Limite de 1 voto ativo por samurai!</span>
          </p>
        </div>
        <div className="z-10 bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-center flex flex-col items-center">
          <Trophy className="h-8 w-8 text-amber-500 mb-1.5 animate-bounce" />
          <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest leading-none">Total Registrados</span>
          <span className="text-2xl font-black text-white mt-1 leading-none">{characters.length}</span>
        </div>
      </div>

      {/* TOP 3 PODIUM SECTIONS */}
      {top3.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" /> Pódio Absoluto - TOP 3 Mais Votados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* 2ND PLACE (SILVER) */}
            {top3[1] && (
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5 relative flex flex-col justify-between items-center text-center order-2 md:order-1 scale-95 md:scale-95 transition-all hover:border-zinc-800">
                <div className="absolute top-3 left-3 bg-zinc-900 border border-zinc-800 text-[11px] font-mono px-2 py-0.5 rounded text-zinc-400 font-bold uppercase tracking-wider">
                  🥈 2º Lugar
                </div>
                
                <div className="flex flex-col items-center mt-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-650 shadow-lg relative bg-zinc-905">
                    <img 
                      src={top3[1].imageUrl} 
                      alt={top3[1].name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display font-black text-lg text-white tracking-tight mt-3 uppercase">{top3[1].name}</h3>
                  <span className="text-xs text-zinc-405 font-mono flex items-center gap-1 mt-0.5 justify-center">
                    <BookOpen className="h-3.5 w-3.5 text-purple-400" /> {top3[1].animeOrManga}
                  </span>
                </div>

                <div className="w-full mt-6 flex flex-col items-center">
                  <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 w-full mb-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Votos</span>
                    <span className="text-xs font-bold font-mono text-zinc-205">{top3[1].votes}</span>
                  </div>
                  
                  <button
                    onClick={() => handleVote(top3[1].id)}
                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      userVotedId === top3[1].id 
                        ? "bg-purple-950/30 text-purple-400 border border-purple-500/30 hover:bg-purple-950/50"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow"
                    }`}
                  >
                    {userVotedId === top3[1].id ? (
                      <>
                        <UserCheck className="h-4 w-4" /> Voto Ativo
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" /> Votar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 1ST PLACE (GOLD) */}
            {top3[0] && (
              <div className="bg-gradient-to-b from-purple-955/20 to-zinc-950/90 border border-amber-900/35 rounded-xl p-6 relative flex flex-col justify-between items-center text-center order-1 md:order-2 scale-100 md:scale-105 shadow-2xl shadow-purple-550/5 transition-all hover:border-amber-800/40">
                <div className="absolute -top-3.5 bg-amber-500 text-black border border-amber-450 text-[10px] font-mono px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                  <Crown className="h-3 w-3 fill-amber-950" /> 👑 Campeão Geral
                </div>
                
                <div className="flex flex-col items-center mt-3">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-500/80 shadow-xl relative bg-zinc-905">
                    <img 
                      src={top3[0].imageUrl} 
                      alt={top3[0].name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display font-black text-xl text-white tracking-tight mt-3 uppercase">{top3[0].name}</h3>
                  <span className="text-xs text-zinc-405 font-mono flex items-center gap-1 mt-1 justify-center">
                    <Tv className="h-3.5 w-3.5 text-purple-400" /> {top3[0].animeOrManga}
                  </span>
                </div>

                <div className="w-full mt-6 flex flex-col items-center">
                  <div className="bg-amber-955/10 px-3 py-1.5 rounded-lg border border-amber-900/40 w-full mb-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-amber-500 uppercase font-black">Votos de Honra</span>
                    <span className="text-xs font-bold font-mono text-amber-400">{top3[0].votes}</span>
                  </div>
                  
                  <button
                    onClick={() => handleVote(top3[0].id)}
                    className={`w-full py-2.5 rounded-lg text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      userVotedId === top3[0].id 
                        ? "bg-purple-950/30 text-purple-400 border border-purple-500/30 hover:bg-purple-950/50"
                        : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
                    }`}
                  >
                    {userVotedId === top3[0].id ? (
                      <>
                        <UserCheck className="h-4 w-4" /> Voto Ativo
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 fill-amber-950" /> Votar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 3RD PLACE (BRONZE) */}
            {top3[2] && (
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-5 relative flex flex-col justify-between items-center text-center order-3 md:order-3 scale-95 md:scale-95 transition-all hover:border-zinc-800">
                <div className="absolute top-3 left-3 bg-zinc-900 border border-zinc-800 text-[11px] font-mono px-2 py-0.5 rounded text-amber-600/70 font-bold uppercase tracking-wider">
                  🥉 3º Lugar
                </div>
                
                <div className="flex flex-col items-center mt-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-700/60 shadow-lg relative bg-zinc-905">
                    <img 
                      src={top3[2].imageUrl} 
                      alt={top3[2].name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display font-black text-lg text-white tracking-tight mt-3 uppercase">{top3[2].name}</h3>
                  <span className="text-xs text-zinc-405 font-mono flex items-center gap-1 mt-0.5 justify-center">
                    <BookOpen className="h-3.5 w-3.5 text-purple-400" /> {top3[2].animeOrManga}
                  </span>
                </div>

                <div className="w-full mt-6 flex flex-col items-center">
                  <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 w-full mb-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Votos</span>
                    <span className="text-xs font-bold font-mono text-zinc-205">{top3[2].votes}</span>
                  </div>
                  
                  <button
                    onClick={() => handleVote(top3[2].id)}
                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      userVotedId === top3[2].id 
                        ? "bg-purple-950/30 text-purple-400 border border-purple-500/30 hover:bg-purple-950/50"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow"
                    }`}
                  >
                    {userVotedId === top3[2].id ? (
                      <>
                        <UserCheck className="h-4 w-4" /> Voto Ativo
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" /> Votar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CORE CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* LEFT COLUMN: ADD PERSONAGEM FORM & TOP 10 LEADERBOARD */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ADD IN SUBMISSION CONTAINER */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-905 pb-2.5">
              <div className="bg-purple-950/40 p-1.5 rounded-md border border-purple-900/40 text-purple-450">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Adicionar Personagem</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Cadastre qualquer herói no Templo Otaku</p>
              </div>
            </div>

            <form onSubmit={handleAddCharacter} className="space-y-3.5">
              <div>
                <label className="block text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Nome do Personagem *
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Roronoa Zoro, Mikasa Ackerman"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-805 hover:border-zinc-800 text-zinc-300 text-xs p-2.5 rounded outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Anime ou Mangá de Origem *
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: One Piece, Jujutsu Kaisen"
                  value={newCharOrigin}
                  onChange={(e) => setNewCharOrigin(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-805 hover:border-zinc-800 text-zinc-300 text-xs p-2.5 rounded outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 mb-1 flex items-center justify-between">
                  <span>URL da Imagem (Opcional)</span>
                  <span className="text-[8px] text-zinc-505 dark:text-zinc-600 font-bold uppercase">(Usa fallback se vazio)</span>
                </label>
                <input 
                  type="url" 
                  placeholder="https://exemplo.com/foto.jpg"
                  value={newCharImage}
                  onChange={(e) => setNewCharImage(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-805 hover:border-zinc-800 text-zinc-300 text-xs p-2.5 rounded outline-none focus:border-purple-600 transition"
                />
              </div>

              {formError && (
                <div className="bg-rose-950/20 border border-rose-500/10 p-2 text-rose-450 text-[10px] rounded leading-relaxed flex items-center gap-1.5 font-mono uppercase animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5" /> {formError}
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-950/20 border border-emerald-500/10 p-2.5 text-emerald-450 text-[10px] rounded leading-relaxed flex items-center gap-1.5 font-bold animate-fade-in">
                  <Sparkles className="h-3.5 w-3.5" /> {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs rounded tracking-widest cursor-pointer transition disabled:opacity-40"
              >
                {isSubmitting ? "Registrando..." : "Registrar Personagem"}
              </button>
            </form>
          </div>

          {/* TOP 10 GENERAL LISTING */}
          {top10.length > 0 && (
            <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-905 pb-2.5">
                <Trophy className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tabela de Liderança</h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {top10.map((char, index) => {
                  const placeColors = ["font-mono font-black text-amber-450", "font-mono font-bold text-zinc-300", "font-mono text-amber-700"];
                  return (
                    <div 
                      key={char.id}
                      className="p-2 border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-950 rounded flex items-center justify-between gap-1.5 transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-5 text-center text-xs ${placeColors[index] || "font-mono text-zinc-500"}`}>
                          #{index + 1}
                        </span>
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-zinc-800">
                          <img 
                            src={char.imageUrl} 
                            alt={char.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-200 uppercase truncate pr-0.5">{char.name}</p>
                          <p className="text-[9px] text-zinc-500 font-mono truncate">{char.animeOrManga}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-zinc-300">{char.votes}</span>
                        <span className="text-[8px] font-mono text-zinc-500 block uppercase">Votos</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SEARCH, ALL CHARACTERS GRID & ADMING MODERATOR CONTROL */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* SEARCH SYSTEM BAR */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-zinc-905 pb-3">
            <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-widest flex items-center gap-1.5 shrink-0 self-start sm:self-center">
              ⚔️ Catálogo Geral ({filteredCharacters.length} Personagens)
            </h3>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-505" />
              <input 
                type="text"
                placeholder="Buscar personagem ou anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-9 pr-4 bg-zinc-950 text-xs text-zinc-200 border border-zinc-850 hover:border-zinc-800 rounded outline-none focus:border-purple-600 transition"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-24 text-center font-mono text-xs text-zinc-500 animate-pulse">
              Carregando lutadores do Templo Otaku...
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="py-24 border border-zinc-900 border-dashed rounded-xl bg-zinc-955/20 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-zinc-500 mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Nenhum guerreiro corresponde ao seu termo de busca.</p>
              <p className="text-[10px] text-zinc-550">Utilize o painel a esquerda para adicionar o personagem na lista!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCharacters.map((c) => {
                const isSelected = userVotedId === c.id;
                return (
                  <div 
                    key={c.id}
                    className={`bg-zinc-950/80 border rounded-xl overflow-hidden p-4 flex gap-3 h-32 relative transition-all duration-250 ${
                      isSelected 
                        ? "border-purple-550/65 shadow-lg shadow-purple-955/5" 
                        : "border-zinc-900 hover:border-zinc-850 hover:bg-zinc-950"
                    }`}
                  >
                    {/* Character image avatar right left */}
                    <div className="w-24 shrink-0 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-905 h-full relative">
                      <img 
                        src={c.imageUrl} 
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Meta info wrapper */}
                    <div className="flex flex-col justify-between flex-1 truncate">
                      <div className="truncate pr-4">
                        <span className="text-[8px] font-mono uppercase bg-zinc-905 text-zinc-455 px-1.5 py-0.5 rounded leading-none border border-zinc-855/35">
                          #{c.votes} {c.votes === 1 ? "voto" : "votos"}
                        </span>
                        <h4 className="font-display font-black text-sm uppercase text-white truncate mt-1 tracking-tight leading-none">
                          {c.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5" title={c.animeOrManga}>
                          {c.animeOrManga}
                        </p>
                      </div>

                      {/* Vote actions */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => handleVote(c.id)}
                          className={`flex-1 py-1.5 rounded text-[9.5px] font-black uppercase text-center transition cursor-pointer flex items-center justify-center gap-1 border ${
                            isSelected 
                              ? "bg-purple-950/40 text-purple-450 border-purple-900/40 hover:bg-purple-950/60"
                              : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Undo2 className="h-3 w-3 shrink-0 text-purple-400" /> Cancelar Voto
                            </>
                          ) : (
                            <>
                              <Heart className="h-3 w-3 shrink-0 text-rose-500" /> Votar
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* ADMIN CORNER CONTROLLER MODERATION FOR DELETION */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      {currentUser.role === "admin" && (
                        <>
                          {deletingId === c.id ? (
                            <div className="flex items-center gap-1 bg-[#060606] p-1 border border-zinc-850 rounded animate-fade-in text-[9px] font-mono leading-none">
                              <span className="text-zinc-500 font-bold px-1 select-none">Excluir?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCharacter(c.id)}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded cursor-pointer uppercase text-[8px]"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-1.5 py-0.5 bg-zinc-800 hover:text-white text-zinc-350 rounded font-bold cursor-pointer uppercase text-[8px]"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(c.id)}
                              className="p-1.5 bg-zinc-950 hover:bg-rose-950/30 text-zinc-600 hover:text-rose-455 border border-zinc-900 hover:border-rose-950/40 rounded transition duration-200 cursor-pointer"
                              title="Retirar do Catálogo do Templo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
