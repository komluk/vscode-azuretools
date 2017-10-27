/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

 // TEMPORARILY DISABLE
// tslint:disable:export-name
// tslint:disable:typedef
// tslint:disable:strict-boolean-expressions
// tslint:disable:no-unsafe-any

// tslint:disable:newline-before-return
// tslint:disable:interface-name

export namespace uiUtils {

    export interface PartialList<T> extends Array<T> {
        nextLink?: string;
    }

    export async function listAll<T>(client: { listNext(nextPageLink: string): Promise<PartialList<T>>; }, first: Promise<PartialList<T>>): Promise<T[]> {
        const all: T[] = [];

        for (let list = await first; list.length || list.nextLink; list = list.nextLink ? await client.listNext(list.nextLink) : []) {
            all.push(...list);
        }

        return all;
    }

    export function getSignInCommandString(): string {
        return 'azure-account.login';
    }

}