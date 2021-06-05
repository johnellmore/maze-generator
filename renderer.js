import { MazeCell, MazeCellBoundary } from './graph.js';

export class MazeRenderer {
    _canvas;
    _maze;
    _cellSize;
    _strokeWidth;

    constructor({ canvas, maze, cellSize = 20, strokeWidth = 2 }) {
        this._canvas = canvas;
        this._maze = maze;
        this._cellSize = cellSize;
        this._strokeWidth = strokeWidth;
    }

    init() {
        const halfStrokePx = Math.ceil(this._strokeWidth / 2);
        const mazeSize = [
            this._maze.width * this._cellSize + halfStrokePx * 2,
            this._maze.height * this._cellSize + halfStrokePx * 2
        ];
        this._canvas.width = mazeSize[0];
        this._canvas.height = mazeSize[1];
        const ctx = this._canvas.getContext('2d');
        ctx.translate(halfStrokePx, halfStrokePx);
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
        const halfStrokePx = Math.ceil(this._strokeWidth / 2);
        ctx.clearRect(
            -1 * halfStrokePx,
            -1 * halfStrokePx,
            this._canvas.width + halfStrokePx * 2,
            this._canvas.height + halfStrokePx * 2
        );

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
        ctx.lineCap = 'butt';
        ctx.lineWidth = Math.ceil(this._strokeWidth * 1.5);
        toHighlight.forEach(obj => {
            if (obj instanceof MazeCellBoundary) {
                strokeLine(...boundaryToEndpoints(obj));
            }
        });

        // draw maze outer edges
        ctx.strokeStyle = 'black';
        ctx.lineCap = 'square';
        ctx.lineWidth = this._strokeWidth;
        const bottom = this._maze.height * this._cellSize;
        const right = this._maze.width * this._cellSize;
        strokeLine([0, 0], [0, bottom]);
        strokeLine([0, bottom], [right - this._cellSize, bottom]);
        strokeLine([this._cellSize, 0], [right, 0]);
        strokeLine([right, 0], [right, bottom]);

        // draw each wall
        const walls = this._maze.graph.boundaries().filter(b => b.isWall);
        for (const boundary of walls) {
            strokeLine(...boundaryToEndpoints(boundary));
        }
    }
}
