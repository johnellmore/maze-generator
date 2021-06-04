export class SquareMaze {
    _graph;
    _width;
    _height;

    constructor(width, height) {
        this._graph = new SquareMazeGraph(width, height);
        this._width = width;
        this._height = height;
    }

    get graph() {
        return this._graph;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    cells() {
        return this._graph.cells();
    }
}

export class MazeCellBoundary {
    _cell;
    _side; // n, s, e, w

    constructor(cell, side) {
        this._cell = cell;
        this._side = side;
    }

    get cell() {
        return this._cell;
    }

    get side() {
        return this._side;
    }

    get isWall() {
        return this.cell.graph.isWall(this);
    }

    set isWall(newValue) {
        this.cell.graph.setWall(this, newValue);
    }
}

export class SquareMazeCell {
    _graph;
    _x; // from left
    _y; // from top

    constructor(graph, x, y) {
        this._graph = graph;
        this._x = x;
        this._y = y;
    }

    get graph() {
        return this._graph;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get boundaries() {
        return this._graph.getCellBoundarySides(this._x, this._y)
            .map(side => new MazeCellBoundary(this, side));
    }
}

export class SquareMazeGraph {
    _width;
    _height;
    _edges;

    constructor(width, height) {
        this._width = width;
        this._height = height;
        // We'll allocate space for 2 edges (N & W) per cell. The northernmost
        // and westernmost cells may not need two edges, but that's okay; we'll
        // allocate the space anyway, because it simplifies calculations and the
        // memory waste is trivial.
        this._edges = new Uint8Array(width * height * 2);
    }

    setAllBoundaries(shouldBeWalls) {
        const fill = shouldBeWalls ? 1 : 0;
        this._edges.fill(fill);
    }

    cells() {
        const c = Array(this._width * this._height);
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                const addr = x + y * this._width;
                c[addr] = this.getCell(x, y);
            }
        }
        return c;
    }

    boundaries() {
        return this.cells().flatMap(cell =>
            cell.boundaries.filter(b => ['n', 'w'].includes(b.side))
        );
    }

    getCell(x, y) {
        if (x >= this._width || x < 0) {
            throw new Error('Cell x is out of bounds');
        } else if (y >= this._height || y < 0) {
            throw new Error('Cell y is out of bounds');
        }
        return new SquareMazeCell(this, x, y);
    }

    isWall(boundary) {
        const addr = this._getWallAddress(
            boundary.cell.x,
            boundary.cell.y,
            boundary.side
        );
        return !!this._edges[addr];
    }

    setWall(boundary, shouldBeWall) {
        const addr = this._getWallAddress(
            boundary.cell.x,
            boundary.cell.y,
            boundary.side
        );
        this._edges[addr] = shouldBeWall ? 1 : 0;
    }

    getCellBoundarySides(x, y) {
        return [
            x > 0 ? 'w' : null,
            y > 0 ? 'n' : null,
            x < (this._width - 1) ? 'e' : null,
            y < (this._height - 1) ? 's' : null,
        ].filter(x => !!x);
    }

    _getWallAddress(x, y, side) {
        if (!['n', 'e', 's', 'w'].includes(side)) {
            throw new Error('Invalid side');
        }
        if (side === 'e') {
            return this._getWallAddress(x + 1, y, 'w');
        }
        if (side === 's') {
            return this._getWallAddress(x, y + 1, 'n');
        }
        return (x + y * this._width) * 2 + (side === 'n' ? 1 : 0);
    }
}