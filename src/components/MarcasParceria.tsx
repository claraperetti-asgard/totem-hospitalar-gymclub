import LogoHospitalar from "../assets/logo-hospitalar-branco.png";
import LogoGymClub from "../assets/logo-mark (1).png";
import MarkGymClub from "../assets/mark (1).png";
import { med } from "../config/tema";

/* Assinatura das duas marcas, igual nas três telas do jogo (início,
   máquina e final).

   As alturas são desiguais de propósito: o "GC" é um símbolo quase
   quadrado e o Hospitalar é um lockup deitado com texto miúdo — igualar
   a altura faria o GC dominar e o Hospitalar virar ilegível. */
export default function MarcasParceria() {
    return (
        <div className="flex items-center" style={{ gap: med(0.03) }}>
            <img src={MarkGymClub} alt="" style={{ height: med(0.08, 30) }} className="object-contain" />

            <img
                src={LogoGymClub}
                alt="GymClub"
                // o wordmark é preto no arquivo; invertido vira branco
                style={{ height: med(0.18, 17), filter: "brightness(0) invert(1)" }}
                className="object-contain"
            />

            <img
                src={LogoHospitalar}
                alt="Plano de Saúde Hospitalar"
                style={{ height: med(0.3, 25) }}
                className="object-contain"
            />
        </div>
    );
}
