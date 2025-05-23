// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { CardSelectionMessageCreator } from 'common/message-creators/card-selection-message-creator';
import { NamedFC } from 'common/react/named-fc';
import { NarrowModeStatus } from 'DetailsView/components/narrow-mode-detector';
import * as React from 'react';

import { TargetAppData } from '../../../common/types/store-data/unified-data-interface';
import { InstanceOutcomeType } from '../../../reports/components/instance-outcome-type';
import {
    getNeedsReviewRuleResourcesUrl,
    isOutcomeNeedsReview,
} from '../../configs/needs-review-rule-resources';
import { CardRuleResult } from '../../types/store-data/card-view-model';
import { UserConfigurationStoreData } from '../../types/store-data/user-configuration-store';
import { InstanceDetailsGroup, InstanceDetailsGroupDeps } from './instance-details-group';
import { RuleResources, RuleResourcesDeps } from './rule-resources';

export type RuleContentDeps = InstanceDetailsGroupDeps & RuleResourcesDeps;

export type RuleContentProps = {
    deps: RuleContentDeps;
    rule: CardRuleResult;
    userConfigurationStoreData: UserConfigurationStoreData | null;
    targetAppInfo: TargetAppData;
    cardSelectionMessageCreator?: CardSelectionMessageCreator;
    narrowModeStatus?: NarrowModeStatus;
    outcomeType: InstanceOutcomeType;
    feedbackURL?: string;
};

export const RuleContent = NamedFC<RuleContentProps>('RuleContent', props => {
    props.deps.GetNeedsReviewRuleResourcesUrl = getNeedsReviewRuleResourcesUrl;
    props.deps.IsOutcomeNeedsReview = isOutcomeNeedsReview;
    return (
        <>
            <RuleResources {...props} />
            <InstanceDetailsGroup {...props} />
        </>
    );
});
