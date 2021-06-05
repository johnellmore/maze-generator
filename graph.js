export class MazeCellBoundary {
    _graph;
    _firstId;
    _secondId;

    constructor(graph, firstId, secondId) {
        this._graph = graph;
        // make sure that cellA is always the cell with the lower ID (makes it
        // easier to check if two boundary instances are actually the same)
        if (firstId < secondId) {
            this._firstId = firstId;
            this._secondId = secondId;
        } else {
            this._firstId = secondId;
            this._secondId = firstId;
        }
    }

    get firstId() {
        return this._firstId;
    }

    get secondId() {
        return this._secondId;
    }

    get borderingCells() {
        return [
            new MazeCell(this._graph, this.firstId),
            new MazeCell(this._graph, this.secondId),
        ];
    }

    get isWall() {
        return this._graph.isWall(this);
    }

    set isWall(newValue) {
        this._graph.setWall(this, newValue);
    }

    traverseFrom(cell) {
        if (cell.id === this.firstId) {
            return new MazeCell(this._graph, this.secondId);
        } else {
            return new MazeCell(this._graph, this.firstId);
        }
    }
}

export class MazeCell {
    _graph;
    _id;

    constructor(graph, id) {
        this._graph = graph;
        this._id = id;
    }

    get graph() {
        return this._graph;
    }

    get id() {
        return this._id;
    }

    get boundaries() {
        return this._graph.getNeighborIds(this._id)
            .map(neighborId => new MazeCellBoundary(
                this._graph,
                this._id,
                neighborId
            ))
    }

    get neighbors() {
        return this._graph.getNeighborIds(this._id)
            .map(neighborId => new MazeCell(this._graph, neighborId))
    }

    boundaryBetween(cell) {
        if (!this._graph.getNeighborIds(this._id).includes(cell.id)) {
            throw new Error('Cannot get boundary; cells are not neighbors.')
        }
        return new MazeCellBoundary(this._graph, this._id, cell.id);
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

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get cells() {
        // generate a range from [0..n]
        return [...Array(this._width * this._height).keys()]
            .map(id => new MazeCell(this, id));
    }

    get boundaries() {
        return this.cells.flatMap(cell =>
            cell.boundaries.filter(b => b.firstId === cell.id)
        );
    }

    setAllBoundaries(shouldBeWalls) {
        const fill = shouldBeWalls ? 1 : 0;
        this._edges.fill(fill);
    }

    isWall(boundary) {
        const addr = this._getWallAddress(
            boundary.firstId,
            boundary.secondId,
        );
        return !!this._edges[addr];
    }

    setWall(boundary, shouldBeWall) {
        const addr = this._getWallAddress(
            boundary.firstId,
            boundary.secondId,
        );
        this._edges[addr] = shouldBeWall ? 1 : 0;
    }

    getNeighborIds(id) {
        const x = id % this._width;
        const y = Math.floor(id / this._width);
        const toAddr = (x, y) => x + y * this._width;
        return [
            x > 0 ? toAddr(x - 1, y) : null,
            y > 0 ? toAddr(x, y - 1) : null,
            x < (this._width - 1) ? toAddr(x + 1, y) : null,
            y < (this._height - 1) ? toAddr(x, y + 1) : null,
        ].filter(x => x !== null);
    }

    _getWallAddress(smallerCellId, largerCellId) {
        const areCellHorizontallyAdjacent = largerCellId - smallerCellId === 1;
        return smallerCellId * 2 + (areCellHorizontallyAdjacent ? 1 : 0);
    }
}
