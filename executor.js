export class MazeGenerationExecutor {
    _maze;
    _algorithm;
    _stepsPerTick;
    _tickSpeed;

    _algoGenerator;
    _autoplay;
    _isDone;

    constructor({ maze, renderer, algorithm, stepsPerTick = 1, tickSpeed = 100 }) {
        this._maze = maze;
        this._renderer = renderer;
        this._algorithm = algorithm;
        this._stepsPerTick = stepsPerTick;
        this._tickSpeed = tickSpeed;

        this._isDone = false;
        this._autoplay = false;
    }

    step() {
        if (this._isDone) {
            this._renderer.render([]);
            return;
        }
        const toHighlight = this._stepAlgorithm(1);
        this._renderer.render(toHighlight);
    }

    tick() {
        if (this._isDone) {
            this._renderer.render([]);
            this._autoplay = false;
            return;
        }
        const toHighlight = this._stepAlgorithm(this._stepsPerTick);
        this._renderer.render(toHighlight);

        // if we're autoplaying, queue up the next step
        if (this._autoplay) {
            if (this._tickSpeed <= 0) {
                window.requestAnimationFrame(() => this.tick());
            } else {
                window.setTimeout(() => this.tick(), this._tickSpeed);
            }
        }
    }

    run() {
        if (this._isDone) {
            return;
        }
        this._autoplay = true;
        this.tick();
    }

    _stepAlgorithm(numSteps) {
        if (this._isDone) {
            return;
        }
        if (!this._algoGenerator) {
            this._algoGenerator = this._algorithm(this._maze);
        }
        const toHighlight = [];
        for (let stepNum = 0; stepNum < numSteps; stepNum++) {
            const step = this._algoGenerator.next();
            toHighlight.push(...(step.value ? step.value : []));
            if (step.done) {
                this._isDone = true;
                break;
            }
        }
        
        return toHighlight;
    }
}
