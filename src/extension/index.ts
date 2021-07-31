import { ContentProvider } from './content';
import { registerDisposableRegistry } from './utils';
import { ExtensionContext } from 'vscode';
import { Controller } from './kernel';
import { ServerLogger } from './serverLogger';
import { TensorflowVisClient } from './tfjsvis';
import { DebuggerCommands } from './kernel/debugger/commands';
import { DebuggerFactory } from './kernel/debugger/debugFactory';
import { PlotlyDownloadRenderer } from './kernel/plotly';
export async function activate(context: ExtensionContext) {
    registerDisposableRegistry(context);
    ContentProvider.register();
    Controller.regsiter();
    ServerLogger.register();
    TensorflowVisClient.register(context);
    DebuggerCommands.register(context);
    DebuggerFactory.regsiter(context);
    PlotlyDownloadRenderer.register(context);
}
