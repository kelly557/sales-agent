import {
  CalculatorOutlined,
  CheckSquareOutlined,
  FilePptOutlined,
  FormOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

export interface QuickScene {
  title: string;
  text: string;
  icon: ReactNode;
}

export const quickScenes: QuickScene[] = [
  {
    title: "解决方案PPT",
    text: "读取项目参数、客户诉求和模板，生成可预览可编辑的方案演示。",
    icon: <FilePptOutlined />,
  },
  {
    title: "施工作业指导书",
    text: "基于工序、设备、标准和现场条件生成作业指导内容。",
    icon: <FormOutlined />,
  },
  {
    title: "工程计算",
    text: "按项目参数完成用量、面积、负荷、报价和工期测算。",
    icon: <CalculatorOutlined />,
  },
  {
    title: "智能审核",
    text: "按审核规则对方案材料评分，低于阈值进入人工审批。",
    icon: <CheckSquareOutlined />,
  },
];

export const promptSuggestions: string[] = [
  "商业办公楼内部净化相关的产品有哪些",
  "基于 XX 项目参数生成客户拜访用解决方案 PPT",
  "把客户现场照片和产品资料整理成一份施工作业指导书",
  "检查本次方案是否满足企业审批规则并给出修改意见",
];
