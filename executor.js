export class MazeGenerationExecutor {
    _maze;
    _algorithm;
    _stepsPerTick;
    _tickSpeed;

    _algoGenerator;
    _nextFrameTimer;
    _isDone;

    constructor({ maze, renderer, algorithm, stepsPerTick = 1, tickSpeed = 100 }) {
        this._maze = maze;
        this._renderer = renderer;
        this._algorithm = algorithm;
        this._stepsPerTick = stepsPerTick;
        this._tickSpeed = tickSpeed;

        this._isDone = false;

        this._renderer.init();
        this._renderer.render();
    }

    get isRunning() {
        return !!this._nextFrameTimer;
    }

    step(numSteps = 1) {
        if (this._isDone) {
            this._renderer.render();
            return;
        }
        const toHighlight = this._stepAlgorithm(numSteps);
        this._renderer.render(toHighlight);
    }

    fullRun() {
        if (!this._algoGenerator) {
            this._algoGenerator = this._algorithm(this._maze);
        }
        while (true) {
            const step = this._algoGenerator.next();
            if (step.done) {
                this._isDone = true;
                this._algoGenerator = null;
                break;
            }
        }
        this._renderer.render();
    }

    tick() {
        if (!this._isDone) {
            const toHighlight = this._stepAlgorithm(this._stepsPerTick);
            this._renderer.render(toHighlight);
            this._nextFrameTimer = window.setTimeout(() => this.tick(), this._tickSpeed);
        } else {
            this._renderer.render();
        }
    }

    run() {
        this.stop();
        this._isDone = false;
        this.tick();
    }

    stop() {
        if (this._nextFrameTimer) {
            window.clearTimeout(this._nextFrameTimer);
            this._nextFrameTimer = null;
        }
    }

    reset() {
        this.stop();
        this._algoGenerator = null;
        this._maze.setAllBoundaries(false);
        this._renderer.render();
    }

    _stepAlgorithm(numSteps) {
        if (!this._algoGenerator) {
            this._algoGenerator = this._algorithm(this._maze);
        }
        const toHighlight = [];
        for (let stepNum = 0; stepNum < numSteps; stepNum++) {
            const step = this._algoGenerator.next();
            toHighlight.push(...(step.value ? step.value : []));
            if (step.done) {
                this._isDone = true;
                this._algoGenerator = null;
                break;
            }
        }
        
        return toHighlight;
    }
}
