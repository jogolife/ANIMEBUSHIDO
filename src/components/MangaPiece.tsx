import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Crown, 
  Send, 
  TrendingUp, 
  History, 
  User, 
  AlertCircle,
  Trophy,
  Compass,
  CheckCircle2,
  Trash2,
  Pencil,
  X
} from "lucide-react";
import { MangaSubmission, MangaRankItem } from "../types";

interface MangaPieceProps {
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
}

export default function MangaPiece({ currentUser }: MangaPieceProps) {
  const [submissionList, setSubmissionList] = useState<MangaSubmission[]>([]);
  const [top10, setTop10] = useState<MangaRankItem[]>([]);
  const [top3, setTop3] = useState<MangaRankItem[]>([]);
  
  const [newMangaName, setNewMangaName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // States for admin edit mode
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [editMangaNameText, setEditMangaNameText] = useState("");
  const [editSubmittedByText, setEditSubmittedByText] = useState("");
  const [confirmingDeleteMangaId, setConfirmingDeleteMangaId] = useState<string | null>(null);

  const fetchMangaData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/manga-piece");
      if (res.ok) {
        const data = await res.json();
        setSubmissionList(data.submissions || []);
        setTop10(data.top10 || []);
        setTop3(data.top3 || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Manga Piece:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMangaData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newMangaName.trim()) {
      setErrorMsg("Por favor, digite o nome de um mangá.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/manga-piece", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mangaName: newMangaName,
          submittedBy: currentUser.isLoggedIn ? (currentUser.email || currentUser.name) : "Otaku Anônimo"
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar sugestão.");
      }

      const data = await res.json();
      setSubmissionList(data.submissions || []);
      setTop10(data.top10 || []);
      setTop3(data.top3 || []);
      setNewMangaName("");
      setSuccessMsg(`📚 "${data.item.mangaName}" sugerido com sucesso! O algoritmo de tesouros catalogados computou o seu voto.`);
      
      // Auto-clear message
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão ao enviar.");
    } finally {
      setIsSending(false);
    }
  };

  const handleEditSubmission = (sub: MangaSubmission) => {
    setEditingSubmissionId(sub.id);
    setEditMangaNameText(sub.mangaName);
    setEditSubmittedByText(sub.submittedBy);
  };

  const handleCancelEdit = () => {
    setEditingSubmissionId(null);
    setEditMangaNameText("");
    setEditSubmittedByText("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editMangaNameText.trim()) {
      alert("O nome do mangá é obrigatório.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/manga-piece/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mangaName: editMangaNameText,
          submittedBy: editSubmittedByText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionList(data.submissions || []);
        setTop10(data.top10 || []);
        setTop3(data.top3 || []);
        setEditingSubmissionId(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao salvar alterações.");
      }
    } catch (err) {
      console.error("Erro ao salvar mangá:", err);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/manga-piece/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionList(data.submissions || []);
        setTop10(data.top10 || []);
        setTop3(data.top3 || []);
        setConfirmingDeleteMangaId(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao excluir indicação.");
      }
    } catch (err) {
      console.error("Erro ao excluir mangá:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="manga-piece-container">
      
      {/* HEADER HERO ACCENTS */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-[#050505] to-[#010101] border border-zinc-800 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-3xl space-y-2">
          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/30 text-[9.5px] font-mono rounded font-black uppercase px-2.5 py-1 tracking-wider inline-flex items-center gap-1.5 shadow">
            <Compass className="h-3 w-3 animate-spin-slow text-emerald-400" />
            Grande Descoberta • Manga Piece
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-white uppercase">
            Manga Piece <span className="text-emerald-400">🏴‍☠️ Os Tesouros Ocultos</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Escreva o título de mangás <strong>pouco conhecidos, mas que sejam excepcionais</strong>! 
            Nosso portal computa em tempo real a freqüência de envios de toda a comunidade brasileira para identificar e ranquear 
            os verdadeiros segredos do mundo otaku.
          </p>
        </div>
      </div>

      {/* TOP 3 GOLDEN TROPHIES SECTION */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-sm uppercase text-emerald-400 tracking-tight flex items-center gap-2">
          <Trophy className="h-4.5 w-4.5 text-amber-400 fill-amber-500/10" />
          🏆 Top 3 Tesouros da Comunidade
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-[#030303] border border-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : top3.length === 0 ? (
          <div className="text-center py-8 bg-[#030303]/40 border border-zinc-900 rounded-xl text-zinc-550 text-xs font-mono">
            Nenhuma sugestão computada ainda. Escreva o primeiro abaixo!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rank 1 */}
            {top3[0] && (
              <div className="bg-gradient-to-b from-[#111] via-[#050505] to-black border-2 border-amber-500/40 p-5 rounded-2xl relative shadow-xl hover:border-amber-400 transition-all group scale-100 hover:scale-[1.01]" id="manga-gold">
                <div className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="h-2.5 w-2.5 text-amber-400" /> REVELAÇÃO SOBERANA
                </div>
                <div className="text-[10px] font-mono text-amber-500 uppercase font-black">1º Lugar • Ouro</div>
                <h3 className="font-display font-black text-lg text-zinc-100 tracking-tight mt-1 capitalize group-hover:text-amber-400 transition-colors">
                  {top3[0].mangaName}
                </h3>
                <div className="mt-4 flex items-center justify-between text-zinc-500 text-xs">
                  <span className="font-mono text-[10.5px]">Enviado por:</span>
                  <span className="font-mono font-bold text-zinc-300 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                    <strong className="text-amber-405 font-black">{top3[0].count}</strong> Indicações
                  </span>
                </div>
              </div>
            )}

            {/* Rank 2 */}
            {top3[1] && (
              <div className="bg-gradient-to-b from-[#111] via-[#050505] to-black border border-zinc-700/80 p-5 rounded-2xl relative shadow-lg hover:border-zinc-550 transition-all group scale-100 hover:scale-[1.01]" id="manga-silver">
                <div className="absolute top-3 right-3 bg-zinc-400/10 border border-zinc-400/20 text-zinc-350 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                  2º Lugar • Prata
                </div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Incrível Tesouro</div>
                <h3 className="font-display font-black text-lg text-zinc-200 tracking-tight mt-1 capitalize group-hover:text-zinc-300 transition-colors">
                  {top3[1].mangaName}
                </h3>
                <div className="mt-4 flex items-center justify-between text-zinc-505 text-xs">
                  <span className="font-mono text-[10.5px]">Enviado por:</span>
                  <span className="font-mono font-bold text-zinc-350 bg-zinc-400/5 px-2 py-1 rounded border border-zinc-400/10">
                    <strong className="text-zinc-200 font-bold">{top3[1].count}</strong> Indicações
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="bg-gradient-to-b from-[#111] via-[#050505] to-black border border-amber-900/30 p-5 rounded-2xl relative shadow-md hover:border-amber-900/60 transition-all group scale-100 hover:scale-[1.01]" id="manga-bronze">
                <div className="absolute top-3 right-3 bg-amber-900/10 border border-amber-900/20 text-amber-600 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                  3º Lugar • Bronze
                </div>
                <div className="text-[10px] font-mono text-amber-600 uppercase font-bold">Altamente Recomendado</div>
                <h3 className="font-display font-black text-lg text-zinc-200 tracking-tight mt-1 capitalize group-hover:text-amber-605 transition-colors">
                  {top3[2].mangaName}
                </h3>
                <div className="mt-4 flex items-center justify-between text-zinc-505 text-xs">
                  <span className="font-mono text-[10.5px]">Enviado por:</span>
                  <span className="font-mono font-bold text-zinc-350 bg-amber-900/5 px-2 py-1 rounded border border-amber-905/10">
                    <strong className="text-amber-500 font-bold">{top3[2].count}</strong> Indicações
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOWER GRID FOR SUBMIT FORM AND LIST OF TOP 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SUBMISSION BLOCK (COL SPAN 5) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-display font-black text-xs uppercase text-zinc-200 tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Enviar Nova Descoberta
            </h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Contribuirá para promover o mangá na lista consensual do Manga Piece.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5 flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-emerald-400" /> Título Original do Mangá
              </label>
              <input
                type="text"
                placeholder="Exemplo: Kingdom, Holyland, Yokohama Kaidashi Kikou"
                value={newMangaName}
                onChange={(e) => setNewMangaName(e.target.value)}
                className="w-full bg-[#030303] border border-zinc-850 hover:border-zinc-800 text-xs text-zinc-200 p-2.5 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                maxLength={80}
              />
            </div>

            {/* ERROR / SUCCESS STATES */}
            {errorMsg && (
              <div className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-900/20 p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 p-2.5 rounded-lg flex items-start gap-1.5 leading-snug">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* METADATA ATRIBUTION TIP */}
            <div className="text-[10px] text-zinc-550 leading-relaxed bg-[#030303]/50 p-3 rounded-lg border border-zinc-900 flex items-start gap-2">
              <User className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {currentUser.isLoggedIn ? (
                  <span>
                    Logado como <strong className="text-zinc-300 font-bold">{currentUser.name}</strong>. Sua indicação será registrada sob seu e-mail do fórum.
                  </span>
                ) : (
                  <span>
                    Conectado anonimamente. Sua recomendação contará para o algoritmo do site, mas sugerimos <span className="text-purple-400 font-semibold">entrar por e-mail</span> para garantir prestígio!
                  </span>
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? "Enviando..." : "Registrar Indicação"}
            </button>
          </form>
        </div>

        {/* TOP 10 CONSENSUS LIST (COL SPAN 7) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="font-display font-black text-xs uppercase text-zinc-200 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Top 10 Tesouros Encontrados
            </h3>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Fórmula Consensual</span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-[#030303] border border-zinc-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : top10.length === 0 ? (
            <div className="py-12 text-center text-zinc-650 font-mono text-xs">
              Nenhuma indicação cadastrada até o momento.
            </div>
          ) : (
            <div className="space-y-2">
              {top10.map((rank, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    idx < 3 
                      ? "bg-emerald-950/10 border-emerald-900/30 hover:border-emerald-500/25" 
                      : "bg-[#030303]/60 border-zinc-900 hover:border-zinc-805"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge ranking index */}
                    <span className={`h-5 w-5 font-mono text-[10px] font-black rounded flex items-center justify-center ${
                      idx === 0 ? "bg-amber-500 text-black" :
                      idx === 1 ? "bg-zinc-400 text-black" :
                      idx === 2 ? "bg-amber-800 text-white" :
                      "bg-zinc-900 text-zinc-400"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-display font-bold text-xs text-zinc-100 capitalize">
                      {rank.mangaName}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-[#070707] border border-zinc-900">
                    <strong className="text-emerald-400 font-bold">{rank.count}</strong> indicações
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* RECENT LIVE SUBMISSIONS STREAM */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-6 space-y-4">
        <h3 className="font-display font-black text-xs uppercase text-zinc-200 tracking-tight flex items-center gap-1.5 border-b border-zinc-900 pb-3">
          <History className="h-4 w-4 text-emerald-400" />
          Sugestões Recentes de Olho Aberto
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-[#030303] border border-zinc-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : submissionList.length === 0 ? (
          <div className="py-8 text-center text-zinc-650 font-mono text-xs">
            Nenhuma atividade registrada na rede.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1" id="manga-stream">
            {submissionList.slice(0, 15).map((sub) => {
              const isEditingThisSub = editingSubmissionId === sub.id;

              return (
                <div 
                  key={sub.id}
                  className="p-3 rounded-lg bg-[#030303]/40 border border-zinc-900/50 hover:bg-[#030303] transition-colors space-y-2.5"
                >
                  {isEditingThisSub ? (
                    <div className="space-y-3 animate-fade-in">
                      <div className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                        ✏️ Editar Indicação de Mangá
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-0.5">Título do Mangá</label>
                          <input
                            type="text"
                            value={editMangaNameText}
                            onChange={(e) => setEditMangaNameText(e.target.value)}
                            className="w-full bg-[#080808] border border-zinc-850 p-2 text-xs text-white rounded outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-0.5">Autor do Envio</label>
                          <input
                            type="text"
                            value={editSubmittedByText}
                            onChange={(e) => setEditSubmittedByText(e.target.value)}
                            className="w-full bg-[#080808] border border-zinc-850 p-2 text-xs text-white rounded outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 text-[10px] font-mono text-zinc-500 hover:text-white cursor-pointer bg-transparent border border-transparent rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(sub.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 font-mono text-[10px] font-bold text-white rounded cursor-pointer border border-transparent"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/20 uppercase font-bold text-center">
                          📚 Descoberta
                        </span>
                        <span className="text-xs font-bold text-zinc-200 capitalize">
                          {sub.mangaName}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between sm:justify-end w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-[10.5px] text-zinc-500 font-mono">
                          <span>Enviado por: <strong className="text-zinc-400">{sub.submittedBy}</strong></span>
                          <span>•</span>
                          <span>{new Date(sub.createdAt).toLocaleDateString("pt-BR")} às {new Date(sub.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>

                        {currentUser.role === "admin" && (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleEditSubmission(sub)}
                              className="p-1 px-2 border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded text-[9px] font-mono uppercase font-black tracking-wider flex items-center gap-1 transition cursor-pointer"
                              title="Modificar item do Manga Piece"
                            >
                              <Pencil className="h-3 w-3" /> Editar
                            </button>

                            {confirmingDeleteMangaId === sub.id ? (
                              <div className="flex items-center gap-1 animate-fade-in bg-zinc-950 p-1 border border-zinc-900 rounded">
                                <span className="text-[8px] font-mono text-rose-450 uppercase font-bold px-1">Deletar?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-mono font-bold uppercase hover:bg-rose-500 cursor-pointer"
                                >
                                  Sim
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmingDeleteMangaId(null)}
                                  className="px-1.5 py-0.5 bg-zinc-800 text-zinc-350 rounded text-[8px] font-mono font-bold uppercase hover:text-white cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteMangaId(sub.id)}
                                className="p-1 px-2 border border-rose-950/40 bg-rose-950/10 hover:bg-rose-950/30 text-rose-450 hover:text-rose-455 rounded text-[9px] font-mono uppercase font-black tracking-wider flex items-center gap-1 transition cursor-pointer"
                                title="Excluir indicação de mangá"
                              >
                                <Trash2 className="h-3 w-3" /> Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
