import { NavLink } from "react-router-dom";

import LogoHospitalar from "../assets/logo-hospitalar-branco.png";
import LogoGymClub from "../assets/logo-mark (1).png";
import MarkGymClub from "../assets/mark (1).png";
import BolinhaPremio from "../components/BolinhaPremio";
import { FUNDO_TOTEM, LARANJA, LARANJA_CLARO, LARANJA_ESCURO, med, neon } from "../config/tema";

/* Bolinhas soltas ao fundo, no lugar das partículas: dão profundidade e
   já mostram o motivo do jogo sem disputar espaço com a pilha central. */
const DECORACAO = [
    { arte: "/card-peso.png", left: "8%", top: "18%", tam: 0.15, giro: -8, atraso: 0 },
    { arte: "/card-servico.jpeg", left: "78%", top: "26%", tam: 0.12, giro: 10, atraso: 700 },
    { arte: "/card-simbolo.png", left: "14%", top: "72%", tam: 0.11, giro: 6, atraso: 1400 },
    { arte: "/card-logo.jpeg", left: "76%", top: "66%", tam: 0.14, giro: -5, atraso: 2100 },
];

export default function Home() {
    return (
        <div
            className="relative flex min-h-screen w-full select-none flex-col items-center justify-between overflow-hidden px-6 py-[6vh] text-white"
            style={{ background: FUNDO_TOTEM }}
        >
            <div className="pointer-events-none absolute -top-25 h-150 w-150 animate-pulse rounded-full bg-white/12 blur-[150px]" />
            <div
                className="pointer-events-none absolute -bottom-25 -right-25 h-100 w-100 rounded-full blur-[120px]"
                style={{ background: "rgba(255,136,63,.25)" }}
            />

            {DECORACAO.map((d) => (
                <div
                    key={d.arte}
                    className="pointer-events-none absolute opacity-25"
                    style={{
                        left: d.left,
                        top: d.top,
                        width: med(d.tam, 52),
                        aspectRatio: "1",
                        animation: `home-flutua 4.2s ease-in-out ${d.atraso}ms infinite`,
                    }}
                >
                    <BolinhaPremio arte={d.arte} rot={d.giro} />
                </div>
            ))}

            {/* ---------- topo: Hospitalar ---------- */}
            <img
                src={LogoHospitalar}
                alt="Plano de Saúde Hospitalar"
                style={{ height: med(0.4, 25) }}
                className="relative z-10 object-contain"
            />

            {/* ---------- meio: chamada e start ---------- */}
            <div className="relative z-10 flex flex-col items-center" style={{ gap: med(0.035) }}>
                <h1
                    className="whitespace-nowrap font-black italic leading-none tracking-tight"
                    style={{
                        // trava dupla: a medida-mestra dá a proporção, mas o
                        // título tem 18 caracteres e sem o teto em vw ele
                        // estoura a largura no monitor do totem
                        fontSize: `min(${med(0.115, 38)}, 7.6vw)`,
                        textShadow: "0 5px 0 rgba(0,0,0,.22)",
                    }}
                >
                    MÁQUINA <span style={{ color: LARANJA }}>DE PRÊMIOS</span>
                </h1>

                <p
                    className="font-black italic uppercase"
                    style={{ fontSize: med(0.036, 15), letterSpacing: ".02em" }}
                >
                    <span style={{ color: LARANJA }}>Mova a garra</span> e ganhe um{" "}
                    <span style={{ color: LARANJA }}>prêmio</span>
                </p>

                <NavLink
                    to="/maquina-de-premios"
                    className="mt-[2vh] grid place-items-center rounded-full transition-transform duration-300 hover:scale-110 active:scale-95"
                    style={{
                        width: med(0.2, 96),
                        height: med(0.2, 96),
                        background: `radial-gradient(circle at 36% 28%, ${LARANJA_CLARO} 0%, ${LARANJA} 48%, ${LARANJA_ESCURO} 100%)`,
                        border: "3px solid rgba(255,209,168,.95)",
                        boxShadow: `0 10px 0 rgba(0,0,0,.35), ${neon(1.2)}`,
                    }}
                    aria-label="Começar"
                >
                    <svg viewBox="0 0 24 24" className="h-[46%] w-[46%] translate-x-[6%]" aria-hidden>
                        <path
                            d="M 8 5 L 19 12 L 8 19 Z"
                            fill="#ffffff"
                            stroke="#ffffff"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                    </svg>
                </NavLink>

                <p
                    className="font-bold uppercase text-white/70"
                    style={{ fontSize: med(0.026, 11), letterSpacing: ".26em" }}
                >
                    <span style={{ color: LARANJA }}>•</span> Toque para começar{" "}
                    <span style={{ color: LARANJA }}>•</span>
                </p>
            </div>

            {/* ---------- base: GymClub ---------- */}
            <div className="relative z-10 flex items-center" style={{ gap: med(0.03) }}>
                <img src={MarkGymClub} alt="" style={{ height: med(0.08, 30) }} className="object-contain" />

                <img
                    src={LogoGymClub}
                    alt="GymClub"
                    // o wordmark é preto no arquivo; invertido vira branco
                    style={{ height: med(0.2, 17), filter: "brightness(0) invert(1)" }}
                    className="object-contain"
                />
            </div>

            <style>{`
                @keyframes home-flutua {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-14px); }
                }
            `}</style>
        </div>
    );
}
