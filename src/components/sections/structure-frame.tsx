/*
 * Engineering-drawing style structural frame (columns, beams, footings,
 * grid axes, section mark A–A, dimension line). Static in phase 1; every
 * stroke carries pathLength=1 and a `data-draw` order so phase 5 can draw it
 * with stroke-dashoffset without touching the geometry.
 */
const COLS = [60, 180, 300, 420];
const LEVELS = [460, 360, 260, 160, 70]; // ground → roof (y)
const AXES = ["1", "2", "3", "4"];

export function StructureFrame({ title, className }: { title: string; className?: string }) {
  return (
    <svg viewBox="0 0 480 560" role="img" aria-label={title} className={className} fill="none">
      {/* Footings */}
      <g stroke="var(--slate-500)" strokeWidth="1.5">
        {COLS.map((x) => (
          <rect key={x} x={x - 22} y={462} width={44} height={18} rx={2} pathLength={1} data-draw="1" />
        ))}
        <line x1={20} y1={462} x2={460} y2={462} strokeDasharray="6 6" />
      </g>

      {/* Columns */}
      <g stroke="var(--pine-600)" strokeWidth="5" strokeLinecap="square">
        {COLS.map((x) => (
          <line key={x} x1={x} y1={LEVELS[0]} x2={x} y2={LEVELS[LEVELS.length - 1]} pathLength={1} data-draw="2" />
        ))}
      </g>

      {/* Beams / slabs */}
      <g stroke="var(--ink)" strokeWidth="3" strokeLinecap="square">
        {LEVELS.slice(1).map((y) => (
          <line key={y} x1={COLS[0] - 18} y1={y} x2={COLS[COLS.length - 1] + 18} y2={y} pathLength={1} data-draw="3" />
        ))}
      </g>

      {/* Shear wall hatching in one bay */}
      <g stroke="var(--sage-300)" strokeWidth="1">
        {Array.from({ length: 13 }, (_, i) => {
          const y = LEVELS[LEVELS.length - 1] + 10 + i * 30;
          return <line key={i} x1={302} y1={y} x2={418} y2={y - 40} pathLength={1} data-draw="4" />;
        })}
      </g>

      {/* Grid axes with bubbles */}
      <g stroke="var(--slate-500)" strokeWidth="1" strokeDasharray="2 5">
        {COLS.map((x) => (
          <line key={x} x1={x} y1={30} x2={x} y2={60} />
        ))}
      </g>
      <g fontFamily="var(--font-mono)" fontSize="11" fill="var(--pine-700)" textAnchor="middle">
        {COLS.map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={18} r={11} stroke="var(--pine-700)" strokeWidth="1" fill="var(--paper)" />
            <text x={x} y={22}>
              {AXES[i]}
            </text>
          </g>
        ))}
      </g>

      {/* Section mark A–A */}
      <g stroke="var(--ink)" strokeWidth="1.5" fontFamily="var(--font-mono)" fontSize="12" fill="var(--ink)">
        <line x1={8} y1={310} x2={472} y2={310} strokeDasharray="14 4 2 4" stroke="var(--slate-500)" strokeWidth="1" />
        <path d="M8 296v14h12" />
        <path d="M472 296v14h-12" />
        <text x={8} y={290} stroke="none">
          A
        </text>
        <text x={466} y={290} stroke="none">
          A
        </text>
      </g>

      {/* Dimension line */}
      <g stroke="var(--pine-700)" strokeWidth="1">
        <line x1={COLS[0]} y1={515} x2={COLS[COLS.length - 1]} y2={515} pathLength={1} data-draw="5" />
        {COLS.map((x) => (
          <line key={x} x1={x} y1={500} x2={x} y2={525} />
        ))}
        <path d={`M${COLS[0] + 10} 511 l-10 4 10 4`} />
        <path d={`M${COLS[COLS.length - 1] - 10} 511 l10 4 -10 4`} />
      </g>
    </svg>
  );
}
