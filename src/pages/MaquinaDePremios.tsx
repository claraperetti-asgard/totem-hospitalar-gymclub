import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import BolinhaPremio from "../components/BolinhaPremio";
import { loadGameSettings, type GameSettings } from "../config/gameSettings";
import {
    AZUL,
    AZUL_CAIXA,
    AZUL_CLARO,
    AZUL_CEU,
    AZUL_FUNDO,
    AZUL_PROFUNDO,
    AZUL_VIVO,
    LARANJA,
    LARANJA_CLARO,
    LARANJA_ESCURO,
    LARANJA_VIVO,
    med,
    neon,
} from "../config/tema";

 
const CABO_TOPO = 22;          
const LARGURA_GARRA = 34;        
const TAM_BOLA = 13;            
const PASSO = 2.5;           
const VELOCIDADE = 0.5;        
const PASSO_PROF = 0.32;       
const VELOCIDADE_PROF = 0.045;  
const ASPECTO = 1.08;           
 
const PAREDE_X = 8;
const PAREDE_Y = 6;

/* ---------- tempos da jogada (ms) ---------- */
const T_DESCIDA = 1200;
const T_FECHA = 500;
const T_SUBIDA = 1300;
const T_RESULTADO = 900;


type Fase = "idle" | "descendo" | "fechando" | "subindo" | "resultado";
 
type Posicao = {
    id: number;
    plano: number;   
    x: number;      
};

type Bola = Posicao & {
    rot: number;
    arte: string;
};
 
const ARTES = [
    "/card1.png",    
    "/card2.png",   
];
 
const BOLAS_POR_PLANO = 11;

 
const faixa = (a: number, b: number) =>
    Array.from({ length: BOLAS_POR_PLANO }, (_, i) =>
        +(a + ((b - a) * i) / (BOLAS_POR_PLANO - 1)).toFixed(2)
    );

 
const PLANOS = [
    { escala: 1, xs: faixa(6, 88) },
    { escala: 0.89, xs: faixa(9.5, 84.5) },
    { escala: 0.79, xs: faixa(13, 81) },
    { escala: 0.7, xs: faixa(16.5, 77.5) },
];

const FUNDO_DA_CAIXA = PLANOS.length - 1;
 
const alturaGarra = (s: number, asp: number) => (LARGURA_GARRA * s * (110 / 140)) / asp;
const alturaBola = (s: number, asp: number) => (TAM_BOLA * s) / asp;
 
const pisoFundo = (asp: number) => 1.83 * alturaBola(1, asp);
const yDoPlano = (p: number, asp: number) => p * 0.58 * alturaBola(1, asp);

 
const topoDoPlano = (p: number) => (p / FUNDO_DA_CAIXA) * PAREDE_Y;

 
const caboDoPlano = (p: number, asp: number) => {
    const { escala } = PLANOS[p];
    const centroDaBola = 100 - (yDoPlano(p, asp) + alturaBola(escala, asp) / 2);

    return centroDaBola - topoDoPlano(p) - 0.582 * alturaGarra(escala, asp);
};
 
const interpola = (p: number, pega: (i: number) => number) => {
    const a = Math.floor(p);
    const b = Math.min(a + 1, FUNDO_DA_CAIXA);
    return pega(a) + (pega(b) - pega(a)) * (p - a);
};

const escalaEm = (p: number) => interpola(p, (i) => PLANOS[i].escala);
 
const limitesEm = (p: number) => ({
    min: interpola(p, (i) => PLANOS[i].xs[0]),
    max: interpola(p, (i) => PLANOS[i].xs[PLANOS[i].xs.length - 1]),
});
 
const PESO_PROFUNDIDADE = 14;

