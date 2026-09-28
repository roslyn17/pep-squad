// Drawn character faces in the mockup's style: flat shapes, no outlines, thick rounded dark
// features, one signature prop each. Faces are drawn on a 100x100 canvas; CharacterAvatar shows
// the middle 84x84 (x 8-92, y 6-90), so keep every shape inside that area.
// Characters without a face here fall back to their placeholder icon (see CharacterAvatar).

import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

const INK = '#1F1B16';
const SKIN_WARM = '#E8A07C';
const SKIN_LIGHT = '#F2C6A0';
const SKIN_MEDIUM = '#D9A273';
const SKIN_TAN = '#C48558';
const SKIN_DEEP = '#8D5A3B';
const WHITE = '#FBF6EE';
const GOLD = '#F4C56A';

// Shared stroke settings for eyebrows, mouths, and glasses.
const line = { stroke: INK, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' };

function SergeantStone() {
  return (
    <G>
      <Circle cx={50} cy={56} r={32} fill={SKIN_WARM} />
      {/* Army cap: crown plus brim */}
      <Rect x={24} y={14} width={52} height={20} rx={6} fill="#4F5E3A" />
      <Rect x={17} y={30} width={66} height={9} rx={4.5} fill="#435230" />
      {/* Angry brows slanting down toward the middle */}
      <Path d="M31 47 L44 52" {...line} />
      <Path d="M69 47 L56 52" {...line} />
      <Circle cx={39} cy={57} r={3.6} fill={INK} />
      <Circle cx={61} cy={57} r={3.6} fill={INK} />
      {/* Flat, stern mouth */}
      <Path d="M40 72 L60 72" {...line} />
    </G>
  );
}

function GrandmaJune() {
  return (
    <G>
      {/* Hair bun, then face, then gray hair */}
      <Circle cx={50} cy={17} r={10} fill="#D8D4CE" />
      <Circle cx={50} cy={55} r={31} fill={SKIN_LIGHT} />
      {/* Hair covers the whole top of the head, down to a soft wave over the forehead */}
      <Path
        d="M18 56 A32 32 0 0 1 82 56 C77 47 68 42 58 44 C54 41 46 41 42 44 C32 42 23 47 18 56 Z"
        fill="#D8D4CE"
      />
      {/* Round glasses */}
      <Circle cx={39} cy={55} r={8} {...line} strokeWidth={4.5} />
      <Circle cx={61} cy={55} r={8} {...line} strokeWidth={4.5} />
      <Path d="M47 55 L53 55" {...line} strokeWidth={4.5} />
      <Circle cx={39} cy={55} r={2.4} fill={INK} />
      <Circle cx={61} cy={55} r={2.4} fill={INK} />
      {/* Warm smile */}
      <Path d="M40 71 Q50 79 60 71" {...line} />
    </G>
  );
}

function Biscuit() {
  return (
    <G>
      <Circle cx={50} cy={52} r={34} fill="#F2C063" />
      {/* Floppy ears drawn on top of the head edges, like the mockup */}
      <Ellipse cx={20} cy={52} rx={10} ry={19} fill="#D69A3A" />
      <Ellipse cx={80} cy={52} rx={10} ry={19} fill="#D69A3A" />
      <Circle cx={40} cy={48} r={4.4} fill={INK} />
      <Circle cx={60} cy={48} r={4.4} fill={INK} />
      {/* Nose and a little pink tongue */}
      <Ellipse cx={50} cy={60} rx={6} ry={4.5} fill={INK} />
      <Path d="M44 68 Q50 76 56 68 Z" fill="#E88A8A" />
    </G>
  );
}

// Two round eyes at the usual spot.
function Eyes({ y = 56, r = 3.6, dx = 11 }: { y?: number; r?: number; dx?: number }) {
  return (
    <G>
      <Circle cx={50 - dx} cy={y} r={r} fill={INK} />
      <Circle cx={50 + dx} cy={y} r={r} fill={INK} />
    </G>
  );
}

function SirReginald() {
  return (
    <G>
      {/* Elizabethan ruff collar under the chin */}
      <Ellipse cx={50} cy={82} rx={30} ry={8} fill={WHITE} />
      <Circle cx={50} cy={52} r={29} fill={SKIN_LIGHT} />
      {/* Swept-back dramatic hair */}
      <Path d="M20 52 A30 30 0 0 1 80 50 C74 40 62 36 52 40 C44 34 32 38 20 52 Z" fill="#5A3A28" />
      <Path d="M52 24 C62 16 76 20 78 30 C70 24 60 24 52 24 Z" fill="#5A3A28" />
      {/* One brow raised in theatrical despair */}
      <Path d="M32 46 Q38 40 45 45" {...line} />
      <Path d="M56 49 L68 48" {...line} />
      <Eyes y={54} />
      {/* Curled mustache */}
      <Path d="M50 66 C44 62 36 64 34 70 C38 67 44 68 50 68 C56 68 62 67 66 70 C64 64 56 62 50 66 Z" fill="#5A3A28" />
      <Path d="M44 74 Q50 78 56 74" {...line} strokeWidth={4} />
    </G>
  );
}

function MrWhiskers() {
  return (
    <G>
      {/* Ears, then head */}
      <Polygon points="22,42 22,12 42,26" fill="#8F8983" />
      <Polygon points="78,42 78,12 58,26" fill="#8F8983" />
      <Polygon points="25,34 25,19 35,26" fill="#E8B4B0" />
      <Polygon points="75,34 75,19 65,26" fill="#E8B4B0" />
      <Circle cx={50} cy={54} r={32} fill="#A7A29C" />
      {/* Half-closed, unimpressed eyes */}
      <Path d="M32 52 L46 52" {...line} />
      <Path d="M54 52 L68 52" {...line} />
      <Path d="M35 52 Q39 58 43 52 Z" fill={INK} />
      <Path d="M57 52 Q61 58 65 52 Z" fill={INK} />
      {/* Nose, flat mouth, whiskers */}
      <Path d="M46 63 L54 63 L50 68 Z" fill="#D98A8A" />
      <Path d="M44 74 L56 74" {...line} strokeWidth={4} />
      <Path d="M12 62 L30 65 M12 72 L30 70 M88 62 L70 65 M88 72 L70 70" {...line} strokeWidth={2.5} />
    </G>
  );
}

function LadyAshworth() {
  return (
    <G>
      {/* Ghost body with a wavy hem */}
      <Path
        d="M20 50 C20 22 80 22 80 50 L80 84 Q74 76 68 84 Q62 92 56 84 Q50 76 44 84 Q38 92 32 84 Q26 76 20 84 Z"
        fill="#FFFFFF"
        stroke="#C9C0D8"
        strokeWidth={2}
      />
      {/* Victorian hair bun and a tiny lace cap */}
      <Circle cx={50} cy={16} r={8} fill="#CFC8DA" />
      <Path d="M30 36 Q50 22 70 36" {...line} stroke="#CFC8DA" strokeWidth={6} />
      {/* Weary, half-lidded eyes and a prim little mouth */}
      <Path d="M34 50 L46 50" {...line} strokeWidth={4} />
      <Path d="M54 50 L66 50" {...line} strokeWidth={4} />
      <Path d="M36 50 Q40 56 44 50 Z" fill={INK} />
      <Path d="M56 50 Q60 56 64 50 Z" fill={INK} />
      <Ellipse cx={50} cy={66} rx={4} ry={3} fill={INK} />
    </G>
  );
}

function CaptainBarnacle() {
  return (
    <G>
      <Circle cx={50} cy={56} r={30} fill={SKIN_TAN} />
      {/* Full red pirate beard covering the lower face */}
      <Path d="M19.6 60 A30.5 30.5 0 0 0 80.4 60 C72 66 62 64 50 66 C38 64 28 66 19.6 60 Z" fill="#B5562E" />
      {/* Tricorn hat with a skull-and-crossbones mark */}
      <Path d="M12 38 Q50 4 88 38 Q50 28 12 38 Z" fill="#2B2521" />
      <Circle cx={50} cy={24} r={4} fill={WHITE} />
      <Path d="M44 30 L56 34 M56 30 L44 34" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
      {/* Eyepatch with strap, one eye, and a grin */}
      <Path d="M24 44 L76 58" stroke={INK} strokeWidth={3} />
      <Circle cx={61} cy={54} r={8} fill={INK} />
      <Circle cx={39} cy={54} r={3.6} fill={INK} />
      <Path d="M42 74 Q50 80 58 74" {...line} strokeWidth={4} />
    </G>
  );
}

function Unit7() {
  return (
    <G>
      {/* Antenna */}
      <Path d="M50 26 L50 14" {...line} stroke="#6E8290" />
      <Circle cx={50} cy={12} r={5} fill="#E86A5A" />
      {/* Rounded square head with side bolts */}
      <Rect x={12} y={44} width={8} height={16} rx={3} fill="#6E8290" />
      <Rect x={80} y={44} width={8} height={16} rx={3} fill="#6E8290" />
      <Rect x={18} y={24} width={64} height={60} rx={14} fill="#9FB3C0" />
      {/* Glowing screen eyes */}
      <Rect x={30} y={42} width={14} height={10} rx={3} fill="#5FE0E6" />
      <Rect x={56} y={42} width={14} height={10} rx={3} fill="#5FE0E6" />
      {/* Speaker-grille mouth */}
      <Rect x={34} y={64} width={32} height={10} rx={4} fill="#6E8290" />
      <Path d="M42 64 L42 74 M50 64 L50 74 M58 64 L58 74" stroke="#9FB3C0" strokeWidth={2.5} />
    </G>
  );
}

function Brody() {
  return (
    <G>
      <Circle cx={50} cy={56} r={30} fill={SKIN_TAN} />
      {/* Messy sun-bleached hair swooping to one side */}
      <Path d="M18 50 C16 22 60 14 82 36 C72 32 70 40 60 36 C54 44 44 34 36 42 C30 38 24 44 18 50 Z" fill="#F2D06B" />
      {/* Chill sunglasses */}
      <Rect x={27} y={48} width={20} height={11} rx={5} fill={INK} />
      <Rect x={53} y={48} width={20} height={11} rx={5} fill={INK} />
      <Path d="M47 52 L53 52" {...line} strokeWidth={3} />
      <Path d="M31 51 L37 51" stroke="#5B6A74" strokeWidth={2} strokeLinecap="round" />
      {/* Easy grin */}
      <Path d="M38 69 Q50 79 62 69" {...line} />
    </G>
  );
}

function QueenMarigold() {
  return (
    <G>
      {/* Dark hair behind the face */}
      <Circle cx={50} cy={54} r={34} fill="#2E211B" />
      <Circle cx={50} cy={58} r={28} fill={SKIN_DEEP} />
      {/* Gold crown with jewels */}
      <Path d="M26 34 L28 12 L39 24 L50 8 L61 24 L72 12 L74 34 Z" fill={GOLD} />
      <Circle cx={50} cy={26} r={3.5} fill="#E86A8A" />
      <Circle cx={36} cy={30} r={2.5} fill="#6AB0E8" />
      <Circle cx={64} cy={30} r={2.5} fill="#6AB0E8" />
      <Eyes y={56} r={3.4} dx={10} />
      {/* Regal little smile and gold earrings */}
      <Path d="M43 70 Q50 75 57 70" {...line} strokeWidth={4} />
      <Circle cx={21} cy={66} r={3.5} fill={GOLD} />
      <Circle cx={79} cy={66} r={3.5} fill={GOLD} />
    </G>
  );
}

function MadameZora() {
  return (
    <G>
      <Circle cx={50} cy={56} r={30} fill={SKIN_MEDIUM} />
      {/* Purple headscarf with a gem, knotted at the side */}
      <Path d="M18 50 C18 18 82 18 82 50 C72 38 28 38 18 50 Z" fill="#7B4FA0" />
      <Circle cx={84} cy={50} r={5} fill="#7B4FA0" />
      <Circle cx={50} cy={34} r={4.5} fill={GOLD} />
      {/* Big gold hoop earrings */}
      <Circle cx={20} cy={70} r={6} fill="none" stroke={GOLD} strokeWidth={3} />
      <Circle cx={80} cy={70} r={6} fill="none" stroke={GOLD} strokeWidth={3} />
      {/* Mysterious half-lidded eyes and a knowing smile */}
      <Path d="M32 55 L46 55" {...line} strokeWidth={4} />
      <Path d="M54 55 L68 55" {...line} strokeWidth={4} />
      <Path d="M35 55 Q39 61 43 55 Z" fill={INK} />
      <Path d="M57 55 Q61 61 65 55 Z" fill={INK} />
      <Path d="M42 70 Q52 76 60 68" {...line} strokeWidth={4} />
    </G>
  );
}

function KevinFromAccounting() {
  return (
    <G>
      {/* Shirt collar and tie */}
      <Path d="M30 78 L50 86 L70 78 L70 90 L30 90 Z" fill={WHITE} />
      <Path d="M46 80 L54 80 L56 90 L44 90 Z" fill="#3E6BA8" />
      <Circle cx={50} cy={48} r={29} fill={SKIN_LIGHT} />
      {/* Neat side-parted hair */}
      <Path d="M21 44 C20 18 80 16 79 42 C74 30 60 26 44 30 C34 32 26 36 21 44 Z" fill="#6B4A32" />
      {/* Rectangular glasses */}
      <Rect x={29} y={44} width={17} height={12} rx={3} {...line} strokeWidth={3.5} />
      <Rect x={54} y={44} width={17} height={12} rx={3} {...line} strokeWidth={3.5} />
      <Path d="M46 50 L54 50" {...line} strokeWidth={3.5} />
      <Circle cx={37.5} cy={50} r={2.6} fill={INK} />
      <Circle cx={62.5} cy={50} r={2.6} fill={INK} />
      {/* Polite office smile */}
      <Path d="M42 64 Q50 69 58 64" {...line} strokeWidth={4} />
    </G>
  );
}

function TheNarrator() {
  return (
    <G>
      <Circle cx={50} cy={58} r={29} fill={SKIN_WARM} />
      {/* Khaki safari hat */}
      <Ellipse cx={50} cy={36} rx={40} ry={8} fill="#B8A06A" />
      <Path d="M28 36 C28 14 72 14 72 36 Z" fill="#C9B07A" />
      <Rect x={28} y={30} width={44} height={5} fill="#8F7A4C" />
      {/* Calm, observant eyes and a gentle smile */}
      <Eyes y={54} r={3.2} />
      {/* Distinguished gray mustache over a gentle smile */}
      <Path d="M50 64 C44 60 36 62 34 67 C40 66 44 68 50 68 C56 68 60 66 66 67 C64 62 56 60 50 64 Z" fill="#8F8A84" />
      <Path d="M44 73 Q50 76 56 73" {...line} strokeWidth={4} />
    </G>
  );
}

function Gerald() {
  return (
    <G>
      {/* Leaves sprouting from the top */}
      <Path d="M50 40 C38 36 28 22 36 10 C46 16 52 28 50 40 Z" fill="#5FA05A" />
      <Path d="M50 40 C62 34 74 24 70 12 C58 16 50 28 50 40 Z" fill="#78B870" />
      {/* Terracotta pot with a face */}
      <Rect x={20} y={38} width={60} height={10} rx={3} fill="#B8603E" />
      <Path d="M24 46 L76 46 L70 86 L30 86 Z" fill="#D4774E" />
      <Eyes y={60} r={3.4} dx={10} />
      <Path d="M43 72 Q50 77 57 72" {...line} strokeWidth={4} />
    </G>
  );
}

function BaronVonProcrastin() {
  return (
    <G>
      {/* High collar, then pale face */}
      <Path d="M18 90 L26 68 L50 80 L74 68 L82 90 Z" fill="#6A2140" />
      <Circle cx={50} cy={52} r={29} fill="#E4DCCB" />
      {/* Slicked-back hair with a sharp widow's peak */}
      <Path d="M21 48 C20 18 80 18 79 48 C74 34 62 30 50 42 C38 30 26 34 21 48 Z" fill="#231C22" />
      {/* Scheming brows, one eye behind a monocle */}
      <Path d="M31 48 L44 52" {...line} />
      <Path d="M56 52 L69 46" {...line} />
      <Circle cx={39} cy={57} r={3.4} fill={INK} />
      <Circle cx={61} cy={57} r={3.4} fill={INK} />
      <Circle cx={61} cy={57} r={8} fill="none" stroke={GOLD} strokeWidth={3} />
      <Path d="M68 61 L74 76" stroke={GOLD} strokeWidth={2} />
      {/* Twirly mustache and a sly smirk */}
      <Path d="M36 66 Q42 62 50 66 Q58 62 64 66 Q62 72 56 68 Q50 70 44 68 Q38 72 36 66 Z" fill="#231C22" />
      <Path d="M44 74 Q52 78 58 72" {...line} strokeWidth={4} />
    </G>
  );
}

function CoachDale() {
  return (
    <G>
      <Circle cx={50} cy={56} r={30} fill={SKIN_DEEP} />
      {/* Red cap with brim */}
      <Path d="M20 44 C20 16 80 16 80 44 Z" fill="#D2443A" />
      <Rect x={50} y={39} width={36} height={7} rx={3.5} fill="#B03228" />
      {/* Headset with a mic */}
      <Rect x={16} y={48} width={8} height={16} rx={4} fill={INK} />
      <Path d="M22 62 Q28 76 40 76" stroke={INK} strokeWidth={3} fill="none" />
      <Circle cx={41} cy={76} r={3} fill={INK} />
      {/* Excited eyes and a big shouting mouth */}
      <Path d="M32 53 L44 51 M56 51 L68 53" {...line} strokeWidth={4} />
      <Eyes y={59} />
      <Path d="M42 68 L58 68 Q58 82 50 82 Q42 82 42 68 Z" fill={INK} />
      <Path d="M45 76 Q50 73 55 76 Q55 81 50 81 Q45 81 45 76 Z" fill="#E88A8A" />
    </G>
  );
}

function ToddlerTess() {
  return (
    <G>
      {/* Pigtails with pink bows */}
      <Circle cx={18} cy={42} r={10} fill="#8A5A36" />
      <Circle cx={82} cy={42} r={10} fill="#8A5A36" />
      <Path d="M20 30 L12 24 L12 36 Z M20 30 L28 24 L28 36 Z" fill="#F07AA0" />
      <Path d="M80 30 L72 24 L72 36 Z M80 30 L88 24 L88 36 Z" fill="#F07AA0" />
      <Circle cx={50} cy={56} r={30} fill={SKIN_MEDIUM} />
      {/* Bangs */}
      <Path d="M22 50 C22 22 78 22 78 50 C70 40 60 44 50 40 C40 44 30 40 22 50 Z" fill="#8A5A36" />
      {/* Big sparkly eyes, rosy cheeks, huge happy mouth */}
      <Circle cx={39} cy={57} r={5} fill={INK} />
      <Circle cx={61} cy={57} r={5} fill={INK} />
      <Circle cx={40.5} cy={55.5} r={1.6} fill={WHITE} />
      <Circle cx={62.5} cy={55.5} r={1.6} fill={WHITE} />
      <Circle cx={30} cy={67} r={4} fill="#F09A9A" opacity={0.7} />
      <Circle cx={70} cy={67} r={4} fill="#F09A9A" opacity={0.7} />
      <Path d="M40 68 Q50 84 60 68 Z" fill={INK} />
    </G>
  );
}

function FutureYou() {
  return (
    <G>
      <Circle cx={50} cy={56} r={30} fill={SKIN_MEDIUM} />
      {/* Sleek silver hair */}
      <Path d="M18 56 A32 32 0 0 1 82 56 C74 44 62 40 50 42 C38 40 26 44 18 56 Z" fill="#C9CCD6" />
      {/* Futuristic visor */}
      <Rect x={24} y={48} width={52} height={12} rx={6} fill="#6AD1E0" />
      <Path d="M30 52 L42 52" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
      {/* Knowing smile and a little sparkle */}
      <Path d="M40 70 Q50 77 60 70" {...line} strokeWidth={4} />
      <Path d="M80 18 L82 24 L88 26 L82 28 L80 34 L78 28 L72 26 L78 24 Z" fill={GOLD} />
    </G>
  );
}

function CommanderNova() {
  return (
    <G>
      {/* Space helmet with an antenna and a mission badge */}
      <Path d="M76 20 L82 10" stroke="#9AA5B4" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={83} cy={9} r={3} fill="#E86A5A" />
      <Circle cx={50} cy={52} r={38} fill="#E8ECF2" />
      <Circle cx={50} cy={52} r={27} fill="#2B3A55" />
      <Circle cx={50} cy={54} r={22} fill={SKIN_TAN} />
      <Circle cx={22} cy={76} r={5} fill="#E86A5A" />
      {/* Confident eyes and smile */}
      <Path d="M36 46 L46 45 M54 45 L64 46" {...line} strokeWidth={3.5} />
      <Eyes y={52} r={3} dx={9} />
      <Path d="M42 63 Q50 69 58 63" {...line} strokeWidth={4} />
      {/* Visor shine */}
      <Path d="M30 34 Q36 28 44 27" stroke={WHITE} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
    </G>
  );
}

function ChefAntoine() {
  return (
    <G>
      {/* Tall puffy chef's hat */}
      <Path
        d="M29 42 L29 30 C18 30 18 12 32 15 C34 5 66 5 68 15 C82 12 82 30 71 30 L71 42 Z"
        fill="#FFFFFF"
        stroke="#E0D8CC"
        strokeWidth={2}
      />
      <Circle cx={50} cy={60} r={27} fill={SKIN_LIGHT} />
      <Rect x={26} y={36} width={48} height={8} rx={3} fill="#E6E0D6" />
      {/* Happy closed eyes, rosy cheeks */}
      <Path d="M34 56 Q39 51 44 56 M56 56 Q61 51 66 56" {...line} strokeWidth={4} />
      <Circle cx={32} cy={66} r={4} fill="#F09A9A" opacity={0.7} />
      <Circle cx={68} cy={66} r={4} fill="#F09A9A" opacity={0.7} />
      {/* Grand curly mustache over a smile */}
      <Path d="M50 66 C44 62 34 62 30 70 C34 66 40 70 50 70 C60 70 66 66 70 70 C66 62 56 62 50 66 Z" fill={INK} />
      <Path d="M44 76 Q50 80 56 76" {...line} strokeWidth={3.5} />
    </G>
  );
}

export const FACES: Record<string, () => ReactElement> = {
  'sergeant-stone': SergeantStone,
  'grandma-june': GrandmaJune,
  biscuit: Biscuit,
  'sir-reginald': SirReginald,
  'mr-whiskers': MrWhiskers,
  'lady-ashworth': LadyAshworth,
  'captain-barnacle': CaptainBarnacle,
  'unit-7': Unit7,
  brody: Brody,
  'queen-marigold': QueenMarigold,
  'madame-zora': MadameZora,
  'kevin-from-accounting': KevinFromAccounting,
  'the-narrator': TheNarrator,
  gerald: Gerald,
  'baron-von-procrastin': BaronVonProcrastin,
  'coach-dale': CoachDale,
  'toddler-tess': ToddlerTess,
  'future-you': FutureYou,
  'commander-nova': CommanderNova,
  'chef-antoine': ChefAntoine,
};
