import React from "react";
import { Award, Flame, ThumbsUp, Sparkles, Star, Film } from "lucide-react";
import { Anime } from "../types";

interface RankingProps {
  animes: Anime[];
  onVote: (id: string) => void;
  votedAnimes: string[];
  onSelectAnime: (anime: Anime) => void;
}

export default function Ranking({ animes, onVote, votedAnimes, onSelectAnime }: RankingProps) {
  // Sort descending by votes
  const sortedAnimes = [...animes].sort((a, b) => b.votes - a.votes);
  const maxVotes = sortedAnimes[0]?.votes || 1;

  const getRankBadgeClass = (index: number) => {
    switch (index) {
      case 0:
        return "bg-purple-600 text-white font-black";
      case 1:
        return "bg-zinc-800 text-zinc-100 font-bold";
      case 2:
        return "bg-zinc-900 text-zinc-300 font-bold";
      default:
        return "bg-zinc-950 text-zinc-500 border border-zinc-900";
    }
  };

  const getRankSuffix = (index: number) => {
    switch (index) {
      case 0:
        return "👑 Líder da Audiência";
      case 1:
        return "🥈 Vice-Líder";
      case 2:
        return "🥉 Alta Recomendação";
      default:
        return `#${index + 1} Colocado`;
    }
  };

  return (
    <div className="bg-[#080808] rounded-xl border border-zinc-800 p-6 shadow-xl relative overflow-hidden animate-fade-in" id="ranking-container">
      {/* Background highlight decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-zinc-900">
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-white flex items-center gap-2">
            <Award className="h-7 w-7 text-purple-500" />
            Votação & Ranking Geral
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Atualizado automaticamente em tempo real a cada voto computado pela comunidade brasileira.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-zinc-900 px-3.5 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
          <Flame className="h-4 w-4 text-purple-500 animate-pulse" />
          <span>Total Acumulado: {animes.reduce((s, a) => s + a.votes, 0)} Votos</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedAnimes.map((anime, index) => {
          const popularityPct = Math.round((anime.votes / maxVotes) * 100);
          const hasVoted = votedAnimes.includes(anime.id);

          return (
            <div 
              key={anime.id}
              className="group relative flex flex-col md:flex-row md:items-center justify-between bg-zinc-950 hover:bg-zinc-900 border border-zinc-905 hover:border-zinc-800 p-4 rounded-xl transition-all duration-300"
            >
              {/* Placement & Image info */}
              <div className="flex items-center space-x-4">
                {/* Placement circle */}
                <div className={`w-10 h-10 rounded flex items-center justify-center font-mono font-black text-sm ${getRankBadgeClass(index)}`}>
                  {index + 1}
                </div>

                {/* Anime Image Banner (small) */}
                <div 
                  onClick={() => onSelectAnime(anime)}
                  className="w-14 h-14 rounded overflow-hidden bg-zinc-900 cursor-pointer relative shrink-0 border border-zinc-850"
                >
                  <img 
                    src={anime.image} 
                    alt={anime.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Film className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Name & Title description */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 
                      onClick={() => onSelectAnime(anime)}
                      className="font-display font-black text-base text-white hover:text-purple-400 cursor-pointer transition-colors"
                    >
                      {anime.title}
                    </h3>
                    <span className="text-[9px] text-[10px] text-zinc-550 font-mono tracking-wider uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-850 rounded">
                      {anime.season}
                    </span>
                  </div>

                  <p className="text-zinc-500 text-[10px] font-mono uppercase mt-0.5 tracking-wider">
                    {getRankSuffix(index)}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {anime.genres.slice(0, 3).map((g) => (
                      <span key={g} className="text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-500 rounded px-1.5 py-0.2 uppercase font-mono">
                        {g}
                      </span>
                    ))}
                    <span className="text-[9px] bg-zinc-900 border border-zinc-850 text-amber-500 rounded px-1.5 py-0.2 flex items-center gap-0.5 font-mono">
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      {anime.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Vote Controls */}
              <div className="mt-4 md:mt-0 flex items-center space-x-6 w-full md:w-auto shrink-0 pl-14 md:pl-0">
                {/* Live Statistics Visual Meter */}
                <div className="hidden sm:block w-40">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    <span>Popularidade</span>
                    <span>{popularityPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-sm transition-all duration-500"
                      style={{ width: `${popularityPct}%` }}
                    />
                  </div>
                </div>

                {/* Vote counters */}
                <div className="text-left md:text-center min-w-[70px]">
                  <span className="block font-mono text-lg font-black text-zinc-100">
                    {anime.votes}
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">
                    Acumulados
                  </span>
                </div>

                {/* Voting Action Trigger */}
                <button
                  onClick={() => onVote(anime.id)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none ${
                    hasVoted 
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  }`}
                  id={`vote-rank-btn-${anime.id}`}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? "fill-white" : ""}`} />
                  {hasVoted ? "Votado!" : "Votar"}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
