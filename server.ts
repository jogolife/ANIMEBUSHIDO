import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Anime, Comment, NewsItem, PushNotification, MangaSubmission } from "./src/types";
import { MercadoPagoConfig, Preference } from "mercadopago";

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
  uses_count?: number;
  official?: boolean;
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
  { id: "1", code: "PO", meaning: "Personagem Overpower", approved: true, uses_count: 521, official: true },
  { id: "2", code: "LT", meaning: "Lutas Top", approved: true, uses_count: 280, official: true },
  { id: "3", code: "AL", meaning: "Animação Linda", approved: true, uses_count: 310, official: true },
  { id: "4", code: "DG", meaning: "Desenvolvimento Grande", approved: true, uses_count: 95, official: false },
  { id: "5", code: "FE", meaning: "Final Emocionante", approved: true, uses_count: 35, official: false },
  { id: "6", code: "TR", meaning: "Muito Triste", approved: true, uses_count: 18, official: false },
  { id: "7", code: "CM", meaning: "Comédia Muito Boa", approved: true, uses_count: 42, official: false },
  { id: "8", code: "RP", meaning: "Romance Pesado", approved: true, uses_count: 22, official: false },
  { id: "9", code: "VL", meaning: "Vilão Incrível", approved: true, uses_count: 65, official: false },
  { id: "10", code: "MT", meaning: "Plot Twist Forte", approved: true, uses_count: 84, official: false },
  { id: "11", code: "FM", meaning: "Código Raro Encontrado", approved: true, uses_count: 4, official: false }
];

const DEFAULT_RATINGS: Rating[] = [
  { id: "r1", animeId: "1", userId: "seeded_1", ratingValue: "Absolute Cinema", codes: ["PO", "AL", "LT"] },
  { id: "r2", animeId: "2", userId: "seeded_2", ratingValue: "Ótimo", codes: ["AL", "LT"] },
  { id: "r3", animeId: "3", userId: "seeded_3", ratingValue: "Ótimo", codes: ["PO", "LT", "AL"] },
  { id: "r4", animeId: "4", userId: "seeded_4", ratingValue: "Ótimo", codes: ["DG", "LT"] },
  { id: "r5", animeId: "5", userId: "seeded_5", ratingValue: "Ótimo", codes: ["MT", "VL"] },
  { id: "r6", animeId: "6", userId: "seeded_6", ratingValue: "Absolute Cinema", codes: ["AL", "DG"] }
];

