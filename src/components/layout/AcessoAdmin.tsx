import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import type { GameSettings } from "../../config/gameSettings";
import {
    AZUL,
    AZUL_CEU,
    AZUL_PROFUNDO,
    AZUL_VIVO,
    FUNDO_TOTEM,
    LARANJA,
    LARANJA_CLARO,
    LARANJA_ESCURO,
    LARANJA_VIVO,
    neon,
} from "../../config/tema";

type Props = {
    settings: GameSettings;
    onSave: (settings: GameSettings) => void;
    onClose: () => void;
};

const MIN_TENTATIVAS = 1;
const MAX_TENTATIVAS = 10;
const PASSO_CHANCE = 5;

const clamp = (valor: number, min: number, max: number) =>
    Math.min(max, Math.max(min, valor));

/* A barra é preenchida em laranja até a posição atual. Como o input range
   nativo não deixa colorir só o trecho percorrido, isso vira um gradiente
   com a parada exatamente no valor. */
const trilho = (valor: number, min: number, max: number) => {
    const pct = ((valor - min) / (max - min)) * 100;

    return {
        background: `linear-gradient(to right, ${LARANJA} ${pct}%, rgba(255,255,255,.2) ${pct}%)`,
    };
};

function Ajuste({
    titulo,
    descricao,
    valor,
    sufixo = "",
    min,
    max,
    passo,
    onChange,
}: {
    titulo: string;
    descricao: string;
    valor: number;
    sufixo?: string;
    min: number;
    max: number;
    passo: number;
    onChange: (v: number) => void;
}) {
    const botao =
        "shrink-0 grid place-items-center rounded-full p-5 transition-transform active:scale-95";

    const estiloBotao = {
        background: `linear-gradient(180deg, ${LARANJA_VIVO} 0%, ${LARANJA} 55%, ${LARANJA_ESCURO} 100%)`,
        border: "2px solid rgba(255,255,255,.85)",
        boxShadow: neon(0.5),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black">{titulo}</h2>
                    <p className="text-xl text-white/70">{descricao}</p>
                </div>

                <span
                    className="text-6xl font-black leading-none"
                    style={{ color: LARANJA_CLARO, textShadow: "0 3px 0 rgba(0,0,0,.3)" }}
                >
                    {valor}
                    {sufixo}
                </span>
            </div>

            <div className="flex items-center gap-6">
                <button
                    type="button"
                    onClick={() => onChange(clamp(valor - passo, min, max))}
                    className={botao}
                    style={estiloBotao}
                    aria-label={`Diminuir ${titulo}`}
                >
                    <Minus color="#ffffff" size={34} strokeWidth={3} />
                </button>

                <input
                    type="range"
                    className="slot-range"
                    min={min}
                    max={max}
                    step={passo}
                    value={valor}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={trilho(valor, min, max)}
                    aria-label={titulo}
                />

                <button
                    type="button"
                    onClick={() => onChange(clamp(valor + passo, min, max))}
                    className={botao}
                    style={estiloBotao}
                    aria-label={`Aumentar ${titulo}`}
                >
                    <Plus color="#ffffff" size={34} strokeWidth={3} />
                </button>
            </div>

            <div className="flex justify-between px-1 text-lg text-white/50">
                <span>
                    {min}
                    {sufixo}
                </span>
                <span>
                    {max}
                    {sufixo}
                </span>
            </div>
        </div>
    );
}

export default function AcessoAdmin({ settings, onSave, onClose }: Props) {
    const [tentativas, setTentativas] = useState(settings.maxAttempts);
    // o painel trabalha em %, o jogo guarda de 0 a 1
    const [chance, setChance] = useState(Math.round(settings.winChance * 100));
    const [salvo, setSalvo] = useState(false);

    const salvar = () => {
        onSave({ maxAttempts: tentativas, winChance: chance / 100 });

        setSalvo(true);
        setTimeout(() => setSalvo(false), 2500);
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto text-white"
            style={{ background: FUNDO_TOTEM }}
        >
            <div className="flex min-h-screen w-full flex-col items-center gap-10 px-8 py-14">
                <div className="relative flex w-full max-w-3xl items-center justify-center">
                    {/* padding lateral do tamanho do botão: sem ele o título
                        largo passa por baixo do X */}
                    <div className="px-20 text-center">
                        <h1
                            className="text-4xl font-black tracking-tight md:text-5xl"
                            style={{ color: LARANJA, textShadow: "0 4px 0 rgba(0,0,0,.25)" }}
                        >
                            PAINEL DO ADMINISTRADOR
                        </h1>
                        <p className="mt-2 text-2xl text-white/70">Máquina de Prêmios</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-0 rounded-full border border-white/25 bg-white/10 p-3 backdrop-blur"
                        aria-label="Fechar"
                    >
                        <X color="#ffffff" size={35} />
                    </button>
                </div>

                <div
                    className="w-full max-w-3xl space-y-14 rounded-3xl p-10"
                    style={{
                        background: `linear-gradient(180deg, ${AZUL_VIVO} 0%, ${AZUL} 55%, ${AZUL_PROFUNDO} 100%)`,
                        border: "3px solid rgba(255,255,255,.8)",
                        boxShadow: `${neon(0.5)}, inset 0 3px 0 rgba(255,255,255,.3)`,
                    }}
                >
                    <Ajuste
                        titulo="Tentativas por pessoa"
                        descricao="Quantas vezes cada participante pode soltar a garra."
                        valor={tentativas}
                        min={MIN_TENTATIVAS}
                        max={MAX_TENTATIVAS}
                        passo={1}
                        onChange={setTentativas}
                    />

                    <Ajuste
                        titulo="Chance de ganhar"
                        descricao="Probabilidade de a garra subir com a bolinha."
                        valor={chance}
                        sufixo="%"
                        min={0}
                        max={100}
                        passo={PASSO_CHANCE}
                        onChange={setChance}
                    />

                    <div className="flex flex-col items-center gap-5">
                        <button
                            type="button"
                            onClick={salvar}
                            className="w-full rounded-full px-12 py-5 text-3xl font-black transition-transform active:scale-95"
                            style={{
                                background: `linear-gradient(180deg, ${LARANJA_VIVO} 0%, ${LARANJA} 55%, ${LARANJA_ESCURO} 100%)`,
                                border: "3px solid rgba(255,255,255,.9)",
                                boxShadow: `0 8px 0 rgba(0,0,0,.28), ${neon(0.8)}`,
                            }}
                        >
                            Salvar
                        </button>

                        {salvo && (
                            <p className="text-2xl font-bold" style={{ color: AZUL_CEU }}>
                                Configurações salvas!
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xl text-white/60 underline"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
