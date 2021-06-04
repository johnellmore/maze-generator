import { MazeCellBoundary, SquareMazeCell } from './graph.js';

const cellSize = 20;

export class MazeRenderer {
    _canvas;
    _maze;

    constructor(canvas, maze) {
        this._canvas = canvas;
        this._maze = maze;
    }

    init() {
        const ctx = this._canvas.getContext('2d');
        ctx.translate(1, 1);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
    }

    render(toHighlight) {
        const ctx = this._canvas.getContext('2d');

        // clear canvas
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // draw any highlights behind cells
        ctx.fillStyle = 'yellow';
        toHighlight.forEach(obj => {
            if (obj instanceof SquareMazeCell) {
                ctx.fillRect(obj.x * cellSize, obj.y * cellSize, cellSize, cellSize);
            }
        });

        // draw any highlights behind walls
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 4;
        toHighlight.forEach(obj => {
            if (obj instanceof MazeCellBoundary) {
                this.strokeBoundaryPath(obj);
            }
        });

        // draw maze outer edges
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this._maze.width * cellSize, this._maze.height * cellSize);

        // draw each wall
        for (const cell of this._maze.cells()) {
            const boundariesToDraw = cell.boundaries
                .filter(b => ['n', 'w'].includes(b.side))
                .filter(b => b.isWall)
            for (const boundary of boundariesToDraw) {
                this.strokeBoundaryPath(boundary);
            }
        }
    }

    strokeBoundaryPath(boundary) {
        const ctx = this._canvas.getContext('2d');
        const side = boundary.side;
        const top = boundary.cell.y * cellSize;
        const right = (boundary.cell.x + 1) * cellSize;
        const bottom = (boundary.cell.y + 1) * cellSize;
        const left = boundary.cell.x * cellSize;

        ctx.beginPath();

        if (side === 'n' || side === 'w') {
            ctx.moveTo(left, top);
        } else {
            ctx.moveTo(right, bottom);
        }

        if (side === 'n' || side === 'e') {
            ctx.lineTo(right, top);
        } else {
            ctx.lineTo(left, bottom);
        }

        ctx.stroke();
    }
}
