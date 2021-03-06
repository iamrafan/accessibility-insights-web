// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BugFilingSettings } from './bug-filing/bug-filing-settings';
import { HighContrastSettings } from './high-contrast/high-contrast-settings';
import { createSettingsProvider } from './settings-provider';
import { TelemetrySettings } from './telemetry/telemetry-settings';

export const SettingsProviderImpl = createSettingsProvider([TelemetrySettings, HighContrastSettings, BugFilingSettings]);
