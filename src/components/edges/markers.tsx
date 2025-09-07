export const ERMarkerTypes = {
  none: "none",
  one: "one",
  oneOptionnal: "oneOptionnal",
  many: "many",
} as const;

export const ERMakerLabels = {
  [ERMarkerTypes.none]: "",
  [ERMarkerTypes.one]: "1",
  [ERMarkerTypes.oneOptionnal]: "0..1",
  [ERMarkerTypes.many]: "*", 
} as const;

export type ERMarkerProps = {
  color?: string;
};

export const markerWidth = 20;
export const markerHeight = 10;

export default function ERMarkers({ color }: ERMarkerProps) {
  color ??= "#b1b1b7";
  return (
    <svg id="er-markers" style={{ position: "absolute", height: 0, width: 0 }}>
      <defs>
        <marker
          id={ERMarkerTypes.oneOptionnal}
          refX={0}
          refY={5}
          markerWidth={markerWidth}
          markerHeight={markerHeight}
          fill="none"
          stroke={color}
          orient="auto-start-reverse"
          viewBox={`0 0 ${markerWidth} ${markerHeight}`}
        >
          <path d="m0 5L4 5A1 1 0 0010 5 1 1 0 004 5M10 5 20 5" />
        </marker>

        <marker
          id={ERMarkerTypes.one}
          refX={0}
          refY={5}
          markerWidth={markerWidth}
          markerHeight={markerHeight}
          fill="none"
          stroke={color}
          orient="auto-start-reverse"
          viewBox={`0 0 ${markerWidth} ${markerHeight}`}
        >
          <path d="m0 5L20 5M10 1 10 9" />
        </marker>

        <marker
          id={ERMarkerTypes.many}
          refX={0}
          refY={5}
          markerWidth={markerWidth}
          markerHeight={markerHeight}
          fill="none"
          stroke={color}
          orient="auto-start-reverse"
          viewBox={`0 0 ${markerWidth} ${markerHeight}`}
        >
          <path d="m0 5L20 5M11 5 20 1M11 5 20 9" />
        </marker>

        <marker
          id={ERMarkerTypes.none}
          refX={0}
          refY={5}
          markerWidth={markerWidth}
          markerHeight={markerHeight}
          fill="none"
          stroke={color}
          orient="auto-start-reverse"
          viewBox={`0 0 ${markerWidth} ${markerHeight}`}
        >
          <path d="m0 5L20 5" />
        </marker>
      </defs>
    </svg>
  );
}
