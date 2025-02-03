// Import mathjs
const math = require('mathjs');

// SymbolManager Class: Manages symbolic variables for equations
class SymbolManager {
    constructor() {
        this.symbols = new Map();
    }

    createSymbol(name) {
        // Store symbols as strings (simpler than using nonexistent math.symbol)
        if (!this.symbols.has(name)) {
            this.symbols.set(name, name); // Store the name directly
        }
        return this.symbols.get(name);
    }

    getSymbol(name) {
        return this.symbols.get(name);
    }
}

// Instantiate SymbolManager
const symbolManager = new SymbolManager();

// Function to parse equations and substitute values
function parseEquation(equation, substitutions) {
    let parsed = math.parse(equation);
    const transformed = parsed.transform(node => {
        if (node.isSymbolNode && substitutions[node.name] !== undefined) {
            return math.parse(substitutions[node.name].toString());
        }
        return node;
    });
    return transformed;
}

// Example equations and calculation logic
function calculateMoments(joints, members, displacements) {
    const moments = {};

    members.forEach(member => {
        const { start, end, length, stiffness } = member;

        // Define moment equations for the member
        const m1 = `(2 * ${stiffness} / ${length}) * (${symbolManager.getSymbol(start)} - ${symbolManager.getSymbol(end)})`;
        const m2 = `(2 * ${stiffness} / ${length}) * (${symbolManager.getSymbol(end)} - ${symbolManager.getSymbol(start)})`;

        // Substitute displacements
        const substitutions = { [start]: displacements[start], [end]: displacements[end] };

        // Parse and evaluate the equations
        const momentStart = parseEquation(m1, substitutions).evaluate();
        const momentEnd = parseEquation(m2, substitutions).evaluate();

        moments[start] = momentStart;
        moments[end] = momentEnd;
    });

    return moments;
}

// Main function to demonstrate slope-deflection calculations
function slopeDeflection(joints, members, displacements) {
    console.log("=== Slope-Deflection Method ===");

    // Generate symbols for each joint
    joints.forEach(joint => {
        symbolManager.createSymbol(joint);
    });

    // Calculate moments at joints
    const moments = calculateMoments(joints, members, displacements);

    console.log("Moments:", moments);
    return moments;
}

// Test Data
const joints = ['A', 'B', 'C'];
const members = [
    { start: 'A', end: 'B', length: 4, stiffness: 2 },
    { start: 'B', end: 'C', length: 3, stiffness: 3 }
];
const displacements = {
    A: 0,
    B: 0.01,
    C: -0.005
};

// Run Test
slopeDeflection(joints, members, displacements);