// Default Initial Seed Data
const INITIAL_ANIMES: Anime[] = [
  {
    id: "1",
    title: "Solo Leveling",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    description: "Em um mundo onde caçadores humanos devem combater monstros terríveis para proteger a raça humana da aniquilação total, um caçador notoriamente fraco chamado Sung Jinwoo se encontra em uma luta pela sobrevivência que mudará sua vida para sempre. Ele ganha a habilidade única de subir de nível sem limites. — PO (Personagem Overpower) marcante!",
    season: "Temporada de Inverno",
    votes: 325,
    trailerUrl: "https://www.youtube.com/embed/g8fP-Wf_qC4",
    episodesCount: 12,
    rating: 9.1,
    genres: ["Ação", "Fantasia", "Superpoderes"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Temporada 1", episodes: 12, year: 2024 }],
    releaseCalendar: "Sábados às 14:30"
  },
  {
    id: "2",
    title: "Demon Slayer",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    description: "Tanjirou Kamado luta incansavelmente contra demônios devoradores de homens para encontrar uma cura para sua irmã Nezuko, que foi transformada em demônio, e vingar a trágica morte de sua família.",
    season: "Temporada de Primavera",
    votes: 412,
    trailerUrl: "https://www.youtube.com/embed/VQGCKySg878",
    episodesCount: 55,
    rating: 8.9,
    genres: ["Ação", "Histórico", "Aventura"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Arco de Estreia", episodes: 26, year: 2019 }],
    releaseCalendar: "Domingos às 13:45"
  },
  {
    id: "3",
    title: "Jujutsu Kaisen",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    description: "Yuji Itadori, um estudante com força física imensa, engole um dedo amaldiçoado de Ryomen Sukuna para salvar amigos de uma maldição, tornando-se o receptáculo da maldição suprema e ingressando na escola técnica de Jujutsu. — PO (Personagem Overpower) marcante!",
    season: "Temporada de Outono",
    votes: 521,
    trailerUrl: "https://www.youtube.com/embed/ApSgT_9f_N0",
    episodesCount: 47,
    rating: 9.0,
    genres: ["Ação", "Sobrenatural", "Shounen"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Introdução à Jujutsu", episodes: 24, year: 2020 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "4",
    title: "Naruto",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    description: "A saga emocionante de Naruto Uzumaki, um jovem ninja que carrega a Raposa de Nove Caudas selada em seu corpo e faz de tudo para conquistar o respeito de sua vila e tornar-se o Hokage. — DG (Desenvolvimento Grande) marcante!",
    season: "Clássico & Shippuden",
    votes: 310,
    trailerUrl: "https://www.youtube.com/embed/QzzYp_yW_8s",
    episodesCount: 720,
    rating: 8.8,
    genres: ["Ação", "Ninja", "Shounen"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Naruto Clássico", episodes: 220, year: 2002 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "5",
    title: "Death Note",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
    description: "Light Yagami encontra um caderno sobrenatural capaz de assassinar qualquer pessoa cujo nome seja escrito nele. Começa um duelo psicológico inesquecível de gato e rato contra o detetive genial L. — MT (Plot Twist Forte) marcante!",
    season: "Concluído",
    votes: 280,
    trailerUrl: "https://www.youtube.com/embed/NlJZ-YgAt-c",
    episodesCount: 37,
    rating: 9.0,
    genres: ["Mistério", "Policial", "Sobrenatural"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Estreia de Death Note", episodes: 37, year: 2006 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "6",
    title: "Attack on Titan",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    description: "A humanidade vive assombrada dentro de muralhas gigantescas com medo dos Titãs devoradores, até que o jovem Eren Yeager decide destruí-los após presenciar uma terrível tragédia pessoal.",
    season: "Finalizada",
    votes: 382,
    trailerUrl: "https://www.youtube.com/embed/LHtdkWMS-WY",
    episodesCount: 88,
    rating: 9.6,
    genres: ["Ação", "Drama", "Sombrio"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Temporada de Estreia", episodes: 25, year: 2013 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "7",
    title: "Bleach",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    description: "Ichigo Kurosaki recebe acidentalmente os poderes de Shinigami de Rukia Kuchiki para salvar sua família do ataque violento de uma alma corrompida devastadora.",
    season: "Guerra Sangrenta dos Mil Anos",
    votes: 198,
    trailerUrl: "https://www.youtube.com/embed/e8Y_fC-0T88",
    episodesCount: 366,
    rating: 8.8,
    genres: ["Ação", "Sobrenatural", "Superpoderes"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Arco do Shinigami Substituto", episodes: 20, year: 2004 }],
    releaseCalendar: "Lançamento Concluído"
  },
  {
    id: "8",
    title: "Chainsaw Man",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
    description: "Denji é um jovem desamparado caçador de demônios que faz um pacto de sangue vitalício com seu cão Pochita para renascer como o lendário Homem-Motosserra.",
    season: "Filme Anunciado",
    votes: 145,
    trailerUrl: "https://www.youtube.com/embed/v4yY_g3H2-8",
    episodesCount: 12,
    rating: 8.7,
    genres: ["Ação", "Gore", "Sombrio"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Arco da Segurança Pública", episodes: 12, year: 2022 }],
    releaseCalendar: "No Aguardo do Filme"
  },
  {
    id: "9",
    title: "Dragon Ball",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    description: "O clássico supremo dos animes de luta. Acompanhe a jornada de Goku, desde sua infância em busca das esferas do dragão até os duelos lendários contra deuses e conquistadores universais.",
    season: "Saga Super",
    votes: 450,
    trailerUrl: "https://www.youtube.com/embed/jZf9XvX_Lgw",
    episodesCount: 508,
    rating: 9.2,
    genres: ["Ação", "Luta", "Superpoderes"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Dragon Ball Z", episodes: 291, year: 1989 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "10",
    title: "Fullmetal Alchemist",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    description: "Edward e Alphonse Elric violam a proibição tabu da alquimia humana para ressuscitar sua falecida mãe, perdendo partes essenciais de seus corpos e partindo em busca da lendária Pedra Filosofal.",
    season: "Brotherhood Completo",
    votes: 490,
    trailerUrl: "https://www.youtube.com/embed/B8_9V83scfc",
    episodesCount: 64,
    rating: 9.7,
    genres: ["Aventura", "Drama", "Shounen"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Alquimia e Militares", episodes: 64, year: 2009 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "11",
    title: "Hunter x Hunter",
    image: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=800&auto=format&fit=crop&q=80",
    description: "Gon Freecss descobre que seu pai desaparecido na verdade é um dos maiores caçadores (Hunters) licenciados do mundo, decidindo seguir seus mesmos passos perigosos.",
    season: "Concluído",
    votes: 360,
    trailerUrl: "https://www.youtube.com/embed/d6kBeJjO0Sg",
    episodesCount: 148,
    rating: 9.5,
    genres: ["Aventura", "Fantasia", "Superpoderes"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Exame Hunter Inicial", episodes: 26, year: 2011 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "12",
    title: "Tokyo Ghoul",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
    description: "Em um mundo onde criaturas sinistras devoradoras chamadas Ghouls coabitam escondidas com os humanos, o estudante Ken Kaneki sofre uma cirurgia de emergência e adquire órgãos Ghoul.",
    season: "Temporada de Outono",
    votes: 210,
    trailerUrl: "https://www.youtube.com/embed/7aM_e3CYAnQ",
    episodesCount: 12,
    rating: 8.0,
    genres: ["Ação", "Terror", "Sobrenatural"],
    seasonsCatalog: [{ seasonNumber: 1, title: "O Nascimento de Kaneki", episodes: 12, year: 2014 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "13",
    title: "Vinland Saga",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80",
    description: "Uma saga histórica impecável de vikings. Thorfinn cresce no campo de batalha jurando assassinar Askeladd, o capitão mercenário audaz que liquidou seu pai com uma cilada desonrosa.",
    season: "Arco da Escravidão",
    votes: 320,
    trailerUrl: "https://www.youtube.com/embed/f8OHSObA1H8",
    episodesCount: 48,
    rating: 9.4,
    genres: ["Histórico", "Viking", "Drama"],
    seasonsCatalog: [{ seasonNumber: 1, title: "Guerra de Conquista", episodes: 24, year: 2019 }],
    releaseCalendar: "Concluído"
  },
  {
    id: "14",
    title: "One Piece",
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80",
    description: "O indestrutível Monkey D. Luffy consome a fruta Akuma no Mi de elasticidade e parte com seu bando do Chapéu de Palha na maior aventura pirata de todos os tempos em busca do tesouro One Piece.",
    season: "Arco Egghead",
    votes: 780,
    trailerUrl: "https://www.youtube.com/embed/MCb13393_T8",
    episodesCount: 1100,
    rating: 9.3,
    genres: ["Aventura", "Piratas", "Comédia"],
    seasonsCatalog: [{ seasonNumber: 1, title: "East Blue Inicial", episodes: 61, year: 1999 }],
    releaseCalendar: "Domingos"
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

const INITIAL_MANGA_SUBMISSIONS: MangaSubmission[] = [
  { id: "m1", mangaName: "Holyland", submittedBy: "kamado_t@gmail.com", createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "m2", mangaName: "Holyland", submittedBy: "goku_legend@db.com", createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "m3", mangaName: "Holyland", submittedBy: "yuji_it@jujutsu.com", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "m4", mangaName: "Holyland", submittedBy: "boruto@ninja.com", createdAt: new Date(Date.now() - 10 * 3600000).toISOString() },
  { id: "m5", mangaName: "Holyland", submittedBy: "light_y@deathnote.com", createdAt: new Date(Date.now() - 11 * 3600000).toISOString() },
  { id: "m6", mangaName: "Kingdom", submittedBy: "ash_k@kanto.com", createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: "m7", mangaName: "Kingdom", submittedBy: "guts@berserk.com", createdAt: new Date(Date.now() - 7 * 3600000).toISOString() },
  { id: "m8", mangaName: "Kingdom", submittedBy: "ichigo@shinigami.com", createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: "m9", mangaName: "Kingdom", submittedBy: "luffy@pirates.com", createdAt: new Date(Date.now() - 9 * 3600000).toISOString() },
  { id: "m10", mangaName: "Monster", submittedBy: "edward_e@alchem.com", createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: "m11", mangaName: "Monster", submittedBy: "alphonse@alchem.com", createdAt: new Date(Date.now() - 13 * 3600000).toISOString() },
  { id: "m12", mangaName: "Monster", submittedBy: "gon@hunter.com", createdAt: new Date(Date.now() - 14 * 3600000).toISOString() },
  { id: "m13", mangaName: "20th Century Boys", submittedBy: "killua@hunter.com", createdAt: new Date(Date.now() - 15 * 3600000).toISOString() },
  { id: "m14", mangaName: "20th Century Boys", submittedBy: "kurapika@hunter.com", createdAt: new Date(Date.now() - 16 * 3600000).toISOString() },
  { id: "m15", mangaName: "Yotsuba&!", submittedBy: "leorio@hunter.com", createdAt: new Date(Date.now() - 17 * 3600000).toISOString() },
  { id: "m16", mangaName: "Yotsuba&!", submittedBy: "kaneki@ghoul.com", createdAt: new Date(Date.now() - 18 * 3600000).toISOString() },
  { id: "m17", mangaName: "Vagabond", submittedBy: "thorfinn@vinland.com", createdAt: new Date(Date.now() - 19 * 3600000).toISOString() },
  { id: "m18", mangaName: "Vagabond", submittedBy: "askeladd@vinland.com", createdAt: new Date(Date.now() - 20 * 3600000).toISOString() },
  { id: "m19", mangaName: "Homunculus", submittedBy: "naruto_u@konoha.com", createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "m20", mangaName: "Liar Game", submittedBy: "sasuke_u@konoha.com", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "m21", mangaName: "Pluto", submittedBy: "sakura_h@konoha.com", createdAt: new Date(Date.now() - 22 * 3600000).toISOString() },
  { id: "m22", mangaName: "Beck", submittedBy: "kakashi@konoha.com", createdAt: new Date(Date.now() - 23 * 3600000).toISOString() }
];

export interface CommunityTip {
  id: string;
  animeId: string;
  animeTitle: string;
  content: string;
  submittedBy: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
  role: "admin" | "vip" | "user";
  uid: string;
}

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
  userRoles?: { [userId: string]: "admin" | "vip" | "user" };
  mangaSubmissions?: MangaSubmission[];
  communityTips?: CommunityTip[];
  chatMessages?: ChatMessage[];
  bannedUsers?: string[];
}

// Database Helper
const loadDb = (): DatabaseSchema => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data) as DatabaseSchema;
      
      // Ensure codes, ratings, and userCodes tables exist
      if (!parsed.animes || parsed.animes.length < 14) {
        parsed.animes = INITIAL_ANIMES;
      }
      if (!parsed.codes || parsed.codes.length < 11 || !parsed.codes[0].hasOwnProperty('uses_count')) {
        parsed.codes = DEFAULT_CODES;
      }
      if (!parsed.ratings) {
        parsed.ratings = DEFAULT_RATINGS;
      }
      if (!parsed.userCodes) {
        parsed.userCodes = {};
      }
      if (!parsed.mangaSubmissions) {
        parsed.mangaSubmissions = INITIAL_MANGA_SUBMISSIONS;
      }
      if (!parsed.communityTips) {
        parsed.communityTips = [
          {
            id: "tip1",
            animeId: "a1",
            animeTitle: "Sousou no Frieren",
            content: "Para quem quer assistir Sousou no Frieren com excelente qualidade e dublagem impecável, recomendo assistir direto pela Crunchyroll BR. O mangá também está sendo lançado oficialmente em volumes físicos no Brasil!",
            submittedBy: "Mestre Dos Animes",
            createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
          },
          {
            id: "tip2",
            animeId: "a3",
            animeTitle: "Kimetsu no Yaiba: Hashira Geiko-hen",
            content: "Atenção galera! O novo arco de Demon Slayer está disponível completo na Netflix e Crunchyroll. Uma dica para quem quer poupar tempo: os episódios 1 e 8 têm duração extendida e reúnem as melhores qualidades do longa de cinema!",
            submittedBy: "Zenitsu_Puto",
            createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
          }
        ];
      }
      if (!parsed.chatMessages) {
        parsed.chatMessages = [
          {
            id: "chat1",
            userName: "Sasuke Vingador",
            content: "Fala clã! Curtiram o novo ranking de animes da temporada?",
            createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
            role: "vip",
            uid: "sasuser_mock"
          },
          {
            id: "chat2",
            userName: "Sakura_Chan",
            content: "Achei super justo o topo! Frieren é Absolute Cinema de verdade!",
            createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
            role: "user",
            uid: "sakurachan_mock"
          },
          {
            id: "chat3",
            userName: "Admin Bushidô 👑",
            content: "Bem-vindos ao chat oficial de debate! Respeitem as regras e divirtam-se indicando seus tesouros ocultos! 🎌",
            createdAt: new Date(Date.now() - 2 * 60500).toISOString(),
            role: "admin",
            uid: "admin_superuser"
          }
        ];
      }
      if (!parsed.bannedUsers) {
        parsed.bannedUsers = [];
      }
      saveDb(parsed); // Save migrated structure
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
    userCodes: {},
    mangaSubmissions: INITIAL_MANGA_SUBMISSIONS,
    communityTips: [
      {
        id: "tip1",
        animeId: "a1",
        animeTitle: "Sousou no Frieren",
        content: "Para quem quer assistir Sousou no Frieren com excelente qualidade e dublagem impecável, recomendo assistir direto pela Crunchyroll BR. O mangá também está sendo lançado oficialmente em volumes físicos no Brasil!",
        submittedBy: "Mestre Dos Animes",
        createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
      }
    ],
    chatMessages: [
      {
        id: "chat1",
        userName: "Sasuke Vingador",
        content: "Fala clã! Curtiram o novo ranking de animes da temporada?",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        role: "vip",
        uid: "sasuser_mock"
      },
      {
        id: "chat3",
        userName: "Admin Bushidô 👑",
        content: "Bem-vindos ao chat oficial de debate! Respeitem as regras e divirtam-se indicando seus tesouros ocultos! 🎌",
        createdAt: new Date(Date.now() - 2 * 60500).toISOString(),
        role: "admin",
        uid: "admin_superuser"
      }
    ],
    bannedUsers: []
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

// PROXY FETCH FROM JIKAN / ANILIST API FOR AUTO-FILL
app.get("/api/admin/fetch-anime-external", async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ error: "Título é obrigatório para busca externa." });
  }

  try {
    const query = String(title).trim();
    // 1. Try Jikan API (MyAnimeList wrapper)
    const jikanUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(jikanUrl);
    
    if (response.ok) {
      const result = await response.json();
      const item = result.data && result.data[0];
      if (item) {
        return res.json({
          title: item.title,
          image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
          description: item.synopsis || "Descrição automática não disponibilizada.",
          genres: (item.genres || []).map((g: any) => g.name) || ["Ação"],
          episodesCount: item.episodes || 12,
          rating: item.score ? Number(item.score.toFixed(1)) : 8.0,
          season: item.season ? `Temporada de ${item.season === 'winter' ? 'Inverno' : item.season === 'spring' ? 'Primavera' : item.season === 'summer' ? 'Verão' : 'Outono'}` : "Temporada Desconhecida"
        });
      }
    }

    // 2. Fallback to AniList GraphQL API
    const aniQuery = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          description
          genres
          episodes
          averageScore
        }
      }
    `;

    const aniResponse = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: aniQuery,
        variables: { search: query }
      })
    });

    if (aniResponse.ok) {
      const aniResult = await aniResponse.json();
      const media = aniResult.data?.Media;
      if (media) {
        return res.json({
          title: media.title.english || media.title.romaji,
          image: media.coverImage?.large || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
          description: media.description ? media.description.replace(/<[^>]*>/g, '') : "Descrição automática não disponibilizada.",
          genres: media.genres || ["Ação"],
          episodesCount: media.episodes || 12,
          rating: media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : 8.0,
          season: "Temporada Desconhecida"
        });
      }
    }

    return res.status(404).json({ error: "Nenhum anime localizado nas APIs Jikan/AniList." });
  } catch (err: any) {
    console.error("Erro na busca de Jikan/AniList:", err);
    res.status(500).json({ error: `Ocorreu um erro ao fazer a ponte Jikan/AniList: ${err.message}` });
  }
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

// COMMUNITY USER: Create/Add Anime in catalog directly
app.post("/api/user/animes", (req, res) => {
  const { title, image, description, genres } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "O título do anime é obrigatório para cadastrar no catálogo!" });
  }

  const dbData = loadDb();
  const upTitle = title.trim().toLowerCase();
  const duplicate = dbData.animes.some(a => a.title.toLowerCase() === upTitle);
  if (duplicate) {
    return res.status(400).json({ error: `O anime "${title.trim()}" já está cadastrado no catálogo do Bushidô!` });
  }

  const nextId = String(Date.now());
  const newAnime: Anime = {
    id: nextId,
    title: title.trim(),
    image: image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    description: description || "Este anime foi cadastrado por um honrado membro da comunidade Otaku Bushidô.",
    season: "Adicionado via Comunidade 🥋",
    votes: 1, // Start with 1 default vote of confidence
    trailerUrl: "https://www.youtube.com/embed/ApSgT_9f_N0",
    episodesCount: 12,
    rating: 8.5,
    genres: genres && genres.length > 0 ? genres : ["Ação"],
    releaseCalendar: "Lançamento Concluído",
    seasonsCatalog: [{ seasonNumber: 1, title: "Temporada de Estreia", episodes: 12, year: 2026 }]
  };

  // Add at the beginning of the list so they can see their newly added anime instantly!
  dbData.animes.unshift(newAnime);
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


// Helper to dynamically calculate code uses and official status
function getEnrichedCodes(dbData: DatabaseSchema): Code[] {
  const codes = dbData.codes || DEFAULT_CODES;
  
  // Calculate baseline counts and dynamic ones from ratings
  const counts: { [code: string]: number } = {};
  
  // Seed initial baseline values from DEFAULT_CODES
  DEFAULT_CODES.forEach(c => {
    counts[c.code.toUpperCase()] = c.uses_count || 0;
  });

  // Calculate active user ratings using this code
  const ratings = dbData.ratings || [];
  ratings.forEach(r => {
    (r.codes || []).forEach(tc => {
      const upper = tc.toUpperCase().trim();
      counts[upper] = (counts[upper] || 0) + 1;
    });
  });

  return codes.map(c => {
    const codeUpper = c.code.toUpperCase();
    const uses = counts[codeUpper] || 0;
    
    // Dynamic trigger: threshold >= 100 or Example Logic: >= 3
    const isOfficial = uses >= 100 || uses >= 3;

    return {
      ...c,
      uses_count: uses,
      official: isOfficial
    };
  });
}

// SYSTEM CODES ENDPOINTS
app.get("/api/codes", (req, res) => {
  const dbData = loadDb();
  const enriched = getEnrichedCodes(dbData);
  const approvedCodes = enriched.filter(c => c.approved);
  res.json(approvedCodes);
});

app.get("/api/admin/codes", (req, res) => {
  const dbData = loadDb();
  const enriched = getEnrichedCodes(dbData);
  res.json(enriched);
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
    approved: true // Approved instantly so anyone can use it!
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

// Community edits code meaning globally on the fly
app.put("/api/codes/:id", (req, res) => {
  const { id } = req.params;
  const { meaning } = req.body;

  if (!meaning || typeof meaning !== "string" || meaning.trim() === "") {
    return res.status(400).json({ error: "O significado da característica não pode ser vazio!" });
  }

  const dbData = loadDb();
  if (!dbData.codes) dbData.codes = [];

  const index = dbData.codes.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Código não encontrado no sistema" });
  }

  dbData.codes[index].meaning = meaning.trim();
  saveDb(dbData);
  res.json(dbData.codes[index]);
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

// PERSISTENT AUTH & BILLING ENDPOINTS BY USER REQUEST
app.post("/api/auth/login", (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "E-mail de login inválido." });
  }

  const dbData = loadDb();
  if (!dbData.userRoles) dbData.userRoles = {};

  const cleanEmail = email.trim().toLowerCase();
  
  // Guard admin account with password
  if (cleanEmail === "admin@bushido.com") {
    if (password !== "bushido100") {
      return res.status(401).json({ error: "Senha confidencial de Moderador Admin incorreta!" });
    }
  }

  // Derive a solid, safe userId from their Gmail to persist favorites & VIP status
  const uid = `u_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  let role: "user" | "vip" | "admin" = "user";
  if (cleanEmail === "admin@bushido.com") {
    role = "admin";
  } else if (dbData.userRoles[uid]) {
    role = dbData.userRoles[uid];
  } else {
    dbData.userRoles[uid] = "user";
    saveDb(dbData);
  }

  res.json({
    userId: uid, // For compatibility
    uid,
    email: cleanEmail,
    name: name || (cleanEmail === "admin@bushido.com" ? "Administrador Geral 👑" : "Otaku Bushidô"),
    role,
    isLoggedIn: true
  });
});

app.post("/api/auth/upgrade-vip", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "O identificador do usuário é obrigatório." });
  }

  const dbData = loadDb();
  if (!dbData.userRoles) dbData.userRoles = {};

  dbData.userRoles[userId] = "vip";
  saveDb(dbData);

  res.json({ success: true, role: "vip" });
});

// Mercado Pago checkout endpoint
app.post("/api/checkout", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "O identificador do usuário (userId) é necessário." });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(400).json({ 
        error: "O Token de Acesso do Mercado Pago (MERCADOPAGO_ACCESS_TOKEN) não foi configurado no servidor! Por favor, configure-o no painel de configurações para habilitar pagamentos de verdade." 
      });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const origin = req.headers.referer || req.headers.origin || "http://localhost:3000";
    const cleanOrigin = origin.split("?")[0];

    const result = await preference.create({
      body: {
        items: [
          {
            id: "vip-bushido",
            title: "VIP AnimeBushido",
            description: "Status de Membro VIP Premium no Anime Bushidô. Desbloqueia distintivo com destaque e contagem de votos!",
            quantity: 1,
            unit_price: 9.99,
            currency_id: "BRL"
          }
        ],
        back_urls: {
          success: `${cleanOrigin}?success=true&userId=${encodeURIComponent(userId)}`,
          failure: `${cleanOrigin}?cancel=true`,
          pending: `${cleanOrigin}?cancel=true`
        },
        auto_return: "approved",
        metadata: {
          userId: userId
        }
      }
    });

    res.json({
      url: result.init_point
    });
  } catch (error: any) {
    console.error("Erro ao criar preferência do Mercado Pago:", error);
    res.status(500).json({ error: error.message || "Erro interno de checkout." });
  }
});

