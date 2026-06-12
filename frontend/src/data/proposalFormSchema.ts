export type FieldType = "text" | "number" | "select";

export interface ProposalFormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

export interface ProposalFormSchema {
  id: string;
  label: string;
  description: string;
  fields: ProposalFormField[];
}

export const proposalFormSchemas: ProposalFormSchema[] = [
  {
    id: "exterior",
    label: "建筑外墙涂装",
    description: "外墙翻新、商业综合体、园区建筑等场景",
    fields: [
      { key: "projectName", label: "项目名称", type: "text", required: true, fullWidth: true },
      { key: "customer", label: "客户名称", type: "text", required: true },
      { key: "location", label: "项目位置", type: "text", required: true },
      {
        key: "scenario",
        label: "项目场景",
        type: "select",
        required: true,
        options: [
          { value: "商业综合体外墙翻新", label: "商业综合体外墙翻新" },
          { value: "园区建筑外墙翻新", label: "园区建筑外墙翻新" },
          { value: "医院公共区域外墙", label: "医院公共区域外墙" },
        ],
      },
      { key: "area", label: "涂装面积", type: "text", required: false, placeholder: "如 18,600 m²" },
      {
        key: "template",
        label: "PPT 模板",
        type: "select",
        required: false,
        options: [
          { value: "商务汇报型 10 页", label: "商务汇报型 10 页" },
          { value: "技术说明型 12 页", label: "技术说明型 12 页" },
          { value: "客户答疑型 8 页", label: "客户答疑型 8 页" },
        ],
      },
      { key: "coatingSystem", label: "推荐体系", type: "text", required: false, fullWidth: true },
      { key: "baseCondition", label: "基层情况", type: "text", required: true, fullWidth: true },
      { key: "demand", label: "客户诉求与交付目标", type: "text", required: true, fullWidth: true },
      {
        key: "language",
        label: "输出语言",
        type: "select",
        required: false,
        options: [
          { value: "中文", label: "中文" },
          { value: "English", label: "English" },
        ],
      },
    ],
  },
  {
    id: "floor",
    label: "工业地坪",
    description: "工业厂房地坪、车间地坪、仓库地坪等场景",
    fields: [
      { key: "projectName", label: "项目名称", type: "text", required: true, fullWidth: true },
      { key: "customer", label: "客户名称", type: "text", required: true },
      { key: "location", label: "项目位置", type: "text", required: true },
      {
        key: "scenario",
        label: "项目场景",
        type: "select",
        required: true,
        options: [
          { value: "工业厂房地坪", label: "工业厂房地坪" },
          { value: "车间地坪改造", label: "车间地坪改造" },
          { value: "仓库地坪翻新", label: "仓库地坪翻新" },
        ],
      },
      { key: "area", label: "地坪面积", type: "text", required: true, placeholder: "如 4,200 m²" },
      {
        key: "loadRequirement",
        label: "承载要求",
        type: "select",
        required: true,
        options: [
          { value: "轻载 1-3 吨", label: "轻载 1-3 吨" },
          { value: "中载 5-10 吨", label: "中载 5-10 吨" },
          { value: "重载 10 吨以上", label: "重载 10 吨以上" },
        ],
      },
      { key: "coatingSystem", label: "推荐体系", type: "text", required: false, fullWidth: true },
      { key: "baseCondition", label: "基层情况", type: "text", required: true, fullWidth: true },
      { key: "demand", label: "客户诉求与交付目标", type: "text", required: true, fullWidth: true },
    ],
  },
  {
    id: "interior",
    label: "医院内墙净味",
    description: "医院、康复机构、办公空间净味翻新等场景",
    fields: [
      { key: "projectName", label: "项目名称", type: "text", required: true, fullWidth: true },
      { key: "customer", label: "客户名称", type: "text", required: true },
      { key: "location", label: "项目位置", type: "text", required: true },
      {
        key: "scenario",
        label: "项目场景",
        type: "select",
        required: true,
        options: [
          { value: "医院内墙净味翻新", label: "医院内墙净味翻新" },
          { value: "康复机构内墙", label: "康复机构内墙" },
          { value: "办公空间净味", label: "办公空间净味" },
        ],
      },
      { key: "area", label: "内墙面积", type: "text", required: true, placeholder: "如 9,800 m²" },
      {
        key: "vocStandard",
        label: "VOC 等级",
        type: "select",
        required: true,
        options: [
          { value: "GB/T 18883 优级", label: "GB/T 18883 优级" },
          { value: "法国 A+", label: "法国 A+" },
          { value: "德国 TÜV", label: "德国 TÜV" },
        ],
      },
      { key: "coatingSystem", label: "推荐体系", type: "text", required: false, fullWidth: true },
      { key: "demand", label: "客户诉求与交付目标", type: "text", required: true, fullWidth: true },
    ],
  },
];

export const defaultProposalSchemaId = proposalFormSchemas[0].id;

export function findProposalSchema(schemaId: string): ProposalFormSchema {
  return proposalFormSchemas.find((schema) => schema.id === schemaId) ?? proposalFormSchemas[0];
}
