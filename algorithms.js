function shuffle(a) {
    // Fisher-Yates algorithm from https://stackoverflow.com/a/6274381
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function* random(maze) {
    maze.setAllBoundaries(false);
    for (const b of maze.boundaries) {
        b.isWall = Math.random() < 0.5;
        yield [b];
    }
}

export function* depthFirstSearch(maze) {
    maze.setAllBoundaries(true);

    const allCells = maze.cells;
    const startCell = pickRandom(allCells);

    const backtrackStack = [startCell];

    // keep track of the cells which have been connected to the larger maze
    const visitedIds = new Set([startCell.id]);
    while (backtrackStack.length) {
        // get all unvisited neighbors. If this 
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

export function* wilsonsAlgorithm(maze) {
    maze.setAllBoundaries(true);

    // keep track of whether a cell is officially connected to the maze yet
    const isConnected = Array(maze.width * maze.height).fill(false);

    // add one cell to the maze at random
    const initialMazeCell = pickRandom(maze.cells);
    isConnected[initialMazeCell.id] = true;
    yield [initialMazeCell];

    // we'll use each unconnected cell as a starting point for our random walk
    for (const c of maze.cells) {
        if (isConnected[c.id]) {
            continue;
        }

        // we'll store each cell in our walk as a key in the map, with the value
        // being the direction (boundary) that the walk proceeds from that cell.
        const walkDirections = new Map();
        let walkPos = c;
        while (true) {
            // We'll pick a neighbor to randomly move in to and add that to our
            // map. This will sometimes overwrite a previous move from that
            // cell-which is the "loop-erasing" part of the algorithm.
            const direction = pickRandom(walkPos.boundaries);
            yield [walkPos, direction];
            walkDirections.set(walkPos.id, direction);
            walkPos = direction.traverseFrom(walkPos);
            
            // if we've reached the connected part of the maze, we'll done
            if (isConnected[walkPos.id]) {
                break;
            }
        }

        // Now that we have a series of directions to get to the maze, we'll
        // re-execute that walk from the beginning cell, following the map
        // of directions, busting down walls as we go and marking each cell
        // connected.
        let pathPos = c;
        while (!isConnected[pathPos.id]) {
            isConnected[pathPos.id] = true;
            const wallToBust = walkDirections.get(pathPos.id);
            yield [pathPos, wallToBust];
            wallToBust.isWall = false;
            pathPos = wallToBust.traverseFrom(pathPos);
        }
        // Note that there may be entries in the map which we didn't visit.
        // That's okay--they were the erased parts of the random walk that we
        // don't care about.
    }
}