const POSICOES: Posicao[] = PLANOS.flatMap(({ xs }, plano) =>
    xs.map((x, i) => ({ id: plano * 100 + i + 1, plano, x }))
);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const embaralha = <T,>(lista: T[]): T[] => {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
};

 
function montaPilha(): Bola[] {
    const baralho: string[] = [];

    while (baralho.length < POSICOES.length) {
        baralho.push(...embaralha(ARTES));
    }

    return POSICOES.map((p, i) => ({
        ...p,
 
        x: +(p.x + (Math.random() * 2 - 1) * 2.2).toFixed(2),
         rot: Math.round((Math.random() * 2 - 1) * 7),
        arte: baralho[i],
    }));
}

/* ---------- peças visuais ---------- */

function Bulbo({ delay }: { delay: number }) {
    return (
        <span
            className="block rounded-full"
            style={{
                width: med(0.012, 4),
                height: med(0.012, 4),
                
                background: "#ffffff",
                boxShadow: `0 0 8px 3px rgba(255,255,255,.9), 0 0 0 2px ${LARANJA_ESCURO}`,
                animation: `claw-bulb 1.6s ease-in-out ${delay}ms infinite`,
            }}
        />
    );
}
 
const Bolinha = ({ bola }: { bola: Bola }) => (
    <BolinhaPremio arte={bola.arte} rot={bola.rot} />
);

 
const DEDO = "M 0 0 C 13 8, 20 26, 0 48";
const PIVO_DEDO = 16;          // afastamento do eixo, em unidades do viewBox
const GROSSURA_DEDO = 14;
const SUAVE = "transform .45s cubic-bezier(.34,1.15,.5,1)";
 
const ANGULO = (fechada: boolean) => (fechada ? -8 : -30);

const VIEWBOX_GARRA = "-70 -30 140 110";

function DedoGarra({ abre, espelho = false }: { abre: number; espelho?: boolean }) {
    return (
        <g
            transform={`translate(${espelho ? -PIVO_DEDO : PIVO_DEDO} 9)${espelho ? " scale(-1 1)" : ""} rotate(${abre})`}
            style={{ transition: SUAVE }}
        >
            <path d={DEDO} stroke="url(#cromo)" strokeWidth={GROSSURA_DEDO} strokeLinecap="round" fill="none" />
             <path
                d={DEDO}
                stroke="rgba(255,255,255,.5)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                transform="translate(-2.5 -1)"
            />
        </g>
    );
}

 
function GarraFundo({ fechada }: { fechada: boolean }) {
 
    const dedo = "M 0 0 C 5 12, 8 28, 2 46";

    return (
        <svg viewBox={VIEWBOX_GARRA} className="absolute inset-0 h-full w-full">
            <defs>
                <linearGradient id="cromo-sombra" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9aacbd" />
                    <stop offset="45%" stopColor="#6b7c8d" />
                    <stop offset="100%" stopColor="#3c4a58" />
                </linearGradient>
            </defs>

            <g transform={`translate(0 7) rotate(${ANGULO(fechada) * 0.3})`} style={{ transition: SUAVE }}>
                <path d={dedo} stroke="url(#cromo-sombra)" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path
                    d={dedo}
                    stroke="rgba(255,255,255,.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    transform="translate(-2 -1)"
                />
            </g>
        </svg>
    );
}

function Garra({ fechada }: { fechada: boolean }) {
    const abre = ANGULO(fechada);

    return (
        <svg
            viewBox={VIEWBOX_GARRA}
            className="absolute inset-0 h-full w-full overflow-visible"
            style={{ filter: "drop-shadow(0 5px 12px rgba(0,0,0,.7))" }}
        >
            <defs>
                <linearGradient id="cromo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#dbe5ee" />
                    <stop offset="68%" stopColor="#94a7b9" />
                    <stop offset="100%" stopColor="#5b6d80" />
                </linearGradient>
                <linearGradient id="cromo-fundo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8497a9" />
                    <stop offset="100%" stopColor="#465666" />
                </linearGradient>
                <linearGradient id="colar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LARANJA_CLARO} />
                    <stop offset="45%" stopColor={LARANJA} />
                    <stop offset="100%" stopColor={LARANJA_ESCURO} />
                </linearGradient>
            </defs>

            {/* haste que desce do cabo */}
            <rect x="-4" y="-30" width="8" height="18" rx="2" fill="url(#cromo)" />
            <rect x="-10" y="-14" width="20" height="7" rx="3" fill="url(#colar)" />

            {/* corpo onde os dedos giram */}
            <rect x="-16" y="-8" width="32" height="19" rx="8" fill="url(#cromo)" />
            <rect x="-16" y="0" width="32" height="6" rx="3" fill="url(#colar)" opacity=".9" />

            <DedoGarra abre={abre} />
            <DedoGarra abre={abre} espelho />
        </svg>
    );
}

