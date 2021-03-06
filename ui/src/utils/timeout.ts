/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from "../localize";

class TimeoutError extends Error { }

/**
 * Returns the result of awaiting a specified action. Rejects if the action throws. Returns timeoutValue if a time-out occurs.
 */
export async function valueOnTimeout<T>(timeoutMs: number, timeoutValue: T, action: () => Promise<T> | T): Promise<T> {
    try {
        return await rejectOnTimeout(timeoutMs, action);
    } catch (err) {
        if (err instanceof TimeoutError) {
            return timeoutValue;
        }

        throw err;
    }
}

/**
 * Returns the result of awaiting a specified action. Rejects if the action throws or if the time-out occurs.
 */
export async function rejectOnTimeout<T>(timeoutMs: number, action: () => Promise<T> | T, callerTimeOutMessage?: string): Promise<T> {
    return await new Promise<T>(async (resolve, reject): Promise<void> => {
        let timer: NodeJS.Timer | undefined = setTimeout(
            () => {
                timer = undefined;
                reject(new TimeoutError(callerTimeOutMessage || localize('timeout', 'Execution timed out.')));
            },
            timeoutMs);

        let value: T;
        // tslint:disable-next-line:no-any
        let error: any;

        try {
            value = await action();
            clearTimeout(timer);
            resolve(value);
        } catch (err) {
            error = err;
            clearTimeout(timer);
            reject(error);
        }
    });
}
