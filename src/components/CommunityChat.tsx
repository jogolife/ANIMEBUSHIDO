import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  Crown, 
  User, 
  Zap,
  Lock,
  Ghost
} from "lucide-react";
import { ChatMessage } from "../types";

interface CommunityChatProps {
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
}

export default function CommunityChat({ currentUser }: CommunityChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bannedUids, setBannedUids] = useState<string[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [customNickname, setCustomNickname] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [confirmingDeleteChatId, setConfirmingDeleteChatId] = useState<string | null>(null);
  const [confirmingBanUserId, setConfirmingBanUserId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchChatData = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setBannedUids(data.bannedUsers || []);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens do chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
    // Refresh messages every 4 seconds for immediate interaction feels
    const interval = setInterval(fetchChatData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on load or new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newMessageText.trim()) return;

    // Determine sender name
    let senderName = currentUser.isLoggedIn ? currentUser.name : customNickname.trim();
    if (!currentUser.isLoggedIn && !senderName) {
      senderName = "Otaku Vagante";
    }

    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: senderName,
          content: newMessageText,
          role: currentUser.role || "user",
          uid: currentUser.uid
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Houve uma falha ao enviar a mensagem.");
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setNewMessageText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro para se comunicar com o chat.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/chat/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setConfirmingDeleteChatId(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Falha ao apagar mensagem.");
      }
    } catch (err) {
      console.error("Erro ao remover mensagem:", err);
    }
  };

  const handleBanUser = async (uidToBan: string, nameToBan: string) => {
    if (uidToBan === "admin_superuser") {
      alert("Não é possível banir um super administrador!");
      return;
    }

    try {
      const res = await fetch("/api/admin/chat/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uidToBan })
      });

      if (res.ok) {
        const data = await res.json();
        setBannedUids(data.bannedUsers || []);
        setMessages(data.messages || []);
        setConfirmingBanUserId(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Falha ao banir usuário.");
      }
    } catch (err) {
      console.error("Erro ao banir usuário do chat:", err);
    }
  };

  const handleUnbanUser = async (uidToUnban: string) => {
    try {
      const res = await fetch("/api/admin/chat/unban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uidToUnban })
      });

      if (res.ok) {
        const data = await res.json();
        setBannedUids(data.bannedUsers || []);
        alert(`UID desbanido do sistema.`);
      }
    } catch (err) {
      console.error("Erro ao remover ban:", err);
    }
  };

  const isBanned = bannedUids.includes(currentUser.uid);

  return (
    <div className="space-y-6 animate-fade-in" id="community-chat-panel">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-purple-950/20 via-[#050505] to-[#010101] border border-zinc-900 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5">
          <span className="bg-purple-900/40 text-purple-400 border border-purple-800/20 text-[9.5px] font-mono rounded font-black uppercase px-2.5 py-1 tracking-wider inline-flex items-center gap-1.5 shadow">
            <MessageSquare className="h-3 w-3 text-purple-400" />
            Chat Global • Debate Otaku
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-white uppercase">
            Chat da Tribo <span className="text-purple-400">💬 Bushidô</span>
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
            Converse em tempo real com toda a comunidade sobre novos animes, palpites do ranking e teorias de mangás!
            {currentUser.role === "admin" && (
              <span className="text-amber-400 font-extrabold ml-1">👑 Você está como Moderador. Você possui direitos de excluir mensagens e banir arruaceiros instantaneamente.</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ACTION CHAT (SPAN 8) */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col h-[520px] overflow-hidden">
          
          {/* Active status panel */}
          <div className="bg-[#030303] border-b border-zinc-900/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300">Sala de Discussão #geral</span>
            </div>
            
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Futebol, animes e pirataria consensual</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-black/20 to-[#030303]/40">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-mono text-zinc-550">Sincronizando com a Matrix...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-650 space-y-2">
                <Ghost className="h-8 w-8 text-zinc-700" />
                <p className="font-mono text-xs">O silêncio ecoa na sala... Seja o primeiro a quebrar a quietude!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isAdminMsg = m.role === "admin";
                const isVipMsg = m.role === "vip";
                const isMyMsg = m.uid === currentUser.uid;

                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col space-y-1 max-w-[85%] ${isMyMsg ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    {/* Identification meta */}
                    <div className="flex items-center gap-1.5 text-[10.5px]">
                      {isAdminMsg ? (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-mono text-[8px] font-black flex items-center gap-0.5 uppercase tracking-wider">
                          <Crown className="h-2 w-2" /> MODERADOR
                        </span>
                      ) : isVipMsg ? (
                        <span className="bg-purple-950/40 border border-purple-900/20 text-purple-400 px-1 py-0.2 rounded font-mono text-[8px] font-bold flex items-center gap-0.5 uppercase tracking-wider">
                          <Zap className="h-2 w-2" /> VIP TRIBAL
                        </span>
                      ) : null}

                      <span className={`font-bold ${isAdminMsg ? "text-amber-450" : isMyMsg ? "text-purple-300" : "text-zinc-300"}`}>
                        {m.userName}
                      </span>
                      
                      <span className="text-[9px] text-zinc-550 font-mono">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Speech bubble */}
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                      isAdminMsg 
                        ? "bg-amber-950/10 border-amber-900/20 text-zinc-100" 
                        : isMyMsg 
                          ? "bg-purple-950/10 border-purple-900/20 text-purple-100 rounded-tr-none" 
                          : "bg-zinc-900/60 border-zinc-850 text-zinc-300 rounded-tl-none hover:bg-zinc-900 transition-colors"
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>

                      {/* Admin moderation quick triggers */}
                      {currentUser.role === "admin" && (
                        <div className="flex items-center gap-2 mt-2 border-t border-zinc-800/40 pt-1.5 justify-end">
                          
                          {confirmingDeleteChatId === m.id ? (
                            <div className="flex items-center gap-1 bg-[#060606] p-1 border border-zinc-805 rounded animate-fade-in text-[9px] font-mono leading-none">
                              <span className="text-rose-400 font-bold px-1 select-none">Excluir?</span>
                              <button
                                type="button"
                                onClick={() => handleDeletePost(m.id)}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded cursor-pointer uppercase text-[8px]"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteChatId(null)}
                                className="px-1.5 py-0.5 bg-zinc-800 hover:text-white text-zinc-350 rounded font-bold cursor-pointer uppercase text-[8px]"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteChatId(m.id)}
                              className="text-[9px] font-mono text-rose-400 hover:text-rose-350 cursor-pointer flex items-center gap-0.5 uppercase font-medium bg-rose-950/10 hover:bg-rose-950/30 px-1.5 py-0.5 rounded transition border border-rose-950/20"
                              title="Apagar post"
                            >
                              <Trash2 className="h-2.5 w-2.5" /> Excluir Post
                            </button>
                          )}
                          
                          {m.uid !== "admin_superuser" && m.uid !== "anon" && (
                            <>
                              {confirmingBanUserId === m.id ? (
                                <div className="flex items-center gap-1 bg-[#060606] p-1 border border-zinc-805 rounded animate-fade-in text-[9px] font-mono leading-none">
                                  <span className="text-amber-450 font-bold px-1 select-none">Banir?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleBanUser(m.uid, m.userName)}
                                    className="px-1.5 py-0.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded cursor-pointer uppercase text-[8px]"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmingBanUserId(null)}
                                    className="px-1.5 py-0.5 bg-zinc-800 hover:text-white text-zinc-350 rounded font-bold cursor-pointer uppercase text-[8px]"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmingBanUserId(m.id)}
                                  className="text-[9px] font-mono text-amber-500 hover:text-amber-400 cursor-pointer flex items-center gap-0.5 uppercase font-medium bg-amber-950/10 hover:bg-amber-950/30 px-1.5 py-0.5 rounded transition border border-amber-950/20"
                                  title="Banir usuário permanentemente"
                                >
                                  <ShieldAlert className="h-2.5 w-2.5" /> Banir Autor
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Form control submission */}
          <div className="bg-[#030303] border-t border-zinc-900 p-3">
            {isBanned ? (
              <div className="bg-rose-950/30 border border-rose-900/30 p-3.5 rounded-xl text-center flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="text-[11.5px] font-mono text-rose-300 font-bold">
                  Sua conta foi banida deste chat pelo Administrador por infringir os termos do Bushidô.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-2.5">
                
                {/* Custom display nickname for guest readers */}
                {!currentUser.isLoggedIn && (
                  <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-850">
                    <span className="text-[9.5px] font-mono text-zinc-550 uppercase tracking-wider shrink-0">Apelido Temporário:</span>
                    <input
                      type="text"
                      placeholder="Ex: GokuDeOsasco"
                      value={customNickname}
                      onChange={(e) => setCustomNickname(e.target.value.replace(/\s+/g, ""))}
                      className="bg-transparent border-none text-xs text-purple-300 outline-none w-full font-mono placeholder:text-zinc-700"
                      maxLength={15}
                    />
                    <span className="text-[9px] font-mono text-amber-500 bg-amber-500/5 px-1.5 border border-amber-500/10 rounded">Anônimo</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isSending}
                    placeholder={currentUser.isLoggedIn ? "Envie sua mensagem sobre animes..." : "Defina um apelido acima e digite sua mensagem..."}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 bg-black border border-zinc-850 text-xs text-zinc-100 p-2.5 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 font-sans"
                    maxLength={140}
                  />

                  <button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
                    className="px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="text-[10px] font-mono text-rose-400 bg-rose-950/10 border border-rose-950/20 p-2 rounded">
                    {errorMsg}
                  </div>
                )}
              </form>
            )}
          </div>

        </div>

        {/* SIDE BAR / BAN MONITOR (SPAN 4) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-display font-black text-xs uppercase text-zinc-200 tracking-tight flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Diretrizes Sobrenaturais
            </h3>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed leading-normal">
              O Chat do Bushidô é um espaço livre criativo. Mas lembre-se:
            </p>
            
            <ul className="space-y-2 text-[10.5px] text-zinc-500 list-disc pl-3 leading-normal">
              <li>Respeite as preferências de anime ecológicas de seus colegas.</li>
              <li>A revelação irresponsável de spoilers críticos acarretará punições.</li>
              <li>Links externos suspeitos ou propagandas repetitivas resultarão em <strong className="text-zinc-300">banimento instantâneo</strong> do seu UID.</li>
              <li>Apenas o Moderador Administrador possui o olho capaz de banir.</li>
            </ul>
          </div>

          {/* BAN LIST LOG FOR ADMIN PANEL FEEL */}
          <div className="bg-[#030303] border border-zinc-900 rounded-xl p-3.5 space-y-3.5 flex-1 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[9px] text-rose-450 font-black uppercase tracking-widest flex items-center gap-1">
                <Lock className="h-3 w-3 text-rose-500" /> Registro de Banidos ({bannedUids.length})
              </h4>
              <span className="text-[10px] text-zinc-600 font-mono">Consola</span>
            </div>

            {bannedUids.length === 0 ? (
              <p className="text-[10.5px] font-mono text-zinc-650 italic text-center py-4">
                Histórico limpo. Nenhuma conta de usuário banida no momento!
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1" id="chat-bans">
                {bannedUids.map((uid) => (
                  <div key={uid} className="flex items-center justify-between p-1.5 bg-black border border-zinc-900 rounded text-[9.5px] font-mono">
                    <span className="text-rose-400 font-medium tracking-tight truncate max-w-[130px]">{uid}</span>
                    
                    {currentUser.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => handleUnbanUser(uid)}
                        className="text-[8px] uppercase tracking-wider text-purple-400 hover:text-purple-300 font-black"
                      >
                        Desbanir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] text-zinc-550 leading-relaxed text-center">
            Pressione para atualizar ou aguarde 4 segundos pela sincronia nativa em segundo plano.
          </div>

        </div>

      </div>

    </div>
  );
}
