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
            return;
        }
        if (!this._algoGenerator) {
            this._algoGenerator = this._algorithm(this._maze);
        }
        const step = this._algoGenerator.next();
        this._isDone = step.done;
        const toHighlight = step.value;
        this._renderer.render(toHighlight ? toHighlight : []);

        // if we're autoplaying, queue up the next step
        if (this._autoplay) {
            if (this._tickSpeed <= 0) {
                window.requestAnimationFrame(() => this.step());
            } else {
                window.setTimeout(() => this.step(), this._tickSpeed);
            }
        }
    }

    run() {
        if (this._isDone) {
            return;
        }
        this._autoplay = true;
        this.step();
    }


}
