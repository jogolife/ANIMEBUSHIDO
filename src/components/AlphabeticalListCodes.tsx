import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  Tag, 
  Check, 
  Plus, 
  HelpCircle,
  Filter, 
  Info,
  ChevronRight,
  AlertCircle,
  User,
  Settings,
  RefreshCw,
  Award,
  TrendingUp,
  BarChart2
} from "lucide-react";
import { Anime, Code } from "../types";

interface AlphabeticalListCodesProps {
  animes: Anime[];
  availableCodes: Code[];
  onRateAnime: (animeId: string, ratingValue: string, codes: string[]) => Promise<void>;
  onSelectAnime: (anime: Anime) => void;
  currentUser: {
    uid: string;
    email?: string;
    name: string;
    role: "admin" | "vip" | "user";
    isLoggedIn: boolean;
  };
}

export default function AlphabeticalListCodes({
  animes,
  availableCodes,
  onRateAnime,
  onSelectAnime,
  currentUser
}: AlphabeticalListCodesProps) {
  // Search query for the animes (supports combination, e.g., PO + TR + VL)
  const [animeQuery, setAnimeQuery] = useState("");
  // Filter by a specific code selected from the dictionary
  const [selectedFilterCode, setSelectedFilterCode] = useState<string | null>(null);
  
  // Search state for the codes/dictionary table
  const [codeQuery, setCodeQuery] = useState("");

  // Managing inline code toggles for each anime to allow users to "usar os códigos" directly in this view
  const [editingAnimeId, setEditingAnimeId] = useState<string | null>(null);
  const [selectedCodesForEdit, setSelectedCodesForEdit] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<{ animeId: string; success: boolean; msg: string } | null>(null);

  // User-specific personal meanings override dictionary: { CODE: Meaning }
  const [userPersonalCodes, setUserPersonalCodes] = useState<{ [code: string]: string }>({});
  const [editingCodeKey, setEditingCodeKey] = useState<string | null>(null);
  const [customMeaningText, setCustomMeaningText] = useState("");
  
  // State to register a completely new custom personal tag code
  const [showPersonalTagForm, setShowPersonalTagForm] = useState(false);
  const [newPersonalCode, setNewPersonalCode] = useState("");
  const [newPersonalMeaning, setNewPersonalMeaning] = useState("");
  const [personalFormMsg, setPersonalFormMsg] = useState("");

  // Fetch personal codes if logged in
  const fetchPersonalCodes = async () => {
    if (currentUser.isLoggedIn && currentUser.uid) {
      try {
        const res = await fetch(`/api/user-codes/${currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          setUserPersonalCodes(data || {});
        }
      } catch (err) {
        console.error("Erro ao buscar códigos pessoais do usuário:", err);
      }
    }
  };

  useEffect(() => {
    fetchPersonalCodes();
  }, [currentUser.uid, currentUser.isLoggedIn]);

  // Translate code meaning, preferring user personal definition over global database
  const getMappedCodeMeaning = (codeStr: string, fallbackMean: string) => {
    if (userPersonalCodes && userPersonalCodes[codeStr.toUpperCase()]) {
      return userPersonalCodes[codeStr.toUpperCase()];
    }
    return fallbackMean;
  };

  // Group animes alphabetically
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

  // Filter animes by text search + support intelligent combination filtering (e.g. "PO + LT + AL")
  const filteredAnimes = animes.filter((anime) => {
    const cleanSearch = animeQuery.trim().toLowerCase();
    let matchesQuery = false;

    if (!cleanSearch) {
      matchesQuery = true;
    } else if (
      cleanSearch.includes("+") || 
      cleanSearch.includes(",") || 
      cleanSearch.match(/^[a-z]{2,4}(\s+[a-z]{2,4})*$/i)
    ) {
      // Intelligent combination search (e.g. PO + LT)
      const searchCodes = cleanSearch
        .split(/[\s+,]+/)
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);

      if (searchCodes.length > 0) {
        // Must contain all queried tags
        const animeCodes = anime.topCodes || [];
        matchesQuery = searchCodes.every(sc => animeCodes.includes(sc));
      } else {
        matchesQuery = true;
      }
    } else {
      // Standard title or genre match
      matchesQuery = anime.title.toLowerCase().includes(cleanSearch) ||
        anime.genres.some(g => g.toLowerCase().includes(cleanSearch));
    }

    // Secondary table code filter
    const matchesCode = !selectedFilterCode || (anime.topCodes || []).includes(selectedFilterCode);

    return matchesQuery && matchesCode;
  });

  const groupedAnimes = getGroupedAlphabetical(filteredAnimes);

  // Filter dictionary table codes
  const filteredCodes = availableCodes.filter((c) => {
    const query = codeQuery.toLowerCase();
    const currentMeaning = getMappedCodeMeaning(c.code, c.meaning);
    return c.code.toLowerCase().includes(query) || currentMeaning.toLowerCase().includes(query);
  });

  // Toggle/start assigning codes for a specific anime inline
  const handleStartEditingCodes = (anime: Anime) => {
    setEditingAnimeId(anime.id);
    setSelectedCodesForEdit(anime.topCodes || []);
    setSaveStatus(null);
  };

  const handleToggleCodeInEdit = (codeStr: string) => {
    if (selectedCodesForEdit.includes(codeStr)) {
      setSelectedCodesForEdit(selectedCodesForEdit.filter(c => c !== codeStr));
    } else {
      setSelectedCodesForEdit([...selectedCodesForEdit, codeStr]);
    }
  };

  const handleSaveCodes = async (animeId: string, currentCommunityRating: string) => {
    try {
      const rating = currentCommunityRating || "Ótimo";
      await onRateAnime(animeId, rating, selectedCodesForEdit);
      
      setSaveStatus({
        animeId,
        success: true,
        msg: "Características enviadas com sucesso!"
      });
      
      setTimeout(() => {
        setEditingAnimeId(null);
        setSaveStatus(null);
      }, 1500);
    } catch (err) {
      setSaveStatus({
        animeId,
        success: false,
        msg: "Ocorreu um erro no servidor."
      });
    }
  };

  // Submit/save user custom code meaning
  const handleSavePersonalMeaning = async (code: string) => {
    if (!currentUser.isLoggedIn) return;
    try {
      const response = await fetch(`/api/user-codes/${currentUser.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, personal_meaning: customMeaningText })
      });
      if (response.ok) {
        const data = await response.json();
        setUserPersonalCodes(data || {});
        setEditingCodeKey(null);
        setCustomMeaningText("");
      }
    } catch (err) {
      console.error("Erro ao salvar interpretação customizada:", err);
    }
  };

  // Submit new completely personal/own category custom code
  const handleCreatePersonalCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalFormMsg("");
    if (!currentUser.isLoggedIn) return;

    if (!newPersonalCode.trim() || !newPersonalMeaning.trim()) {
      setPersonalFormMsg("Preencha todos os campos.");
      return;
    }

    const cleanCode = newPersonalCode.toUpperCase().trim().substring(0, 4);

    try {
      const response = await fetch(`/api/user-codes/${currentUser.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, personal_meaning: newPersonalMeaning.trim() })
      });
      if (response.ok) {
        const data = await response.json();
        setUserPersonalCodes(data || {});
        setPersonalFormMsg(`Código privado '${cleanCode}' criado com sucesso!`);
        setNewPersonalCode("");
        setNewPersonalMeaning("");
        setTimeout(() => {
          setShowPersonalTagForm(false);
          setPersonalFormMsg("");
        }, 1500);
      }
    } catch (err) {
      setPersonalFormMsg("Falha ao criar o código pessoal.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto leading-normal animate-fade-in" id="alphabetical-codes-layout">
      
      {/* SECTION HEADER BAR */}
      <div className="bg-gradient-to-r from-purple-950/30 via-[#0a0712] to-black border-zinc-800 p-5 sm:p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-900/40 text-purple-400 border border-purple-500/30 text-[9px] font-mono rounded font-black uppercase px-2 py-0.5 tracking-wider">
              Guia Consensual & Inteligente
            </span>
            {currentUser.isLoggedIn && (
              <span className="bg-green-950/40 text-green-400 border border-green-500/30 text-[9px] font-mono rounded font-black uppercase px-2 py-0.5 tracking-wider flex items-center gap-1">
                <User className="h-2.5 w-2.5" /> Painel Ativo
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-2xl tracking-tighter text-white mt-1 uppercase">
            Catálogo Alfabético & Dicionário de Códigos
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mt-1">
            Pesquise por títulos ou faça buscas combinadas (Ex: <strong className="text-purple-400">“PO + LT”</strong>) para achar animes de luta overpower. Logue para cadastrar seus próprios apelidos e significados pessoais seguros!
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {selectedFilterCode && (
            <button 
              onClick={() => setSelectedFilterCode(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/60 text-xs text-purple-300 font-bold border border-purple-500/30 cursor-pointer transition-colors"
            >
              Filtro: {selectedFilterCode} <span className="text-zinc-500">× Limpar</span>
            </button>
          )}

          {currentUser.isLoggedIn && (
            <button 
              onClick={() => setShowPersonalTagForm(!showPersonalTagForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs text-zinc-200 font-bold border border-zinc-800 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-purple-400" /> Criar Código Privado
            </button>
          )}
        </div>
      </div>

      {/* TWO COLUMN SIDE-BY-SIDE RESPONSIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 7/12 (approx 58%) - ALPHABETICAL ACCORDION INDEX & ACTIONS */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SEARCH BOX FOR ANIME LIST WITH INSTRUCTIONS FOR INTENSIVE SEARCH */}
          <div className="bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Insira o Título ou uma combinação de tags:</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-purple-500" />
                <input
                  type="text"
                  placeholder="Ex: Solo Leveling ou 'PO + LT + AL'..."
                  value={animeQuery}
                  onChange={(e) => setAnimeQuery(e.target.value)}
                  className="w-full bg-[#030303] text-xs text-zinc-200 pl-10 pr-4 py-3 rounded-lg border border-zinc-800 hover:border-zinc-750 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-zinc-650"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                <span>Pesquisa Inteligente: Utilize <strong>+</strong> para juntar requisitos. Ex: <span className="text-purple-400 font-bold cursor-pointer hover:underline" onClick={() => setAnimeQuery("PO + LT")}>PO + LT</span></span>
              </div>
            </div>

            {/* ALPHABETICAL GROUPS ACCORDIONS / PANELS */}
            <div className="space-y-6 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
              {groupedAnimes.length === 0 ? (
                <div className="text-center py-20 bg-black/40 rounded-xl border border-dashed border-zinc-900">
                  <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-xs font-mono">Nenhum anime localizado nessa busca combinada.</p>
                  <button 
                    onClick={() => setAnimeQuery("")}
                    className="mt-2 text-[10px] text-purple-400 hover:underline cursor-pointer font-mono"
                  >
                    [limpar filtros de busca]
                  </button>
                </div>
              ) : (
                groupedAnimes.map(([letter, list]) => (
                  <div key={letter} className="relative border-b border-zinc-900 pb-5 mb-3 last:border-0 last:pb-0 last:mb-0">
                    
                    {/* ACCORDION BIG LETTER */}
                    <div className="flex items-center space-x-3 mb-3.5">
                      <div className="bg-purple-950/20 text-purple-300 border border-purple-500/20 text-xs font-mono font-black rounded-lg h-7 w-7 flex items-center justify-center shadow">
                        {letter}
                      </div>
                      <div className="h-[1px] flex-1 bg-zinc-900" />
                    </div>

                    {/* ANIMES SUB-ITEMS LOOP */}
                    <ul className="space-y-4 pl-1">
                      {list.map((an) => {
                        const isEditingThis = editingAnimeId === an.id;
                        return (
                          <li 
                            key={an.id} 
                            className="bg-[#050505]/80 hover:bg-[#0a0715]/40 border border-zinc-900 hover:border-purple-900/20 p-4 rounded-xl transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              
                              {/* ANIME DATA PIECE */}
                              <div 
                                onClick={() => onSelectAnime(an)}
                                className="flex items-center gap-3 cursor-pointer group min-w-0 flex-1"
                              >
                                <img 
                                  src={an.image} 
                                  alt={an.title} 
                                  className="w-12 h-16 object-cover rounded-md border border-zinc-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <h3 className="font-bold text-xs text-zinc-150 group-hover:text-purple-400 transition-colors truncate">
                                    {an.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      Nota Consensual: <strong className="text-amber-400">{an.communityRating || "Ótimo"}</strong>
                                    </span>
                                    <span className="text-zinc-700">|</span>
                                    <span className="text-[10px] text-zinc-500 truncate">
                                      {an.genres.slice(0, 3).join(", ")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* TAG CODES WIDGETS OR TOGGLE COMPONENT */}
                              <div className="flex items-center flex-wrap gap-1.5 justify-end">
                                
                                {/* Present static badges */}
                                {an.topCodes && an.topCodes.length > 0 ? (
                                  <div className="flex items-center gap-1">
                                    {an.topCodes.map(code => {
                                      const globalObj = availableCodes.find(c => c.code === code);
                                      const mappedMeaning = getMappedCodeMeaning(code, globalObj?.meaning || "Tag de Estilo");
                                      return (
                                        <span 
                                          key={code}
                                          onClick={() => setSelectedFilterCode(code === selectedFilterCode ? null : code)}
                                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer border transition-colors ${
                                            code === selectedFilterCode 
                                              ? "bg-purple-600 text-white border-purple-400"
                                              : "bg-zinc-950 text-purple-400 border-zinc-900 hover:border-purple-800/40"
                                          }`}
                                          title={`${code}: ${mappedMeaning} (Clique para filtrar)`}
                                        >
                                          {code}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-zinc-650 font-mono italic">Sem tags</span>
                                )}

                                {/* ACTION BUTTON TO USE CODES */}
                                <button
                                  onClick={() => handleStartEditingCodes(an)}
                                  className="px-2 py-1 rounded bg-[#0d0a1c] hover:bg-purple-950/40 text-[10px] font-bold text-purple-400 border border-purple-900/20 cursor-pointer flex items-center gap-0.5 transition-colors"
                                  title="Grave suas tags para este anime"
                                >
                                  <Plus className="h-3 w-3" /> Usar Códigos
                                </button>
                              </div>

                            </div>

                            {/* STATISTICS PANEL: HOW MANY USERS ASSIGNED EACH CODE & RATING TIER */}
                            <div className="mt-3.5 pt-2.5 border-t border-zinc-900/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* RATING TIER COUNTS (e.g. Absolute Cinema - 520 usuarios, Otimo - 301, Bom - 40) */}
                              <div className="bg-black/25 p-2 rounded-lg border border-zinc-900/40">
                                <span className="text-[9px] font-mono text-zinc-550 flex items-center gap-1 uppercase tracking-wider mb-1.5">
                                  <BarChart2 className="h-3 w-3 text-purple-500" /> Classificações Gerais
                                </span>
                                
                                <div className="space-y-1">
                                  {an.ratingStats && Object.entries(an.ratingStats).filter(([_, count]) => count > 0).length > 0 ? (
                                    Object.entries(an.ratingStats)
                                      .filter(([_, count]) => count > 0)
                                      .sort((a, b) => b[1] - a[1]) // Ranked by votes number
                                      .map(([tier, count]) => (
                                        <div key={tier} className="flex justify-between items-center text-[10px] font-mono">
                                          <span className="text-zinc-400">{tier}</span>
                                          <span className="text-zinc-500 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-900">
                                            <strong className="text-amber-400 font-bold">{count}</strong> {count === 1 ? 'membro' : 'membros'}
                                          </span>
                                        </div>
                                      ))
                                  ) : (
                                    <div className="text-[9px] text-zinc-600 font-mono italic">Sem votos detalhados</div>
                                  )}
                                </div>
                              </div>

                              {/* STYLISH CODES COUNTS (e.g. PO - 480 usuarios, AL - 390, LT - 355) */}
                              <div className="bg-black/25 p-2 rounded-lg border border-zinc-900/40">
                                <span className="text-[9px] font-mono text-zinc-550 flex items-center gap-1 uppercase tracking-wider mb-1.5">
                                  <Tag className="h-3 w-3 text-purple-500" /> Atribuição de Códigos
                                </span>

                                <div className="space-y-1">
                                  {an.codeStats && Object.entries(an.codeStats).filter(([_, count]) => count > 0).length > 0 ? (
                                    Object.entries(an.codeStats)
                                      .filter(([_, count]) => count > 0)
                                      .sort((a, b) => b[1] - a[1])
                                      .map(([code, count]) => {
                                        const globalObj = availableCodes.find(c => c.code === code);
                                        const customMean = getMappedCodeMeaning(code, globalObj?.meaning || "Tag de Estilo");
                                        return (
                                          <div key={code} className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-zinc-400 truncate max-w-[130px]" title={`${code} — ${customMean}`}>
                                              <strong className="text-purple-400">{code}</strong> <span className="text-zinc-550">({customMean})</span>
                                            </span>
                                            <span className="text-zinc-550 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-900 ml-1">
                                              <strong className="text-zinc-200">{count}</strong> {count === 1 ? 'voto' : 'votos'}
                                            </span>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <div className="text-[9px] text-zinc-600 font-mono italic">Seja o primeiro a carimbar códigos!</div>
                                  )}
                                </div>
                              </div>

                            </div>

                            {/* INLINE CODES SUBMISSION FORM */}
                            {isEditingThis && (
                              <div className="mt-3 p-3 bg-black border border-purple-500/20 rounded-lg space-y-3 animate-scale-up">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase flex items-center gap-1">
                                    <Tag className="h-3 w-3" /> Vote nas tags para "{an.title}"
                                  </span>
                                  <button 
                                    onClick={() => setEditingAnimeId(null)}
                                    className="text-[10px] text-zinc-550 hover:text-white font-mono cursor-pointer"
                                  >
                                    [cancelar]
                                  </button>
                                </div>

                                {!currentUser.isLoggedIn ? (
                                  <div className="text-[11px] text-zinc-500 font-mono bg-zinc-950 p-2.5 rounded border border-zinc-900">
                                    ⚠️ Faça login no menu superior usando seu e-mail para usar e votar as tags da obra.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                      {availableCodes.map((codeObj) => {
                                        const isSelected = selectedCodesForEdit.includes(codeObj.code);
                                        const personalizedMean = getMappedCodeMeaning(codeObj.code, codeObj.meaning);
                                        return (
                                          <button
                                            key={codeObj.code}
                                            onClick={() => handleToggleCodeInEdit(codeObj.code)}
                                            className={`text-[10px] font-mono px-2 py-1 rounded cursor-pointer transition-all border ${
                                              isSelected 
                                                ? "bg-purple-950/60 text-purple-300 border-purple-500/50 font-bold"
                                                : "bg-[#030303] text-zinc-500 border-zinc-900 hover:border-zinc-800"
                                            }`}
                                            title={personalizedMean}
                                          >
                                            {codeObj.code} <span className="opacity-50 text-[8px]">({personalizedMean})</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {saveStatus && saveStatus.animeId === an.id && (
                                      <div className={`text-[10px] font-mono px-2.5 py-1.5 rounded ${
                                        saveStatus.success 
                                          ? "text-green-450 bg-green-950/20 border border-green-900/30" 
                                          : "text-rose-450 bg-rose-950/20"
                                      }`}>
                                        {saveStatus.success ? "✓" : "⚠️"} {saveStatus.msg}
                                      </div>
                                    )}

                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <button
                                        onClick={() => setEditingAnimeId(null)}
                                        className="px-2.5 py-1 text-[10px] hover:bg-zinc-900 text-zinc-400 hover:text-white rounded transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        onClick={() => handleSaveCodes(an.id, an.communityRating || "Ótimo")}
                                        className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10.5px] uppercase tracking-wider cursor-pointer transition-colors"
                                      >
                                        Confirmar Características
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          </li>
                        );
                      })}
                    </ul>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: 5/12 (approx 42%) - THE INTERACTIVE DICTIONARY INDEX TABLE PANEL */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CRITICAL FOR USER LOGGED-IN: FORM TO INSERT COMPLETELY PRIVATE / PERSONAL CODE */}
          {showPersonalTagForm && currentUser.isLoggedIn && (
            <div className="bg-[#0b0816] border border-purple-900/30 p-4 rounded-2xl space-y-3 animate-scale-up">
              <div className="flex items-center justify-between border-b border-purple-950/60 pb-2">
                <h3 className="text-xs font-mono font-bold text-purple-305 uppercase flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-purple-400" />
                  Cadastrar Código Privado / Apelido
                </h3>
                <button 
                  onClick={() => setShowPersonalTagForm(false)}
                  className="text-zinc-500 hover:text-white font-mono text-[10px]"
                >
                  [fechar]
                </button>
              </div>

              <form onSubmit={handleCreatePersonalCode} className="space-y-3">
                <p className="text-[11px] text-zinc-450 leading-relaxed">
                  Os códigos privados/apelidos que você criar são persistidos de maneira segura no banco de dados e <strong className="text-purple-405">aparecerão unicamente para a sua conta</strong>!
                </p>
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Código (Max 4 letras):</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Ex: TR"
                    value={newPersonalCode}
                    onChange={(e) => setNewPersonalCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                    className="w-full bg-[#030303] text-xs text-zinc-200 p-2 rounded border border-zinc-850 focus:border-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Interpretação / Categoria Pessoal:</label>
                  <input
                    type="text"
                    placeholder="Ex: Muito Triste"
                    value={newPersonalMeaning}
                    onChange={(e) => setNewPersonalMeaning(e.target.value)}
                    className="w-full bg-[#030303] text-xs text-zinc-200 p-2 rounded border border-zinc-850 focus:border-purple-500 outline-none"
                    required
                  />
                </div>

                {personalFormMsg && (
                  <div className="text-[10px] font-mono text-purple-300 bg-purple-950/20 p-2 rounded">
                    {personalFormMsg}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPersonalTagForm(false)}
                    className="px-2.5 py-1 text-[10px] text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase tracking-wider"
                  >
                    Salvar Privado
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MAIN CODES DICTIONARY */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 md:p-5 space-y-4">
            
            <div className="border-b border-zinc-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-black text-sm uppercase text-zinc-200 tracking-tight flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-purple-400" />
                  Significado de Códigos (Tags)
                </h2>
                <p className="text-[11px] text-zinc-550 leading-relaxed mt-0.5">
                  Clique para filtrar ao lado. {currentUser.isLoggedIn ? "Insira novos significados próprios clicando em dístico!" : "Faça login com seu e-mail para customizar os significados no seu sistema pessoal!"}
                </p>
              </div>
            </div>

            {/* QUICK SEARCH FOR SIGNIFIQUES */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar nos significados..."
                value={codeQuery}
                onChange={(e) => setCodeQuery(e.target.value)}
                className="w-full bg-[#030303] text-xs text-zinc-200 pl-3 pr-4 py-2.5 rounded-lg border border-zinc-85 border-zinc-850 focus:border-purple-500 outline-none"
              />
              {codeQuery && (
                <button 
                  onClick={() => setCodeQuery("")} 
                  className="absolute right-2.5 top-3 text-[10px] text-zinc-500 hover:text-white px-1 leading-normal cursor-pointer font-mono"
                >
                  ×
                </button>
              )}
            </div>

            {/* TABLE STRUCTURE */}
            <div className="border border-zinc-900 rounded-lg overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#050505]/80 border-b border-zinc-900 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                    <th className="p-3 pl-4 font-bold">Código</th>
                    <th className="p-3">Significado Consensual / Pessoal</th>
                    <th className="p-3 pr-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-zinc-600 font-mono text-xs">
                        Nenhum acrônimo localizado nesta pesquisa.
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((c) => {
                      const isFilterActive = selectedFilterCode === c.code;
                      const globalMeaning = c.meaning;
                      const userMeaning = userPersonalCodes[c.code.toUpperCase()];
                      const displayMeaning = userMeaning || globalMeaning;

                      const isEditingThisCode = editingCodeKey === c.code;

                      return (
                        <React.Fragment key={c.id}>
                          <tr 
                            className={`hover:bg-[#0c0817]/40 cursor-pointer transition-colors ${
                              isFilterActive ? "bg-purple-950/20" : ""
                            }`}
                          >
                            {/* CODE */}
                            <td 
                              className="p-3 pl-4 font-mono font-bold"
                              onClick={() => setSelectedFilterCode(c.code === selectedFilterCode ? null : c.code)}
                            >
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isFilterActive
                                  ? "bg-purple-600 text-white font-extrabold border border-purple-500"
                                  : "bg-purple-950/40 text-purple-400 border border-purple-955/40"
                              }`}>
                                {c.code}
                              </span>
                            </td>

                            {/* MEANING (WITH INDICATION IF PERSONAL OVERRIDDEN) */}
                            <td 
                              className="p-3 font-medium text-zinc-350"
                              onClick={() => setSelectedFilterCode(c.code === selectedFilterCode ? null : c.code)}
                            >
                              <span className={userMeaning ? "text-purple-300 font-semibold" : ""}>
                                {displayMeaning}
                              </span>
                              
                              {userMeaning && (
                                <span className="ml-1.5 text-[8px] bg-purple-950 text-purple-400 border border-purple-900/40 px-1 py-0.2 rounded font-mono uppercase font-extrabold tracking-wider" title={`Original: "${globalMeaning}"`}>
                                  Pessoal
                                </span>
                              )}
                            </td>

                            {/* USER QUICK EDIT ICON TO CUSTOMIZE INTERPRETAZIONE */}
                            <td className="p-3 pr-4 text-right font-mono text-[9px]">
                              {currentUser.isLoggedIn ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isEditingThisCode) {
                                      setEditingCodeKey(null);
                                    } else {
                                      setEditingCodeKey(c.code);
                                      setCustomMeaningText(userMeaning || globalMeaning);
                                    }
                                  }}
                                  className="text-purple-400 hover:text-purple-305 hover:underline cursor-pointer flex items-center justify-end gap-0.5 ml-auto text-[9.5px] font-bold uppercase transition"
                                >
                                  <Settings className="h-3 w-3" /> {userMeaning ? "Alterar" : "Personalizar"}
                                </button>
                              ) : (
                                <span className="text-zinc-650" title="Faça login com e-mail para customizar">
                                  Travado
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* INLINE EDIT DRAWER SECTION FOR CUSTOM MEANINGS */}
                          {isEditingThisCode && currentUser.isLoggedIn && (
                            <tr className="bg-black/50">
                              <td colSpan={3} className="p-3 pl-4 bg-[#080512]">
                                <div className="space-y-2 text-xs">
                                  <div className="font-mono text-[9px] text-purple-400 uppercase font-black tracking-widest">
                                    Definir seu apelido privado para o código {c.code}:
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Ex: ${globalMeaning}`}
                                      value={customMeaningText}
                                      onChange={(e) => setCustomMeaningText(e.target.value)}
                                      className="flex-1 bg-black text-zinc-200 border border-zinc-850 p-2 rounded text-xs outline-none"
                                    />
                                    <button
                                      onClick={() => handleSavePersonalMeaning(c.code)}
                                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 rounded uppercase tracking-wider cursor-pointer transition-colors"
                                    >
                                      Salvar
                                    </button>
                                  </div>
                                  <p className="text-[9px] text-zinc-550 leading-relaxed">
                                    Deixe em branco e salve se quiser reverter para o significado global padrão (<strong className="text-zinc-400">"{globalMeaning}"</strong>).
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* EXTRA EXPLANATORY TIP */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-900 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-zinc-500 leading-normal">
                <strong className="text-zinc-300">Como funciona o Sistema de Apelidos?</strong> Se você alterar o significado de um código oficial da mesa, a interpretação mudará em seu feed de cartões de anime instantaneamente, enquanto os outros usuários continuarão visualizando o significado cadastrado pela moderação. Prático para criar e gerenciar taxonomias personalizadas!
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
