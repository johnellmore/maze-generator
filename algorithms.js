export function* randomGenerator(maze) {
    for (const b of maze.graph.boundaries()) {
        b.isWall = Math.random() > 0.5;
        yield [b];
    }
}

export function* randomDepthFirstSearchGenerator(maze) {
    maze.graph.setAllBoundaries(true);
    const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];
    const allCells = maze.graph.cells();
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