import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Anime, Comment, NewsItem, PushNotification } from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "anime_db.json");

app.use(express.json());

// Code structure
interface Code {
  id: string;
  code: string;
  meaning: string;
  approved: boolean;
}

// User rating with custom tags
interface Rating {
  id: string;
  animeId: string;
  userId: string;
  ratingValue: string; // "Péssimo" | "Ruim" | "OK" | "Bom" | "Ótimo" | "Absolute Cinema"
  codes: string[];
}

const DEFAULT_CODES: Code[] = [
  { id: "1", code: "PO", meaning: "Personagem Overpower", approved: true },
  { id: "2", code: "LT", meaning: "Lutas Top", approved: true },
  { id: "3", code: "AL", meaning: "Animação Linda", approved: true },
  { id: "4", code: "DG", meaning: "Desenvolvimento Grande", approved: true },
  { id: "5", code: "FE", meaning: "Final Emocionante", approved: true },
  { id: "6", code: "TR", meaning: "Muito Triste", approved: true },
  { id: "7", code: "CM", meaning: "Comédia Muito Boa", approved: true },
  { id: "8", code: "RP", meaning: "Romance Pesado", approved: true },
  { id: "9", code: "VL", meaning: "Vilão Incrível", approved: true },
  { id: "10", code: "MT", meaning: "Plot Twist Forte", approved: true }
];

const DEFAULT_RATINGS: Rating[] = [
  { id: "r1", animeId: "1", userId: "seeded_1", ratingValue: "Ótimo", codes: ["PO", "LT", "AL"] },
  { id: "r2", animeId: "2", userId: "seeded_2", ratingValue: "Absolute Cinema", codes: ["AL", "DG", "FE"] },
  { id: "r3", animeId: "3", userId: "seeded_3", ratingValue: "Ótimo", codes: ["LT", "AL"] },
  { id: "r4", animeId: "4", userId: "seeded_4", ratingValue: "Ótimo", codes: ["PO", "LT", "AL", "VL"] },
  { id: "r5", animeId: "5", userId: "seeded_5", ratingValue: "Bom", codes: ["LT", "VL", "MT"] }
];

