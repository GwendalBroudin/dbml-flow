export const ERMarkerTypes = {
  none: "none",
  oneOptionnal: "one-optionnal",
  one: "one",
  many: "many",
};

export type ERMarkerProps = {
  color?: string;
};

export const markerWidth = 20;
export const markerHeight = 10;

export default function ERMarkers({ color }: ERMarkerProps) {
  color ??= "#b1b1b7";
  return (
    <svg style={{ position: "absolute", height: 0, width: 0 }}>
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
      </defs>
    </svg>
  );
}
