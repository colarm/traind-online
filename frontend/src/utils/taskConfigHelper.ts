import {
  TaskConfigs,
  ParamsType,
  UIConfigs,
  UIConfig,
} from "../types/taskConfig";
import taskConfigsData from "../config/task_configs.json";
import uiConfigsData from "../config/ui_configs.json";

const getTaskConfigs = (): TaskConfigs => {
  return taskConfigsData as TaskConfigs;
};

const getUIConfigs = (): UIConfigs => {
  return uiConfigsData as UIConfigs;
};

export const getDefaultParams = (
  taskType: string = "reddit_analysis"
): ParamsType => {
  const configs = getTaskConfigs();
  return configs.task_configs[taskType as keyof typeof configs.task_configs]
    ?.default_params;
};

export const getDefaultUIConfigs = (
  taskType: string = "reddit_analysis"
): UIConfig => {
  const configs = getUIConfigs();
  return configs.ui_configs[taskType as keyof typeof configs.ui_configs];
};