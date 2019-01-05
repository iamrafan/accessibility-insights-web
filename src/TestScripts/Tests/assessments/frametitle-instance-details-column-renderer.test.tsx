// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { frameTitleInstanceDetailsColumnRenderer } from '../../../assessments/page/frametitle-instance-details-column-renderer';
import { IFrameAssessmentProperties } from '../../../common/types/store-data/iassessment-result-data';
import { AssessmentInstanceDetailsColumn } from '../../../DetailsView/components/assessment-instance-details-column';
import { IAssessmentInstanceRowData } from '../../../DetailsView/components/assessment-instance-table';
import { FrameFormatter } from '../../../injected/visualization/frame-formatter';

describe('FrameTitleInstanceDetailsColumnRendererTest', () => {
    test('render: propertyBag is null', () => {
        const frameType = 'default';
        const item = {
            instance: {
                propertyBag: null,
            },
        } as IAssessmentInstanceRowData<IFrameAssessmentProperties>;
        const expected = (
            <AssessmentInstanceDetailsColumn
                background={FrameFormatter.frameStyles[frameType].borderColor}
                labelText={FrameFormatter.frameStyles[frameType].contentText}
                textContent={null}
                tooltipId={null}
            />
        );
        expect(expected).toEqual(frameTitleInstanceDetailsColumnRenderer(item));
    });

    test('render: normal *iframe* title', () => {
        const frameTitle = 'Test IFRAME title';
        const frameType = 'iframe';
        const item = {
            instance: {
                propertyBag: {
                    frameType: frameType,
                    frameTitle: frameTitle,
                },
            },
        } as IAssessmentInstanceRowData<IFrameAssessmentProperties>;
        const expected = (
            <AssessmentInstanceDetailsColumn
                background={FrameFormatter.frameStyles[frameType].borderColor}
                labelText={FrameFormatter.frameStyles[frameType].contentText}
                textContent={frameTitle}
                tooltipId={null}
            />
        );
        expect(expected).toEqual(frameTitleInstanceDetailsColumnRenderer(item));
    });

    test('render: normal *frame* title', () => {
        const frameTitle = 'Test FRAME title';
        const frameType = 'frame';
        const item = {
            instance: {
                propertyBag: {
                    frameType: frameType,
                    frameTitle: frameTitle,
                },
            },
        } as IAssessmentInstanceRowData<IFrameAssessmentProperties>;
        const expected = (
            <AssessmentInstanceDetailsColumn
                background={FrameFormatter.frameStyles[frameType].borderColor}
                labelText={FrameFormatter.frameStyles[frameType].contentText}
                textContent={frameTitle}
                tooltipId={null}
            />
        );
        expect(expected).toEqual(frameTitleInstanceDetailsColumnRenderer(item));
    });
});