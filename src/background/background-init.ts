// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AppInsights } from 'applicationinsights-js';

import { Assessments } from '../assessments/assessments';
import { VisualizationConfigurationFactory } from '../common/configs/visualization-configuration-factory';
import { IndexedDBAPI, IndexedDBUtil } from '../common/indexedDB/indexedDB';
import { createDefaultLogger } from '../common/logging/default-logger';
import { NotificationCreator } from '../common/notification-creator';
import { TelemetryDataFactory } from '../common/telemetry-data-factory';
import { UrlValidator } from '../common/url-validator';
import { WindowUtils } from '../common/window-utils';
import { Window } from '../Scripts/Window';
import { ChromeAdapter } from './browser-adapter';
import { ChromeCommandHandler } from './chrome-command-handler';
import { DetailsViewController } from './details-view-controller';
import { DevToolsListener } from './dev-tools-listener';
import { getPersistedData, PersistedData } from './get-persisted-data';
import { GlobalContextFactory } from './global-context-factory';
import { deprecatedStorageDataKeys, storageDataKeys } from './local-storage-data-keys';
import { MessageDistributor } from './message-distributor';
import { LocalStorageData } from './storage-data';
import { TabToContextMap } from './tab-context';
import { TabContextBroadcaster } from './tab-context-broadcaster';
import { TabContextFactory } from './tab-context-factory';
import { TabController } from './tab-controller';
import { TargetTabController } from './target-tab-controller';
import { getTelemetryClient } from './telemetry/telemetry-client-provider';
import { TelemetryEventHandler } from './telemetry/telemetry-event-handler';
import { TelemetryLogger } from './telemetry/telemetry-logger';
import { TelemetryStateListener } from './telemetry/telemetry-state-listener';
import { UserStoredDataCleaner } from './user-stored-data-cleaner';

declare var window: Window;
const browserAdapter = new ChromeAdapter();
const urlValidator = new UrlValidator();
const backgroundInitCleaner = new UserStoredDataCleaner(browserAdapter);

const indexedDBInstance: IndexedDBAPI = new IndexedDBUtil();

backgroundInitCleaner.cleanUserData(deprecatedStorageDataKeys);

// tslint:disable-next-line:no-floating-promises - top-level entry points are intentionally floating promises
getPersistedData(indexedDBInstance).then((persistedData: PersistedData) => {
    browserAdapter.getUserData(storageDataKeys, (userData: LocalStorageData) => {
        const assessmentsProvider = Assessments;
        const windowUtils = new WindowUtils();
        const telemetryDataFactory = new TelemetryDataFactory();
        const telemetryLogger = new TelemetryLogger();

        const telemetryClient = getTelemetryClient(userData, browserAdapter, telemetryLogger, AppInsights);

        const telemetryEventHandler = new TelemetryEventHandler(telemetryClient);
        const globalContext = GlobalContextFactory.createContext(
            browserAdapter,
            telemetryEventHandler,
            userData,
            assessmentsProvider,
            telemetryDataFactory,
            indexedDBInstance,
            persistedData,
        );
        telemetryLogger.initialize(globalContext.featureFlagsController);

        const telemetryStateListener = new TelemetryStateListener(globalContext.stores.userConfigurationStore, telemetryEventHandler);
        telemetryStateListener.initialize();

        const broadcaster = new TabContextBroadcaster(browserAdapter.sendMessageToFramesAndTab);
        const detailsViewController = new DetailsViewController(browserAdapter);

        const tabToContextMap: TabToContextMap = {};

        const visualizationConfigurationFactory = new VisualizationConfigurationFactory();
        const notificationCreator = new NotificationCreator(browserAdapter, visualizationConfigurationFactory);

        const chromeCommandHandler = new ChromeCommandHandler(
            tabToContextMap,
            browserAdapter,
            urlValidator,
            notificationCreator,
            visualizationConfigurationFactory,
            telemetryDataFactory,
            globalContext.stores.userConfigurationStore,
        );
        chromeCommandHandler.initialize();

        const messageDistributor = new MessageDistributor(globalContext, tabToContextMap, browserAdapter);
        messageDistributor.initialize();

        const targetTabController = new TargetTabController(browserAdapter, visualizationConfigurationFactory);

        const tabContextFactory = new TabContextFactory(
            visualizationConfigurationFactory,
            telemetryEventHandler,
            windowUtils,
            targetTabController,
            globalContext.stores.assessmentStore,
            assessmentsProvider,
        );

        const clientHandler = new TabController(
            tabToContextMap,
            broadcaster,
            browserAdapter,
            detailsViewController,
            tabContextFactory,
            createDefaultLogger(),
        );

        clientHandler.initialize();

        const devToolsBackgroundListener = new DevToolsListener(tabToContextMap, browserAdapter);
        devToolsBackgroundListener.initialize();

        window.insightsFeatureFlags = globalContext.featureFlagsController;
    });
});
