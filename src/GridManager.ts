import { Solver } from './Solver';

export class GridManager {
  private gridData: number[][] = [];
  private topGridData: number[] = [];
  private rightGridData: number[] = [];
  private solutionData: number[] = [];
  private totalsData: number[] = [];
  private gridContainer: HTMLElement;
  private topGridContainer: HTMLElement;
  private rightGridContainer: HTMLElement;
  private solutionGridContainer: HTMLElement;
  private totalsGridContainer: HTMLElement;
  private controlsContainer: HTMLElement;

  constructor() {
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'grid-container';

    this.topGridContainer = document.createElement('div');
    this.topGridContainer.className = 'top-grid-container';

    this.solutionGridContainer = document.createElement('div');
    this.solutionGridContainer.className = 'solution-grid-container';

    this.totalsGridContainer = document.createElement('div');
    this.totalsGridContainer.className = 'totals-grid-container';

    this.rightGridContainer = document.createElement('div');
    this.rightGridContainer.className = 'right-grid-container';

    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'controls-container';

    // Initialize with 3x3 grid
    this.initializeGrid(3, 3);
    this.createControls();
    this.render();

    // Set up drag and drop
    this.setupDragAndDrop();
  }

  private initializeGrid(rows: number, cols: number) {
    this.gridData = [];
    for (let i = 0; i < rows; i++) {
      this.gridData[i] = [];
      for (let j = 0; j < cols; j++) {
        this.gridData[i][j] = 0;
      }
    }

    // Initialize top grid with same number of columns
    this.topGridData = new Array(cols).fill(0);

    // Initialize solution grid with same number of columns
    this.solutionData = new Array(cols).fill(0);

    // Initialize totals grid with same number of rows
    this.totalsData = new Array(rows).fill(0);

    // Initialize right grid with same number of rows
    this.rightGridData = new Array(rows).fill(0);
  }

