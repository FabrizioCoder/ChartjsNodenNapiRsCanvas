"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartJSNodeCanvas = void 0;
const freshRequire_1 = require("./freshRequire");
const backgroundColourPlugin_1 = require("./backgroundColourPlugin");
class ChartJSNodeCanvas {
    _width;
    _height;
    _chartJs;
    _createCanvas;
    _registerFont;
    _image;
    _type;
    constructor(options) {
        if (options === null || typeof (options) !== 'object') {
            throw new Error('An options parameter object is required');
        }
        if (!options.width || typeof (options.width) !== 'number') {
            throw new Error('A width option is required');
        }
        if (!options.height || typeof (options.height) !== 'number') {
            throw new Error('A height option is required');
        }
        this._width = options.width;
        this._height = options.height;
        const canvas = require('@napi-rs/canvas');
        this._createCanvas = canvas.createCanvas;
        this._registerFont = canvas.registerFont;
        this._image = canvas.Image;
        this._type = options.type && options.type.toLowerCase();
        this._chartJs = this.initialize(options);
    }
    renderToDataURL(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        return new Promise((resolve, reject) => {
            if (!chart.canvas) {
                return reject(new Error('Canvas is null'));
            }
            const canvas = chart.canvas;
            canvas.toDataURL(mimeType, (error, png) => {
                chart.destroy();
                if (error) {
                    return reject(error);
                }
                return resolve(png);
            });
        });
    }
    renderToDataURLSync(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas) {
            throw new Error('Canvas is null');
        }
        const canvas = chart.canvas;
        const dataUrl = canvas.toDataURL(mimeType);
        chart.destroy();
        return dataUrl;
    }
    renderToBuffer(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        return new Promise((resolve, reject) => {
            if (!chart.canvas) {
                throw new Error('Canvas is null');
            }
            const canvas = chart.canvas;
            canvas.toBuffer((error, buffer) => {
                chart.destroy();
                if (error) {
                    return reject(error);
                }
                return resolve(buffer);
            }, mimeType);
        });
    }
    renderToBufferSync(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas) {
            throw new Error('Canvas is null');
        }
        const canvas = chart.canvas;
        const buffer = canvas.toBuffer(mimeType);
        chart.destroy();
        return buffer;
    }
    renderToStream(configuration, mimeType = 'image/png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas) {
            throw new Error('Canvas is null');
        }
        const canvas = chart.canvas;
        setImmediate(() => chart.destroy());
        switch (mimeType) {
            case 'image/png':
                return canvas.createPNGStream();
            case 'image/jpeg':
                return canvas.createJPEGStream();
            case 'application/pdf':
                return canvas.createPDFStream();
            default:
                throw new Error(`Un-handled mimeType: ${mimeType}`);
        }
    }
    registerFont(path, nameAlias) {
        this._registerFont(path, nameAlias);
    }
    initialize(options) {
        const chartJs = require('chart.js');
        if (options.plugins?.requireChartJSLegacy) {
            for (const plugin of options.plugins.requireChartJSLegacy) {
                require(plugin);
                delete require.cache[require.resolve(plugin)];
            }
        }
        if (options.plugins?.globalVariableLegacy) {
            global.Chart = chartJs;
            for (const plugin of options.plugins.globalVariableLegacy) {
                (0, freshRequire_1.freshRequire)(plugin);
            }
            delete global.Chart;
        }
        if (options.plugins?.modern) {
            for (const plugin of options.plugins.modern) {
                if (typeof plugin === 'string') {
                    chartJs.register((0, freshRequire_1.freshRequire)(plugin));
                }
                else {
                    chartJs.register(plugin);
                }
            }
        }
        if (options.plugins?.requireLegacy) {
            for (const plugin of options.plugins.requireLegacy) {
                chartJs.register((0, freshRequire_1.freshRequire)(plugin));
            }
        }
        if (options.chartCallback) {
            options.chartCallback(chartJs);
        }
        if (options.backgroundColour) {
            chartJs.register(new backgroundColourPlugin_1.BackgroundColourPlugin(options.width, options.height, options.backgroundColour));
        }
        delete require.cache[require.resolve('chart.js')];
        return chartJs;
    }
    renderChart(configuration) {
        const canvas = this._createCanvas(this._width, this._height, this._type);
        canvas.style = canvas.style || {};
        configuration.options = configuration.options || {};
        configuration.options.responsive = false;
        configuration.options.animation = false;
        const context = canvas.getContext('2d');
        global.Image = this._image;
        const chart = new this._chartJs(context, configuration);
        delete global.Image;
        return chart;
    }
}
exports.ChartJSNodeCanvas = ChartJSNodeCanvas;
