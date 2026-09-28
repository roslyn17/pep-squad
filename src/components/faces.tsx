// Drawn character faces in the mockup's style: flat shapes, no outlines, thick rounded dark
// features, one signature prop each. Faces are drawn on a 100x100 canvas; CharacterAvatar shows
// the middle 84x84 (x 8-92, y 6-90), so keep every shape inside that area.
// Characters without a face here fall back to their placeholder icon (see CharacterAvatar).

import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

const INK = '#1F1B16';
const SKIN_WARM = '#E8A07C';
const SKIN_LIGHT = '#F2C6A0';

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

export const FACES: Record<string, () => ReactElement> = {
  'sergeant-stone': SergeantStone,
  'grandma-june': GrandmaJune,
  biscuit: Biscuit,
};