  private createControls() {
    this.controlsContainer.innerHTML = '';

    // Row controls
    const rowControls = document.createElement('div');
    rowControls.className = 'row-controls';

    const rowLabel = document.createElement('label');
    rowLabel.textContent = 'Rows:';
    rowLabel.htmlFor = 'row-input';

    // Row input controls
    const rowInputContainer = document.createElement('div');
    rowInputContainer.className = 'input-controls';

    const rowMinusBtn = document.createElement('button');
    rowMinusBtn.textContent = '-';
    rowMinusBtn.className = 'control-btn';
    rowMinusBtn.addEventListener('click', () => {
      const currentValue = parseInt(rowInput.value);
      if (currentValue > 1) {
        rowInput.value = (currentValue - 1).toString();
        this.setRows(currentValue - 1);
      }
    });

    const rowInput = document.createElement('input');
    rowInput.type = 'number';
    rowInput.id = 'row-input';
    rowInput.min = '1';
    rowInput.max = '20';
    rowInput.step = '1';
    rowInput.value = this.gridData.length.toString();
    rowInput.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (value >= 1 && value <= 20) {
        this.setRows(value);
      }
    });

    const rowPlusBtn = document.createElement('button');
    rowPlusBtn.textContent = '+';
    rowPlusBtn.className = 'control-btn';
    rowPlusBtn.addEventListener('click', () => {
      const currentValue = parseInt(rowInput.value);
      if (currentValue < 20) {
        rowInput.value = (currentValue + 1).toString();
        this.setRows(currentValue + 1);
      }
    });

    rowInputContainer.appendChild(rowMinusBtn);
    rowInputContainer.appendChild(rowInput);
    rowInputContainer.appendChild(rowPlusBtn);

    rowControls.appendChild(rowLabel);
    rowControls.appendChild(rowInputContainer);

    // Column controls
    const colControls = document.createElement('div');
    colControls.className = 'col-controls';

    const colLabel = document.createElement('label');
    colLabel.textContent = 'Columns:';
    colLabel.htmlFor = 'col-input';

    // Column input controls
    const colInputContainer = document.createElement('div');
    colInputContainer.className = 'input-controls';

    const colMinusBtn = document.createElement('button');
    colMinusBtn.textContent = '-';
    colMinusBtn.className = 'control-btn';
    colMinusBtn.addEventListener('click', () => {
      const currentValue = parseInt(colInput.value);
      if (currentValue > 1) {
        colInput.value = (currentValue - 1).toString();
        this.setColumns(currentValue - 1);
      }
    });

    const colInput = document.createElement('input');
    colInput.type = 'number';
    colInput.id = 'col-input';
    colInput.min = '1';
    colInput.max = '20';
    colInput.step = '1';
    colInput.value = (this.gridData[0]?.length || 0).toString();
    colInput.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (value >= 1 && value <= 20) {
        this.setColumns(value);
      }
    });

    const colPlusBtn = document.createElement('button');
    colPlusBtn.textContent = '+';
    colPlusBtn.className = 'control-btn';
    colPlusBtn.addEventListener('click', () => {
      const currentValue = parseInt(colInput.value);
      if (currentValue < 20) {
        colInput.value = (currentValue + 1).toString();
        this.setColumns(currentValue + 1);
      }
    });

    colInputContainer.appendChild(colMinusBtn);
    colInputContainer.appendChild(colInput);
    colInputContainer.appendChild(colPlusBtn);

    colControls.appendChild(colLabel);
    colControls.appendChild(colInputContainer);

    // Solve button
    const solveButton = document.createElement('button');
    solveButton.id = 'solve-btn';
    solveButton.textContent = 'Solve';
    solveButton.addEventListener('click', () => this.solve());

    // Save button
    const saveButton = document.createElement('button');
    saveButton.id = 'save-btn';
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => this.save());

    // Load button
    const loadButton = document.createElement('button');
    loadButton.id = 'load-btn';
    loadButton.textContent = 'Load';
    loadButton.addEventListener('click', () => this.triggerFileInput());

    // Hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => this.loadFile(e));

    // Container for dimension controls
    const dimensionsContainer = document.createElement('div');
    dimensionsContainer.className = 'dimensions-container';
    dimensionsContainer.appendChild(rowControls);
    dimensionsContainer.appendChild(colControls);

    // Button container for vertical stacking
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(solveButton);
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(loadButton);

    this.controlsContainer.appendChild(dimensionsContainer);
    this.controlsContainer.appendChild(buttonContainer);
    this.controlsContainer.appendChild(fileInput);
  }

  private setRows(numRows: number) {
    const currentRows = this.gridData.length;

    if (numRows > currentRows) {
      // Add rows
      for (let i = currentRows; i < numRows; i++) {
        const newRow = new Array(this.gridData[0].length).fill(0);
        this.gridData.push(newRow);
        this.rightGridData.push(0);
        this.totalsData.push(0);
      }
    } else if (numRows < currentRows) {
      // Remove rows
      this.gridData.splice(numRows);
      this.rightGridData.splice(numRows);
      this.totalsData.splice(numRows);
    }

    this.createControls();
    this.render();
  }

  private clearSolution() {
    this.solutionData.fill(0);
    this.totalsData.fill(0);
    this.renderSolution();
    this.renderTotals();
  }

  private setColumns(numCols: number) {
    const currentCols = this.gridData[0]?.length || 0;

    if (numCols > currentCols) {
      // Add columns
      this.gridData.forEach(row => {
        for (let i = currentCols; i < numCols; i++) {
          row.push(0);
        }
      });
      for (let i = currentCols; i < numCols; i++) {
        this.topGridData.push(0);
        this.solutionData.push(0);
      }
    } else if (numCols < currentCols) {
      // Remove columns
      this.gridData.forEach(row => row.splice(numCols));
      this.topGridData.splice(numCols);
      this.solutionData.splice(numCols);
    }

    this.createControls();
    this.render();
  }

  private solve() {
    // Clear previous solution
    this.clearSolution();

    const solver = new Solver(this.gridData, this.topGridData, this.rightGridData);
    const result = solver.solve();

    console.log('Solver result:', result);

    if (result.status === 'optimal') {
      // Update solution grid with results
      this.solutionData = [...result.solution];

      // Calculate totals for each constraint row
      for (let i = 0; i < this.gridData.length; i++) {
        let total = 0;
        for (let j = 0; j < this.gridData[i].length; j++) {
          total += this.gridData[i][j] * result.solution[j];
        }
        this.totalsData[i] = total;
      }
    }

    this.renderSolution();
    this.renderTotals();
  }

  private renderSolution() {
    this.solutionGridContainer.innerHTML = '';

    const solutionRowElement = document.createElement('div');
    solutionRowElement.className = 'grid-row';

    this.solutionData.forEach((cell) => {
      const cellElement = document.createElement('input');
      cellElement.type = 'number';
      cellElement.className = 'grid-cell solution-cell';
      cellElement.value = cell.toFixed(3);
      cellElement.readOnly = true; // Make solution cells read-only
      cellElement.style.backgroundColor = '#e8f4fd'; // Light blue background to distinguish
      cellElement.style.color = '#2c5aa0'; // Darker text color
      cellElement.style.fontWeight = 'bold';

      solutionRowElement.appendChild(cellElement);
    });

    this.solutionGridContainer.appendChild(solutionRowElement);
  }

  private save() {
    const data = {
      body: this.gridData,
      variables: this.topGridData,
      constraints: this.rightGridData
    };

    const jsonString = JSON.stringify(data, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'simplex-problem.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private triggerFileInput() {
    const fileInput = this.controlsContainer.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  private loadFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          this.loadData(data);
        } catch (error) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input so the same file can be loaded again
    fileInput.value = '';
  }

  private loadData(data: any) {
    // Validate the data structure
    if (!data.body || !Array.isArray(data.body) || !data.variables || !Array.isArray(data.variables) || !data.constraints || !Array.isArray(data.constraints)) {
      alert('Invalid file format. Expected body, variables, and constraints arrays.');
      return;
    }

    // Validate dimensions
    const numRows = data.body.length;
    const numCols = data.body[0]?.length || 0;

    if (numRows === 0 || numCols === 0) {
      alert('Invalid grid dimensions');
      return;
    }

    // Check that all rows have the same number of columns
    if (!data.body.every((row: any[]) => Array.isArray(row) && row.length === numCols)) {
      alert('Inconsistent row lengths in body');
      return;
    }

    // Check variable and constraint dimensions
    if (data.variables.length !== numCols) {
      alert(`Variables array length (${data.variables.length}) doesn't match number of columns (${numCols})`);
      return;
    }

    if (data.constraints.length !== numRows) {
      alert(`Constraints array length (${data.constraints.length}) doesn't match number of rows (${numRows})`);
      return;
    }

    // Update the grid data
    this.gridData = data.body.map((row: any[]) => row.map((cell: any) => Number(cell) || 0));
    this.topGridData = data.variables.map((cell: any) => Number(cell) || 0);
    this.rightGridData = data.constraints.map((cell: any) => Number(cell) || 0);

    // Resize solution and totals grids to match new dimensions
    this.solutionData = new Array(numCols).fill(0);
    this.totalsData = new Array(numRows).fill(0);

    // Re-render the grids
    this.createControls();
    this.render();
  }

  private setupDragAndDrop() {
    let dragCounter = 0;

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      if (dragCounter === 1) {
        document.body.classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        document.body.classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      document.body.classList.remove('drag-over');

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target?.result as string);
              this.loadData(data);
            } catch (error) {
              alert('Invalid JSON file format');
            }
          };
          reader.readAsText(file);
        } else {
          alert('Please drop a valid JSON file');
        }
      }
    });
  }

  private render() {
    this.renderSolution();
    this.renderTop();
    this.renderMain();
    this.renderRight();
    this.renderTotals();
  }

  private renderMain() {
    this.gridContainer.innerHTML = '';

    this.gridData.forEach((row, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'grid-row';

      row.forEach((cell, colIndex) => {
        const cellElement = document.createElement('input');
        cellElement.type = 'number';
        cellElement.className = 'grid-cell';
        cellElement.value = cell.toString();
        cellElement.addEventListener('click', (e) => {
          (e.target as HTMLInputElement).select();
        });

        cellElement.addEventListener('input', (e) => {
          const value = parseFloat((e.target as HTMLInputElement).value) || 0;
          this.gridData[rowIndex][colIndex] = value;
        });
        rowElement.appendChild(cellElement);
      });

      this.gridContainer.appendChild(rowElement);
    });
  }

  private renderRight() {
    this.rightGridContainer.innerHTML = '';

    this.rightGridData.forEach((cell, rowIndex) => {
      const cellElement = document.createElement('input');
      cellElement.type = 'number';
      cellElement.className = 'grid-cell';
      cellElement.value = cell.toString();
      cellElement.addEventListener('click', (e) => {
        (e.target as HTMLInputElement).select();
      });

      cellElement.addEventListener('input', (e) => {
        const value = parseFloat((e.target as HTMLInputElement).value) || 0;
        this.rightGridData[rowIndex] = value;
      });

      const rowElement = document.createElement('div');
      rowElement.className = 'grid-row';
      rowElement.appendChild(cellElement);

      this.rightGridContainer.appendChild(rowElement);
    });
  }

  private renderTotals() {
    this.totalsGridContainer.innerHTML = '';

    this.totalsData.forEach((cell, index) => {
      const cellElement = document.createElement('input');
      cellElement.type = 'number';
      cellElement.className = 'grid-cell totals-cell';
      cellElement.value = cell.toFixed(3);
      cellElement.readOnly = true;

      // Highlight when total matches constraint (within tolerance)
      const constraintValue = this.rightGridData[index];
      const tolerance = 1e-6;
      const matches = Math.abs(cell - constraintValue) < tolerance;

      if (matches) {
        cellElement.classList.add('constraint-satisfied');
      }

      cellElement.style.fontWeight = 'bold';

      const rowElement = document.createElement('div');
      rowElement.className = 'grid-row';
      rowElement.appendChild(cellElement);

      this.totalsGridContainer.appendChild(rowElement);
    });
  }

  private renderTop() {
    this.gridContainer.innerHTML = '';
    this.topGridContainer.innerHTML = '';
    this.rightGridContainer.innerHTML = '';

    // Render top grid (horizontal)
    const topRowElement = document.createElement('div');
    topRowElement.className = 'grid-row';

    this.topGridData.forEach((cell, colIndex) => {
      const cellElement = document.createElement('input');
      cellElement.type = 'number';
      cellElement.className = 'grid-cell';
      cellElement.value = cell.toString();
      cellElement.addEventListener('click', (e) => {
        (e.target as HTMLInputElement).select();
      });

      cellElement.addEventListener('input', (e) => {
        const value = parseFloat((e.target as HTMLInputElement).value) || 0;
        this.topGridData[colIndex] = value;
      });
      topRowElement.appendChild(cellElement);
    });

    this.topGridContainer.appendChild(topRowElement);

    // Render main grid
    this.gridData.forEach((row, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'grid-row';

      row.forEach((cell, colIndex) => {
        const cellElement = document.createElement('input');
        cellElement.type = 'number';
        cellElement.className = 'grid-cell';
        cellElement.value = cell.toString();
        cellElement.addEventListener('click', (e) => {
          (e.target as HTMLInputElement).select();
        });

        cellElement.addEventListener('input', (e) => {
          const value = parseFloat((e.target as HTMLInputElement).value) || 0;
          this.gridData[rowIndex][colIndex] = value;
        });
        rowElement.appendChild(cellElement);
      });

      this.gridContainer.appendChild(rowElement);
    });

    // Render right grid (vertical)
    this.rightGridData.forEach((cell, rowIndex) => {
      const cellElement = document.createElement('input');
      cellElement.type = 'number';
      cellElement.className = 'grid-cell';
      cellElement.value = cell.toString();
      cellElement.addEventListener('click', (e) => {
        (e.target as HTMLInputElement).select();
      });

      cellElement.addEventListener('input', (e) => {
        const value = parseFloat((e.target as HTMLInputElement).value) || 0;
        this.rightGridData[rowIndex] = value;
      });

      const rowElement = document.createElement('div');
      rowElement.className = 'grid-row';
      rowElement.appendChild(cellElement);

      this.rightGridContainer.appendChild(rowElement);
    });
  }

  public getElement() {
    const container = document.createElement('div');
    container.className = 'grid-app';
    container.appendChild(this.controlsContainer);

    // Create wrapper for the grids
    const gridsWrapper = document.createElement('div');
    gridsWrapper.className = 'grids-wrapper';

    // Add solution grid (above cost vector)
    gridsWrapper.appendChild(this.solutionGridContainer);

    // Add top grid (cost vector)
    gridsWrapper.appendChild(this.topGridContainer);

    // Create wrapper for main grid and right grids
    const mainAndRightWrapper = document.createElement('div');
    mainAndRightWrapper.className = 'main-and-right-wrapper';
    mainAndRightWrapper.appendChild(this.gridContainer);
    mainAndRightWrapper.appendChild(this.rightGridContainer);
    mainAndRightWrapper.appendChild(this.totalsGridContainer);

    gridsWrapper.appendChild(mainAndRightWrapper);

    container.appendChild(gridsWrapper);
    return container;
  }
}