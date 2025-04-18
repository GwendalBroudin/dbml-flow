export const ERMarkerTypes = {
  oneOptionnal: "one-optionnal",
  one: "one",
  many: "many",
};

export type ERMarkerProps = {
  color?: string;
};

export default function ERMarkers({ color }: ERMarkerProps) {
  color ??= "#b1b1b7";
  return (
    <svg style={{ position: "absolute", top: 0, left: 0 }}>
      <defs>
        <marker
          id={ERMarkerTypes.oneOptionnal}
          refX={0}
          refY={5}
          markerWidth={20}
          markerHeight={10}
          fill="none"
          stroke={color}
          orient="auto-start-reverse"
        >
          <path d="m0 5L4 5A1 1 0 0010 5 1 1 0 004 5M10 5 20 5" />
        </marker>

        <marker
          id={ERMarkerTypes.one}
          refX={0}
          refY={5}
          markerWidth={20}
          markerHeight={10}
          fill="none"
          orient="auto-start-reverse"
        >
          <path d="m0 5L20 5M10 1 10 9" />
        </marker>

        <marker
          id={ERMarkerTypes.many}
          refX={0}
          refY={5}
          markerWidth={20}
          markerHeight={10}
          fill="none"
          stroke={color}
          orient="auto-start-reverse"
        >
          <path d="m0 5L20 5M11 5 20 1M11 5 20 9" />
        </marker>
      </defs>
    </svg>
  );
}
