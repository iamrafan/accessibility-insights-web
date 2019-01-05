// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, Times } from 'typemoq';

import { IVisualizationTogglePayload } from '../../../background/actions/action-payloads';
import { Messages } from '../../../common/messages';
import { VisualizationActionMessageCreator } from '../../../common/message-creators/visualization-action-message-creator';
import { TelemetryEventSource, ToggleTelemetryData } from '../../../common/telemetry-events';
import { VisualizationType } from '../../../common/types/visualization-type';

describe('VisualizationActionMessageCreatorTest', () => {
    let testObject: VisualizationActionMessageCreator;
    let postMessageMock: IMock<(message) => void>;

    const tabId: number = 1;

    const testSource: TelemetryEventSource = -1 as TelemetryEventSource;

    beforeEach(() => {
        postMessageMock = Mock.ofInstance(message => {});
        testObject = new VisualizationActionMessageCreator(postMessageMock.object, tabId);
    });

    test('set visualization state', () => {
        const enabled = true;
        const telemetry: ToggleTelemetryData = {
            enabled,
            triggeredBy: 'test',
            source: testSource,
        };
        const test = VisualizationType.Headings;

        const payload: IVisualizationTogglePayload = {
            test,
            enabled,
            telemetry,
        };

        const expectedMessage: IMessage = {
            tabId: tabId,
            type: Messages.Visualizations.Common.Toggle,
            payload,
        };

        setupPostMessageMock(expectedMessage);

        testObject.setVisualizationState(test, enabled, telemetry);

        postMessageMock.verifyAll();
    });

    function setupPostMessageMock(expectedMessage): void {
        postMessageMock
            .setup(post => post(It.isValue(expectedMessage)))
            .verifiable(Times.once());
    }
});