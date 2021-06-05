import { MazeCell, MazeCellBoundary } from './graph.js';

export class MazeRenderer {
    _canvas;
    _maze;
    _cellSize;

    constructor({ canvas, maze, cellSize = 20 }) {
        this._canvas = canvas;
        this._maze = maze;
        this._cellSize = cellSize;
    }

    init() {
        const ctx = this._canvas.getContext('2d');
        ctx.translate(1, 1);
    }

    render(toHighlight) {
        const ctx = this._canvas.getContext('2d');

        const cellIdToXY = (id) => [
            id % this._maze.width,
            Math.floor(id / this._maze.width)
        ];
        const boundaryToEndpoints = (boundary) => {
            if (boundary.secondId - boundary.firstId === 1) {
                // cells are horizontally adjacent
                const [ cellX, cellY ] = cellIdToXY(boundary.secondId);
                return [
                    [ cellX * this._cellSize, cellY * this._cellSize],
                    [ cellX * this._cellSize, (cellY + 1) * this._cellSize],
                ];
            } else {
                // cells are vertically adjacent
                const [ cellX, cellY ] = cellIdToXY(boundary.secondId);
                return [
                    [ cellX * this._cellSize, cellY * this._cellSize],
                    [ (cellX + 1) * this._cellSize, cellY * this._cellSize],
                ];
            }
        }
        const strokeLine = (a, b) => {
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
        }

        // clear canvas
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // draw any highlights behind cells
        ctx.fillStyle = 'orange';
        toHighlight.forEach(obj => {
            if (obj instanceof MazeCell) {
                const [ cellX, cellY ] = cellIdToXY(obj.id);
                ctx.fillRect(cellX * this._cellSize, cellY * this._cellSize, this._cellSize, this._cellSize);
            }
        });

        // draw any highlights behind walls
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 4;
        toHighlight.forEach(obj => {
            if (obj instanceof MazeCellBoundary) {
                strokeLine(...boundaryToEndpoints(obj));
            }
        });

        // draw maze outer edges
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this._maze.width * this._cellSize, this._maze.height * this._cellSize);

        // draw each wall
        const walls = this._maze.graph.boundaries().filter(b => b.isWall);
        for (const boundary of walls) {
            strokeLine(...boundaryToEndpoints(boundary));
        }
    }
}
