'use client'
import { useState } from "react";
import { slopeDeflection } from "./beamAnalysis";
import DynamicBeamVisualization from "./DynamicBeamVisualisation";

export default function Home() {
  const [spans, setSpans] = useState(1);
  const [spanLengths, setSpanLengths] = useState([4]);
  const [loadValues, setLoadValues] = useState([[50]]);
  const [loadTypes, setLoadTypes] = useState([["point"]]);
  const [moments, setMoments] = useState(null);

  const handleSpanChange = (e) => {
    const count = Number(e.target.value);
    setSpans(count);
    setSpanLengths(Array(count).fill(4));
    setLoadValues(Array.from({ length: count }, () => [50]));
    setLoadTypes(Array.from({ length: count }, () => ["point"]));
  };

  const handleLengthChange = (index, value) => {
    setSpanLengths(prev => prev.map((len, i) => (i === index ? value : len)));
  };

  // 🔹 FIX: Ensure deep copy for load values
  const handleLoadChange = (spanIndex, value, loadIndex) => {
    setLoadValues(prevLoadValues =>
      prevLoadValues.map((spanLoads, i) =>
        i === spanIndex
          ? spanLoads.map((load, j) => (j === loadIndex ? value : load))
          : [...spanLoads]
      )
    );
  };

  const handleCalculate = () => {
    const output = slopeDeflection(
      spans,
      spans + 1,
      { A: "fixed", B: "hinged", C: "hinged" },
      ["A", "B", "C"],
      Array(spans).fill(1),
      spanLengths,
      loadTypes,
      loadValues,
      Array(spans).fill(false),
      Array.from({ length: spans }, (_, i) => `S${i + 1}`),
      Array.from({ length: spans }, () => [2]),
      Array.from({ length: spans }, () => [2])
    );
    setMoments(output);
  };

  const chartData = {
    labels: ["A", ...Array(spans).fill(null).map((_, i) => `S${i + 1}`), "D"],
    datasets: [
      {
        label: "Bending Moment Diagram",
        data: moments ? moments.map((m) => m[0]) : [],
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Shear Force Diagram",
        data: moments ? moments.map((m) => m[1]) : [],
        borderColor: "red",
        fill: false,
      },
    ],
  };

  return (
    <div className="p-5 max-w-2xl mx-auto bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Shear Force & Bending Moment Calculator</h1>

      <label className="block text-lg font-semibold">Number of Spans:</label>
      <input
        type="number"
        className="w-full p-2 border rounded mb-4"
        value={spans}
        min="1"
        max="5"
        onChange={handleSpanChange}
      />

      <div className="grid gap-4">
        {spanLengths.map((_, i) => (
          <div key={i} className="p-3 bg-white rounded shadow">
            <h2 className="font-semibold text-lg">Span {i + 1}</h2>
            <label className="block">Length:</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={spanLengths[i]}
              onChange={(e) => handleLengthChange(i, Number(e.target.value))}
            />

            <label className="block mt-2">Load Type:</label>
            <select
              className="w-full p-2 border rounded"
              value={loadTypes[i][0]}
              onChange={(e) => {
                const updated = [...loadTypes];
                updated[i] = [e.target.value];
                setLoadTypes(updated);
              }}
            >
              <option value="point">Point Load</option>
              <option value="udl">UDL</option>
            </select>

            <label className="block mt-2">Load Value:</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={loadValues[i][0]}
              onChange={(e) => handleLoadChange(i, Number(e.target.value), 0)}
            />
          </div>
        ))}
      </div>

      <button
        className="mt-5 w-full p-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
        onClick={handleCalculate}
      >
        Calculate
      </button>


      {moments && (
        <div className="mt-5">
          <DynamicBeamVisualization
            spans={spanLengths}
            supportTypes={["hinged", "hinged", "hinged"]}
            loads={loadValues.map((val, i) => ({ type: loadTypes[i][0], value: val[0], position: 2, span: i }))}
            shearForces={moments.map(m => m[1])}
            bendingMoments={moments.map(m => m[0])}
          />
        </div>
      )}




    </div>
  );
}
