/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { WebSiteManagementClient } from 'azure-arm-website';
import { ResourceNameAvailability } from 'azure-arm-website/lib/models';
import { AzureNameStep, createAzureClient, IAzureNamingRules, ResourceGroupListStep, resourceGroupNamingRules, StorageAccountListStep, storageAccountNamingRules } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { AppKind, getAppKindDisplayName } from './AppKind';
import { AppServicePlanListStep } from './AppServicePlanListStep';
import { appServicePlanNamingRules } from './AppServicePlanNameStep';
import { IAppServiceWizardContext } from './IAppServiceWizardContext';

export class SiteNameStep extends AzureNameStep<IAppServiceWizardContext> {
    public async prompt(wizardContext: IAppServiceWizardContext): Promise<IAppServiceWizardContext> {
        const client: WebSiteManagementClient = createAzureClient(wizardContext, WebSiteManagementClient);
        wizardContext.newSiteName = (await ext.ui.showInputBox({
            prompt: `Enter a globally unique name for the new ${getAppKindDisplayName(wizardContext.newSiteKind)}.`,
            validateInput: async (value: string): Promise<string | undefined> => {
                value = value ? value.trim() : '';
                const nameAvailability: ResourceNameAvailability = await client.checkNameAvailability(value, 'site');
                if (!nameAvailability.nameAvailable) {
                    return nameAvailability.message;
                } else {
                    return undefined;
                }
            }
        })).trim();

        const namingRules: IAzureNamingRules[] = [resourceGroupNamingRules];
        if (wizardContext.newSiteKind === AppKind.functionapp) {
            namingRules.push(storageAccountNamingRules);
        } else {
            namingRules.push(appServicePlanNamingRules);
        }
        wizardContext.relatedNameTask = this.generateRelatedName(wizardContext, wizardContext.newSiteName, namingRules);

        return wizardContext;
    }

    protected async isRelatedNameAvailable(wizardContext: IAppServiceWizardContext, name: string): Promise<boolean> {
        const tasks: Promise<boolean>[] = [ResourceGroupListStep.isNameAvailable(wizardContext, name)];
        if (wizardContext.newSiteKind === AppKind.functionapp) {
            tasks.push(StorageAccountListStep.isNameAvailable(wizardContext, name));
        } else {
            tasks.push(AppServicePlanListStep.isNameAvailable(wizardContext, name, name));
        }

        return (await Promise.all(tasks)).every((v: boolean) => v);
    }
}
