// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import * as React from 'react';

import { BugFilingSettingsContainer, BugFilingSettingsContainerDeps } from '../../bug-filing/components/bug-filing-settings-container';
import { BugFilingService } from '../../bug-filing/types/bug-filing-service';
import { EnvironmentInfoProvider } from '../../common/environment-info-provider';
import { NamedSFC } from '../../common/react/named-sfc';
import { CreateIssueDetailsTextData } from '../../common/types/create-issue-details-text-data';
import { BugServiceProperties } from '../../common/types/store-data/user-configuration-store';
import { ActionAndCancelButtonsComponent } from './action-and-cancel-buttons-component';

export interface IssueFilingDialogProps {
    deps: IssueFilingDialogDeps;
    isOpen: boolean;
    selectedBugFilingService: BugFilingService;
    selectedBugData: CreateIssueDetailsTextData;
    selectedBugFilingServiceData: BugServiceProperties;
    bugFileTelemetryCallback: (ev: React.SyntheticEvent) => void;
    onClose: (ev: React.SyntheticEvent) => void;
}

export type IssueFilingDialogDeps = {
    environmentInfoProvider: EnvironmentInfoProvider;
} & BugFilingSettingsContainerDeps;

const titleLabel = 'Specify issue filing location';

export const IssueFilingDialog = NamedSFC<IssueFilingDialogProps>('IssueFilingDialog', props => {
    const onPrimaryButtonClick = (ev: React.SyntheticEvent<Element, Event>) => {
        props.bugFileTelemetryCallback(ev);
        props.onClose(ev);
    };

    const { selectedBugFilingService, selectedBugFilingServiceData, selectedBugData, onClose, isOpen, deps } = props;
    const environmentInfo = deps.environmentInfoProvider.getEnvironmentInfo();
    const isSettingsValid = selectedBugFilingService.isSettingsValid(selectedBugFilingServiceData);
    const href = isSettingsValid
        ? selectedBugFilingService.issueFilingUrlProvider(selectedBugFilingServiceData, selectedBugData, environmentInfo)
        : null;
    return (
        <Dialog
            className={'issue-filing-dialog'}
            hidden={!isOpen}
            dialogContentProps={{
                type: DialogType.normal,
                title: titleLabel,
                titleId: 'issue-filing-dialog-title',
                subText: 'This configuration can be changed again in settings.',
                subTextId: 'issue-filing-dialog-subtext',
                showCloseButton: false,
            }}
            modalProps={{
                isBlocking: false,
                containerClassName: 'insights-dialog-main-override',
            }}
            onDismiss={onClose}
        >
            <BugFilingSettingsContainer
                deps={deps}
                selectedBugFilingService={selectedBugFilingService}
                selectedBugFilingServiceData={selectedBugFilingServiceData}
            />
            <DialogFooter>
                <ActionAndCancelButtonsComponent
                    isHidden={false}
                    primaryButtonDisabled={isSettingsValid === false}
                    primaryButtonOnClick={onPrimaryButtonClick}
                    cancelButtonOnClick={onClose}
                    primaryButtonHref={href}
                    primaryButtonText={'File issue'}
                />
            </DialogFooter>
        </Dialog>
    );
});