// Default Initial Seed Data
const INITIAL_ANIMES: Anime[] = [
  {
    id: "1",
    title: "Solo Leveling",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    description: "Em um mundo onde caçadores humanos devem combater monstros terríveis para proteger a raça humana da aniquilação total, um caçador notoriamente fraco chamado Sung Jinwoo se encontra em uma luta pela sobrevivência que mudará sua vida para sempre. Ele ganha a habilidade única de subir de nível sem limites.",
    season: "Temporada de Inverno",
    votes: 215,
    trailerUrl: "https://www.youtube.com/embed/g8fP-Wf_qC4",
    episodesCount: 12,
    rating: 9.1,
    genres: ["Ação", "Fantasia", "Superpoderes", "Aventura"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Temporada de Estreia (Solo Leveling)", episodes: 12, year: 2024 }
    ],
    releaseCalendar: "Sábados às 14:30"
  },
  {
    id: "2",
    title: "Frieren: Beyond Journey's End",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    description: "Uma maga elfa e seus ex-companheiros de aventura derrotaram o Rei Demônio e trouxeram a paz ao mundo. Anos depois, ela enfrenta o fluxo do tempo enquanto busca compreender os sentimentos humanos e honrar a memória de seus amigos mortos.",
    season: "Temporada de Outono",
    votes: 310,
    trailerUrl: "https://www.youtube.com/embed/qgQunxD0qZ4",
    episodesCount: 28,
    rating: 9.5,
    genres: ["Aventura", "Drama", "Fantasia", "Slice of Life"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Jornada do Recomeço", episodes: 28, year: 2023 }
    ],
    releaseCalendar: "Sextas-feiras às 12:00"
  },
  {
    id: "3",
    title: "Demon Slayer: Kimetsu no Yaiba",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    description: "Tanjirou Kamado luta incansavelmente contra demônios devoradores de homens para encontrar uma cura para sua irmã Nezuko, que foi transformada em demônio, e vingar a trágica morte de sua família.",
    season: "Arco do Castelo Infinito",
    votes: 189,
    trailerUrl: "https://www.youtube.com/embed/VQGCKySg878",
    episodesCount: 55,
    rating: 8.9,
    genres: ["Ação", "Fantasia", "Shounen", "Histórico"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Arco da Seleção Final", episodes: 26, year: 2019 },
      { seasonNumber: 2, title: "Arco do Distrito do Entretenimento", episodes: 18, year: 2021 },
      { seasonNumber: 3, title: "Arco da Vila dos Ferreiros", episodes: 11, year: 2023 },
      { seasonNumber: 4, title: "Arco do Treinamento Hashira", episodes: 8, year: 2024 }
    ],
    releaseCalendar: "Domingos às 13:45"
  },
  {
    id: "4",
    title: "Jujutsu Kaisen",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    description: "Yuji Itadori, um estudante com força física imensa, engole um dedo amaldiçoado de Ryomen Sukuna para salvar amigos de uma maldição, tornando-se o receptáculo da maldição suprema e ingressando na escola técnica de Jujutsu.",
    season: "Incidente de Shibuya",
    votes: 274,
    trailerUrl: "https://www.youtube.com/embed/ApSgT_9f_N0",
    episodesCount: 47,
    rating: 9.0,
    genres: ["Ação", "Sobrenatural", "Escolar", "Shounen"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Introdução à Jujutsu", episodes: 24, year: 2020 },
      { seasonNumber: 2, title: "Incidente de Shibuya", episodes: 23, year: 2023 }
    ],
    releaseCalendar: "Lançamento Completo"
  },
  {
    id: "5",
    title: "Chainsaw Man",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
    description: "Denji é um jovem pobre que trabalha como caçador de demônios para pagar as dívidas do pai com a Yakuza, acompanhado por seu cão-demônio Pochita. Após ser morto em uma emboscada, ele se funde com Pochita para se tornar o Homem-Motosserra.",
    season: "Filme anunciado",
    votes: 145,
    trailerUrl: "https://www.youtube.com/embed/v4yY_g3H2-8",
    episodesCount: 12,
    rating: 8.7,
    genres: ["Ação", "Gore", "Sombrio", "Comédia", "Sobrenatural"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Arco da Segurança Pública", episodes: 12, year: 2022 }
    ],
    releaseCalendar: "No Aguardo do Filme Reze-hen"
  },
  {
    id: "6",
    title: "Attack on Titan",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    description: "Em um mundo onde a humanidade vive cercada por imensas muralhas para se proteger de gigantes devoradores de humanos conhecidos como Titãs, Eren Yeager jura exterminar cada um dos monstros após presenciar a morte de sua mãe.",
    season: "Finalizada",
    votes: 382,
    trailerUrl: "https://www.youtube.com/embed/LHtdkWMS-WY",
    episodesCount: 88,
    rating: 9.6,
    genres: ["Ação", "Drama", "Sombrio", "Sobrenatural", "Militar"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Temporada de Estreia", episodes: 25, year: 2013 },
      { seasonNumber: 2, title: "A Batalha do Castelo de Utgard", episodes: 12, year: 2017 },
      { seasonNumber: 3, title: "Retomada de Shiganshina", episodes: 22, year: 2018 },
      { seasonNumber: 4, title: "The Final Season", episodes: 29, year: 2020 }
    ],
    releaseCalendar: "Concluído"
  },
  {
    id: "7",
    title: "Akame ga Kill",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    description: "Tatsumi é um jovem guerreiro que viaja para a capital com o plano de angariar fundos para sua vila faminta, mas descobre uma corrupção inacreditável e se junta ao clã rebelde de assassinos temidos, a Night Raid.",
    season: "Finalizada",
    votes: 112,
    trailerUrl: "https://www.youtube.com/embed/gMvIuDbyCNo",
    episodesCount: 24,
    rating: 8.2,
    genres: ["Ação", "Sombrio", "Superpoderes", "Drama", "Shounen"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "A Ira dos Assassinos Rebeldes", episodes: 24, year: 2014 }
    ],
    releaseCalendar: "Concluído"
  },
  {
    id: "8",
    title: "Bleach",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    description: "Ichigo Kurosaki é um estudante comum de ensino médio que consegue ver fantasmas, mas tudo muda quando seus poderes de Shinigami despertam ao tentar salvar sua família do ataque violento de um Hollow devorador.",
    season: "Guerra Sangrenta dos Mil Anos",
    votes: 198,
    trailerUrl: "https://www.youtube.com/embed/e8Y_fC-0T88",
    episodesCount: 366,
    rating: 8.8,
    genres: ["Ação", "Sobrenatural", "Superpoderes", "Shounen"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Arco do Shinigami Substituto", episodes: 20, year: 2004 },
      { seasonNumber: 2, title: "Arco da Sociedade das Almas", episodes: 43, year: 2005 },
      { seasonNumber: 3, title: "Guerra Sangrenta dos Mil Anos", episodes: 39, year: 2022 }
    ],
    releaseCalendar: "Sábados às 11:00"
  },
  {
    id: "9",
    title: "Blue Lock",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    description: "Após uma derrota trágica na Copa do Mundo de 2018, a associação japonesa de futebol recruta 300 atacantes juvenis de elite e os tranca em uma prisão tecnológica chamada Blue Lock, para forjar o maior centroavante egoísta do planeta.",
    season: "Temporada 2",
    votes: 135,
    trailerUrl: "https://www.youtube.com/embed/K84o-3xSg0Q",
    episodesCount: 36,
    rating: 8.5,
    genres: ["Aventura", "Shounen", "Esportes", "Escolar"],
    seasonsCatalog: [
      { seasonNumber: 1, title: "Eliminatórias do Blue Lock", episodes: 24, year: 2022 },
      { seasonNumber: 2, title: "U-20 Batalha de Seleção", episodes: 12, year: 2024 }
    ],
    releaseCalendar: "Domingos às 15:00"
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c1",
    animeId: "1",
    userName: "OtakuDeSombras",
    comment: "Solo Leveling está impecável! A qualidade da animação da A-1 Pictures superou todas as expectativas na luta contra a estátua de Deus. Mal posso esperar pelo anime continuar!",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    likes: 24,
    isVip: true
  },
  {
    id: "c2",
    animeId: "2",
    userName: "FrierenMagia",
    comment: "Frieren não é apenas um anime, é poesia em forma de animação. A trilha sonora e o tom melancólico misturado com fantasia clássica trazem uma paz imensa. Nota 10/10!",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    likes: 42,
    isVip: false
  },
  {
    id: "c3",
    animeId: "3",
    userName: "TanjiroBR",
    comment: "Demon Slayer sempre entrega as melhores lutas. O trabalho de efeitos de respiração e a animação da ufotable é arte pura. Aguardando ansioso pela trilogia do Castelo Infinito!",
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    likes: 15,
    isVip: true
  }
];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Chainsaw Man: Filme do Arco da Reze divulga novo pôster promocional!",
    content: "O aclamado estúdio MAPPA revelou um novo cartaz promocional para o próximo filme de Chainsaw Man, focado na misteriosa Reze. A produção dará sequência direta à primeira temporada do anime e promete ser um marco nos cinemas mundiais. Fãs especulam estreia para o final deste ano.",
    category: "Filme",
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    author: "Equipe Anime Bushidô"
  },
  {
    id: "n2",
    title: "Curiosidade: A inspiração folclórica por trás dos demônios e técnicas de Demon Slayer",
    content: "Koyoharu Gotouge baseou grande parte das técnicas de respiração e das criaturas Oni em folclores reais do Japão do período Taisho. A respiração do sol, por exemplo, faz menção direta à deusa do sol Amaterasu, enquanto várias das flores glicínias possuíam conotações de purificação espiritual no xintoísmo clássico.",
    category: "Curiosidade",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&auto=format&fit=crop&q=80",
    author: "Admin Bushidô"
  },
  {
    id: "n3",
    title: "Vendas de Mangá: Solo Leveling e Jujutsu Kaisen dominam top global de vendas em 2025/2026",
    content: "Com as recentes adaptações de enorme sucesso, os volumes impressos e digitais de Jujutsu Kaisen e o Manhwa de Solo Leveling alcançaram recordes históricos na América do Sul e Europa. O encerramento iminente de algumas séries acelerou os colecionadores a garantirem suas edições especiais.",
    category: "Mangá",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=800&auto=format&fit=crop&q=80",
    author: "Equipe Editorial"
  }
];

