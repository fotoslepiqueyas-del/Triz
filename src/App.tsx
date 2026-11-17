import React, { useState, useRef, useEffect } from 'react';

// Imports das capas de clássicos do terror (Certifique-se de ter esses arquivos em ./assets ou ajuste os caminhos)
import capaPsycho from './assets/psycho.png';
import capaShining from './assets/shining.png';
import capaExorcista from './assets/exorcista.png';
import capaHalloween from './assets/halloween.png';
import capaDracula from './assets/dracula.png';
import capaAlien from './assets/alien.png';

// Import da trilha sonora da raiz do projeto
import audioTrilha from '../enya.mp3.mp3';

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Screen = 'hero' | 'quiz' | 'diagnostic' | 'result' | 'dev-login' | 'dev-dashboard';
type HorrorTier = 'novice' | 'enthusiast' | 'connoisseur' | 'master';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  subtitle: string;
  options: Option[];
}

interface TierResult {
  title: string;
  subtitle: string;
  description: string;
  emblem: string;
  traits: string[];
  recommendedMasterpiece: string;
  synopsis: string;
  cover: string;
  directors: string;
}

interface ParticipantRecord {
  name: string;
  subgenre: string;
  date?: string;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdTJhH0cNPc_3lryKA5GRjRoE4SYrUr5lN4ypBZLS6NZgX_TBJCpfaVW7PcSP3jwrq/exec';

/* ─── Data: 16 Perguntas de Trivia de Clássicos de Terror ─────────────────── */

const questions: Question[] = [
  {
    id: 1,
    question: 'Em "Psicose" (1960), de Alfred Hitchcock, quem é o verdadeiro assassino por trás dos crimes no motel?',
    subtitle: 'Um dos maiores plot twists da história do cinema',
    options: [
      { text: 'A suposta mãe de Norman Bates', isCorrect: false },
      { text: 'Norman Bates fingindo ser a própria mãe', isCorrect: true },
      { text: 'A irmã de Marion Crane em busca de vingança', isCorrect: false },
      { text: 'O detetive Arbogast', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: 'Qual é o número do quarto mal-assombrado no aterrorizante Hotel Overlook em "O Iluminado"?',
    subtitle: 'O quarto que Danny Torrance é avisado para jamais entrar',
    options: [
      { text: 'Quarto 217 (no livro) / Quarto 237 (no filme)', isCorrect: true },
      { text: 'Quarto 1408', isCorrect: false },
      { text: 'Quarto 666', isCorrect: false },
      { text: 'Quarto 313', isCorrect: false },
    ],
  },
  {
    id: 3,
    question: 'Em "O Exorcista" (1973), qual é o nome do demônio ancestral que possui a jovem Regan MacNeil?',
    subtitle: 'A entidade invocada em rituais milenares',
    options: [
      { text: 'Pazuzu', isCorrect: true },
      { text: 'Babadook', isCorrect: false },
      { text: 'Valak', isCorrect: false },
      { text: 'Beelzebub', isCorrect: false },
    ],
  },
  {
    id: 4,
    question: 'Qual o nome do icônico assassino mascarado que persegue Laurie Strode em "Halloween" (1978)?',
    subtitle: 'O homem que personifica o mal puro',
    options: [
      { text: 'Jason Voorhees', isCorrect: false },
      { text: 'Michael Myers', isCorrect: true },
      { text: 'Leatherface', isCorrect: false },
      { text: 'Freddy Krueger', isCorrect: false },
    ],
  },
  {
    id: 5,
    question: 'No clássico "O Massacre da Serra Elétrica" (1974), qual o principal traço distintivo de Leatherface?',
    subtitle: 'A marca registrada da família de canibais do Texas',
    options: [
      { text: 'Usa uma máscara feita de pele humana', isCorrect: true },
      { text: 'Usa uma capa de couro preto e cartola', isCorrect: false },
      { text: 'É mudo e cego de um olho', isCorrect: false },
      { text: 'Usa uma máscara de hóquei clássica', isCorrect: false },
    ],
  },
  {
    id: 6,
    question: 'Em "O Bebê de Rosemary" (1968), qual era a verdadeira natureza da seita liderada pelos vizinhos Castevet?',
    subtitle: 'O pacto sombrio feito no edifício Dakota',
    options: [
      { text: 'Um culto satânico preparando o nascimento do anticristo', isCorrect: true },
      { text: 'Uma sociedade secreta de cientistas geneticistas', isCorrect: false },
      { text: 'Um grupo de vampiros aristocratas exilados', isCorrect: false },
      { text: 'Fantasmas presos a uma maldição secular', isCorrect: false },
    ],
  },
  {
    id: 7,
    question: 'Qual diretor revolucionou o gênero slasher ao comandar "Pânico" (1996), satirizando as regras do terror?',
    subtitle: 'O mestre do terror moderno e criador de A Hora do Pesadelo',
    options: [
      { text: 'John Carpenter', isCorrect: false },
      { text: 'Wes Craven', isCorrect: true },
      { text: 'George A. Romero', isCorrect: false },
      { text: 'Dario Argento', isCorrect: false },
    ],
  },
  {
    id: 8,
    question: 'No clássico sci-fi/terror "Alien, o 8º Passageiro" (1979), quem é a heroína e oficial que enfrenta a criatura?',
    subtitle: 'A sobrevivente definitiva da nave Nostromo',
    options: [
      { text: 'Ripley (interpretada por Sigourney Weaver)', isCorrect: true },
      { text: 'Sarah Connor', isCorrect: false },
      { text: 'Clarice Starling', isCorrect: false },
      { text: 'Laurie Strode', isCorrect: false },
    ],
  },
  {
    id: 9,
    question: 'Em "A Noite dos Mortos-Vivos" (1968), de George A. Romero, qual criatura foi popularizada no cinema moderno?',
    subtitle: 'O marco zero do cinema de mortos-vivos contemporâneo',
    options: [
      { text: 'Zumbis carnívoros reanimados por radiação/desconhecido', isCorrect: true },
      { text: 'Vampiros clássicos sensíveis à luz solar', isCorrect: false },
      { text: 'Múmias egípcias despertadas por escavações', isCorrect: false },
      { text: 'Lobisomens ligados às fases da lua', isCorrect: false },
    ],
  },
  {
    id: 10,
    question: 'Qual clássico de terror gótico de 1931 da Universal consolidou Bela Lugosi como o vampiro definitivo?',
    subtitle: 'O aristocrata da Transilvânia no cinema sonoro',
    options: [
      { text: 'Drácula', isCorrect: true },
      { text: 'O Fantasma da Ópera', isCorrect: false },
      { text: 'O Médico e o Monstro', isCorrect: false },
      { text: 'A Múmia', isCorrect: false },
    ],
  },
  {
    id: 11,
    question: 'Em "O Iluminado", qual frase icônica Jack Torrance repete centenas de vezes datilografadas no papel?',
    subtitle: 'O sinal inequívoco da perda total de sanidade',
    options: [
      { text: '"All work and no play makes Jack a dull boy"', isCorrect: true },
      { text: '"Here’s Johnny! Let me in!"', isCorrect: false },
      { text: '"Redrum, redrum, murder in the room"', isCorrect: false },
      { text: '"The horror, the horror of the snow"', isCorrect: false },
    ],
  },
  {
    id: 12,
    question: 'Em "O Enigma de Outro Mundo" (1982), qual é a principal habilidade da criatura extraterrestre?',
    subtitle: 'O parasita que destrói a confiança entre os cientistas',
    options: [
      { text: 'Assimilar e imitar perfeitamente a forma de qualquer ser vivo', isCorrect: true },
      { text: 'Controlar a mente das vítimas através de telepatia à distância', isCorrect: false },
      { text: 'Invisibilidade total e rajadas de energia térmica', isCorrect: false },
      { text: 'Transformar humanos em estátuas de gelo instantâneas', isCorrect: false },
    ],
  },
  {
    id: 13,
    question: 'Qual filme de Dario Argento (1977) é o ápice do subgênero italiano Giallo e do terror estilizado em technicolor?',
    subtitle: 'A famosa academia de dança dominada por bruxas',
    options: [
      { text: 'Suspiria', isCorrect: true },
      { text: 'Profondo Rosso', isCorrect: false },
      { text: 'Inferno', isCorrect: false },
      { text: 'Tenebre', isCorrect: false },
    ],
  },
  {
    id: 14,
    question: 'Em "O Silêncio dos Inocentes" (1991), qual é a profissão e especialidade de Hannibal Lecter antes de ser preso?',
    subtitle: 'O brilhante psiquiatra e prisioneiro de segurança máxima',
    options: [
      { text: 'Psiquiatra e cirurgião talentoso (além de serial killer canibal)', isCorrect: true },
      { text: 'Investigador forense da polícia de Baltimore', isCorrect: false },
      { text: 'Professor universitário de literatura gótica', isCorrect: false },
      { text: 'Agente duplo do FBI infiltrado', isCorrect: false },
    ],
  },
  {
    id: 15,
    question: 'Qual foi o primeiro filme de terror da história a ser indicado ao Oscar de Melhor Filme (1973)?',
    subtitle: 'A produção que chocou plateias nos cinemas na estreia',
    options: [
      { text: 'O Exorcista', isCorrect: true },
      { text: 'O Tubarão', isCorrect: false },
      { text: 'O Bebê de Rosemary', isCorrect: false },
      { text: 'Psicose', isCorrect: false },
    ],
  },
  {
    id: 16,
    question: 'Em "Frankenstein" (1931), qual é a famosa exclamação do cientista Henry Frankenstein ao ver sua criatura ganhar vida?',
    subtitle: 'O momento supremo de desafio às leis divinas',
    options: [
      { text: '"It’s alive! It’s alive!"', isCorrect: true },
      { text: '"God forgive me for what I have done!"', isCorrect: false },
      { text: '"The monster breathes! Science has triumphed!"', isCorrect: false },
      { text: '"Born from lightning, live forever!"', isCorrect: false },
    ],
  },
];

const tierResults: Record<HorrorTier, TierResult> = {
  novice: {
    title: 'Espectador da Primeira Fileira',
    subtitle: 'Iniciando a descida às sombras do cinema',
    description: 'Você conhece os nomes mais famosos e alguns sustos clássicos, mas ainda tem muito chão escuro para explorar até dominar os segredos do terror.',
    emblem: '🕯️',
    traits: ['Curioso', 'Cauteloso', 'Iniciante', 'Observador'],
    recommendedMasterpiece: 'Psicose (1960)',
    synopsis: 'A obra-prima definitiva de Alfred Hitchcock para iniciar sua imersão nos clássicos.',
    cover: capaPsycho,
    directors: 'Alfred Hitchcock · Wes Craven',
  },
  enthusiast: {
    title: 'Cinéfilo de Outubro',
    subtitle: 'Boa bagagem de clássicos e sangue frio',
    description: 'Você conhece os principais monstros, diretores lendários e acerta boa parte das referências quando o assunto é suspense e horror.',
    emblem: '🎃',
    traits: ['Dedicado', 'Atento', 'Entusiasta', 'Fascinado'],
    recommendedMasterpiece: 'Halloween: A Noite do Terror (1978)',
    synopsis: 'O slasher que definiu as regras do suspense moderno sob a direção de John Carpenter.',
    cover: capaHalloween,
    directors: 'John Carpenter · George A. Romero',
  },
  connoisseur: {
    title: 'Connoisseur do Macabro',
    subtitle: 'Mente afiada para tramas e reviravoltas sombrias',
    description: 'Você domina detalhes complexos, referências históricas e entende a genialidade por trás dos clássicos absolutos do gênero.',
    emblem: '🦇',
    traits: ['Erudito', 'Sofisticado', 'Analítico', 'Misterioso'],
    recommendedMasterpiece: 'O Iluminado (1980)',
    synopsis: 'Uma aula de atmosfera psicológica e terror visual dirigida por Stanley Kubrick.',
    cover: capaShining,
    directors: 'Stanley Kubrick · William Friedkin',
  },
  master: {
    title: 'Oráculo do Horror Absoluto',
    subtitle: 'Autoridade suprema em clássicos e mitologia do terror',
    description: 'Sua mente habita os recantos mais profundos da sétima arte. Você conhece cada plot twist, diretor, criatura e citação clássica do cinema de terror.',
    emblem: '👑',
    traits: ['Lendário', 'Inalcançável', 'Supremo', 'Onisciente'],
    recommendedMasterpiece: 'O Exorcista (1973)',
    synopsis: 'O ápice absoluto do horror cinematográfico e marco histórico cultural.',
    cover: capaExorcista,
    directors: 'William Friedkin · Stanley Kubrick · Alfred Hitchcock',
  },
};

function calculateTier(correctCount: number): HorrorTier {
  if (correctCount <= 5) return 'novice';
  if (correctCount <= 10) return 'enthusiast';
  if (correctCount <= 14) return 'connoisseur';
  return 'master';
}

/* ─── Componentes Visuais ─────────────────────────────────────────────────── */

function Filigrana({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 420 56"
      style={{ width: '100%', maxWidth: '350px', margin: '0 auto', transform: flip ? 'scaleY(-1)' : undefined, display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#D4AF37" strokeWidth="0.8" fill="none">
        <line x1="0" y1="28" x2="148" y2="28" />
        <line x1="272" y1="28" x2="420" y2="28" />
        <circle cx="210" cy="28" r="22" />
        <circle cx="210" cy="28" r="15" />
        <circle cx="210" cy="28" r="5" fill="#D4AF37" />
        <polyline points="148,28 180,8 210,8 240,8 272,28" />
        <polyline points="148,28 180,48 210,48 240,48 272,28" />
        <circle cx="148" cy="28" r="4" fill="#D4AF37" />
        <circle cx="272" cy="28" r="4" fill="#D4AF37" />
      </g>
    </svg>
  );
}

type ButtonVariant = 'primary' | 'secondary';

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; color: string; shadow: string }> = {
  primary: { bg: '#2b0910', color: '#F5F3E7', shadow: '0 4px 20px rgba(43,9,16,0.8)' },
  secondary: { bg: '#161c14', color: '#F5F3E7', shadow: '0 4px 20px rgba(22,28,20,0.8)' },
};

function DiamondButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  wide = false,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  wide?: boolean;
  type?: 'button' | 'submit';
}) {
  const s = VARIANT_STYLES[variant];
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: s.bg,
        color: s.color,
        fontFamily: "Georgia, serif",
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        padding: '12px 36px',
        minWidth: wide ? '220px' : '180px',
        clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0% 50%)',
        border: '1px solid #D4AF37',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        boxShadow: disabled ? 'none' : s.shadow,
      }}
    >
      {children}
    </button>
  );
}