/* Holofote no teto da caixa: a lâmpada e o cone de luz que ela joga. */
function Holofote({ x }: { x: number }) {
    return (
        <div
            className="pointer-events-none absolute"
            style={{ left: `${x}%`, top: `${PAREDE_Y}%`, transform: "translateX(-50%)" }}
        >
            <div
                className="absolute left-1/2 top-0 -translate-x-1/2"
                style={{
                    width: med(0.15),
                    height: med(0.34),
                    clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
                    background:
                        "linear-gradient(180deg, rgba(159,208,255,.16) 0%, rgba(159,208,255,.05) 50%, transparent 100%)",
                    filter: "blur(3px)",
                }}
            />

            <div
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{ width: med(0.028), height: med(0.017), boxShadow: "0 0 14px 5px rgba(159,208,255,.7)" }}
            />
        </div>
    );
}

const ICONE_SETA = {
    esq: ChevronLeft,
    dir: ChevronRight,
    fundo: ChevronUp,
    frente: ChevronDown,
} as const;

const ROTULO_SETA = {
    esq: "Mover a garra para a esquerda",
    dir: "Mover a garra para a direita",
    fundo: "Mover a garra para o fundo",
    frente: "Mover a garra para a frente",
} as const;

function BotaoSeta({
    lado,
    disabled,
    onDown,
    onUp,
    largura = "44%",
}: {
    lado: keyof typeof ICONE_SETA;
    disabled: boolean;
    onDown: () => void;
    onUp: () => void;
    largura?: string;
}) {
    const Icone = ICONE_SETA[lado];

    return (
        <button
            type="button"
            disabled={disabled}
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            onPointerCancel={onUp}
            className="grid aspect-square place-items-center transition-transform duration-150 active:scale-95 disabled:opacity-35"
            style={{
                width: largura,
                borderRadius: med(0.04),
                // botão branco de vidro: contrasta com o painel azul e deixa
                // a seta laranja bem legível de longe
                background: "linear-gradient(180deg, #ffffff 0%, #dbeaf7 100%)",
                border: `3px solid ${LARANJA}`,
                boxShadow: `${neon(0.6)}, 0 6px 0 rgba(0,0,0,.28), inset 0 -4px 8px rgba(8,91,167,.18)`,
                color: LARANJA,
            }}
            aria-label={ROTULO_SETA[lado]}
        >
            <Icone className="h-[50%] w-[50%]" strokeWidth={3} />
        </button>
    );
}

/* ---------- página ---------- */

