// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import { StoreNames } from '../../../common/stores/store-names';
import { LaunchPanelStoreData } from '../../../common/types/store-data/launch-panel-store-data';
import { LaunchPanelType } from '../../../popup/components/popup-view';
import { BrowserAdapter } from '../../browser-adapter';
import { LocalStorageDataKeys } from '../../local-storage-data-keys';
import { LocalStorageData } from '../../storage-data';
import { BaseStoreImpl } from '../base-store-impl';
import { LaunchPanelStateActions } from './../../actions/launch-panel-state-action';

export class LaunchPanelStore extends BaseStoreImpl<LaunchPanelStoreData> {
    private launchPanelStateActions: LaunchPanelStateActions;
    private browserAdapter: BrowserAdapter;
    private userData: LocalStorageData;

    constructor(launchPanelStateActions: LaunchPanelStateActions, browserAdapter: BrowserAdapter, userData: LocalStorageData) {
        super(StoreNames.LaunchPanelStateStore);

        this.launchPanelStateActions = launchPanelStateActions;
        this.browserAdapter = browserAdapter;
        this.userData = userData;
    }

    public getDefaultState(): LaunchPanelStoreData {
        const defaultValues: LaunchPanelStoreData = {
            launchPanelType: LaunchPanelType.LaunchPad,
        };

        const stateFromLocalStorage = this.userData ? this.userData.launchPanelSetting : null;
        if (stateFromLocalStorage != null) {
            defaultValues.launchPanelType = stateFromLocalStorage;
        }

        return defaultValues;
    }

    protected addActionListeners(): void {
        this.launchPanelStateActions.setLaunchPanelType.addListener(this.onSetLaunchPanelType);
        this.launchPanelStateActions.getCurrentState.addListener(this.onGetCurrentState);
    }

    @autobind
    private onSetLaunchPanelType(panelType: LaunchPanelType): void {
        this.state.launchPanelType = panelType;
        this.browserAdapter.setUserData({ [LocalStorageDataKeys.launchPanelSetting]: panelType });
        this.emitChanged();
    }
}
