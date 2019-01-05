// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import * as _ from 'lodash/index';
import { ActionButton, BaseButton, Button } from 'office-ui-fabric-react/lib/Button';
import { ISelection } from 'office-ui-fabric-react/lib/DetailsList';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';

import { VisualizationToggle } from '../../common/components/visualization-toggle';
import {
    IVisualizationConfiguration,
    VisualizationConfigurationFactory,
} from '../../common/configs/visualization-configuration-factory';
import { FeatureFlags } from '../../common/feature-flags';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { VisualizationType } from '../../common/types/visualization-type';
import { DecoratedAxeNodeResult } from '../../injected/scanner-utils';
import { RuleResult, ScanResults } from '../../scanner/iruleresults';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { ReportGenerator } from '../reports/report-generator';
import { IssuesDetailsList } from './issues-details-list';
import { IssuesDetailsPane, IssuesDetailsPaneDeps } from './Issues-details-pane';
import { IssuesTableHandler } from './issues-table-handler';

export type IssuesTableDeps = IssuesDetailsPaneDeps & {
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
};

export interface IssuesTableProps {
    deps: IssuesTableDeps;
    title: string;
    issuesTableHandler: IssuesTableHandler;
    violations: RuleResult[];
    selectedIdToRuleResultMap: IDictionaryStringTo<DecoratedAxeNodeResult>;
    issuesEnabled: boolean;
    issuesSelection: ISelection;
    pageTitle: string;
    pageUrl: string;
    scanning: boolean;
    toggleClickHandler: (event) => void;
    visualizationConfigurationFactory: VisualizationConfigurationFactory;
    featureFlags: FeatureFlagStoreData;
    scanResult: ScanResults;
    reportGenerator: ReportGenerator;
}

export interface IssuesTableState {
    isExportDialogOpen: boolean;
    exportDescription: string;
    exportName: string;
    exportDataWithPlaceholder: string;
    exportData: string;
}

export class IssuesTable extends React.Component<IssuesTableProps, IssuesTableState> {
    private configuration: IVisualizationConfiguration;
    public static readonly exportTextareaLabel: string = 'Provide result description';
    public static readonly exportInstructions: string = 'Optional: please describe the result (it will be saved in the report).';

    constructor(props: IssuesTableProps) {
        super(props);
        this.configuration = props.visualizationConfigurationFactory.getConfiguration(VisualizationType.Issues);
        this.state = {
            isExportDialogOpen: false,
            exportDescription: '',
            exportName: '',
            exportDataWithPlaceholder: '',
            exportData: '',
        };
    }

    public render(): JSX.Element {
        return (
            <div className="issues-table">
                <h1>{this.props.title}</h1>
                {this.renderContent()}
            </div>
        );
    }

    private renderContent(): JSX.Element {
        if (this.props.issuesEnabled == null) {
            return this.renderSpinner('Loading...');
        }

        return (
            <div>
                {this.renderCommandBar()}
                {this.renderExportDialog()}
                {this.renderComponent()}
            </div>
        );
    }

    private renderCommandBar(): JSX.Element {
        return (
            <div className="details-view-command-bar">
                {this.renderToggle()}
                {this.renderExportButton()}
            </div>
        );
    }

    private renderExportButton(): JSX.Element {
        const shouldShowButton = this.props.featureFlags[FeatureFlags.exportResult] &&
            this.props.issuesEnabled &&
            !this.props.scanning;
        if (shouldShowButton) {
            return (
                <ActionButton
                    iconProps={{ iconName: 'Export' }}
                    onClick={this.onExportButtonClick}
                >
                    Export result
            </ActionButton>
            );
        } else {
            return null;
        }
    }

