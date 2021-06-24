# Maze Generation Algorithms

This web app implements and demonstrates several maze generation algorithms.

[Try it out](https://mazegen.johnellmore.com) |
[Background blog post](https://johnellmore.com/posts/20210622-maze-generation/)

## Intro

The
[Maze Generation Algorithms Wikipedia
article](https://en.wikipedia.org/wiki/Maze_generation_algorithm) is fascinating
reading to get some background here. Effectively, most mazes are just graphs,
with each "cell" beind a node in the graph and each opening (missing wall) being
an edge in that graph. Generating a good maze (with no loops) is therefore done
by finding a minimum spanning tree of that graph.

In this demo, we model the maze as a graph, and then implement renderers which
can draw that graph to an HTML canvas. Maze generation algorithms operate on the
graph directly, with no concept of the visual shape of the maze.

To view the demo, just clone the repo, host it somewhere, and open it in your
browser. You need a relatively recent browser with ES module support.
