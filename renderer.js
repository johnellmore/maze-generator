import { MazeCell, MazeCellBoundary } from './graph.js';

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
                    [ cellX * cellSize, cellY * cellSize],
                    [ cellX * cellSize, (cellY + 1) * cellSize],
                ];
            } else {
                // cells are vertically adjacent
                const [ cellX, cellY ] = cellIdToXY(boundary.secondId);
                return [
                    [ cellX * cellSize, cellY * cellSize],
                    [ (cellX + 1) * cellSize, cellY * cellSize],
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
                ctx.fillRect(cellX * cellSize, cellY * cellSize, cellSize, cellSize);
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
        ctx.strokeRect(0, 0, this._maze.width * cellSize, this._maze.height * cellSize);

        // draw each wall
        const walls = this._maze.graph.boundaries().filter(b => b.isWall);
        for (const boundary of walls) {
            strokeLine(...boundaryToEndpoints(boundary));
        }
    }
}
