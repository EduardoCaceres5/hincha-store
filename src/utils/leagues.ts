import type { KitType, League, ProductQuality } from "@/types/product";

interface LeagueConfig {
  name: string;
  badge: string;
}

export const LEAGUE_CONFIG: Record<League, LeagueConfig> = {
  PREMIER_LEAGUE: {
    name: "Premier League",
    badge: "/parches/inglaterra.png",
  },
  LA_LIGA: {
    name: "La Liga",
    badge: "/parches/espana.png",
  },
  LIGUE_1: {
    name: "Ligue 1",
    badge: "/parches/francia.png",
  },
  SERIE_A: {
    name: "Serie A",
    badge: "/parches/italia.png",
  },
  BUNDESLIGA: {
    name: "Bundesliga",
    badge: "/parches/alemania.png",
  },
  LIGA_PROFESIONAL: {
    name: "Liga Profesional",
    badge: "/parches/argentina.png",
  },
  INTERNACIONAL: {
    name: "Internacional",
    badge: "/parches/fifa.png",
  },
  LIGA_SAUDI: {
    name: "Liga Saudi",
    badge: "/parches/arabia.png",
  },
};

export const KIT_TRANSLATIONS: Record<KitType, string> = {
  HOME: "Titular",
  AWAY: "Alternativa",
  THIRD: "Tercera",
  RETRO: "Retro",
};

export const QUALITY_TRANSLATIONS: Record<ProductQuality, string> = {
  FAN: "Fan",
  PLAYER_VERSION: "Jugador",
};

export const translateLeague = (league: League): string => {
  return LEAGUE_CONFIG[league]?.name || league;
};

export const getLeagueBadge = (league: League): string | undefined => {
  return LEAGUE_CONFIG[league]?.badge;
};

export const translateKit = (kit: KitType): string => {
  return KIT_TRANSLATIONS[kit] || kit;
};

export const translateQuality = (quality: ProductQuality): string => {
  return QUALITY_TRANSLATIONS[quality] || quality;
};