// MANGA PIECE PERSISTENT CULT-FAVORITE FORUM ENDPOINTS (USER REQUEST)
app.get("/api/manga-piece", (req, res) => {
  const dbData = loadDb();
  if (!dbData.mangaSubmissions) {
    dbData.mangaSubmissions = [];
  }

  // Aggregate stats
  const frequencyMap: { [key: string]: number } = {};
  
  dbData.mangaSubmissions.forEach(sub => {
    if (!sub.mangaName) return;
    // Normalize to handle capitalization differences
    const normalized = sub.mangaName
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
      
    frequencyMap[normalized] = (frequencyMap[normalized] || 0) + 1;
  });

  // Sort and build rank items
  const sortedRanks = Object.keys(frequencyMap)
    .map(name => ({ mangaName: name, count: frequencyMap[name] }))
    .sort((a, b) => b.count - a.count);

  const top10 = sortedRanks.slice(0, 10);
  const top3 = sortedRanks.slice(0, 3);

  res.json({
    submissions: dbData.mangaSubmissions,
    top10,
    top3
  });
});

app.post("/api/manga-piece", (req, res) => {
  const { mangaName, submittedBy } = req.body;
  if (!mangaName || typeof mangaName !== "string" || mangaName.trim() === "") {
    return res.status(400).json({ error: "O nome do mangá é obrigatório para envio." });
  }

  const dbData = loadDb();
  if (!dbData.mangaSubmissions) {
    dbData.mangaSubmissions = [];
  }

  // Format cleanly
  const formattedName = mangaName
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const newSubmission = {
    id: `ms_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    mangaName: formattedName,
    submittedBy: submittedBy || "Otaku Anônimo",
    createdAt: new Date().toISOString()
  };

  dbData.mangaSubmissions.unshift(newSubmission);
  saveDb(dbData);

  // Recalculate frequency
  const frequencyMap: { [key: string]: number } = {};
  dbData.mangaSubmissions.forEach(sub => {
    if (!sub.mangaName) return;
    const normalized = sub.mangaName
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    frequencyMap[normalized] = (frequencyMap[normalized] || 0) + 1;
  });

  const sortedRanks = Object.keys(frequencyMap)
    .map(name => ({ mangaName: name, count: frequencyMap[name] }))
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    item: newSubmission,
    top10: sortedRanks.slice(0, 10),
    top3: sortedRanks.slice(0, 3),
    submissions: dbData.mangaSubmissions
  });
});

// ADMIN: Modify Manga Piece Suggestion
app.put("/api/admin/manga-piece/:id", (req, res) => {
  const { id } = req.params;
  const { mangaName, submittedBy } = req.body;

  if (!mangaName || typeof mangaName !== "string" || mangaName.trim() === "") {
    return res.status(400).json({ error: "O nome do mangá é obrigatório para modificação." });
  }

  const dbData = loadDb();
  if (!dbData.mangaSubmissions) dbData.mangaSubmissions = [];

  const index = dbData.mangaSubmissions.findIndex(sub => sub.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Sugestão de mangá não localizada." });
  }

  const formattedName = mangaName
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  dbData.mangaSubmissions[index].mangaName = formattedName;
  if (submittedBy !== undefined) {
    dbData.mangaSubmissions[index].submittedBy = typeof submittedBy === "string" && submittedBy.trim() !== "" ? submittedBy.trim() : "Otaku Anônimo";
  }

  saveDb(dbData);

  // Recalculate frequency
  const frequencyMap: { [key: string]: number } = {};
  dbData.mangaSubmissions.forEach(sub => {
    if (!sub.mangaName) return;
    const normalized = sub.mangaName
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    frequencyMap[normalized] = (frequencyMap[normalized] || 0) + 1;
  });

  const sortedRanks = Object.keys(frequencyMap)
    .map(name => ({ mangaName: name, count: frequencyMap[name] }))
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    submissions: dbData.mangaSubmissions,
    top10: sortedRanks.slice(0, 10),
    top3: sortedRanks.slice(0, 3)
  });
});

// ADMIN: Delete Manga Piece Suggestion
app.delete("/api/admin/manga-piece/:id", (req, res) => {
  const { id } = req.params;

  const dbData = loadDb();
  if (!dbData.mangaSubmissions) dbData.mangaSubmissions = [];

  const exist = dbData.mangaSubmissions.some(sub => sub.id === id);
  if (!exist) {
    return res.status(404).json({ error: "Sugestão de mangá não localizada para exclusão." });
  }

  dbData.mangaSubmissions = dbData.mangaSubmissions.filter(sub => sub.id !== id);
  saveDb(dbData);

  // Recalculate frequency
  const frequencyMap: { [key: string]: number } = {};
  dbData.mangaSubmissions.forEach(sub => {
    if (!sub.mangaName) return;
    const normalized = sub.mangaName
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    frequencyMap[normalized] = (frequencyMap[normalized] || 0) + 1;
  });

  const sortedRanks = Object.keys(frequencyMap)
    .map(name => ({ mangaName: name, count: frequencyMap[name] }))
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    submissions: dbData.mangaSubmissions,
    top10: sortedRanks.slice(0, 10),
    top3: sortedRanks.slice(0, 3)
  });
});

// --- COMMUNITY TIPS (RECOMENDAÇÕES E DICAS) API ---

app.get("/api/tips", (req, res) => {
  const dbData = loadDb();
  if (!dbData.communityTips) dbData.communityTips = [];
  res.json(dbData.communityTips);
});

app.post("/api/tips", (req, res) => {
  const { animeId, animeTitle, content, submittedBy } = req.body;
  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "O conteúdo da dica/recomendação não pode ser vazio." });
  }

  const dbData = loadDb();
  if (!dbData.communityTips) dbData.communityTips = [];

  const newTip = {
    id: "tip_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    animeId: animeId || "geral",
    animeTitle: animeTitle || "Geral",
    content: content.trim(),
    submittedBy: submittedBy || "Anônimo",
    createdAt: new Date().toISOString()
  };

  dbData.communityTips.unshift(newTip);
  saveDb(dbData);

  res.json({ success: true, tip: newTip, tips: dbData.communityTips });
});

app.delete("/api/admin/tips/:id", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  if (!dbData.communityTips) dbData.communityTips = [];

  dbData.communityTips = dbData.communityTips.filter(t => t.id !== id);
  saveDb(dbData);

  res.json({ success: true, tips: dbData.communityTips });
});


// --- COMMUNITY CHAT API ---

app.get("/api/chat", (req, res) => {
  const dbData = loadDb();
  if (!dbData.chatMessages) dbData.chatMessages = [];
  res.json({
    messages: dbData.chatMessages,
    bannedUsers: dbData.bannedUsers || []
  });
});

app.post("/api/chat", (req, res) => {
  const { userName, content, role, uid } = req.body;
  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "A mensagem não pode estar vazia." });
  }

  const dbData = loadDb();
  if (!dbData.chatMessages) dbData.chatMessages = [];
  if (!dbData.bannedUsers) dbData.bannedUsers = [];

  const userUid = uid || "anon";

  // Check if UID is banned
  if (dbData.bannedUsers.includes(userUid)) {
    return res.status(403).json({ error: "Seu usuário foi banido permanentemente pelo Administrador do Bushidô." });
  }

  const newMessage = {
    id: "chat_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    userName: userName || "Otaku Anônimo",
    content: content.trim(),
    role: role || "user",
    uid: userUid,
    createdAt: new Date().toISOString()
  };

  dbData.chatMessages.push(newMessage);

  // keep last 100 messages
  if (dbData.chatMessages.length > 100) {
    dbData.chatMessages = dbData.chatMessages.slice(-100);
  }

  saveDb(dbData);

  res.json({ success: true, message: newMessage, messages: dbData.chatMessages });
});

app.delete("/api/admin/chat/:id", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  if (!dbData.chatMessages) dbData.chatMessages = [];

  dbData.chatMessages = dbData.chatMessages.filter(m => m.id !== id);
  saveDb(dbData);

  res.json({ success: true, messages: dbData.chatMessages });
});

app.post("/api/admin/chat/ban", (req, res) => {
  const { uid } = req.body;
  if (!uid || uid === "admin_superuser") {
    return res.status(400).json({ error: "Identificador de usuário inválido para banimento." });
  }

  const dbData = loadDb();
  if (!dbData.bannedUsers) dbData.bannedUsers = [];

  if (!dbData.bannedUsers.includes(uid)) {
    dbData.bannedUsers.push(uid);
    // Remove messages of the banned user for premium cleaning
    dbData.chatMessages = (dbData.chatMessages || []).filter(m => m.uid !== uid);
    saveDb(dbData);
  }

  res.json({ success: true, bannedUsers: dbData.bannedUsers, messages: dbData.chatMessages });
});

app.post("/api/admin/chat/unban", (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "Identificador de usuário inválido." });
  }

  const dbData = loadDb();
  if (!dbData.bannedUsers) dbData.bannedUsers = [];

  dbData.bannedUsers = dbData.bannedUsers.filter(item => item !== uid);
  saveDb(dbData);

  res.json({ success: true, bannedUsers: dbData.bannedUsers });
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
