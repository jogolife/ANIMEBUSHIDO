import React, { useState } from "react";
import { 
  Newspaper, 
  Calendar, 
  User, 
  Share2, 
  Sparkles, 
  Copy, 
  Check, 
  Film,
  Flame,
  ExternalLink 
} from "lucide-react";
import { NewsItem, Anime } from "../types";

interface NewsSectionProps {
  news: NewsItem[];
  animes: Anime[];
}

export default function NewsSection({ news, animes }: NewsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedAnimeId, setSharedAnimeId] = useState<string>("");
  const [shareStatus, setShareStatus] = useState(false);

  // Get Category Styling
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "Filme":
        return "bg-zinc-900 text-rose-450 border-zinc-800";
      case "Curiosidade":
        return "bg-zinc-900 text-amber-400 border-zinc-800";
      case "Mangá":
        return "bg-zinc-900 text-cyan-400 border-zinc-800";
      default:
        return "bg-zinc-900 text-purple-400 border-zinc-800";
    }
  };

  const handleShareNews = (newsItem: NewsItem) => {
    const text = `📢 *Confira essa novidade no AnimeVote:* \n"${newsItem.title}"\n\nLeia mais no AnimeVote oficial! 🎌`;
    navigator.clipboard.writeText(text);
    setCopiedId(newsItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedAnimeId) return;

    const findAnime = animes.find(a => a.id === sharedAnimeId);
    if (!findAnime) return;

    const text = `🎌 *Minha recomendação do dia no AnimeVote:* \nRecomendo o anime de ação/fantasia *${findAnime.title}*! Atualmente está classificado com nota *${findAnime.rating}/10* e conta com *${findAnime.votes}* votos na comunidade!\n\nVote você também no AnimeVote: ${window.location.href}`;
    
    navigator.clipboard.writeText(text);
    setShareStatus(true);
    setTimeout(() => setShareStatus(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="news-section-container">
      
      {/* SOCIAL NETWORKS INTEGRATION SHARE HUB */}
      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl relative overflow-hidden" id="social-share-center">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-650/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-display font-black text-xl uppercase tracking-tighter text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-500" />
              Compartilhar Conquistas & Favoritos
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xl leading-normal">
              Mostre ao mundo seu amor por animes! Escolha o seu favorito do catálogo atual e gere um card de compartilhamento incrível formatado para o Discord, WhatsApp ou Twitter!
            </p>
          </div>
          <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
        </div>

        {/* Share Form selectors */}
        <form onSubmit={handleShareRecommendation} className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <select
            value={sharedAnimeId}
            onChange={(e) => setSharedAnimeId(e.target.value)}
            className="w-full sm:w-80 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 p-2.5 rounded-lg outline-none focus:border-zinc-700"
          >
            <option value="">-- Escolha um Anime para Compartilhar --</option>
            {animes.map((a) => (
              <option key={a.id} value={a.id}>{a.title} ({a.votes} votos)</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!sharedAnimeId}
            className={`w-full sm:w-auto px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none ${
              sharedAnimeId 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed"
            }`}
          >
            {shareStatus ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Texto Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Convite / Text
              </>
            )}
          </button>
        </form>

        {shareStatus && (
          <p className="text-emerald-400 text-[11px] font-mono mt-2 italic flex items-center gap-1 animate-fade-in">
            💥 Link de indicação especial gerado com sucesso! Cole nas suas redes sociais para amigos votarem!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADING COMPONENT: TIMELINE NEWS ARTICLES (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
            <Newspaper className="h-6 w-6 text-purple-500" />
            <h2 className="font-display font-black text-xl uppercase tracking-tighter text-white">Últimas do Feed</h2>
          </div>

          <div className="space-y-6">
            {news.length === 0 ? (
              <div className="py-12 border border-zinc-900 rounded-lg text-center text-zinc-500 text-xs font-mono">
                Nenhuma novidade publicada no momento.
              </div>
            ) : (
              news.map((item) => (
                <article 
                  key={item.id}
                  className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-xl overflow-hidden p-5 flex flex-col md:flex-row gap-5 transition-all duration-300"
                >
                  {/* Photo Thumbnail */}
                  {item.imageUrl && (
                    <div className="w-full md:w-44 h-32 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-850">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Body text details */}
                  <div className="flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-mono border rounded px-2 py-0.5 font-bold uppercase ${getCategoryTheme(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-purple-500" />
                          {new Date(item.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="font-display font-black text-base uppercase text-white hover:text-purple-400 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-zinc-400 text-xs leading-relaxed leading-normal whitespace-pre-wrap">
                        {item.content}
                      </p>
                    </div>

                    {/* Footer attribution */}
                    <div className="flex items-center justify-between border-t border-zinc-950 pt-2.5 text-[11px]">
                      <span className="text-zinc-500 font-mono flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        Por: {item.author}
                      </span>

                      {/* Interactive Share button */}
                      <button
                        onClick={() => handleShareNews(item)}
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-medium outline-none"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-450" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Compartilhar</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR: EXTRA CURIOSTIES AND INFORMATION (1 COL) */}
        <div className="space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5">
              <Film className="h-4 w-4 text-purple-500" />
              Cinema e Futuro
            </h3>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-rose-450 font-black font-mono uppercase tracking-wider block">
                ALERTA DE FILME
              </span>
              <h4 className="font-black font-display text-sm uppercase tracking-tight text-zinc-100 hover:text-purple-405">
                Trilogia Demon Slayer: Kimetsu no Yaiba - Castelo Infinito
              </h4>
              <p className="text-zinc-450 text-[11px] leading-relaxed">
                Ufotable anunciou que o desfecho colossal da batalha dos caçadores contra Muzan Kibutsuji será retratada em três longa-metragens teatrais monumentais! Os cinemas brasileiros já estão listados para receber o primeiro lançamento global.
              </p>
            </div>

            <div className="border-t border-zinc-900 pt-3 space-y-1">
              <span className="text-[10px] text-cyan-400 font-black font-mono uppercase tracking-wider block">
                CURIOSIDADE DO MANGÁ
              </span>
              <h4 className="font-black font-display text-sm uppercase tracking-tight text-zinc-100">
                Os spinoffs oficiais de Jujutsu Kaisen
              </h4>
              <p className="text-zinc-455 text-[11px] leading-relaxed">
                Gege Akutami revelou que vários detalhes da infância de Satoru Gojo só puderam ser contados por meio das novelizações leves (Light Novels), como &quot;Jujutsu Kaisen: Iku Natsu to Kaeru Aki&quot;, inéditas no Ocidente.
              </p>
            </div>
          </div>

          {/* WATCH LIST STATS OR SIDE CAMPAIGN */}
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl text-center space-y-3">
            <Flame className="h-6 w-6 text-purple-550 mx-auto" />
            <h4 className="font-display font-black text-xs text-gradient-purple-zinc uppercase tracking-widest text-zinc-400">Líder das Temporadas</h4>
            <p className="text-[11px] text-zinc-450 leading-normal">
              Atualmente, <strong className="text-zinc-100">Frieren: Beyond Journey&apos;s End</strong> lidera o ranking de preferências da América Latina como o anime mais bem pontuado de 2024/2025.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
