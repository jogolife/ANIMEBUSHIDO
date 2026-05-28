import React from "react";
import { ThumbsUp, Star, Eye } from "lucide-react";
import { Anime } from "../types";

interface AnimeCardProps {
  key?: any;
  anime: Anime;
  onVote: (id: string, e?: any) => void | Promise<void>;
  votedAnimes: string[];
  isFavorite: boolean;
  onSelect: () => void;
}

export default function AnimeCard({
  anime,
  onVote,
  votedAnimes,
  isFavorite,
  onSelect
}: AnimeCardProps) {
  const hasVoted = votedAnimes.includes(anime.id);

  // Custom rating formatted as stars in accordance to user request
  const formatStars = (ratingStr?: string) => {
    if (!ratingStr) return "OK";
    if (ratingStr === "Absolute Cinema") return "⭐ Absolute Cinema";
    if (ratingStr === "Ótimo") return "⭐⭐ Ótimo";
    if (ratingStr === "Bom") return "⭐⭐⭐ Bom";
    return ratingStr; // fallback for "OK", "Ruim", "Péssimo"
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-[#080808]/60 hover:bg-[#0c0c0c] border border-zinc-850 hover:border-purple-500/30 rounded-xl overflow-hidden shadow-xl group cursor-pointer transition-all duration-300 relative flex flex-col justify-between"
      id={`anime-card-${anime.id}`}
    >
      {/* Absolute Badges overlay */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
        {isFavorite && (
          <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow">
            ❤️ Favorito
          </span>
        )}
      </div>

      <span className="absolute top-3 right-3 bg-black/85 backdrop-blur-md text-amber-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-zinc-800 z-10 flex items-center gap-1 shadow">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        {anime.rating}
      </span>

      {/* COVER IMAGE */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        
        {/* Hover overlay indicator */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
          <div className="bg-purple-600 text-white px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-lg scale-95 group-hover:scale-100 transition-all">
            Abafar Detalhes & Votar
          </div>
        </div>
      </div>

      {/* METADATA CONTENT */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="text-[9px] text-purple-400 font-mono uppercase tracking-wider font-bold">
            {anime.season}
          </span>
          
          <h2 className="text-base font-display font-black text-white tracking-tight leading-snug group-hover:text-purple-400 transition-colors line-clamp-1">
            {anime.title}
          </h2>

          {/* Core Feature Dynamic Presentation Box */}
          <div className="bg-[#030303]/90 border border-zinc-900 rounded-lg p-2.5 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wide">Avaliação:</span>
              <span className="font-bold text-amber-300 font-display flex items-center">
                {formatStars(anime.communityRating)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-900/60">
              <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wide">Códigos:</span>
              <span className="font-mono font-extrabold text-purple-400 tracking-tight text-xs flex gap-0.5">
                {anime.topCodes && anime.topCodes.length > 0 ? (
                  anime.topCodes.join(" • ")
                ) : (
                  <span className="text-zinc-650 text-[10px] font-normal italic">Nenhum</span>
                )}
              </span>
            </div>
          </div>

          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed pt-1">
            {anime.description}
          </p>
        </div>

        <div className="mt-4">
          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {anime.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase">
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider leading-none">VOTAÇÃO</span>
              <span className="font-mono text-xs font-bold text-zinc-350 mt-1">
                {anime.votes} Votos
              </span>
            </div>

            {/* QUICK VIEW TRIGGER */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="px-3 py-1.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 text-purple-400 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 transition-all outline-none cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver Ficha
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
