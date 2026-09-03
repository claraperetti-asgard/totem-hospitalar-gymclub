import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

import BolinhaPremio from "../components/BolinhaPremio";
import MarcasParceria from "../components/MarcasParceria";
import { AZUL_CEU, FUNDO_TOTEM, LARANJA, LARANJA_CLARO, LARANJA_ESCURO, LARANJA_VIVO } from "../config/tema";

export default function EndScreen() {
    const { state } = useLocation();

    const status = state?.status;
    // a bolinha que a pessoa pegou; a máquina manda junto na navegação
    const arte: string | undefined = state?.arte;

    useEffect(() => {
        if (status !== "win") return;

        // confete nas duas marcas, não só no azul
        const cores = [LARANJA, LARANJA_CLARO, AZUL_CEU, "#ffffff"];

        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: cores });

        const duration = 3 * 1000;
        const end = Date.now() + duration;

        let cancelled = false;

        const frame = () => {
            if (cancelled) return;

            confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: cores });
            confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: cores });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        return () => {
            cancelled = true;
        };
    }, [status]);

    const ganhou = status === "win";

    return (
        <div
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white"
            style={{ background: FUNDO_TOTEM }}
        >
            <div className="absolute -top-25 h-150 w-150 animate-pulse rounded-full bg-white/15 blur-[150px]" />
            <div className="absolute -bottom-25 -right-25 h-100 w-100 rounded-full blur-[120px]" style={{ background: "rgba(255,136,63,.25)" }} />

            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 px-8 text-center">

                {/* as duas marcas juntas: é uma parceria, não uma tela do Hospitalar */}
                <MarcasParceria />

                {ganhou ? (
                    <div className="flex animate-fade-in-up flex-col items-center gap-6">
                        {/* o prêmio que ela pegou, do mesmo jeito que aparecia
                            preso na garra */}
                        {arte && (
                            <div
                                className="h-44 w-44 md:h-60 md:w-60"
                                style={{ filter: `drop-shadow(0 18px 40px rgba(0,0,0,.5)) drop-shadow(0 0 40px rgba(255,136,63,.55))` }}
                            >
                                <BolinhaPremio arte={arte} />
                            </div>
                        )}

                        <h1
                            className="font-black leading-none tracking-tight"
                            style={{ fontSize: "clamp(56px, 14vw, 150px)", color: LARANJA, textShadow: "0 6px 0 rgba(0,0,0,.25)" }}
                        >
                            PARABÉNS!
                        </h1>

                        <p className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
                            Você pegou o seu prêmio na<br />
                            <span style={{ color: LARANJA_CLARO }}>Máquina de Prêmios</span>!
                        </p>

                        <p className="text-xl font-semibold text-white/85 md:text-3xl">
                            Retire no estande com a nossa equipe.
                        </p>
                    </div>
                ) : (
                    /* Derrota: "quase" em vez de "você não conseguiu". A garra
                       chegou a fechar no prêmio, então a tela conta isso — sair
                       com a sensação de azar segura muito melhor do que sair
                       com uma negativa seca. */
                    <div className="flex animate-fade-in-up flex-col items-center gap-6">
                        <h1
                            className="font-black leading-none tracking-tight"
                            style={{ fontSize: "clamp(72px, 18vw, 190px)", color: LARANJA, textShadow: "0 6px 0 rgba(0,0,0,.25)" }}
                        >
                            QUASE!
                        </h1>

                        <p className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
                            A garra desceu, mas os prêmios<br />
                            <span style={{ color: LARANJA_CLARO }}>escaparam</span> bem na hora.
                        </p>

                        <p className="text-xl font-semibold text-white/85 md:text-3xl">
                            Passe no estande para conhecer o plano.
                        </p>
                    </div>
                )}

                <NavLink
                    to="/"
                    className="mt-6 rounded-full px-12 py-4 text-3xl font-black transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                        background: `linear-gradient(180deg, ${LARANJA_VIVO} 0%, ${LARANJA} 55%, ${LARANJA_ESCURO} 100%)`,
                        color: "#ffffff",
                        border: "3px solid rgba(255,255,255,.9)",
                        boxShadow: "0 10px 0 rgba(0,0,0,.28), 0 0 32px rgba(255,136,63,.6)",
                    }}
                >
                    Jogar Novamente
                </NavLink>

            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
            `}</style>
        </div>
    );
}
