"use client";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { slopeDeflection } from "./beamanalysis/app/beamAnalysis"; // Import function

export default function BeamCalculator() {
  const [spans, setSpans] = useState(3);
  const [spanLengths, setSpanLengths] = useState([4, 5, 2]);
  const [loadValues, setLoadValues] = useState([[72], [24], [15]]);
  const [moments, setMoments] = useState(null);

  const handleCalculate = () => {
    const output = slopeDeflection(
      spans,
      spans,
      { A: "fixed", B: "hinged", C: "hinged" },
      ["A", "B", "C"],
      [1, 1, 1],
      spanLengths,
      [["point"], ["udl"], ["point"]],
      loadValues,
      [false, false, true],
      ["AB", "BC", "CD"],
      [[2], [0], [2]],
      [[2], [4], [11]]
    );
    setMoments(output);
  };

  const chartData = {
    labels: ["A", "B", "C", "D"],
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
    <div className="p-5 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">
        Shear Force & Bending Moment Calculator
      </h1>
      <button
        className="mt-3 p-2 bg-blue-500 text-white rounded"
        onClick={handleCalculate}
      >
        Calculate
      </button>
      {moments && <Line data={chartData} className="mt-5" />}
    </div>
  );
}