export default function MaquinaDePremios() {
    // tentativas e chance de vitória vêm do painel admin (tela do formulário)
    const [settings] = useState<GameSettings>(() => loadGameSettings());
    const MAX_ATTEMPTS = settings.maxAttempts;
    const WIN_CHANCE = settings.winChance;

    // começa parada, aberta e no alto, centrada numa bolinha da fileira de cima
    const [x, setX] = useState(47.25);
    const [cabo, setCabo] = useState(CABO_TOPO);
    const [fechada, setFechada] = useState(false);
    const [fase, setFase] = useState<Fase>("idle");
    const [presa, setPresa] = useState<number | null>(null);
    const [tremendo, setTremendo] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [message, setMessage] = useState("Mova a garra e solte no prêmio");

    // profundidade contínua da garra (0 = frente, 3 = fundo)
    const [prof, setProf] = useState(1);
    // bolinhas que a garra esbarrou ao descer, para o solavanco
    const [sacudidas, setSacudidas] = useState<Record<number, [number, number]>>({});
 
    const vidroRef = useRef<HTMLDivElement>(null);
    const [aspecto, setAspecto] = useState(ASPECTO);

    useEffect(() => {
        const el = vidroRef.current;
        if (!el) return;

        const observador = new ResizeObserver(() => {
            const { width, height } = el.getBoundingClientRect();
            if (width > 0 && height > 0) setAspecto(height / width);
        });

        observador.observe(el);
        return () => observador.disconnect();
    }, []);

    // sorteada uma vez por montagem: a pilha abre diferente a cada partida
    const [bolas] = useState<Bola[]>(montaPilha);

    const navigate = useNavigate();
    const dirRef = useRef(0);
    const dirProfRef = useRef(0);
    const rafRef = useRef(0);
    const timersRef = useRef<number[]>([]);

    const jogando = fase !== "idle";
    const acabou = attempts >= MAX_ATTEMPTS;
    const travado = jogando || acabou;
 
    const limites = limitesEm(prof);
    const xGarra = clamp(x, limites.min, limites.max);

 
    const custo = (b: Bola) =>
        Math.abs(b.x - xGarra) + Math.abs(b.plano - prof) * PESO_PROFUNDIDADE;

    const bolaAlvo = bolas.reduce((perto, b) => (custo(b) < custo(perto) ? b : perto));
    const bolaPresa = presa !== null ? bolas.find((b) => b.id === presa) ?? null : null;

    // as vizinhas do alvo são as que levam o empurrão
    const alcancaveis = bolas.filter((b) => b.plano === bolaAlvo.plano);

    // plano inteiro só para ordem de desenho; o resto usa a profundidade contínua
    const plano = Math.round(prof);
    const escala = escalaEm(prof);

    const agenda = useCallback((fn: () => void, ms: number) => {
        timersRef.current.push(window.setTimeout(fn, ms));
    }, []);
 
    const paraMover = useCallback(() => {
        dirRef.current = 0;
        dirProfRef.current = 0;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
    }, []);

    const ligaLoop = useCallback(() => {
        if (rafRef.current) return;

        const largo = limitesEm(0);

        const loop = () => {
            if (dirRef.current) {
                setX((v) => clamp(v + dirRef.current * VELOCIDADE, largo.min, largo.max));
            }
            if (dirProfRef.current) {
                setProf((v) => clamp(v + dirProfRef.current * VELOCIDADE_PROF, 0, FUNDO_DA_CAIXA));
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
    }, []);

    const mover = useCallback(
        (dir: number) => {
            if (travado) return;

            const largo = limitesEm(0);
            setX((v) => clamp(v + dir * PASSO, largo.min, largo.max));

            dirRef.current = dir;
            ligaLoop();
        },
        [travado, ligaLoop]
    );

    const moverProfundidade = useCallback(
        (dir: number) => {
            if (travado) return;

            setProf((v) => clamp(v + dir * PASSO_PROF, 0, FUNDO_DA_CAIXA));

            dirProfRef.current = dir;
            ligaLoop();
        },
        [travado, ligaLoop]
    );


    /* ----- a jogada: desce, fecha na bolinha, sobe ----- */
    const soltarGarra = () => {
        if (travado) return;

        paraMover();

        const ganhou = Math.random() < WIN_CHANCE;
        const alvo = bolaAlvo.id;
 
        const arteAlvo = bolaAlvo.arte;

        setFase("descendo");
        setMessage("Descendo a garra...");
        setProf(bolaAlvo.plano);
        setCabo(caboDoPlano(bolaAlvo.plano, aspecto));
 
        const empurra = (intensidade: number, incluiAlvo: boolean) => {
            const empurrao: Record<number, [number, number]> = {};

            alcancaveis.forEach((b) => {
                if (b.id === alvo && !incluiAlvo) return;

                const dist = Math.abs(b.x - bolaAlvo.x);
                if (dist > 30) return;

                const forca = (1 - dist / 30) * intensidade;
                // a bolinha do alvo não tem lado definido; sorteia um
                const lado = b.id === alvo ? (Math.random() < 0.5 ? -1 : 1) : b.x < bolaAlvo.x ? -1 : 1;

                empurrao[b.id] = [
                    Math.round(lado * forca * (0.6 + Math.random() * 0.6)),
                    Math.round(-forca * (0.2 + Math.random() * 0.5)),
                ];
            });

            setSacudidas(empurrao);
        };

  
        agenda(() => empurra(3.5, false), T_DESCIDA - 520);

        const tSobe = T_DESCIDA + T_FECHA;

        if (ganhou) {
            agenda(() => empurra(9, false), T_DESCIDA - 60);
            agenda(() => setSacudidas({}), T_DESCIDA + 700);

            // fecha em cima da bolinha, que passa a andar junto com a garra
            agenda(() => {
                setFase("fechando");
                setFechada(true);
                setPresa(alvo);
                setMessage("Pegando...");
            }, T_DESCIDA);

            agenda(() => {
                setFase("subindo");
                setCabo(CABO_TOPO);
                setMessage("Subindo com o prêmio!");
            }, tSobe);
        } else {
 
            agenda(() => empurra(16, true), T_DESCIDA - 40);

            agenda(() => {
                setFase("fechando");
                setFechada(true);
                setTremendo(true);
                setMessage("Fechando...");
            }, T_DESCIDA);

            agenda(() => setTremendo(false), T_DESCIDA + 320);
            agenda(() => setSacudidas({}), T_DESCIDA + 900);

            agenda(() => {
                setFase("subindo");
                setCabo(CABO_TOPO);
                setMessage("A garra fechou no vazio!");
            }, tSobe);
        }

        const encerra = (venceu: boolean) => {
            const novasTentativas = attempts + 1;

            setAttempts(novasTentativas);
            setFase("idle");
            setFechada(false);

            if (venceu) {
                setMessage("Prêmio na mão. Parabéns!");
                agenda(() => navigate("/final", { state: { status: "win", arte: arteAlvo } }), 800);
                return;
            }

            if (novasTentativas >= MAX_ATTEMPTS) {
                setMessage("Foi por pouco!");
                agenda(() => navigate("/final", { state: { status: "lost" } }), 800);
                return;
            }

            setMessage(`Tentativa ${novasTentativas}/${MAX_ATTEMPTS} — tente de novo!`);
        };

        const tTopo = tSobe + T_SUBIDA;

        agenda(() => setFase("resultado"), tTopo);
        agenda(() => encerra(ganhou), tTopo + T_RESULTADO);
    };

    /* ----- teclado, para testar no desktop ----- */
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if (e.key === "ArrowLeft") mover(-1);
            if (e.key === "ArrowRight") mover(1);
            if (e.key === "ArrowUp") moverProfundidade(1);
            if (e.key === "ArrowDown") moverProfundidade(-1);
            if (e.key === " ") soltarGarra();
        };

        const up = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") paraMover();
        };

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);

        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    });

    useEffect(() => {
        const timers = timersRef.current;

        return () => {
            timers.forEach(clearTimeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

     const parede = (recorte: string, fundo: string) => (
        <div className="pointer-events-none absolute inset-0" style={{ clipPath: recorte, background: fundo }} />
    );

    return (
        
        <div
            className="totem-fixo relative flex h-screen w-full select-none flex-col overflow-hidden"
            style={{
                background: `linear-gradient(165deg, ${AZUL_CEU} 0%, ${AZUL_VIVO} 30%, ${AZUL} 68%, ${AZUL_PROFUNDO} 100%)`,
                padding: med(0.03),
                gap: med(0.022),
            }}
        >


            <div className="flex min-h-0 flex-1 flex-col" style={{ gap: med(0.022) }}>
                    {/* ----- letreiro ----- */}
                    <div
                        className="relative text-center"
                        style={{
                            borderRadius: med(0.045),
                            padding: `${med(0.03)} ${med(0.028)}`,
                            background: `linear-gradient(180deg, ${LARANJA_VIVO} 0%, ${LARANJA} 55%, ${LARANJA_ESCURO} 100%)`,
                            border: `3px solid rgba(255,255,255,.92)`,
                            boxShadow: `${neon(0.9)}, inset 0 3px 0 rgba(255,255,255,.5), inset 0 -8px 18px rgba(0,0,0,.28)`,
                        }}
                    >
                     
                        <NavLink
                            to="/"
                            className="absolute left-[2%] top-1/2 grid -translate-y-1/2 place-items-center rounded-2xl border border-white/40 bg-black/20 backdrop-blur"
                            style={{ width: med(0.05, 34), height: med(0.05, 34) }}
                            aria-label="Voltar"
                        >
                            <ArrowLeft color="#ffffff" size={22} />
                        </NavLink>

                        

                        <h1
                            className="font-black tracking-tight text-white"
                            style={{
                                fontSize: med(0.066, 19),
                                textShadow: `0 3px 0 ${LARANJA_ESCURO}, 0 5px 14px rgba(0,0,0,.35)`,
                            }}
                        >
                            MÁQUINA DE PRÊMIOS
                        </h1>
                         <h1
                            className="font-black tracking-tight text-white"
                            style={{
                                fontSize: med(0.046, 19),
                                textShadow: `0 3px 0 ${LARANJA_ESCURO}, 0 5px 14px rgba(0,0,0,.35)`,
                            }}
                        >
                            HOSPITALAR X GYMCLUB
                        </h1>


                        {/* fileira de lâmpadas */}
                        <div className="mt-[3.5%] flex justify-center" style={{ gap: med(0.022) }}>
                            {Array.from({ length: 7 }, (_, i) => (
                                <Bulbo key={i} delay={i * 130} />
                            ))}
                        </div>
                    </div>

                    {/* ----- vidro: estica para tomar a altura que sobra ----- */}
                    <div
                        ref={vidroRef}
                        className="relative min-h-0 flex-1 overflow-hidden"
                        style={{
                            borderRadius: med(0.045),
                            background: AZUL_CAIXA,
                            border: `3px solid rgba(255,255,255,.85)`,
                            boxShadow: `${neon(0.75)}, inset 0 0 44px rgba(0,0,0,.55)`,
                        }}
                    >
                      
                        {parede(
                            `polygon(0 0, ${PAREDE_X}% ${PAREDE_Y}%, ${PAREDE_X}% ${100 - pisoFundo(aspecto)}%, 0 100%)`,
                            `linear-gradient(90deg, ${AZUL_VIVO} 0%, ${AZUL_PROFUNDO} 100%)`
                        )}
                        {parede(
                            `polygon(100% 0, 100% 100%, ${100 - PAREDE_X}% ${100 - pisoFundo(aspecto)}%, ${100 - PAREDE_X}% ${PAREDE_Y}%)`,
                            `linear-gradient(270deg, ${AZUL_VIVO} 0%, ${AZUL_PROFUNDO} 100%)`
                        )}
                        {parede(
                            `polygon(0 0, 100% 0, ${100 - PAREDE_X}% ${PAREDE_Y}%, ${PAREDE_X}% ${PAREDE_Y}%)`,
                            `linear-gradient(180deg, ${AZUL_PROFUNDO} 0%, ${AZUL_FUNDO} 100%)`
                        )}
                        {/* o piso é o plano mais claro: é nele que a luz bate */}
                        {parede(
                            `polygon(0 100%, ${PAREDE_X}% ${100 - pisoFundo(aspecto)}%, ${100 - PAREDE_X}% ${100 - pisoFundo(aspecto)}%, 100% 100%)`,
                            `linear-gradient(0deg, ${AZUL_CEU} 0%, ${AZUL} 100%)`
                        )}

                        {/* parede do fundo, com a marca em marca-d'água */}
                        <div
                            className="pointer-events-none absolute grid place-items-center"
                            style={{
                                left: `${PAREDE_X}%`,
                                right: `${PAREDE_X}%`,
                                top: `${PAREDE_Y}%`,
                                bottom: `${PAREDE_Y}%`,
                                background: `radial-gradient(72% 58% at 50% 30%, ${AZUL_VIVO} 0%, ${AZUL} 55%, ${AZUL_PROFUNDO} 100%)`,
                            }}
                        >
                        </div>

                        <Holofote x={24} />
                        <Holofote x={76} />
 
                        {Array.from({ length: PLANOS.length }, (_, k) => FUNDO_DA_CAIXA - k).map((ip) => (
                            <Fragment key={ip}>
                                {bolas
                                    .filter((b) => b.plano === ip && b.id !== presa)
                                    .map((b) => {
                                        const s = PLANOS[b.plano].escala;
                                        const empurrao = sacudidas[b.id];

                                        return (
                                            <div
                                                key={b.id}
                                                className="absolute"
                                                style={{
                                                    width: `${TAM_BOLA * s}%`,
                                                    aspectRatio: "1",
                                                    left: `${b.x}%`,
                                                    bottom: `${yDoPlano(b.plano, aspecto)}%`,
                                                    transform: "translateX(-50%)",
                                                }}
                                            >
                                                {/* camada só do solavanco, para não brigar
                                                    com o translateX que centraliza */}
                                                <div
                                                    className="h-full w-full"
                                                    style={{
                                                        transform: empurrao
                                                            ? `translate(${empurrao[0]}%, ${empurrao[1]}%)`
                                                            : "translate(0, 0)",
                                                        transition: empurrao
                                                            ? "transform .16s cubic-bezier(.3,1.7,.5,1)"
                                                            : "transform .5s cubic-bezier(.3,1.5,.5,1)",
                                                    }}
                                                >
                                                    <Bolinha bola={b} />
                                                </div>
                                            </div>
                                        );
                                    })}

                                {ip === plano && (
                        <div
                            className="pointer-events-none absolute inset-y-0 flex flex-col items-center"
                            style={{
                                left: `${xGarra}%`,
                                transform: "translateX(-50%)",
                                width: `${LARGURA_GARRA * escala}%`,
                            
                            }}
                        >
                             <div
                                className="shrink-0"
                                style={{ height: `${topoDoPlano(prof)}%` }}
                            />

                             <div
                                className="shrink-0 rounded-full"
                                style={{
                                    width: med(0.006, 2),
                                    height: `${cabo}%`,
                                    background: `linear-gradient(90deg, ${AZUL_VIVO} 0%, #e8eef5 45%, ${AZUL_CLARO} 100%)`,
                                    transition: `height ${fase === "descendo" ? T_DESCIDA : T_SUBIDA}ms cubic-bezier(.45,.05,.3,1)`,
                                }}
                            />

                             <div
                                className="relative w-full shrink-0"
                                style={{
                                    aspectRatio: "140 / 110",
                                    transformOrigin: "top center",
                                    animation: tremendo
                                        ? "claw-tremor .16s linear infinite"
                                        : fase === "idle"
                                            ? "claw-swing 3.6s ease-in-out infinite"
                                            : "none",
                                }}
                            >
                                <GarraFundo fechada={fechada} />

                                 {bolaPresa && (
                                    <div
                                        className="absolute"
                                        style={{
                                            width: `${(TAM_BOLA / LARGURA_GARRA) * 100}%`,
                                            aspectRatio: "1",
                                            left: `${50 - (TAM_BOLA / LARGURA_GARRA) * 50}%`,
                                            top: "33.9%",
                                        }}
                                    >
                                        <Bolinha bola={bolaPresa} />
                                    </div>
                                )}

                                <Garra fechada={fechada} />
                            </div>
                        </div>
                                )}
                            </Fragment>
                        ))}

                         <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/[.04]" />

                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div
                                className="h-full w-1/5 bg-white/[.05]"
                                style={{ animation: "slot-shine 5.5s ease-in-out infinite" }}
                            />
                        </div>
                    </div>

                    {/* ----- painel de controle ----- */}
                    <div
                        style={{
                            borderRadius: med(0.045),
                            padding: med(0.03),
                            background: `linear-gradient(180deg, ${AZUL_VIVO} 0%, ${AZUL} 55%, ${AZUL_PROFUNDO} 100%)`,
                            border: `3px solid rgba(255,255,255,.8)`,
                            boxShadow: `${neon(0.6)}, inset 0 3px 0 rgba(255,255,255,.35), inset 0 -8px 18px rgba(0,0,0,.3)`,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            {/* botão de descer */}
                            <button
                                type="button"
                                onClick={soltarGarra}
                                disabled={travado}
                                className="grid aspect-square w-[24%] place-items-center rounded-full transition-transform duration-150 active:scale-95 disabled:opacity-40"
                                style={{
                                    background: `radial-gradient(circle at 36% 28%, ${LARANJA_CLARO} 0%, ${LARANJA} 48%, ${LARANJA_ESCURO} 100%)`,
                                    border: `2px solid rgba(255,209,168,.9)`,
                                    boxShadow: travado
                                        ? "0 7px 0 rgba(0,0,0,.5)"
                                        : `0 7px 0 rgba(0,0,0,.5), ${neon(1.2)}`,
                                }}
                                aria-label="Descer a garra"
                            >
                                <svg viewBox="0 0 24 24" className="h-[52%] w-[52%] translate-x-[6%]" aria-hidden>
                                    <path
                                        d="M 8 5 L 19 12 L 8 19 Z"
                                        fill="#ffffff"
                                        stroke="#ffffff"
                                        strokeWidth="3"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
 
                            <div
                                className="grid w-[52%]"
                                style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: med(0.012) }}
                            >
                                <span />
                                <BotaoSeta
                                    lado="fundo"
                                    largura="100%"
                                    disabled={travado || prof >= FUNDO_DA_CAIXA}
                                    onDown={() => moverProfundidade(1)}
                                    onUp={paraMover}
                                />
                                <span />

                                <BotaoSeta
                                    lado="esq"
                                    largura="100%"
                                    disabled={travado}
                                    onDown={() => mover(-1)}
                                    onUp={paraMover}
                                />
                                <span />
                                <BotaoSeta
                                    lado="dir"
                                    largura="100%"
                                    disabled={travado}
                                    onDown={() => mover(1)}
                                    onUp={paraMover}
                                />

                                <span />
                                <BotaoSeta
                                    lado="frente"
                                    largura="100%"
                                    disabled={travado || prof <= 0}
                                    onDown={() => moverProfundidade(-1)}
                                    onUp={paraMover}
                                />
                                <span />
                            </div>
                        </div>

                        {/* status */}
                        <div className="mt-[4%] flex items-center justify-between" style={{ gap: med(0.02) }}>
                          
                            <span
                                className="whitespace-nowrap font-bold text-white"
                                style={{ fontSize: med(0.028, 11), textShadow: "0 2px 4px rgba(0,0,0,.4)" }}
                            >
                                Tentativas{" "}
                                <span style={{ color: LARANJA_CLARO }}>
                                    {Math.min(attempts + (jogando ? 1 : 0), MAX_ATTEMPTS)}/{MAX_ATTEMPTS}
                                </span>
                            </span>

                            <span
                                className="truncate font-bold text-white"
                                style={{ fontSize: med(0.03, 12), textShadow: "0 2px 4px rgba(0,0,0,.4)" }}
                            >
                                {message}
                            </span>
                        </div>
                    </div>
            </div>
        </div>
    );
}
