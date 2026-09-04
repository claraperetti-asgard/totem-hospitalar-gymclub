export type GameSettings = {
    /** quantos giros cada pessoa tem */
    maxAttempts: number;
    /** chance de ganhar, de 0 a 1 */
    winChance: number;
};

export const DEFAULT_SETTINGS: GameSettings = {
    maxAttempts: 1,
    /* Chance de a garra subir com a bolinha. Vale de 0 a 1 — 0.5 é meio a
       meio. Este é só o padrão de fábrica: o painel admin grava outro
       valor no localStorage e ele passa a mandar, sem mexer no código.
       Trocar aqui só muda máquinas que nunca tiveram o painel usado. */
    winChance: 0.5,
};

const STORAGE_KEY = "slot_game_settings";

export const ADMIN_USER = "hospitalar";
export const ADMIN_PASSWORD = "hospitalar2026";

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export function loadGameSettings(): GameSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(raw) as Partial<GameSettings>;

        return {
            maxAttempts: Number.isFinite(parsed.maxAttempts)
                ? clamp(Math.round(parsed.maxAttempts as number), 1, 10)
                : DEFAULT_SETTINGS.maxAttempts,
            winChance: Number.isFinite(parsed.winChance)
                ? clamp(parsed.winChance as number, 0, 1)
                : DEFAULT_SETTINGS.winChance,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveGameSettings(settings: GameSettings): GameSettings {
    const safe: GameSettings = {
        maxAttempts: clamp(Math.round(settings.maxAttempts), 1, 10),
        winChance: clamp(settings.winChance, 0, 1),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));

    return safe;
}