function CornerBrackets() {
  const b = '1.5px solid #D4AF37';
  const s = '15px';
  return (
    <>
      <span style={{ position: 'absolute', top: 10, left: 10, width: s, height: s, borderTop: b, borderLeft: b }} />
      <span style={{ position: 'absolute', top: 10, right: 10, width: s, height: s, borderTop: b, borderRight: b }} />
      <span style={{ position: 'absolute', bottom: 10, left: 10, width: s, height: s, borderBottom: b, borderLeft: b }} />
      <span style={{ position: 'absolute', bottom: 10, right: 10, width: s, height: s, borderBottom: b, borderRight: b }} />
    </>
  );
}

function GoldDivider({ glyph = '✦' }: { glyph?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1rem 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
      <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>{glyph}</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
    </div>
  );
}

function ParchmentCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(145deg, #120b0e 0%, #1a1718 50%, #0d120f 100%)',
        border: '1.5px solid rgba(212,175,55,0.7)',
        boxShadow: '0 16px 50px rgba(0,0,0,0.8), inset 0 0 40px rgba(43,9,16,0.4)',
        padding: '2.5rem 2rem',
        color: '#F5F3E7',
        ...style,
      }}
    >
      <CornerBrackets />
      {children}
    </div>
  );
}

function HeroSection({ onStart, onDevAccess }: { onStart: () => void; onDevAccess: () => void }) {
  return (
    <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <ParchmentCard style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <Filigrana />
        <h2 style={{ fontFamily: "Georgia, serif", color: '#D4AF37', fontSize: '2.4rem', margin: '1.2rem 0', textShadow: '0 2px 10px rgba(212,175,55,0.4)' }}>
          Quiz: O Quanto Você Sabe de Clássicos de Terror?
        </h2>
        <GoldDivider />
        <p style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', color: '#E0D8C7', fontSize: '1.15rem', margin: '1.5rem 0', lineHeight: 1.6 }}>
          Responda às 16 perguntas de trivia cinematográfica e descubra o seu nível oficial de cinéfilo(a) de terror.
        </p>
        <Filigrana flip />
        <div style={{ marginTop: '1.8rem', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <DiamondButton onClick={onStart} variant="primary" wide>Iniciar Quiz</DiamondButton>
        </div>
      </ParchmentCard>
      
      <button 
        onClick={onDevAccess}
        style={{ background: 'transparent', border: 'none', color: '#D4AF37', marginTop: '1.5rem', fontFamily: 'Georgia, serif', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.7, textDecoration: 'underline' }}
      >
        Acesso de Programadora (Participantes & Planilha)
      </button>
    </main>
  );
}

function DevLoginSection({ onLoginSuccess, onBack }: { onLoginSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lepique2026') {
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <ParchmentCard style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
        <Filigrana />
        <h2 style={{ fontFamily: "Georgia, serif", color: '#D4AF37', fontSize: '1.8rem', margin: '1.2rem 0' }}>
          Painel da Programadora
        </h2>
        <GoldDivider glyph="🔒" />
        <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Digite a senha secreta para consultar os dados salvos na sua Planilha Google.
        </p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.85rem', marginBottom: '5px', fontFamily: 'Georgia, serif' }}>Senha de Acesso:</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setError(false); }} 
              required
              placeholder="Digite a senha..."
              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid #D4AF37', color: '#F5F3E7', borderRadius: '4px', fontFamily: 'Georgia, serif' }}
            />
            {error && <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Senha incorreta. Tente novamente.</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '10px' }}>
            <DiamondButton type="submit" variant="primary">Entrar</DiamondButton>
          </div>
        </form>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#E0D8C7', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif', textDecoration: 'underline' }}>
            Voltar ao Início
          </button>
        </div>
      </ParchmentCard>
    </main>
  );
}

function DevDashboardSection({ onBack, onSelectTier }: { onBack: () => void; onSelectTier: (tier: HorrorTier) => void }) {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParticipants(data);
        } else {
          setErrorMsg('Formato de dados inesperado da planilha.');
        }
      })
      .catch(err => {
        console.error("Erro ao carregar dados do Google Sheets:", err);
        setErrorMsg('Não foi possível conectar à planilha. Verifique a URL do Script.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const tierKeys = Object.keys(tierResults) as HorrorTier[];

  return (
    <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '850px', width: '100%' }}>
        <ParchmentCard>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Filigrana />
            <h2 style={{ fontFamily: "Georgia, serif", color: '#D4AF37', fontSize: '2rem', margin: '1rem 0' }}>
              Painel Dev: Registros & Níveis de Terror
            </h2>
            <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '0.9rem' }}>
              Visualize os registros da planilha e teste as telas de resultado por nível abaixo.
            </p>
            <GoldDivider glyph="📊" />
          </div>

          {/* Tabela de Participantes */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#D4AF37', fontFamily: 'Georgia, serif', fontSize: '1.1rem', marginBottom: '8px' }}>Participantes Registrados na Planilha:</h3>
            <div style={{ maxHeight: '25vh', overflowY: 'auto', border: '1px solid rgba(212,175,55,0.3)', padding: '10px', background: 'rgba(0,0,0,0.4)' }}>
              {loading ? (
                <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#E0D8C7', padding: '1rem' }}>
                  Carregando registros da planilha...
                </p>
              ) : errorMsg ? (
                <p style={{ textAlign: 'center', color: '#ffb3b3', padding: '1rem' }}>
                  {errorMsg}
                </p>
              ) : participants.length === 0 ? (
                <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#E0D8C7', padding: '1rem' }}>
                  Nenhum registro encontrado na planilha.
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #D4AF37', color: '#D4AF37' }}>
                      <th style={{ padding: '6px' }}>Nome</th>
                      <th style={{ padding: '6px' }}>Nível / Desempenho</th>
                      <th style={{ padding: '6px' }}>Data / Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', color: '#F5F3E7' }}>
                        <td style={{ padding: '6px', fontWeight: 'bold' }}>{p.name}</td>
                        <td style={{ padding: '6px', color: '#E0D8C7' }}>{p.subgenre}</td>
                        <td style={{ padding: '6px', fontSize: '0.75rem', opacity: 0.8 }}>{p.date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Lista de Níveis para Teste Rápido */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#D4AF37', fontFamily: 'Georgia, serif', fontSize: '1.1rem', marginBottom: '8px' }}>Testar Telas de Resultado por Nível:</h3>
            <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '0.85rem', marginBottom: '12px' }}>
              Clique em qualquer nível para abrir exatamente como ele aparece no fim do quiz:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {tierKeys.map(key => {
                const item = tierResults[key];
                return (
                  <button
                    key={key}
                    onClick={() => onSelectTier(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212,175,55,0.5)',
                      color: '#F5F3E7',
                      cursor: 'pointer',
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      borderRadius: '4px',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{item.emblem}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <DiamondButton onClick={onBack} variant="secondary">Voltar ao Início</DiamondButton>
          </div>
        </ParchmentCard>
      </div>
    </main>
  );
}

function QuizSection({ onComplete }: { onComplete: (tier: HorrorTier, name: string, score: number) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [stepName, setStepName] = useState(true);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isCorrectOpt, setIsCorrectOpt] = useState<boolean | null>(null);

  const q = questions[currentIdx];

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStepName(false);
  };

  const handleSelectOption = (isCorrect: boolean, optIdx: number) => {
    setSelectedOpt(optIdx);
    setIsCorrectOpt(isCorrect);
    
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    setTimeout(() => {
      setSelectedOpt(null);
      setIsCorrectOpt(null);
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        const finalTier = calculateTier(newScore);
        onComplete(finalTier, name, newScore);
      }
    }, 900);
  };

  if (stepName) {
    return (
      <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <ParchmentCard style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <Filigrana />
          <h2 style={{ fontFamily: "Georgia, serif", color: '#D4AF37', fontSize: '1.8rem', margin: '1.2rem 0' }}>
            Identifique-se, Cinéfilo(a)
          </h2>
          <GoldDivider glyph="✒️" />
          <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Insira seu nome para que sua pontuação seja registrada na planilha.
          </p>
          <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome ou alcunha..."
              required
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #D4AF37', color: '#F5F3E7', borderRadius: '4px', fontFamily: 'Georgia, serif', fontSize: '1rem', textAlign: 'center' }}
            />
            <div style={{ marginTop: '1rem' }}>
              <DiamondButton type="submit" variant="primary">Começar Quiz</DiamondButton>
            </div>
          </form>
        </ParchmentCard>
      </main>
    );
  }

  return (
    <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '650px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D4AF37', fontFamily: 'Georgia, serif', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
          <span>Participante: <strong>{name}</strong></span>
          <span>Questão {currentIdx + 1} de {questions.length}</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(212,175,55,0.2)', marginBottom: '1.5rem', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, height: '100%', background: '#D4AF37', transition: 'width 0.3s ease' }} />
        </div>

        <ParchmentCard>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🎬</span>
            <h2 style={{ fontFamily: "Georgia, serif", color: '#D4AF37', fontSize: '1.4rem', margin: '0.8rem 0 0.4rem 0', lineHeight: 1.4 }}>
              {q.question}
            </h2>
            <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '0.9rem' }}>{q.subtitle}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              let bgStyle = 'rgba(0,0,0,0.4)';
              let borderStyle = '1px solid rgba(212,175,55,0.5)';

              if (isSelected) {
                if (opt.isCorrect) {
                  bgStyle = 'rgba(46, 125, 50, 0.7)';
                  borderStyle = '1px solid #4CAF50';
                } else {
                  bgStyle = 'rgba(183, 28, 28, 0.7)';
                  borderStyle = '1px solid #f44336';
                }
              } else if (selectedOpt !== null && opt.isCorrect) {
                bgStyle = 'rgba(46, 125, 50, 0.4)';
                borderStyle = '1px solid #4CAF50';
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOpt !== null}
                  onClick={() => handleSelectOption(opt.isCorrect, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '14px 18px',
                    background: bgStyle,
                    border: borderStyle,
                    color: '#F5F3E7',
                    textAlign: 'left',
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.95rem',
                    cursor: selectedOpt !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', color: '#D4AF37', fontWeight: 'bold' }}>{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </ParchmentCard>
      </div>
    </main>
  );
}

function DiagnosticSection({ participantName, tier, score, onNext }: { participantName: string; tier: HorrorTier; score: number; onNext: () => void }) {
  const info = tierResults[tier];

  return (
    <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <ParchmentCard style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <Filigrana />
        <h2 style={{ fontFamily: "Georgia, serif", color: '#D4AF37', fontSize: '2rem', margin: '1.2rem 0' }}>
          Resultado de {participantName}
        </h2>
        <GoldDivider glyph={info.emblem} />
        <div style={{ margin: '1.5rem 0' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>{info.emblem}</span>
          <h3 style={{ fontFamily: 'Georgia, serif', color: '#D4AF37', fontSize: '1.6rem' }}>{info.title}</h3>
          <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '1.05rem', marginTop: '0.3rem' }}>
            Acertos: <strong>{score} de {questions.length}</strong>
          </p>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', color: '#F5F3E7', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {info.description}
        </p>
        <DiamondButton onClick={onNext} variant="primary">Ver Detalhes do Nível & Recomendação</DiamondButton>
      </ParchmentCard>
    </main>
  );
}

function ResultSection({ participantName, tier, score, onRestart, isDevPreview = false }: { participantName: string; tier: HorrorTier; score: number; onRestart: () => void; isDevPreview?: boolean }) {
  const info = tierResults[tier];
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isDevPreview);

  useEffect(() => {
    if (!saved && !saving && !isDevPreview) {
      setSaving(true);
      const recordTitle = `${info.title} (${score}/${questions.length} acertos)`;
      const params = new URLSearchParams({ name: participantName, subgenre: recordTitle });
      fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`)
        .then(() => setSaved(true))
        .catch(err => console.error("Erro ao salvar na planilha:", err))
        .finally(() => setSaving(false));
    }
  }, [participantName, info.title, score, saved, saving, isDevPreview]);

  return (
    <main style={{ background: 'radial-gradient(circle at center, #1c060b 0%, #080607 100%)', minHeight: '100vh', padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '750px', width: '100%' }}>
        <ParchmentCard>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Filigrana />
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#D4AF37', fontSize: '2.2rem', margin: '1rem 0' }}>
              {info.title} {isDevPreview && '(Modo de Visualização Dev)'}
            </h2>
            <p style={{ fontStyle: 'italic', color: '#E0D8C7', fontSize: '1.1rem' }}>{info.subtitle} • {score}/{questions.length} acertos</p>
            <GoldDivider glyph={info.emblem} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={info.cover}
                alt={info.recommendedMasterpiece}
                style={{ width: '100%', maxWidth: '200px', border: '2px solid #D4AF37', boxShadow: '0 8px 25px rgba(0,0,0,0.8)', borderRadius: '4px' }}
              />
            </div>
            <div>
              <h4 style={{ color: '#D4AF37', fontFamily: 'Georgia, serif', fontSize: '1.
