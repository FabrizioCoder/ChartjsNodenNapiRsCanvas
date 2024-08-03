"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundColourPlugin = void 0;
class BackgroundColourPlugin {
    _width;
    _height;
    _fillStyle;
    id = 'chartjs-plugin-chartjs-node-canvas-background-colour';
    constructor(_width, _height, _fillStyle) {
        this._width = _width;
        this._height = _height;
        this._fillStyle = _fillStyle;
    }
    beforeDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = this._fillStyle;
        ctx.fillRect(0, 0, this._width, this._height);
        ctx.restore();
    }
}
exports.BackgroundColourPlugin = BackgroundColourPlugin;
