const math = require('mathjs');

class SymbolManager {
    constructor() {
        this.symbols = new Map();
    }

    createSymbol(name) {
        if (!this.symbols.has(name)) {
            this.symbols.set(name, name);
        }
        return this.symbols.get(name);
    }
}

// Helper function to sum array
const sum = arr => arr.reduce((a, b) => a + b, 0);

function spansDistanceFromSupport(spanLengths, shearForceDistances) {
    const cumulativeSpan = spanLengths.map((_, index) => 
        sum(spanLengths.slice(0, index + 1))
    );
    
    const nestedList = [];
    let startIndex = 0;
    
    for (const limit of cumulativeSpan) {
        const group = [];
        for (let i = startIndex; i < shearForceDistances.length; i++) {
            if (shearForceDistances[i] <= limit) {
                group.push(shearForceDistances[i]);
            } else {
                break;
            }
        }
        nestedList.push(group);
        startIndex = Math.max(0, group.length - 1) + startIndex;
    }
    
    return nestedList;
}

function calculateFixedEndMoments(spanLength, loadType, loadValue, cantileverSpan, distanceFromLeftSupport = null) {
    let femAB = 0;
    let femBA = 0;
    
    for (let i = 0; i < loadType.length; i++) {
        if (cantileverSpan) {
            if (loadType[i] === "point") {
                femAB = loadValue[i] * distanceFromLeftSupport[i];
            } else if (loadType[i] === "udl") {
                femAB = loadValue[i] * spanLength * (spanLength / 2);
            }
        }

        if (loadType[i] === 'udl') {
            const w = loadValue[i];
            femAB += (-w * Math.pow(spanLength, 2)) / 12;
            femBA += (w * Math.pow(spanLength, 2)) / 12;
        } else if (loadType[i] === 'point') {
            const p = loadValue[i];
            const a = distanceFromLeftSupport[i];
            const b = spanLength - a;
            const term1 = (-p * a * Math.pow(b, 2)) / Math.pow(spanLength, 2);
            const term2 = (p * Math.pow(a, 2) * b) / Math.pow(spanLength, 2);
            femAB += term1;
            femBA += term2;
        }
    }
    
    return [femAB, femBA];
}

function solveEquations(reactionSymbols, loadValue, spanLength, distanceFromLeftSupport, cantileverSpan) {
    try {
        if (cantileverSpan) {
            return { [reactionSymbols[0]]: sum(loadValue) };
        }

        const totalLoad = sum(loadValue);
        let momentSum = 0;
        loadValue.forEach((load, index) => {
            momentSum += load * (spanLength - distanceFromLeftSupport[index]);
        });

        // Solve using simple algebra for a 2-equation system
        const R1 = momentSum / spanLength;
        const R2 = totalLoad - R1;

        return {
            [reactionSymbols[0]]: R1,
            [reactionSymbols[1]]: R2
        };
    } catch (error) {
        console.error('Error solving equations:', error);
        return {};
    }
}

function calculateMoments(fixedEndMoments, spanLabels, spanLengths, supportTypes, EIs, cantileverSpans) {
    try {
        const momentsList = [];
        
        for (let i = 0; i < spanLabels.length; i++) {
            if (cantileverSpans[i]) {
                momentsList.push([0, 0]);
                continue;
            }

            const label = spanLabels[i];
            const L = spanLengths[i];
            const EI = EIs[i];
            const FEM1 = fixedEndMoments.get(`FEM_${label}`) || 0;
            const FEM2 = fixedEndMoments.get(`FEM_${label.split('').reverse().join('')}`) || 0;

            // For simplification, we'll assume fixed-end condition
            // This is a simplified approach - you might want to expand this
            // based on your specific requirements
            const M1 = FEM1;
            const M2 = FEM2;

            momentsList.push([M1, M2]);
        }

        return momentsList;
    } catch (error) {
        console.error('Error calculating moments:', error);
        return spanLabels.map(() => [0, 0]);
    }
}

