import './style.css'
import { GridManager } from './GridManager';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Simplexer</h1>
    <div id="grid-app"></div>
  </div>
`;

const gridManager = new GridManager();
document.getElementById('grid-app')?.appendChild(gridManager.getElement());