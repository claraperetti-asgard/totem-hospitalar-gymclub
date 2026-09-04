import { useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Settings, User, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import KeyboardReact from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

import LogoHospitalar from "../assets/logo-hospitalar-branco.png";
import LogoGymClub from "../assets/logo-mark (1).png";
import MarkGymClub from "../assets/mark (1).png";
import AcessoAdmin from "../components/layout/AcessoAdmin";
import {
    ADMIN_PASSWORD,
    ADMIN_USER,
    loadGameSettings,
    saveGameSettings,
    type GameSettings,
} from "../config/gameSettings";
import {
    AZUL,
    AZUL_PROFUNDO,
    AZUL_VIVO,
    FUNDO_TOTEM,
    LARANJA,
    LARANJA_CLARO,
    LARANJA_ESCURO,
    LARANJA_VIVO,
    med,
    neon,
} from "../config/tema";

/* O pacote publica em CommonJS e em ESM; conforme o empacotador, o
   componente vem em `default` ou na própria exportação. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Teclado = (KeyboardReact as any).default || KeyboardReact;

const CAMPOS = [
    { id: "nome", rotulo: "Nome completo", exemplo: "Digite seu nome" },
    { id: "empresa", rotulo: "Nome da empresa", exemplo: "Onde você trabalha" },
    { id: "cargo", rotulo: "Cargo", exemplo: "Seu cargo na empresa" },
    { id: "telefone", rotulo: "Telefone com WhatsApp", exemplo: "(99) 99999-9999" },
] as const;

type CampoId = (typeof CAMPOS)[number]["id"];

const VAZIO: Record<CampoId, string> = { nome: "", empresa: "", cargo: "", telefone: "" };

const LETRAS = {
    default: [
        "1 2 3 4 5 6 7 8 9 0",
        "q w e r t y u i o p á é í",
        "a s d f g h j k l ó ú ç",
        "{shift} z x c v b n m ã {backspace}",
        ". _ - + {space}",
    ],
    shift: [
        "1 2 3 4 5 6 7 8 9 0",
        "Q W E R T Y U I O P Á É Í",
        "A S D F G H J K L Ó Ú Ç",
        "{shift} Z X C V B N M Ã {backspace}",
        ". _ - + {space}",
    ],
};

const NUMEROS = {
    default: ["1 2 3", "4 5 6", "7 8 9", "0 {backspace}"],
};

/* Teclado do login: mais enxuto que o do formulário, com os caracteres
   que aparecem em usuário e senha (@ . _ - e o arroba do e-mail). */
const LOGIN_TECLAS = {
    default: [
        "1 2 3 4 5 6 7 8 9 0",
        "q w e r t y u i o p",
        "a s d f g h j k l ç",
        "{shift} z x c v b n m {backspace}",
        "@ . _ - {space}",
    ],
    shift: [
        "1 2 3 4 5 6 7 8 9 0",
        "Q W E R T Y U I O P",
        "A S D F G H J K L Ç",
        "{shift} Z X C V B N M {backspace}",
        "@ . _ - {space}",
    ],
};

/* (99) 99999-9999 — formata enquanto digita, e ignora o que passar de 11
   dígitos para o campo não crescer sem limite. */
const formataTelefone = (bruto: string) => {
    const d = bruto.replace(/\D/g, "").slice(0, 11);

    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;

    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export default function Cadastro() {
    const navigate = useNavigate();

    const [dados, setDados] = useState<Record<CampoId, string>>(VAZIO);
    const [foco, setFoco] = useState<CampoId>("nome");
    const [erro, setErro] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tecladoRef = useRef<any>(null);

    /* ----- acesso do administrador ----- */
    const [settings, setSettings] = useState<GameSettings>(() => loadGameSettings());
    const [loginAberto, setLoginAberto] = useState(false);
    const [adminAberto, setAdminAberto] = useState(false);
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erroLogin, setErroLogin] = useState("");
    const [focoLogin, setFocoLogin] = useState<"usuario" | "senha">("usuario");
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tecladoLoginRef = useRef<any>(null);

    const abrirLogin = () => {
        setUsuario("");
        setSenha("");
        setErroLogin("");
        setFocoLogin("usuario");
        setSenhaVisivel(false);
        setLoginAberto(true);
        tecladoLoginRef.current?.setInput("");
    };

    const trocaFocoLogin = (campo: "usuario" | "senha") => {
        setFocoLogin(campo);
        tecladoLoginRef.current?.setInput(campo === "usuario" ? usuario : senha);
    };

    /* Mesmo cuidado do formulário: o campo vem por parâmetro, senão o
       primeiro caractere após trocar de campo cai no anterior. */
    const digitouLogin = (campo: "usuario" | "senha", valor: string) => {
        setErroLogin("");
        if (campo === "usuario") setUsuario(valor);
        else setSenha(valor);
    };

    const numerico = foco === "telefone";

    const trocaFoco = (campo: CampoId) => {
        setFoco(campo);
        // o teclado guarda o texto internamente; sem isso ele continuaria
        // editando o valor do campo anterior
        tecladoRef.current?.setInput(dados[campo]);
    };

    /* O campo vem por parâmetro, não do estado `foco`: ao tocar num campo
       novo, `trocaFoco` só vale no próximo render, e ler `foco` aqui
       mandaria o primeiro caractere para o campo anterior. */
    const digitou = (campo: CampoId, valor: string) => {
        setErro("");
        setDados((d) => ({
            ...d,
            [campo]: campo === "telefone" ? formataTelefone(valor) : valor,
        }));
    };

    const enviar = () => {
        const faltando = CAMPOS.filter((c) => !dados[c.id].trim());

        if (faltando.length) {
            setErro(`Preencha: ${faltando.map((c) => c.rotulo.toLowerCase()).join(", ")}`);
            return;
        }

        if (dados.telefone.replace(/\D/g, "").length < 10) {
            setErro("Telefone incompleto");
            return;
        }

        /* Ainda não há banco: os dados seguem no estado da navegação para
           quem for gravar depois plugar sem mexer nesta tela. */
        navigate("/maquina-de-premios", { state: { cadastro: dados } });
    };

    const entrarAdmin = () => {
        if (usuario.trim().toLowerCase() === ADMIN_USER && senha === ADMIN_PASSWORD) {
            setLoginAberto(false);
            setAdminAberto(true);
            setUsuario("");
            setSenha("");
            setErroLogin("");
            return;
        }

        setErroLogin("Usuário ou senha inválidos");
    };

    if (adminAberto) {
        return (
            <AcessoAdmin
                settings={settings}
                onSave={(next) => setSettings(saveGameSettings(next))}
                onClose={() => setAdminAberto(false)}
            />
        );
    }

    return (
        <div
            className="relative flex min-h-screen w-full flex-col items-center overflow-y-auto px-6 py-[3vh] text-white"
            style={{ background: FUNDO_TOTEM }}
        >
            <NavLink
                to="/"
                className="absolute left-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur"
                aria-label="Voltar"
            >
                <ArrowLeft color="#ffffff" size={22} />
            </NavLink>

            {/* engrenagem discreta: é o único caminho para o painel admin
                agora que o formulário antigo saiu do fluxo */}
            <button
                type="button"
                onClick={abrirLogin}
                className="absolute right-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur"
                aria-label="Painel do administrador"
            >
                <Settings color="#ffffff" size={20} />
            </button>

            <img
                src={LogoHospitalar}
                alt="Plano de Saúde Hospitalar"
                style={{ height: med(0.22, 25) }}
                className="relative z-10 object-contain"
            />

            <h1
                className="mt-[2vh] text-center font-black italic leading-none tracking-tight"
                style={{ fontSize: `min(${med(0.085, 30)}, 6.4vw)`, textShadow: "0 4px 0 rgba(0,0,0,.22)" }}
            >
                PREENCHA SEUS <span style={{ color: LARANJA }}>DADOS</span>
            </h1>

            <p
                className="mt-[1vh] font-bold uppercase text-white/70"
                style={{ fontSize: med(0.024, 11), letterSpacing: ".22em" }}
            >
                <span style={{ color: LARANJA }}>•</span> Para jogar na Máquina de Prêmios{" "}
                <span style={{ color: LARANJA }}>•</span>
            </p>

            <div
                className="relative z-10 mt-[2.5vh] w-full max-w-3xl rounded-3xl p-6"
                style={{
                    background: `linear-gradient(180deg, ${AZUL_VIVO} 0%, ${AZUL} 55%, ${AZUL_PROFUNDO} 100%)`,
                    border: "3px solid rgba(255,255,255,.75)",
                    boxShadow: `${neon(0.45)}, inset 0 3px 0 rgba(255,255,255,.28)`,
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    {CAMPOS.map((campo) => (
                        <label key={campo.id} className="flex flex-col gap-1.5">
                            <span className="text-lg font-bold text-white/85">{campo.rotulo}</span>

                            <input
                                value={dados[campo.id]}
                                onFocus={() => trocaFoco(campo.id)}
                                onChange={(e) => {
                                    if (foco !== campo.id) trocaFoco(campo.id);
                                    digitou(campo.id, e.target.value);
                                }}
                                placeholder={campo.exemplo}
                                inputMode={campo.id === "telefone" ? "numeric" : "text"}
                                className="rounded-xl px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-white/40"
                                style={{
                                    background: "rgba(255,255,255,.12)",
                                    border: `2px solid ${foco === campo.id ? LARANJA : "rgba(255,255,255,.25)"}`,
                                }}
                            />
                        </label>
                    ))}
                </div>

                <div className="mt-5">
                    <Teclado
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        keyboardRef={(r: any) => (tecladoRef.current = r)}
                        baseClass={numerico ? "totem-kb totem-kb-numeric" : "totem-kb"}
                        theme="hg-theme-default totem-kb"
                        layout={numerico ? NUMEROS : LETRAS}
                        layoutName="default"
                        display={{ "{shift}": "⇧", "{backspace}": "⌫ Apagar", "{space}": "Espaço" }}
                        onChange={(v: string) => digitou(foco, v)}
                        onKeyPress={(tecla: string) => {
                            if (tecla !== "{shift}") return;
                            tecladoRef.current?.setOptions({
                                layoutName:
                                    tecladoRef.current.options.layoutName === "default"
                                        ? "shift"
                                        : "default",
                            });
                        }}
                    />
                </div>

                {erro && (
                    <p className="mt-4 text-center text-xl font-bold" style={{ color: LARANJA_CLARO }}>
                        {erro}
                    </p>
                )}

                <button
                    type="button"
                    onClick={enviar}
                    className="mt-5 w-full rounded-full py-4 text-2xl font-black transition-transform active:scale-95"
                    style={{
                        background: `linear-gradient(180deg, ${LARANJA_VIVO} 0%, ${LARANJA} 55%, ${LARANJA_ESCURO} 100%)`,
                        border: "3px solid rgba(255,255,255,.9)",
                        boxShadow: `0 7px 0 rgba(0,0,0,.28), ${neon(0.7)}`,
                    }}
                >
                    Jogar
                </button>
            </div>

            <div className="relative z-10 mt-[3vh] flex items-center" style={{ gap: med(0.03) }}>
                <img src={MarkGymClub} alt="" style={{ height: med(0.06, 26) }} className="object-contain" />
                <img
                    src={LogoGymClub}
                    alt="GymClub"
                    style={{ height: med(0.15, 15), filter: "brightness(0) invert(1)" }}
                    className="object-contain"
                />
            </div>

            {/* ---------- login do administrador ---------- */}
            {loginAberto && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 px-6">
                    <div
                        className="relative w-full max-w-lg space-y-5 rounded-3xl p-8"
                        style={{
                            background: `linear-gradient(180deg, ${AZUL_VIVO} 0%, ${AZUL} 100%)`,
                            border: "3px solid rgba(255,255,255,.8)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setLoginAberto(false)}
                            className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/10 p-2"
                            aria-label="Fechar"
                        >
                            <X color="#ffffff" size={22} />
                        </button>

                        <h2 className="text-center text-3xl font-black tracking-tight">
                            ACESSO <span style={{ color: LARANJA }}>ADMIN</span>
                        </h2>

                        <div className="flex items-center gap-3 rounded-xl px-4"
                            style={{
                                background: "rgba(255,255,255,.12)",
                                border: `2px solid ${focoLogin === "usuario" ? LARANJA : "rgba(255,255,255,.25)"}`,
                            }}
                        >
                            <User color="#ffffff" size={20} className="shrink-0 opacity-60" />
                            <input
                                value={usuario}
                                onFocus={() => trocaFocoLogin("usuario")}
                                onChange={(e) => {
                                    if (focoLogin !== "usuario") trocaFocoLogin("usuario");
                                    digitouLogin("usuario", e.target.value);
                                }}
                                placeholder="USUÁRIO"
                                autoComplete="off"
                                className="w-full bg-transparent py-3 text-xl text-white outline-none placeholder:text-white/40"
                            />
                        </div>

                        <div className="flex items-center gap-3 rounded-xl px-4"
                            style={{
                                background: "rgba(255,255,255,.12)",
                                border: `2px solid ${focoLogin === "senha" ? LARANJA : "rgba(255,255,255,.25)"}`,
                            }}
                        >
                            <Lock color="#ffffff" size={20} className="shrink-0 opacity-60" />
                            <input
                                value={senha}
                                onFocus={() => trocaFocoLogin("senha")}
                                onChange={(e) => {
                                    if (focoLogin !== "senha") trocaFocoLogin("senha");
                                    digitouLogin("senha", e.target.value);
                                }}
                                placeholder="SENHA"
                                type={senhaVisivel ? "text" : "password"}
                                autoComplete="off"
                                className="w-full bg-transparent py-3 text-xl text-white outline-none placeholder:text-white/40"
                            />
                            <button
                                type="button"
                                onClick={() => setSenhaVisivel((v) => !v)}
                                className="shrink-0 opacity-70"
                                aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {senhaVisivel ? <EyeOff color="#ffffff" size={20} /> : <Eye color="#ffffff" size={20} />}
                            </button>
                        </div>

                        {/* teclado próprio do login: o totem não tem teclado físico */}
                        <Teclado
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            keyboardRef={(r: any) => (tecladoLoginRef.current = r)}
                            baseClass="totem-kb-login"
                            theme="hg-theme-default totem-kb totem-kb-mini"
                            layout={LOGIN_TECLAS}
                            layoutName="default"
                            display={{ "{shift}": "⇧", "{backspace}": "⌫", "{space}": "Espaço" }}
                            onChange={(v: string) => digitouLogin(focoLogin, v)}
                            onKeyPress={(tecla: string) => {
                                if (tecla !== "{shift}") return;
                                tecladoLoginRef.current?.setOptions({
                                    layoutName:
                                        tecladoLoginRef.current.options.layoutName === "default"
                                            ? "shift"
                                            : "default",
                                });
                            }}
                        />

                        {erroLogin && (
                            <p className="text-center font-bold" style={{ color: LARANJA_CLARO }}>
                                {erroLogin}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setLoginAberto(false)}
                                className="flex-1 rounded-full border-2 border-white/40 py-3 text-xl font-black"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={entrarAdmin}
                                className="flex-1 rounded-full py-3 text-xl font-black"
                                style={{
                                    background: `linear-gradient(180deg, ${LARANJA_VIVO} 0%, ${LARANJA} 55%, ${LARANJA_ESCURO} 100%)`,
                                    border: "3px solid rgba(255,255,255,.9)",
                                }}
                            >
                                Entrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
