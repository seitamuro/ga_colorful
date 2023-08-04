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
    const variance = Math.max(blob.r, blob.g, blob.b) - Math.min(blob.r, blob.g, blob.b);
    return variance;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255.0;
    g /= 255.0;
    b /= 255.0;

    let maxVal = Math.max(r, g, b);
    let minVal = Math.min(r, g, b);

    let h = (maxVal + minVal) / 2;
    let s = (maxVal + minVal) / 2;
    let l = (maxVal + minVal) / 2;

    if (maxVal === minVal) {
        h = s = 0; // achromatic
    } else {
        const d = maxVal - minVal;
        s = l > 0.5 ? d / (2.0 - maxVal - minVal) : d / (maxVal + minVal);

        switch (maxVal) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

const fitness_by_blobs = (blobs: Blob[], idx: number): number => {
    const [h, s, v] = rgbToHsl(blobs[idx].r * 255, blobs[idx].g * 255, blobs[idx].b * 255);
    let mean_h = 0;
    let mean_s = 0;
    let mean_v = 0;
    blobs.forEach((element, idx) => {
        mean_h += rgbToHsl(element.r * 255, element.g * 255, element.b * 255)[0] / blobs.length;
        mean_s += rgbToHsl(element.r * 255, element.g * 255, element.b * 255)[1] / blobs.length;
        mean_v += rgbToHsl(element.r * 255, element.g * 255, element.b * 255)[2] / blobs.length;
    })

    return Math.sqrt(mean_h * mean_h / blobs.length) + Math.sqrt(mean_s * mean_s / blobs.length) + Math.sqrt(mean_v * mean_v / blobs.length);
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
            let min_fitness = fitness_by_blobs(blobs, min_idx);
            blobs.forEach((element, idx) => {
                const val: number = fitness_by_blobs(blobs, idx);
                if (val < min_fitness) {
                    min_fitness = val;
                    min_idx = idx;
                }
            })
            blobs = blobs.filter((_, idx) => idx != min_idx);
        }
        blobs.sort((a, b) => fitness_by_blobs(blobs, blobs.indexOf(b)) - fitness_by_blobs(blobs, blobs.indexOf(a)));
    }
}

new p5(sketch)
