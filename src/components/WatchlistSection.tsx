import React from "react";
import { Heart, Bookmark, Eye, Trash, Sparkles, Film } from "lucide-react";
import { Anime } from "../types";

interface WatchlistSectionProps {
  animes: Anime[];
  favorites: string[];
  watchlist: string[];
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onToggleWatchlist: (id: string, e?: React.MouseEvent) => void;
  onSelectAnime: (anime: Anime) => void;
}

export default function WatchlistSection({
  animes,
  favorites,
  watchlist,
  onToggleFavorite,
  onToggleWatchlist,
  onSelectAnime
}: WatchlistSectionProps) {
  const favoriteAnimes = animes.filter((a) => favorites.includes(a.id));
  const watchlistAnimes = animes.filter((a) => watchlist.includes(a.id));

  return (
    <div className="space-y-8 animate-fade-in" id="watchlist-section-container">
      
      {/* SECTION HEADER DESIGN */}
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          Minha Área Otaku
        </h2>
        <p className="text-zinc-500 text-xs mt-1">
          Gerencie facilmente seus animes favoritos e monte sua lista de maratona para organizar sua rotina.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FAVORITES COLUMN */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Heart className="h-4 w-4 text-purple-500 fill-purple-650/10" />
            Meus Animes Favoritos ({favoriteAnimes.length})
          </h3>

          {favoriteAnimes.length === 0 ? (
            <div className="py-12 px-6 border border-dashed border-zinc-900 rounded-lg text-center text-zinc-500 text-xs font-mono">
              Você ainda não favoritou nenhum anime. Navegue no catálogo e clique em &quot;Favoritar&quot;!
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteAnimes.map((anime) => (
                <div 
                  key={anime.id} 
                  className="flex items-center justify-between bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-3 rounded-lg transition-all group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="w-11 h-11 rounded object-cover shrink-0 cursor-pointer border border-zinc-850"
                      onClick={() => onSelectAnime(anime)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 
                        onClick={() => onSelectAnime(anime)}
                        className="font-black text-sm text-zinc-200 hover:text-purple-400 cursor-pointer truncate"
                      >
                        {anime.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{anime.season}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onSelectAnime(anime)}
                      className="p-1.5 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-md transition-all"
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => onToggleFavorite(anime.id, e)}
                      className="p-1.5 border border-zinc-850 hover:border-zinc-700 text-zinc-450 hover:text-rose-450 rounded-md transition-all"
                      title="Remover de favoritos"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WATCHLIST COLUMN */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Bookmark className="h-4 w-4 text-purple-400" />
            Marcados para Assistir ({watchlistAnimes.length})
          </h3>

          {watchlistAnimes.length === 0 ? (
            <div className="py-12 px-6 border border-dashed border-zinc-900 rounded-lg text-center text-zinc-500 text-xs font-mono">
              Sua Watchlist está vazia. Adicione os lançamentos que você planeja maratonar!
            </div>
          ) : (
            <div className="space-y-2">
              {watchlistAnimes.map((anime) => (
                <div 
                  key={anime.id} 
                  className="flex items-center justify-between bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-3 rounded-lg transition-all group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="w-11 h-11 rounded object-cover shrink-0 cursor-pointer border border-zinc-850"
                      onClick={() => onSelectAnime(anime)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 
                        onClick={() => onSelectAnime(anime)}
                        className="font-black text-sm text-zinc-200 hover:text-purple-400 cursor-pointer truncate"
                      >
                        {anime.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{anime.season}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onSelectAnime(anime)}
                      className="p-1.5 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-md transition-all"
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => onToggleWatchlist(anime.id, e)}
                      className="p-1.5 border border-zinc-850 hover:border-zinc-700 text-zinc-450 hover:text-rose-450 rounded-md transition-all"
                      title="Remover da lista de maratona"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
