export function* randomGenerator(maze) {
    for (const b of maze.graph.boundaries()) {
        b.isWall = Math.random() > 0.5;
        yield [b];
    }
}
