// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import type * as plotly from 'plotly.js';
import { ActivationFunction, OutputItem } from 'vscode-notebook-renderer';
import { errorToJson } from './coreUtils';
import { GeneratePlot, ResponseType } from './types';
// import { PlotGenerated } from './types';
declare const Plotly: typeof plotly;

/* eslint-disable @typescript-eslint/no-explicit-any */

export const activate: ActivationFunction = (context) => {
    return {
        renderOutputItem(outputItem: OutputItem, element: HTMLElement) {
            registerPlotlyScript().then(() => {
                const json: GeneratePlot = outputItem.json();
                const ele = (json.ele ? document.getElementById(json.ele) : undefined) || document.createElement('div');
                if (json.hidden) {
                    ele.style.display = 'none';
                }
                element.appendChild(ele);
                Plotly.newPlot(ele, json.data, json.layout).then((gd) => {
                    if (!json.download || !json.requestId) {
                        return;
                    }
                    Plotly.toImage(gd, {
                        format: json.format || 'png',
                        height: json.layout?.height || 400,
                        width: json.layout?.width || 500
                    })
                        .then((url) => {
                            if (!context.postMessage) {
                                return;
                            }
                            context.postMessage(<ResponseType>{
                                type: 'plotGenerated',
                                success: true,
                                base64: url,
                                requestId: json.requestId
                            });
                        })
                        .catch((ex) => {
                            if (!context.postMessage) {
                                return;
                            }
                            context.postMessage(<ResponseType>{
                                type: 'plotGenerated',
                                success: false,
                                error: errorToJson(ex),
                                requestId: json.requestId
                            });
                        });
                });
            });
        }
    };
};

async function registerPlotlyScript() {
    if (globalThis.__plotlyPromise) {
        return globalThis.__plotlyPromise;
    }
    return (globalThis.__plotlyPromise = new Promise<void>((resolve, reject) => {
        const uri = 'https://cdn.plot.ly/plotly-2.3.0.min.js';
        const head = document.head;

        const scriptNode = document.createElement('script');
        scriptNode.src = uri;
        scriptNode.onload = () => {
            resolve();
        };
        scriptNode.onerror = (err) => {
            reject(err);
        };
        head.append(scriptNode);
    }));
}