function calculateReactionsAndShearForce(
    numberOfSpans,
    numberOfSupports,
    spanLengths,
    loadTypes,
    loadValues,
    cantileverSpans,
    spanLabels,
    distancesFromLeftSupport,
    distancesFromLeftOfBeam,
    momentList
) {
    const symbolManager = new SymbolManager();
    const supportReactionsList = [];
    const supportReactionsMap = new Map();

    for (let i = 0; i < spanLengths.length; i++) {
        const spanLength = spanLengths[i];
        const spanLabel = spanLabels[i];
        const loadType = loadTypes[i];
        const spanLoadValues = loadValues[i];
        const loadValue = [];
        const cantileverSpan = cantileverSpans[i];
        const distanceFromLeftSupport = distancesFromLeftSupport[i];

        // Convert udl to point load
        for (let j = 0; j < spanLoadValues.length; j++) {
            if (loadType[j] === "udl") {
                const load = spanLoadValues[j] * spanLength;
                loadValue.push(load);
                distanceFromLeftSupport[j] = spanLength / 2;
            } else {
                loadValue.push(spanLoadValues[j]);
            }
        }

        const reactionSymbols = [];
        const r1 = symbolManager.createSymbol(`R_${spanLabel[0]}`);
        reactionSymbols.push(r1);
        
        if (!cantileverSpan) {
            const r2 = symbolManager.createSymbol(`R_${spanLabel[1]}`);
            reactionSymbols.push(r2);
        }

        const solutions = solveEquations(reactionSymbols, loadValue, spanLength, distanceFromLeftSupport, cantileverSpan);
        supportReactionsList.push(solutions);
    }

    // Combine reactions
    for (const solution of supportReactionsList) {
        for (const [key, value] of Object.entries(solution)) {
            supportReactionsMap.set(key, (supportReactionsMap.get(key) || 0) + value);
        }
    }

    return Array.from(supportReactionsMap.values());
}

function slopeDeflection(
    numberOfSpans,
    numberOfSupports,
    supportTypes,
    supportLabels,
    EIs,
    spanLengths,
    loadTypes,
    loadValues,
    cantileverSpans,
    spanLabels,
    distancesFromLeftSupport,
    distancesFromLeftOfBeam
) {
    const fixedEndMoments = new Map();
    const fixedEndMomentsList = [];

    // Calculate fixed end moments
    for (let i = 0; i < spanLengths.length; i++) {
        const spanLength = spanLengths[i];
        const loadType = loadTypes[i];
        const loadValue = loadValues[i];
        const cantileverSpan = cantileverSpans[i];
        const spanLabel = spanLabels[i];
        const distanceFromLeftSupport = distancesFromLeftSupport[i];

        const fixedEndMoment = calculateFixedEndMoments(
            spanLength,
            loadType,
            loadValue,
            cantileverSpan,
            distanceFromLeftSupport
        );

        fixedEndMomentsList.push(fixedEndMoment);
        fixedEndMoments.set(`FEM_${spanLabel}`, fixedEndMoment[0]);
        fixedEndMoments.set(`FEM_${spanLabel.split('').reverse().join('')}`, fixedEndMoment[1]);
    }

    const momentsList = calculateMoments(
        fixedEndMoments,
        spanLabels,
        spanLengths,
        supportTypes,
        EIs,
        cantileverSpans
    );

    const reactions = calculateReactionsAndShearForce(
        numberOfSpans,
        numberOfSupports,
        spanLengths,
        loadTypes,
        loadValues,
        cantileverSpans,
        spanLabels,
        distancesFromLeftSupport,
        distancesFromLeftOfBeam,
        momentsList
    );

    console.log("Moments List:", momentsList);
    console.log("Support reactions:", reactions);

    return momentsList;
}

// Example usage:
const beam = slopeDeflection(
    3,                              // number_of_spans
    3,                              // number_of_supports
    { A: "fixed", B: "hinged", C: "hinged" }, // support_types
    ["A", "B", "C"],               // support_labels
    [1, 1, 1],                     // EIs
    [4, 5, 2],                     // span_lengths
    [["point"], ["udl"], ["point"]], // load_types
    [[72], [24], [15]],           // load_values
    [false, false, true],          // cantilever_spans
    ["AB", "BC", "CD"],           // span_labels
    [[2], [0], [2]],              // distances_from_left_support
    [[2], [4], [11]]              // distances_from_left_of_beam
);

console.log(beam);

module.exports = {
    slopeDeflection,
    calculateFixedEndMoments,
    calculateReactionsAndShearForce,
    spansDistanceFromSupport
};