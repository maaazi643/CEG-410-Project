const DynamicBeamVisualization = ({
  spans = [],
  supportTypes = [],
  loads = [],
  shearForces = [],
  bendingMoments = [],
  width = 800,
  height = 400,
  margin = 100
}) => {
  const totalLength = spans.reduce((sum, span) => sum + span, 0);
  const scale = (width - 2 * margin) / totalLength;

  const supportPositions = spans.reduce((positions, span, index) => {
    const lastPos = positions[positions.length - 1] || margin;
    return [...positions, lastPos + span * scale];
  }, [margin]);

  const renderDiagram = (data, color, yOffset, label) => (
    <g>
      <path
        d={`M ${supportPositions[0]},${height / 2 + yOffset} ${data.map((val, i) => `L ${supportPositions[i + 1]},${height / 2 + yOffset - val}`).join(" ")}`}
        stroke={color}
        fill="none"
        strokeWidth="2"
      />
      <text x={width - margin} y={height / 2 + yOffset - 10} fill={color} className="text-xs">{label}</text>
    </g>
  );

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="border border-gray-200">
      <line x1={margin} y1={height / 2} x2={width - margin} y2={height / 2} stroke="black" strokeWidth="3" />
      {supportTypes.map((type, index) => (
        <circle key={index} cx={supportPositions[index]} cy={height / 2} r="5" fill="black" />
      ))}
      {loads.map((load, index) => (
        <text key={index} x={supportPositions[load.span] + load.position * scale} y={height / 2 - 20} className="text-xs">
          {load.value}kN
        </text>
      ))}
      {renderDiagram(shearForces, "red", 80, "SFD")}
      {renderDiagram(bendingMoments, "blue", 120, "BMD")}
    </svg>
  );
};

export default DynamicBeamVisualization;
