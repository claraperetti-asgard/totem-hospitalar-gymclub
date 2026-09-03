/* A bolinha da máquina de prêmios, usada na pilha, presa na garra e na
   tela final. Ela se mede pelo container (h-full/w-full), então quem usa
   decide o tamanho e a mesma peça serve para 13% do vidro e para o
   destaque grande do final — sem salto de aparência entre as telas.

   As artes são cartelas em retrato; entram em object-cover porque assim o
   corte come só topo e base e a figura, que é centralizada, fica inteira. */
export default function BolinhaPremio({
    arte,
    rot = 0,
    alvo = false,
}: {
    arte: string;
    rot?: number;
    alvo?: boolean;
}) {
    return (
        <div
            className="relative h-full w-full overflow-hidden rounded-full"
            style={{
                transform: `rotate(${rot}deg)`,
                boxShadow: alvo
                    ? "0 5px 14px rgba(0,0,0,.65), 0 0 0 2px rgba(255,136,63,.95), 0 0 8px rgba(255,136,63,.42), 0 0 28px rgba(255,136,63,.2)"
                    : "0 5px 14px rgba(0,0,0,.65)",
                transition: "box-shadow .25s ease",
            }}
        >
            <img src={arte} alt="" className="absolute inset-0 h-full w-full object-cover" />

            {/* Sombreado por cima da arte: é o que faz a cartela chapada
                virar esfera — luz no alto à esquerda, sombra embaixo à
                direita, na mesma direção dos holofotes da caixa. */}
            <span
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at 34% 26%, rgba(255,255,255,.4) 0%, rgba(255,255,255,0) 45%)," +
                        "radial-gradient(circle at 70% 80%, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 65%)",
                }}
            />

            <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ boxShadow: "inset 0 -6px 14px rgba(0,0,0,.4), inset 0 4px 10px rgba(255,255,255,.22)" }}
            />

            {/* brilho especular */}
            <span className="pointer-events-none absolute left-[20%] top-[13%] h-[18%] w-[24%] rounded-full bg-white/70 blur-[2px]" />
        </div>
    );
}