const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: "notif1",
    title: "🔥 Novo Trailer Liberado!",
    message: "O trailer oficial da nova temporada de Solo Leveling foi liberado com cenas explosivas de Sung Jinwoo!",
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    animeId: "1"
  },
  {
    id: "notif2",
    title: "🌟 Votação do Mês Aberta",
    message: "Qual o melhor anime da temporada de Outono? Deixe seu voto e ajude a definir o líder do Ranking!",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

interface DatabaseSchema {
  animes: Anime[];
  comments: Comment[];
  news: NewsItem[];
  notifications: PushNotification[];
  userVotedAnimes: { [userId: string]: string[] }; // Record of anime IDs voted by users
  userFavorites: { [userId: string]: string[] }; // Record of anime IDs favorited by users
  userWatchlist: { [userId: string]: string[] }; // Record of anime IDs in watchlist
  codes?: Code[];
  ratings?: Rating[];
  userCodes?: { [userId: string]: { [code: string]: string } }; // Personal code meaning overrides: userId -> code -> custom meaning
}

// Database Helper
const loadDb = (): DatabaseSchema => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data) as DatabaseSchema;
      
      // Ensure codes, ratings, and userCodes tables exist
      if (!parsed.codes) {
        parsed.codes = DEFAULT_CODES;
      }
      if (!parsed.ratings) {
        parsed.ratings = DEFAULT_RATINGS;
      }
      if (!parsed.userCodes) {
        parsed.userCodes = {};
      }
      return parsed;
    }
  } catch (err) {
    console.error("Erro ao ler banco de dados JSON. Reiniciando de padrões.", err);
  }

  const defaultDb: DatabaseSchema = {
    animes: INITIAL_ANIMES,
    comments: INITIAL_COMMENTS,
    news: INITIAL_NEWS,
    notifications: INITIAL_NOTIFICATIONS,
    userVotedAnimes: {},
    userFavorites: {},
    userWatchlist: {},
    codes: DEFAULT_CODES,
    ratings: DEFAULT_RATINGS,
    userCodes: {}
  };
  saveDb(defaultDb);
  return defaultDb;
};

