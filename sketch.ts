import p5 from 'p5'

class Blob {
    x: number = 0
    y: number = 0
    r: number = 0
    g: number = 0
    b: number = 0
    vx: number = 0
    vy: number = 0

    constructor(x: number, y: number, r: number, g: number, b: number, vx: number, vy: number) {
        this.x = x
        this.y = y
        this.r = r
        this.g = g
        this.b = b
        this.vx = vx
        this.vy = vy
    }

    crossover(blob: Blob): Blob {
        const pallet = [];
        pallet.push(this.clip(this.r + blob.r * (Math.random() * 0.6 - 0.3)));
        pallet.push(this.clip(this.g + blob.g * (Math.random() * 0.6 - 0.3)));
        pallet.push(this.clip(this.b + blob.b * (Math.random() * 0.6 - 0.3)))

        return new Blob(
            this.x,
            this.y,
            pallet[Math.floor(Math.random() * 3)],
            pallet[Math.floor(Math.random() * 3)],
            pallet[Math.floor(Math.random() * 3)],
            0,
            0
        )
    }

    mutation() {
        this.r = this.mutation_with_clip(this.r);
        this.g = this.mutation_with_clip(this.g);
        this.b = this.mutation_with_clip(this.b);
    }

    mutation_with_clip(value: number) {
        value += Math.random() * 0.1;
        return this.clip(value);
    }

    clip(value: number): number {
        if (value < 0) {
            value = 0;
        }

        if (value > 1) {
            value = 1;
        }

        return value;
    }
}

const fitness = (blob: Blob): number => {
    const bonus = Math.max(blob.r, blob.g, blob.b) - Math.min(blob.r, blob.g, blob.b);
    return blob.r + blob.g + blob.b + bonus * 5;
}

const sketch = (p: p5) => {
    let blobs: Blob[] = [];
    let timestamp = 0;

    p.setup = () => {
        p.createCanvas(400, 400)
        blobs.push(new Blob(0, 0, 0, 0, 0, 0, 0));
        blobs.push(new Blob(0, 0, 0, 0, 0, 0, 0));
    }

    p.draw = () => {
        let cnt = 0;
        blobs.forEach(element => {
            p.fill(element.r * 255, element.g * 255, element.b * 255);
            p.rect(cnt % 10 * 40, Math.floor(cnt / 10) * 40, 40, 40);
            cnt += 1;
        });

        if (p.millis() - timestamp > 100) {
            timestamp = p.millis();
            forward();
        }
    }

    p.mouseClicked = () => {
        forward();
    }

    const forward = () => {
        const parent1 = blobs[Math.floor(Math.random() * blobs.length)];
        const parent2 = blobs[Math.floor(Math.random() * blobs.length)];
        const child = parent1.crossover(parent2);
        child.mutation();
        blobs.push(child);
        if (blobs.length > 100) {
            let min_idx = 0;
            let min_fitness = fitness(blobs[min_idx]);
            blobs.forEach(element => {
                const val: number = fitness(element);
                if (val < min_fitness) {
                    min_fitness = val;
                    min_idx = blobs.indexOf(element);
                }
            })
            blobs = blobs.filter((_, idx) => idx != min_idx);
        }
        blobs.sort((a, b) => fitness(b) - fitness(a));
    }
}

new p5(sketch)
