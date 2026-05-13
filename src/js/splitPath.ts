export type Point2D = [number, number];

export type CurveSegment = { split: () => [CurveSegment, CurveSegment] } & { toString: () => string };

export class Path {
  private _: CurveSegment[];
  private _m: Point2D | undefined;

  constructor(segments: CurveSegment[] = []) {
    this._ = segments;
    this._m = undefined;
  }

  moveTo(x: number, y: number) {
    this._ = [];
    this._m = [x, y];
  }

  lineTo(x: number, y: number) {
    if (!this._m) this._m = [0, 0];
    this._.push(new Line(this._m, (this._m = [x, y])));
  }

  bezierCurveTo(ax: number, ay: number, bx: number, by: number, x: number, y: number) {
    if (!this._m) this._m = [0, 0];
    this._.push(new BezierCurve(this._m, [ax, ay], [bx, by], (this._m = [x, y])));
  }

  *split(k = 0): Generator<Path> {
    const n = this._.length;
    const i = Math.floor(n / 2);
    const j = Math.ceil(n / 2);
    const a = new Path(this._.slice(0, i));
    const b = new Path(this._.slice(j));
    if (i !== j) {
      const mid = this._[i];
      if (mid) {
        const [ab, ba] = mid.split();
        a._.push(ab);
        b._.unshift(ba);
      }
    }
    if (k > 1) {
      yield* a.split(k - 1);
      yield* b.split(k - 1);
    } else {
      yield a;
      yield b;
    }
  }

  toString() {
    return this._.join("");
  }
}

class Line implements CurveSegment {
  constructor(
    public a: Point2D,
    public b: Point2D,
  ) {}

  split(): [Line, Line] {
    const { a, b } = this;
    const m: Point2D = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return [new Line(a, m), new Line(m, b)];
  }

  toString() {
    return `M${this.a}L${this.b}`;
  }
}

type BezierDotInput = { a: Point2D; b: Point2D; c: Point2D; d: Point2D };
const l1: [number, number, number, number] = [4 / 8, 4 / 8, 0 / 8, 0 / 8];
const l2: [number, number, number, number] = [2 / 8, 4 / 8, 2 / 8, 0 / 8];
const l3: [number, number, number, number] = [1 / 8, 3 / 8, 3 / 8, 1 / 8];
const r1: [number, number, number, number] = [0 / 8, 2 / 8, 4 / 8, 2 / 8];
const r2: [number, number, number, number] = [0 / 8, 0 / 8, 4 / 8, 4 / 8];

const dot = ([ka, kb, kc, kd]: [number, number, number, number], input: BezierDotInput): Point2D => {
  const { a, b, c, d } = input;
  return [ka * a[0] + kb * b[0] + kc * c[0] + kd * d[0], ka * a[1] + kb * b[1] + kc * c[1] + kd * d[1]];
};

class BezierCurve implements CurveSegment {
  constructor(
    public a: Point2D,
    public b: Point2D,
    public c: Point2D,
    public d: Point2D,
  ) {}

  split(): [BezierCurve, BezierCurve] {
    const m = dot(l3, this);
    return [new BezierCurve(this.a, dot(l1, this), dot(l2, this), m), new BezierCurve(m, dot(r1, this), dot(r2, this), this.d)];
  }

  toString() {
    return `M${this.a}C${this.b},${this.c},${this.d}`;
  }
}

type LineGeneratorWithContext<TContext> = {
  context: (ctx: TContext | null) => (data: unknown) => unknown;
};

export const splitPath = <TContext extends object>(
  lineGenerator: LineGeneratorWithContext<TContext>,
  pointArr: unknown,
) => {
  const p = new Path();
  (lineGenerator.context(p as unknown as TContext) as unknown as (data: unknown) => unknown)(pointArr);
  return p;
};