const saveDb = (data: DatabaseSchema) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco de dados JSON:", err);
  }
};

// Helper to compute live ratings and statistics for each anime
function computeAnimeDynamicData(anime: Anime, dbData: DatabaseSchema) {
  const animeId = anime.id;
  const ratings = (dbData.ratings || []).filter(r => r.animeId === animeId);
  
  // Set up baseline stats for seeded animes matching user requirements
  const ratingDistribution: { [key: string]: number } = {
    "Absolute Cinema": 0,
    "Ótimo": 0,
    "Bom": 0,
    "OK": 0,
    "Ruim": 0,
    "Péssimo": 0
  };

  const codeCounts: { [key: string]: number } = {};

  // Baseline seeds aligned with prompt specifications
  if (animeId === "1") { // Solo Leveling
    ratingDistribution["Absolute Cinema"] = 520;
    ratingDistribution["Ótimo"] = 301;
    ratingDistribution["Bom"] = 40;
    codeCounts["PO"] = 480;
    codeCounts["AL"] = 390;
    codeCounts["LT"] = 355;
  } else if (animeId === "4") { // Jujutsu Kaisen
    ratingDistribution["Absolute Cinema"] = 180;
    ratingDistribution["Ótimo"] = 245;
    ratingDistribution["Bom"] = 30;
    codeCounts["PO"] = 125;
    codeCounts["LT"] = 89;
    codeCounts["AL"] = 210;
  } else if (animeId === "3") { // Demon Slayer
    ratingDistribution["Ótimo"] = 170;
    ratingDistribution["Bom"] = 120;
    ratingDistribution["Absolute Cinema"] = 90;
    codeCounts["LT"] = 145;
    codeCounts["AL"] = 189;
  } else {
    // Other simple seeds
    ratingDistribution["Ótimo"] = 15;
    ratingDistribution["Bom"] = 8;
  }

  // Aggregate user ratings
  ratings.forEach(r => {
    ratingDistribution[r.ratingValue] = (ratingDistribution[r.ratingValue] || 0) + 1;
    (r.codes || []).forEach(c => {
      codeCounts[c] = (codeCounts[c] || 0) + 1;
    });
  });

  // Calculate most represented rating as communityRating
  let communityRating = "Bom";
  let maxRatingCount = -1;
  Object.entries(ratingDistribution).forEach(([k, v]) => {
    if (v > maxRatingCount) {
      maxRatingCount = v;
      communityRating = k;
    }
  });

  // Sort and filter codes according to actual vote weights
  const sortedCodes = Object.entries(codeCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  // Fallbacks if list is empty
  const finalTopCodes = sortedCodes.length > 0 ? sortedCodes : (animeId === "1" ? ["PO", "LT", "AL"] : ["AL"]);

  return {
    ...anime,
    communityRating,
    topCodes: finalTopCodes,
    ratingStats: ratingDistribution,
    codeStats: codeCounts
  };
}

// API Endpoints
app.get("/api/animes", (req, res) => {
  const dbData = loadDb();
  const decorated = dbData.animes.map(a => computeAnimeDynamicData(a, dbData));
  res.json(decorated);
});

// ADMIN: Create Anime
app.post("/api/admin/animes", (req, res) => {
  const { title, image, description, season, trailerUrl, episodesCount, rating, genres, releaseCalendar, seasonsCatalog } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Título e descrição do anime são obrigatórios para o cadastro" });
  }

  const dbData = loadDb();
  // Generate high unique standard id
  const nextId = String(Date.now());
  
  const newAnime: Anime = {
    id: nextId,
    title,
    image: image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    description,
    season: season || "Temporada Atual",
    votes: 0,
    trailerUrl: trailerUrl || "https://www.youtube.com/embed/ApSgT_9f_N0",
    episodesCount: Number(episodesCount) || 12,
    rating: Number(rating) || 8.0,
    genres: genres || ["Ação"],
    releaseCalendar: releaseCalendar || "Lançamentos Concluídos",
    seasonsCatalog: seasonsCatalog || [{ seasonNumber: 1, title: "Temporada de Estreia", episodes: Number(episodesCount) || 12, year: 2026 }]
  };

  dbData.animes.push(newAnime);
  saveDb(dbData);
  res.status(210).json(computeAnimeDynamicData(newAnime, dbData));
});