    private renderExportDialog(): JSX.Element {
        if (!this.props.featureFlags[FeatureFlags.exportResult]) {
            return null;
        }

        return (
            <Dialog
                hidden={!this.state.isExportDialogOpen}
                onDismiss={this.onDismissExportDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: IssuesTable.exportTextareaLabel,
                    subText: IssuesTable.exportInstructions,
                }}
                modalProps={{
                    isBlocking: false,
                    containerClassName: 'insights-dialog-main-override',
                }}
            >
                <TextField
                    multiline
                    autoFocus
                    rows={8}
                    resizable={false}
                    onChanged={this.onExportDescriptitonChange}
                    value={this.state.exportDescription}
                    ariaLabel={IssuesTable.exportTextareaLabel}
                />
                <DialogFooter>
                    <Link
                        onClick={this.onExportLinkClick}
                        className="download-report-link"
                        download={this.state.exportName}
                        href={'data:text/html,' + this.state.exportData}
                    >
                        Export
                    </Link>
                </DialogFooter>
            </Dialog>
        );
    }

    private renderComponent(): JSX.Element {
        if (!this.props.issuesEnabled) {
            return this.renderDisabledMessage();
        }

        if (this.props.scanning) {
            return this.renderSpinner('Scanning...');
        }

        if (this.props.violations == null) {
            return this.renderSpinner('Loading data...');
        }

        return this.renderDetails();
    }

    private renderToggle(): JSX.Element {
        return <VisualizationToggle
            label={this.configuration.displayableData.toggleLabel}
            checked={this.props.issuesEnabled}
            disabled={this.props.scanning}
            onClick={this.props.toggleClickHandler}
            className="automated-checks-details-view-toggle"
            visualizationName={this.configuration.displayableData.title}
        />;
    }

    private renderSpinner(label: string): JSX.Element {
        return (
            <Spinner
                className="details-view-spinner"
                size={SpinnerSize.large}
                label={label}
            />
        );
    }

    private renderDisabledMessage(): JSX.Element {
        return (
            <div className="details-disabled-message" role="alert">
                Turn on <b>{this.configuration.displayableData.title}</b> to see a list of failures.
            </div>
        );
    }

    private renderDetails(): JSX.Element {
        return (
            <div className="issues-table-details">
                <IssuesDetailsList
                    violations={this.props.violations}
                    issuesTableHandler={this.props.issuesTableHandler}
                    issuesSelection={this.props.issuesSelection}
                    pageTitle={this.props.pageTitle}
                    pageUrl={this.props.pageUrl}
                    featureFlagData={this.props.featureFlags}
                />
                <div className="issue-detail-outer-container ms-Fabric">
                    {this.getIssueDetailPane()}
                </div>
            </div>
        );
    }

    private getIssueDetailPane(): JSX.Element {
        return (<IssuesDetailsPane
            deps={this.props.deps}
            selectedIdToRuleResultMap={this.props.selectedIdToRuleResultMap}
            pageTitle={this.props.pageTitle}
            pageUrl={this.props.pageUrl}
        />);
    }

    private descriptionPlaceholder: string = 'd68d50a0-8249-464d-b2fd-709049c89ee4';

    @autobind
    private onExportButtonClick(
        event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement | BaseButton | Button>,
    ): void {
        const scanDate = new Date(this.props.scanResult.timestamp);
        const exportName = this.props.reportGenerator.generateName(scanDate, this.props.pageTitle);
        const exportDataWithPlaceholder = this.props.reportGenerator.generateHtml(
            this.props.scanResult,
            scanDate,
            this.props.pageTitle,
            this.props.pageUrl,
            this.descriptionPlaceholder,
        );
        const exportData = exportDataWithPlaceholder.replace(this.descriptionPlaceholder, '');
        this.setState({
            isExportDialogOpen: true,
            exportDescription: '',
            exportName: exportName,
            exportDataWithPlaceholder: exportDataWithPlaceholder,
            exportData: exportData,
        });
    }

    @autobind
    private onExportLinkClick(event: React.MouseEvent<HTMLElement>): void {
        this.props.deps.detailsViewActionMessageCreator.exportAutomatedResultsClicked(this.state.exportData, event);
        this.setState({ isExportDialogOpen: false });
    }

    @autobind
    private onDismissExportDialog(
        event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement | BaseButton | Button>,
    ): void {
        this.setState({ isExportDialogOpen: false });
    }

    @autobind
    private onExportDescriptitonChange(value: string): void {
        const exportData = this.state.exportDataWithPlaceholder.replace(this.descriptionPlaceholder, _.escape(value));
        this.setState({ exportDescription: value, exportData: exportData });
    }
}