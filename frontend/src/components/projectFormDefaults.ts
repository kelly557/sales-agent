export interface CreatedProject {
  name: string;
  projectType: string;
  region: string;
  projectScene: string;
  address: string;
  stage?: string;
  code?: string;
  startDate?: string;
  siteOwner?: string;
  investor?: string;
  remark?: string;
}

export const defaultCreatedProject: CreatedProject = {
  name: "xxxxxx",
  projectType: "",
  region: "上海市 / 静安区 / 彭浦镇",
  projectScene: "",
  address: "上海市静安区彭浦镇望源公寓",
  stage: "储备阶段",
  startDate: "2026-06-02",
  investor: "kelly",
};