// ADMIN: Update Anime
app.put("/api/admin/animes/:id", (req, res) => {
  const { id } = req.params;
  const { title, image, description, season, trailerUrl, episodesCount, rating, genres, releaseCalendar, seasonsCatalog } = req.body;

  const dbData = loadDb();
  const index = dbData.animes.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Anime não localizado" });
  }

  const updatedAnime = {
    ...dbData.animes[index],
    title: title || dbData.animes[index].title,
    image: image || dbData.animes[index].image,
    description: description || dbData.animes[index].description,
    season: season !== undefined ? season : dbData.animes[index].season,
    trailerUrl: trailerUrl !== undefined ? trailerUrl : dbData.animes[index].trailerUrl,
    episodesCount: episodesCount !== undefined ? Number(episodesCount) : dbData.animes[index].episodesCount,
    rating: rating !== undefined ? Number(rating) : dbData.animes[index].rating,
    genres: genres || dbData.animes[index].genres,
    releaseCalendar: releaseCalendar !== undefined ? releaseCalendar : dbData.animes[index].releaseCalendar,
    seasonsCatalog: seasonsCatalog || dbData.animes[index].seasonsCatalog
  };

  dbData.animes[index] = updatedAnime;
  saveDb(dbData);
  res.json(computeAnimeDynamicData(updatedAnime, dbData));
});

// ADMIN: Delete Anime
app.delete("/api/admin/animes/:id", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  
  const exist = dbData.animes.some(a => a.id === id);
  if (!exist) {
    return res.status(404).json({ error: "Anime não localizado para exclusão" });
  }

  dbData.animes = dbData.animes.filter(a => a.id !== id);
  
  // Clean up associated ratings
  if (dbData.ratings) {
    dbData.ratings = dbData.ratings.filter(r => r.animeId !== id);
  }
  // Clean up comments
  dbData.comments = dbData.comments.filter(c => c.animeId !== id);

  saveDb(dbData);
  res.json({ success: true, message: "Anime e dependências removidos com sucesso!" });
});


