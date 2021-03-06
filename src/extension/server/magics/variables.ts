import { sendMessage } from '../comms';
import { RunCellRequest, RunCellResponse } from '../types';
import * as repl from 'repl';

const reservedVars = new Set([
    'global',
    'clearInterval',
    'clearTimeout',
    'setInterval',
    'setTimeout',
    'queueMicrotask',
    'clearImmediate',
    'setImmediate'
]);

export class VariableListingMagicCommandHandler {
    public isMagicCommand(request: RunCellRequest): boolean {
        if (!request.code.code.includes('%who')) {
            return false;
        }
        return request.code.code
            .trim()
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => !line.startsWith('#'))
            .some((line) => line.toLowerCase().startsWith('%who'));
    }
    public async handleCommand(request: RunCellRequest, replServer: repl.REPLServer) {
        const start = Date.now();
        const vars = Object.keys(replServer.context);
        const execResult: RunCellResponse = {
            requestId: request.requestId,
            success: true,
            result: {
                type: 'text',
                requestId: request.requestId,
                value: vars
                    .filter((item) => !reservedVars.has(item))
                    .sort()
                    .map((name) => `${name} (type '${typeof replServer.context[name]}')`)
                    .join('\n')
            },
            type: 'cellExec',
            start,
            end: Date.now()
        };
        sendMessage(execResult);
    }
}
