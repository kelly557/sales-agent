export type GuideFormValues = {
  projectName: string;
  workArea: string;
  guideType: string;
  baseCondition: string;
  coatingSystem: string;
  safetyRequirement: string;
};

export const initialGuideValues: GuideFormValues = {
  projectName: "浦东商业综合体外墙翻新项目",
  workArea: "主楼南立面、裙楼商业街、地下车库坡道",
  guideType: "外墙涂装施工作业指导书",
  baseCondition: "旧涂层局部粉化、裂缝宽度小于 0.3mm，局部保温层需复核粘结强度。",
  coatingSystem: "立邦抗碱封闭底漆 + 高耐候外墙面漆，两遍面涂。",
  safetyRequirement: "吊篮作业需完成验收，雨天、五级以上大风和基层含水率超标时暂停施工。",
};

export const guideProjects = ["外墙涂装作业指导书", "工业地坪施工交底", "内墙翻新作业方案"];

export const guideMaterialRows = [
  { key: "1", name: "外墙现勘照片.zip", status: "已读取", source: "现场照片", risk: "需补充北立面近景" },
  { key: "2", name: "立邦外墙体系说明.pdf", status: "已引用", source: "产品资料", risk: "无" },
  { key: "3", name: "施工进度计划.xlsx", status: "已读取", source: "项目计划", risk: "雨季窗口需复核" },
];

export const guideToolRows = [
  { key: "1", item: "基层处理", material: "柔性找平腻子、抗裂砂浆", amount: "按实测面积核算", note: "裂缝处加强处理" },
  { key: "2", item: "底涂施工", material: "立邦抗碱封闭底漆", amount: "约 1,860 kg", note: "滚涂均匀，不漏涂" },
  { key: "3", item: "面涂施工", material: "高耐候外墙面漆", amount: "约 3,720 kg", note: "两遍成活，色差分区控制" },
  { key: "4", item: "成品保护", material: "遮蔽膜、胶带、警示围挡", amount: "按施工段配置", note: "门窗、石材和绿化保护" },
];

export const guideDocumentSections = [
  "一、适用范围：本指导书适用于浦东商业综合体外墙翻新项目的基层处理、底涂、面涂和成品保护作业。",
  "二、作业准备：施工前应完成吊篮验收、样板确认、材料复核、基层含水率和粘结强度检查。",
  "三、施工工艺：清理基层、裂缝修补、批刮找平、打磨除尘、滚涂底漆、两遍面漆、分区验收。",
  "四、质量控制：面层应颜色一致、无漏涂、无明显接茬；阴阳角、分格缝和收口部位应重点复核。",
  "五、安全要求：高处作业人员必须持证上岗，吊篮每日检查，遇雨天或五级以上大风暂停作业。",
];
