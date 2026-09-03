/* ---------- identidade da parceria ----------
   As duas cores de marca mandam nas telas da máquina de prêmios:
   #ff883f do GymClub e #085ba7 do Hospitalar. O resto da escala é só
   clarear e escurecer essas duas — nada de azul-marinho neutro, que é o
   que apagava o conjunto. Os tons ficam saturados de propósito: o totem
   precisa chamar atenção de longe. */
export const LARANJA = "#ff883f";
export const LARANJA_VIVO = "#ffa564";
export const LARANJA_CLARO = "#ffd0a8";
export const LARANJA_ESCURO = "#c25610";
export const AZUL = "#085ba7";
export const AZUL_VIVO = "#1180da";
export const AZUL_CEU = "#3ba3ee";
export const AZUL_CLARO = "#9fd0ff";
export const AZUL_PROFUNDO = "#064a87";
export const AZUL_FUNDO = "#043a6b";
export const AZUL_CAIXA = "#032c52";

/* Néon laranja: as molduras usam a mesma receita, muda só a força. */
export const neon = (i = 1) =>
    `0 0 ${12 * i}px rgba(255,136,63,${0.6 * i}), 0 0 ${40 * i}px rgba(255,136,63,${0.28 * i})`;

/* ---------- medida mestra ----------
   Tudo — inclusive as fontes e os logos — se mede pela largura do
   gabinete da máquina, então as telas escalam juntas e o logo sai do
   mesmo tamanho em todas: do monitor do totem ao navegador do dev. */
export const W = "min(88vw, 42vh, 760px)";

export const med = (f: number, min = 0) => {
    const calc = `calc(${W} * ${f})`;
    return min ? `max(${min}px, ${calc})` : calc;
};

/* Fundo comum das telas do jogo: azul de marca com dois halos laranja
   nas diagonais, para as duas marcas aparecerem já no fundo. */
export const FUNDO_TOTEM =
    `radial-gradient(60% 40% at 18% 12%, rgba(255,136,63,.22) 0%, transparent 70%),` +
    `radial-gradient(55% 38% at 84% 88%, rgba(255,136,63,.18) 0%, transparent 72%),` +
    `radial-gradient(125% 78% at 50% 0%, ${AZUL_CEU} 0%, ${AZUL_VIVO} 26%, ${AZUL} 55%, ${AZUL_PROFUNDO} 82%, ${AZUL_FUNDO} 100%)`;
