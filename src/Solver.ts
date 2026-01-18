export class Solver {
  private coefficients: number[][];
  private costs: number[];
  private constraints: number[];

  constructor(coefficients: number[][], costs: number[], constraints: number[]) {
    this.coefficients = coefficients;
    this.costs = costs;
    this.constraints = constraints;
  }

  public solve(): { solution: number[]; optimalValue: number; status: string } {
    console.log('Solving with data:');
    console.log('Coefficients:', this.coefficients);
    console.log('Costs:', this.costs);
    console.log('Constraints:', this.constraints);

    try {
      // Validate input dimensions
      if (this.coefficients.length === 0 || !this.coefficients[0] || this.coefficients[0].length === 0) {
        return { solution: [], optimalValue: 0, status: 'invalid_input' };
      }

      const m = this.coefficients.length; // number of constraints
      const n = this.coefficients[0]!.length; // number of variables
      console.log(`Original n=${n}, m=${m}`);

      if (this.costs.length !== n || this.constraints.length !== m) {
        return { solution: [], optimalValue: 0, status: 'dimension_mismatch' };
      }

      // For Ax ≤ b, convert to standard form: Ax + s = b, maximize cx
      // Initial basis: slack variables (indices n to n+m-1)
      let basis = Array.from({length: m}, (_, i) => n + i);

      // Initial solution: x = 0, s = b
      let x = new Array(n + m).fill(0);
      for (let i = 0; i < m; i++) {
        x[n + i] = this.constraints[i];
      }

      // Create augmented coefficient matrix [A | I] where I is identity for slack variables
      let A_augmented = this.coefficients.map((row, i) => {
        let newRow = [...row]; // Copy original coefficients
        // Add identity matrix columns for slack variables
        for (let j = 0; j < m; j++) {
          newRow.push(i === j ? 1 : 0);
        }
        return newRow;
      });

      // Objective coefficients: [c | 0] (zeros for slack variables)
      // For maximization, we want to minimize -c, so augmented costs are [-c | 0]
      let c_augmented = [...this.costs.map(cost => -cost), ...new Array(m).fill(0)];


      // Solve using revised simplex
      const result = this.revisedSimplex(A_augmented, c_augmented, n, m, basis, x);

      console.log('Revised simplex result:', result);

      if (result.status === 'optimal') {
        // Extract solution (only original variables, not slack variables)
        let solution = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          solution[i] = result.x[i] || 0;
        }

        return {
          solution: solution,
          optimalValue: -result.optimalValue, // Convert back to maximization
          status: 'optimal'
        };
      }

      return { solution: [], optimalValue: 0, status: result.status };

    } catch (error) {
      console.error('Solver error:', error);
      return { solution: [], optimalValue: 0, status: 'error' };
    }
  }


  private revisedSimplex(A: number[][], c: number[], n: number, m: number, basis: number[], x: number[]):
    { status: string; x: number[]; optimalValue: number; basis: number[] } {

      // Initialize basis inverse (identity matrix for initial basis)
    let B_inv: number[][] = Array.from({length: m}, (_, i) =>
      Array.from({length: m}, (_, j) => i === j ? 1 : 0)
    );


    let iteration = 0;
    const maxIterations = 1000;

    while (iteration < maxIterations) {
      iteration++;

      // Compute reduced costs: c_j - c_B * B_inv * A_j
      let reducedCosts = new Array(n + m).fill(0);

      for (let j = 0; j < n + m; j++) {  // Check all variables
        // Get column A_j (for augmented matrix)
        let A_j: number[];
        if (j < n) {
          // Original variable - use column from A
          A_j = A.map(row => row[j]);
        } else {
          // Slack variable - use identity matrix column
          const slackIndex = j - n;
          A_j = new Array(m).fill(0);
          A_j[slackIndex] = 1;
        }

        // Compute y = B_inv * A_j
        let y = this.matrixVectorMultiply(B_inv, A_j);

        // Compute reduced cost c_j - c_B * y
        let reducedCost = c[j];
        for (let i = 0; i < m; i++) {
          reducedCost -= c[basis[i]] * y[i];
        }
        reducedCosts[j] = reducedCost;
      }

      // Check optimality (for minimization, all reduced costs >= 0)
      let minReducedCost = Math.min(...reducedCosts);
      console.log(`Reduced costs: [${reducedCosts.join(', ')}], min = ${minReducedCost}`);
      if (minReducedCost >= -1e-10) {
        // Optimal solution found
        let optimalValue = 0;
        for (let i = 0; i < m; i++) {
          optimalValue += c[basis[i]] * x[basis[i]];
        }

        return { status: 'optimal', x: x, optimalValue: optimalValue, basis: basis };
      }

      // Choose entering variable (most negative reduced cost)
      let enteringVar = reducedCosts.indexOf(minReducedCost);

      // Compute direction: d = B_inv * A_entering
      let A_entering: number[];
      if (enteringVar < n) {
        // Original variable - use column from A
        A_entering = A.map(row => row[enteringVar]);
      } else {
        // Slack variable - use identity matrix column
        const slackIndex = enteringVar - n;
        A_entering = new Array(m).fill(0);
        A_entering[slackIndex] = 1;
      }
      let d = this.matrixVectorMultiply(B_inv, A_entering);

      // Check if problem is unbounded
      let minRatio = Infinity;
      let leavingVar = -1;

      console.log(`Ratio test: d=[${d.join(',')}], basis=[${basis.join(',')}], x=[${x.join(',')}]`);
      for (let i = 0; i < m; i++) {
        if (d[i] > 1e-10) { // d_i > 0
          let ratio = x[basis[i]] / d[i];
          if (ratio < minRatio) {
            minRatio = ratio;
            leavingVar = i;
          }
        }
      }
      if (leavingVar === -1) {
        console.log('returning unbounded');
        return { status: 'unbounded', x: x, optimalValue: 0, basis: basis };
      }

      // Update solution and basis
      let leavingVarIndex = basis[leavingVar]; // Save the variable index before updating basis
      let theta = x[leavingVarIndex] / d[leavingVar];
      x[enteringVar] = theta;
      x[leavingVarIndex] = 0;

      // Update basis
      basis[leavingVar] = enteringVar;

      // Update basis inverse using eta matrix
      // E[i][j] = δ_{ij} for j ≠ leavingVar
      // E[i][leavingVar] = -d[i]/d[leavingVar] for i ≠ leavingVar
      // E[leavingVar][leavingVar] = 1/d[leavingVar]
      let E = Array.from({length: m}, (_, i) =>
        Array.from({length: m}, (_, j) => {
          if (j === leavingVar) {
            return i === leavingVar ? 1 / d[leavingVar] : -d[i] / d[leavingVar];
          } else {
            return i === j ? 1 : 0;
          }
        })
      );

      B_inv = this.matrixMultiply(E, B_inv);
    }

    return { status: 'max_iterations', x: x, optimalValue: 0, basis: basis };
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    let result = new Array(matrix.length).fill(0);
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < vector.length; j++) {
        result[i] += matrix[i][j] * vector[j];
      }
    }
    return result;
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const m = A.length;
    const n = B[0].length;
    const p = A[0].length; // Should equal B.length

    let result = Array.from({length: m}, () => Array(n).fill(0));

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < p; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }
}