/**
 * Task Configuration Helper
 * Utility functions for loading and managing task configuration data
 */

import {
  TaskConfigs,
  ParamsType,
  UIConfigs,
  UIConfig,
} from "../types/taskConfig";
import taskConfigsData from "../config/task_configs.json";
import uiConfigsData from "../config/ui_configs.json";

/**
 * Load task configuration data from JSON file
 */
const getTaskConfigs = (): TaskConfigs => {
  return taskConfigsData as TaskConfigs;
};

/**
 * Load UI configuration data from JSON file
 */
const getUIConfigs = (): UIConfigs => {
  return uiConfigsData as UIConfigs;
};

/**
 * Get default parameters for a specific task type
 */
export const getDefaultParams = (
  taskType: string = "reddit_analysis"
): ParamsType => {
  const configs = getTaskConfigs();
  return configs.task_configs[taskType as keyof typeof configs.task_configs]
    ?.default_params;
};

/**
 * Get default UI configuration for a specific task type
 */
export const getDefaultUIConfigs = (
  taskType: string = "reddit_analysis"
): UIConfig => {
  const configs = getUIConfigs();
  return configs.ui_configs[taskType as keyof typeof configs.ui_configs];
};
