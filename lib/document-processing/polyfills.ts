/**
 * Polyfills for PDF.js in Node.js environment
 * 
 * PDF.js expects browser APIs that don't exist in Node.js.
 * These minimal polyfills allow text extraction to work.
 */

// Only apply polyfills in Node.js environment
if (typeof window === 'undefined') {
    // DOMMatrix polyfill
    if (typeof globalThis.DOMMatrix === 'undefined') {
        (globalThis as any).DOMMatrix = class DOMMatrix {
            a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
            
            constructor(init?: any) {
                if (Array.isArray(init)) {
                    this.a = init[0] || 1;
                    this.b = init[1] || 0;
                    this.c = init[2] || 0;
                    this.d = init[3] || 1;
                    this.e = init[4] || 0;
                    this.f = init[5] || 0;
                }
            }
            
            transform() { return this; }
            translate() { return this; }
            scale() { return this; }
            rotate() { return this; }
            inverse() { return this; }
        };
    }

    // Path2D polyfill
    if (typeof globalThis.Path2D === 'undefined') {
        (globalThis as any).Path2D = class Path2D {
            constructor(path?: any) {}
            addPath() {}
            closePath() {}
            moveTo() {}
            lineTo() {}
            bezierCurveTo() {}
            quadraticCurveTo() {}
            arc() {}
            arcTo() {}
            ellipse() {}
            rect() {}
        };
    }

    // ImageData polyfill
    if (typeof globalThis.ImageData === 'undefined') {
        (globalThis as any).ImageData = class ImageData {
            width: number;
            height: number;
            data: Uint8ClampedArray;
            
            constructor(width: number, height: number);
            constructor(data: Uint8ClampedArray, width: number, height?: number);
            constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
                if (typeof dataOrWidth === 'number') {
                    this.width = dataOrWidth;
                    this.height = widthOrHeight;
                    this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4);
                } else {
                    this.data = dataOrWidth;
                    this.width = widthOrHeight;
                    this.height = height || Math.floor(dataOrWidth.length / (widthOrHeight * 4));
                }
            }
        };
    }
}

export {};
