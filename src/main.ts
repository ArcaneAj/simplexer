import './style.css'
import { GridManager } from './GridManager';
import { runSolverTests } from './Solver.test';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Simplexer</h1>
    <button id="run-tests" style="margin-bottom: 1rem; padding: 0.5rem 1rem;">Run Solver Tests</button>
    <div id="grid-app"></div>
  </div>
`;

const gridManager = new GridManager();
document.getElementById('grid-app')?.appendChild(gridManager.getElement());

// Add test runner
document.getElementById('run-tests')?.addEventListener('click', () => {
  runSolverTests();
});