// USER RATING & CODES VOTING ENDPOINT
app.post("/api/animes/:animeId/rate", (req, res) => {
  const { animeId } = req.params;
  const { userId, ratingValue, codes } = req.body; // codes: Array of code strings e.g. ["PO", "LT"]

  if (!ratingValue) {
    return res.status(400).json({ error: "A nota do anime é obrigatória." });
  }

  const validRatings = ["Péssimo", "Ruim", "OK", "Bom", "Ótimo", "Absolute Cinema"];
  if (!validRatings.includes(ratingValue)) {
    return res.status(400).json({ error: "Classificação de Estrelas Inválida" });
  }

  const dbData = loadDb();
  const anime = dbData.animes.find(a => a.id === animeId);
  if (!anime) {
    return res.status(404).json({ error: "Anime não localizado" });
  }

  if (!dbData.ratings) dbData.ratings = [];

  // Upsert user rating
  const existingIndex = dbData.ratings.findIndex(r => r.animeId === animeId && r.userId === userId);
  const ratingData: Rating = {
    id: existingIndex !== -1 ? dbData.ratings[existingIndex].id : `r_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
    animeId,
    userId,
    ratingValue,
    codes: codes || []
  };

  if (existingIndex !== -1) {
    dbData.ratings[existingIndex] = ratingData;
  } else {
    dbData.ratings.push(ratingData);
    // Add to community votes as well!
    anime.votes += 1;
  }

  // Recalculate average numeric rating
  const animeRatings = dbData.ratings.filter(r => r.animeId === animeId);
  const valueMap: { [key: string]: number } = {
    "Péssimo": 2.0,
    "Ruim": 4.0,
    "OK": 6.0,
    "Bom": 8.0,
    "Ótimo": 9.2,
    "Absolute Cinema": 10.0
  };

  const sum = animeRatings.reduce((acc, curr) => acc + (valueMap[curr.ratingValue] || 8.0), 0);
  const avg = sum / animeRatings.length;
  anime.rating = parseFloat(avg.toFixed(1));

  saveDb(dbData);
  res.json(computeAnimeDynamicData(anime, dbData));
});


// SYSTEM CODES ENDPOINTS
app.get("/api/codes", (req, res) => {
  const dbData = loadDb();
  const approvedCodes = (dbData.codes || []).filter(c => c.approved);
  res.json(approvedCodes);
});

app.get("/api/admin/codes", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.codes || []);
});

// Community suggest code
app.post("/api/codes", (req, res) => {
  const { code, meaning } = req.body;
  if (!code || !meaning) {
    return res.status(400).json({ error: "Código e Significado são necessários" });
  }

  const dbData = loadDb();
  if (!dbData.codes) dbData.codes = [];

  // Check unique uppercase
  const upCode = code.toUpperCase().trim().substring(0, 4);
  const exist = dbData.codes.some(c => c.code === upCode);
  if (exist) {
    return res.status(400).json({ error: `O código '${upCode}' já existe/está em análise.` });
  }

  const newCode: Code = {
    id: `co_${Date.now()}`,
    code: upCode,
    meaning: meaning.trim(),
    approved: false // requires admin consent
  };

  dbData.codes.push(newCode);
  saveDb(dbData);
  res.status(210).json(newCode);
});

// Admin directly registers code (instant approved)
app.post("/api/admin/codes", (req, res) => {
  const { code, meaning } = req.body;
  if (!code || !meaning) {
    return res.status(400).json({ error: "Código e Significado são necessários" });
  }

  const dbData = loadDb();
  if (!dbData.codes) dbData.codes = [];

  const upCode = code.toUpperCase().trim().substring(0, 4);
  const existIdx = dbData.codes.findIndex(c => c.code === upCode);
  
  if (existIdx !== -1) {
    // Approve if existing
    dbData.codes[existIdx].approved = true;
    dbData.codes[existIdx].meaning = meaning;
    saveDb(dbData);
    return res.json(dbData.codes[existIdx]);
  }

  const newCode: Code = {
    id: `co_${Date.now()}`,
    code: upCode,
    meaning: meaning.trim(),
    approved: true
  };

  dbData.codes.push(newCode);
  saveDb(dbData);
  res.status(210).json(newCode);
});

// Admin edits code
app.put("/api/admin/codes/:id", (req, res) => {
  const { id } = req.params;
  const { code, meaning, approved } = req.body;

  const dbData = loadDb();
  if (!dbData.codes) dbData.codes = [];

  const index = dbData.codes.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Código não correspondido" });
  }

  dbData.codes[index] = {
    ...dbData.codes[index],
    code: code ? code.toUpperCase().trim().substring(0, 4) : dbData.codes[index].code,
    meaning: meaning !== undefined ? meaning.trim() : dbData.codes[index].meaning,
    approved: approved !== undefined ? !!approved : dbData.codes[index].approved
  };

  saveDb(dbData);
  res.json(dbData.codes[index]);
});

// Admin approves a code
app.post("/api/admin/codes/:id/approve", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  if (!dbData.codes) dbData.codes = [];

  const index = dbData.codes.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Código não correspondido" });
  }

  dbData.codes[index].approved = true;
  saveDb(dbData);
  res.json(dbData.codes[index]);
});

// Admin deletes code
app.delete("/api/admin/codes/:id", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  if (!dbData.codes) dbData.codes = [];

  dbData.codes = dbData.codes.filter(c => c.id !== id);
  saveDb(dbData);
  res.json({ success: true, message: "Código excluído!" });
});


app.post("/api/animes/:id/vote", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const currentUserId = userId || "anonymous_user";

  const dbData = loadDb();
  const anime = dbData.animes.find((a) => a.id === id);

  if (!anime) {
    return res.status(404).json({ error: "Anime não encontrado" });
  }

  // Set up tracking structure for user votes if missing
  if (!dbData.userVotedAnimes) {
    dbData.userVotedAnimes = {};
  }

  const votedList = dbData.userVotedAnimes[currentUserId] || [];

  if (votedList.includes(id)) {
    // Already voted for this anime, let's toggle/remove vote
    dbData.userVotedAnimes[currentUserId] = votedList.filter((vId) => vId !== id);
    anime.votes = Math.max(0, anime.votes - 1);
    saveDb(dbData);
    return res.json({ message: "Voto removido com sucesso!", anime: computeAnimeDynamicData(anime, dbData), hasVoted: false });
  } else {
    // Add vote
    votedList.push(id);
    dbData.userVotedAnimes[currentUserId] = votedList;
    anime.votes += 1;
    saveDb(dbData);
    return res.json({ message: "Voto registrado com sucesso!", anime: computeAnimeDynamicData(anime, dbData), hasVoted: true });
  }
});

app.get("/api/animes/:id/comments", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  const commentsForAnime = dbData.comments.filter((c) => c.animeId === id);
  // Sort comments by likes first (top comments request) and then date
  commentsForAnime.sort((a, b) => b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(commentsForAnime);
});

app.post("/api/animes/:id/comments", (req, res) => {
  const { id } = req.params;
  const { userName, comment, isVip } = req.body;

  if (!comment || typeof comment !== "string" || comment.trim() === "") {
    return res.status(400).json({ error: "Comentário não pode ser vazio" });
  }

  const dbData = loadDb();
  const animeExists = dbData.animes.some((a) => a.id === id);
  if (!animeExists) {
    return res.status(404).json({ error: "Anime não encontrado" });
  }

  const newComment: Comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    animeId: id,
    userName: userName || "Otaku Anônimo",
    comment: comment.substring(0, 1000), // Protect size
    createdAt: new Date().toISOString(),
    likes: 0,
    isVip: !!isVip
  };

  dbData.comments.unshift(newComment);
  saveDb(dbData);
  res.status(210).json(newComment);
});

app.post("/api/comments/:commentId/like", (req, res) => {
  const { commentId } = req.params;
  const dbData = loadDb();
  const comment = dbData.comments.find((c) => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: "Comentário não encontrado" });
  }

  comment.likes += 1;
  saveDb(dbData);
  res.json(comment);
});

app.get("/api/news", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.news);
});

app.post("/api/news", (req, res) => {
  const { title, content, category, imageUrl, author } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: "Dados incompletos para a notícia" });
  }

  const dbData = loadDb();
  const newNews: NewsItem = {
    id: `n_${Date.now()}`,
    title,
    content,
    category: category as any,
    createdAt: new Date().toISOString(),
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    author: author || "Administrador"
  };

  dbData.news.unshift(newNews);
  saveDb(dbData);
  res.status(210).json(newNews);
});

app.get("/api/notifications", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.notifications);
});

app.post("/api/notifications", (req, res) => {
  const { title, message, animeId } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Dados incompletos para a notificação" });
  }

  const dbData = loadDb();
  const newNotification: PushNotification = {
    id: `notif_${Date.now()}`,
    title,
    message,
    createdAt: new Date().toISOString(),
    animeId
  };

  dbData.notifications.unshift(newNotification);
  // Keep last 15 notifications as max
  if (dbData.notifications.length > 15) {
    dbData.notifications = dbData.notifications.slice(0, 15);
  }
  saveDb(dbData);
  res.status(210).json(newNotification);
});

// Watchlist and Favorites handlers
app.get("/api/user/:userId/favorites", (req, res) => {
  const { userId } = req.params;
  const dbData = loadDb();
  if (!dbData.userFavorites) dbData.userFavorites = {};
  const favs = dbData.userFavorites[userId] || [];
  res.json(favs);
});

app.post("/api/user/:userId/favorites", (req, res) => {
  const { userId } = req.params;
  const { animeId } = req.body;
  const dbData = loadDb();

  if (!dbData.userFavorites) dbData.userFavorites = {};
  const favs = dbData.userFavorites[userId] || [];

  let isFav = false;
  if (favs.includes(animeId)) {
    dbData.userFavorites[userId] = favs.filter((id) => id !== animeId);
  } else {
    favs.push(animeId);
    dbData.userFavorites[userId] = favs;
    isFav = true;
  }

  saveDb(dbData);
  res.json({ favorites: dbData.userFavorites[userId], isFavorite: isFav });
});

app.get("/api/user/:userId/watchlist", (req, res) => {
  const { userId } = req.params;
  const dbData = loadDb();
  if (!dbData.userWatchlist) dbData.userWatchlist = {};
  const watchlist = dbData.userWatchlist[userId] || [];
  res.json(watchlist);
});

app.post("/api/user/:userId/watchlist", (req, res) => {
  const { userId } = req.params;
  const { animeId } = req.body;
  const dbData = loadDb();

  if (!dbData.userWatchlist) dbData.userWatchlist = {};
  const watchlist = dbData.userWatchlist[userId] || [];

  let inWatch = false;
  if (watchlist.includes(animeId)) {
    dbData.userWatchlist[userId] = watchlist.filter((id) => id !== animeId);
  } else {
    watchlist.push(animeId);
    dbData.userWatchlist[userId] = watchlist;
    isVip: true;
    inWatch = true;
  }

  saveDb(dbData);
  res.json({ watchlist: dbData.userWatchlist[userId], inWatchlist: inWatch });
});

// Personal User Codes Meanings
app.get("/api/user-codes/:userId", (req, res) => {
  const { userId } = req.params;
  const dbData = loadDb();
  if (!dbData.userCodes) dbData.userCodes = {};
  const personal = dbData.userCodes[userId] || {};
  res.json(personal);
});

app.post("/api/user-codes/:userId", (req, res) => {
  const { userId } = req.params;
  const { code, personal_meaning } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Código inválido" });
  }

  const cleanCode = code.toUpperCase().trim().substring(0, 4);
  const dbData = loadDb();
  if (!dbData.userCodes) dbData.userCodes = {};
  if (!dbData.userCodes[userId]) dbData.userCodes[userId] = {};

  if (!personal_meaning || personal_meaning.trim() === "") {
    delete dbData.userCodes[userId][cleanCode];
  } else {
    dbData.userCodes[userId][cleanCode] = personal_meaning.trim();
  }

  saveDb(dbData);
  res.json(dbData.userCodes[userId]);
});

// Admin state checks and system stats
app.get("/api/admin/stats", (req, res) => {
  const dbData = loadDb();
  const totalVotes = dbData.animes.reduce((sum, anime) => sum + anime.votes, 0);
  const totalComments = dbData.comments.length;
  const totalNews = dbData.news.length;
  res.json({
    totalAnimes: dbData.animes.length,
    totalVotes,
    totalComments,
    totalNews
  });
});

async function startServer() {
  // Vite integration middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server rodando com sucesso no endereço http://localhost:${PORT}`);
  });
}

startServer();
