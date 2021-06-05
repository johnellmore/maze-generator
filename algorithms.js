function shuffle(a) {
    // Fisher-Yates algorithm from https://stackoverflow.com/a/6274381
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function* random(maze) {
    for (const b of maze.boundaries) {
        b.isWall = Math.random() > 0.5;
        yield [b];
    }
}

export function* depthFirstSearch(maze) {
    maze.setAllBoundaries(true);
    const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];
    const allCells = maze.cells;
    const startCell = pickRandom(allCells);

    const backtrackStack = [startCell];
    const visitedIds = new Set([startCell.id]);
    while (backtrackStack.length) {
        // find all unvisited neighbors
        const thisCell = backtrackStack.pop();
        yield [thisCell];
        const unvisitedNeighbors = thisCell.neighbors
            .filter(cell => !visitedIds.has(cell.id));
        if (unvisitedNeighbors.length === 0) {
            continue;
        }
        backtrackStack.push(thisCell);
        const nextCell = pickRandom(unvisitedNeighbors);
        visitedIds.add(nextCell.id);
        backtrackStack.push(nextCell);
        const wallToRemove = thisCell.boundaryBetween(nextCell);
        wallToRemove.isWall = false;
        yield [wallToRemove];
    }
}

export function* kruskalsAlgorithm(maze) {
    maze.setAllBoundaries(true);

    // Array that starts as [0 => 0, 1 => 1, 2 => 2, ...], with one entry per
    // cell. Each key represents a cell ID, and each value is the "set" ID that
    // that cell belongs to. At first, each cell belongs to its own set.
    const cellSets = [...Array(maze.width * maze.height).keys()];
    const joinSets = (setA, setB) => {
        const setToChange = Math.max(setA, setB);
        const newSet = Math.min(setA, setB);
        for (let cellId = 0; cellId < cellSets.length; cellId++) {
            if (cellSets[cellId] === setToChange) {
                cellSets[cellId] = newSet;
            }
        }
    }

    const boundaries = maze.boundaries;
    shuffle(boundaries);
    for (const boundary of boundaries) {
        yield [boundary];
        if (cellSets[boundary.firstId] !== cellSets[boundary.secondId]) {
            boundary.isWall = false;
            joinSets(cellSets[boundary.firstId], cellSets[boundary.secondId]);
            yield boundary.borderingCells;
        }
    }
}
