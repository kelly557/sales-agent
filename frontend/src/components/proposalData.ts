export type ProposalFormValues = {
  projectName: string;
  customer: string;
  location: string;
  scenario: string;
  area: string;
  baseCondition: string;
  demand: string;
  coatingSystem: string;
  template: string;
  language: string;
  [extraKey: string]: string | undefined;
};

export type ProposalTemplate = {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
};

export const proposalTemplates: ProposalTemplate[] = [
  {
    id: "tmpl-smart",
    name: "智能推荐模版",
    description: "根据项目现场、客户诉求和销售场景自动匹配的默认模板。",
    recommended: true,
  },
  {
    id: "tmpl-commercial-refresh",
    name: "商业楼换新方案模版",
    description: "面向黄浦、浦东等核心商圈商业综合体外墙翻新场景。",
    recommended: true,
  },
  {
    id: "tmpl-hospital",
    name: "医院净味体系方案模版",
    description: "聚焦医院内墙净味体系、施工窗口和验收标准。",
    recommended: false,
  },
  {
    id: "tmpl-industrial-floor",
    name: "工业地坪改造方案模版",
    description: "工业地坪涂装、基层病害识别和施工交底材料。",
    recommended: false,
  },
];

export const initialProposalValues: ProposalFormValues = {
  projectName: "上海富居商业楼翻新推荐书",
  customer: "上海浦东商业管理有限公司",
  location: "上海市浦东新区",
  scenario: "商业综合体外墙翻新",
  area: "18,600 m2",
  baseCondition: "旧涂层局部粉化、开裂，混凝土基层为主，局部保温层需复核粘结强度。",
  demand: "耐候、抗污、低气味，需形成可向业主汇报的技术方案 PPT。",
  coatingSystem: "抗碱封闭底漆 + 高耐候外墙面漆，两遍面涂。",
  template: "商务汇报型 10 页",
  language: "中文",
};

export const proposalProjects = ["立邦外墙涂装翻新方案", "工业地坪涂装建议书", "医院内墙净味体系"];

export type ProposalHistoryStep = {
  title: string;
  detail: string;
  status: "finish" | "process" | "wait";
};

export type ProposalHistoryResult = {
  summary: string;
  highlights: string[];
  attachments: { name: string; type: string; version?: string; content?: string }[];
};

export type ProposalHistoryTurn = {
  id: string;
  question: string;
  thinking: string;
  steps: ProposalHistoryStep[];
  result: ProposalHistoryResult;
};

export type ProposalHistoryConversation = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  messageCount: number;
  turns: ProposalHistoryTurn[];
  projectId?: string;
};

export const proposalHistoryConversations: ProposalHistoryConversation[] = [
  {
    id: "HIST-001",
    title: "商业办公楼内部净化相关的产品有哪些",
    preview: "在净化的核心……",
    updatedAt: "2026-06-09 10:42",
    messageCount: 4,
    turns: [{
      id: "HIST-001-turn-1",
      question: "商业办公楼内部净化相关的产品有哪些？",
      thinking:
        "客户场景为 1.8 万 m² 商业综合体内装翻新，重点是低 VOC、净味和快速投入使用。需要从涂料体系、底材处理和施工窗口三个维度识别推荐产品，并对比医院场景的 TVOC 限值口径。",
      steps: [
        {
          title: "需求解析",
          detail: "识别场景：商业综合体内墙；约束：低气味、短工期；指标：TVOC ≤ 30 mg/m³、入住前 7 天可用。",
          status: "finish",
        },
        {
          title: "知识检索",
          detail: "检索产品库「净味」「内墙」「低 VOC」类目，命中 6 款立邦产品 + 3 款多乐士竞品。",
          status: "finish",
        },
        {
          title: "规则匹配",
          detail: "按净味等级、TVOC 报告、施工道数和单价排序，输出 3 套组合方案。",
          status: "finish",
        },
        {
          title: "输出整理",
          detail: "生成对比表并附上推荐组合的用量估算和施工窗口约束。",
          status: "process",
        },
      ],
      result: {
        summary: "推荐 3 套净味内墙组合：净味全效 A 系列（性价比）、儿童房净味 B 系列（环保升级）、医院级 C 系列（TVOC ≤ 10）。",
        highlights: [
          "A 系列：底漆 + 面漆 2 遍，单价 28 元/m²，工期 4 天。",
          "B 系列：底漆 + 中涂 + 面漆，单价 42 元/m²，工期 6 天。",
          "C 系列：水性无机 + 净味面漆，单价 65 元/m²，TVOC 报告 7 mg/m³。",
        ],
        attachments: [
          {
            name: "净味内墙产品对比表.xlsx",
            type: "Excel",
            version: "V1.2",
            content:
              "1. 净味全效 A 系列：底漆+面漆 2 遍，单价 28 元/m²，工期 4 天，TVOC 报告 26 mg/m³。\n2. 儿童房净味 B 系列：底漆+中涂+面漆，单价 42 元/m²，工期 6 天，TVOC 报告 14 mg/m³。\n3. 医院级 C 系列：水性无机+净味面漆，单价 65 元/m²，工期 8 天，TVOC 报告 7 mg/m³。\n4. 适用基层：混凝土、砌块、轻钢龙骨石膏板；面漆颜色可按业主要求定制。",
          },
          {
            name: "TVOC 抽样检测标准.pdf",
            type: "PDF",
            version: "V1.0",
            content:
              "1. 抽样点位：每 1000 m² 设 1 个采样点，距地 1.2-1.5 m。\n2. 检测方法：GB/T 18883-2022，采样 45 min，流量 0.5 L/min。\n3. 限值：TVOC ≤ 0.60 mg/m³，苯 ≤ 0.11 mg/m³，甲苯 ≤ 0.20 mg/m³。\n4. 检测时机：面漆施工完成后 7 天、客户入住前各 1 次。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-002",
    title: "立邦外墙耐候体系适配黄浦区雨季窗口",
    preview: "根据近 30 天降雨数据……",
    updatedAt: "2026-06-07 17:18",
    messageCount: 6,
    turns: [{
      id: "HIST-002-turn-1",
      question: "立邦外墙耐候体系能否适配黄浦区雨季窗口？",
      thinking:
        "黄浦区 6-7 月平均降水 12 天/月，需识别可施工窗口。结合项目 18,600 m² 体量、吊篮分区和高空作业边界，重新评估底涂干燥、面涂间隔和接茬风险。",
      steps: [
        {
          title: "需求解析",
          detail: "场景：黄浦区商业体外墙翻新；约束：雨季 12 天/月；规模：18,600 m²。",
          status: "finish",
        },
        {
          title: "气象数据读取",
          detail: "读取近 30 天黄浦区逐小时降水概率，识别 4 个 ≥ 4 天连续晴窗。",
          status: "finish",
        },
        {
          title: "工艺对齐",
          detail: "底涂干燥 ≥ 6h、面涂间隔 ≥ 12h、接茬控制在分格缝。",
          status: "finish",
        },
        {
          title: "方案校验",
          detail: "推荐底漆 + 2 遍面漆 + 罩光，配合吊篮分区，雨天备案。",
          status: "finish",
        },
      ],
      result: {
        summary: "立邦外墙耐候体系可适配黄浦区雨季窗口，建议按「4 个晴窗 × 3 段吊篮」排程，整体工期 28 天。",
        highlights: [
          "耐候性：人工加速老化 1500h 通过，色差 ΔE ≤ 1.5。",
          "底涂：抗碱封闭底漆，单遍干燥 6h，可抢晴窗。",
          "面涂：高耐候弹性面漆 2 遍，间隔 12h，接茬风险低。",
          "雨季预案：阴雨停工备案 ≤ 24h 复测含水率 ≤ 10%。",
        ],
        attachments: [
          {
            name: "黄浦区近 30 天降水数据.csv",
            type: "CSV",
            version: "V1.0",
            content:
              "日期,时段,降水概率(mm/h),适宜施工\n06-01,08-18,0.2,适宜\n06-02,08-18,0.0,适宜\n06-03,08-18,1.4,不适宜\n06-04,08-18,0.6,边缘\n06-05,08-18,0.0,适宜\n…（近 30 天逐小时数据）",
          },
          {
            name: "外墙耐候体系施工排程.xlsx",
            type: "Excel",
            version: "V1.1",
            content:
              "1. 第一段（南立面）：D1-D6，底涂 + 第一遍面涂。\n2. 第二段（东、西立面）：D7-D14，两遍面涂 + 罩光。\n3. 第三段（北立面 + 裙楼）：D15-D22，验收与成品保护。\n4. 缓冲：预留 D23-D28 用于阴雨复测和局部修补。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-PRJ3001",
    title: "浦东商业综合体外墙翻新推荐书",
    preview: "围绕立邦外墙涂装推荐书、施工指导书和交付资料清单……",
    updatedAt: "2026-05-29 14:12",
    messageCount: 4,
    projectId: "PRJ-3001",
    turns: [{
      id: "HIST-PRJ3001-turn-1",
      question: "基于浦东商业综合体外墙翻新项目生成推荐书 PPT。",
      thinking:
        "项目目标：1.86 万 m² 商业综合体外墙翻新，输出 10 页商务汇报型 PPT。已读取立邦外墙耐候体系 TDS、现场勘查照片和基层检测记录，按需求解析→资料读取→规则校验→PPT 生成流水线推进。",
      steps: [
        { title: "需求解析", detail: "识别项目：浦东商业综合体外墙；客户：上海浦东商业管理；模板：商务汇报 10 页。", status: "finish" },
        { title: "资料读取", detail: "读取立邦耐候体系 TDS、现场勘查照片包和基层检测记录。", status: "finish" },
        { title: "规则校验", detail: "匹配体系选型、用量估算、施工边界，输出 1 项待复核项。", status: "finish" },
        { title: "PPT 生成", detail: "生成 10 页大纲、逐页内容和图表建议。", status: "process" },
      ],
      result: {
        summary: "已生成《浦东商业综合体外墙翻新推荐书》方案 PPT 初稿：共 10 页，引用 3 类知识资料，识别 1 项待复核内容。",
        highlights: [
          "10 页大纲：背景、现状、目标、体系、工艺、用量、计划、质控、风险、交付。",
          "引用资料：立邦耐候体系 TDS、商业楼翻新案例库、用量估算口径。",
          "待复核：吊篮验收记录与分区施工边界。",
        ],
        attachments: [
          {
            name: "浦东商业综合体外墙翻新推荐书.pptx",
            type: "PPTX",
            version: "V1.3",
            content:
              "幻灯片 1｜封面：浦东商业综合体外墙翻新推荐书\n幻灯片 2｜项目背景与客户诉求\n幻灯片 3｜现场现状诊断（南立面旧涂层粉化）\n幻灯片 4｜方案目标与设计原则\n幻灯片 5｜推荐涂装体系（抗碱封闭底漆 + 高耐候面漆 2 遍）\n幻灯片 6｜施工工艺流程\n幻灯片 7｜材料用量估算（18,600 m²）\n幻灯片 8｜分区实施计划（吊篮 3 段）\n幻灯片 9｜质量控制与验收\n幻灯片 10｜风险提示与审批项",
          },
          {
            name: "外墙涂装施工作业指导书.docx",
            type: "DOCX",
            version: "V2.0",
            content:
              "1. 适用范围：商业综合体外墙翻新；规模 18,600 m²。\n2. 工艺流程：基层处理 → 抗碱封闭底漆 → 高耐候面漆 2 遍 → 罩光。\n3. 干燥间隔：底漆 ≥ 6h，面漆 ≥ 12h。\n4. 安全：高处作业吊篮验收合格后方可施工。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-PRJ3002",
    title: "华南智能制造园地坪改造方案",
    preview: "工业地坪涂装方案、基层病害识别和施工交底……",
    updatedAt: "2026-05-26 11:08",
    messageCount: 4,
    projectId: "PRJ-3002",
    turns: [{
      id: "HIST-PRJ3002-turn-1",
      question: "基于华南智能制造园地坪改造项目生成施工方案。",
      thinking:
        "项目目标：工业地坪涂装方案，聚焦基层病害识别、施工交底和验收标准。已读取车间地坪病害照片、施工交底初稿和工业地坪案例库，按需求解析→资料读取→规则校验→方案生成流水线推进。",
      steps: [
        { title: "需求解析", detail: "识别项目：华南智能制造园地坪改造；客户：华南智能制造园；模板：工业地坪改造方案。", status: "finish" },
        { title: "资料读取", detail: "读取车间地坪病害照片、基层处理建议和施工交底初稿。", status: "finish" },
        { title: "规则校验", detail: "匹配环氧/聚氨酯地坪选型、抗磨和耐化学介质规则，输出 4 项待复核项。", status: "finish" },
        { title: "方案生成", detail: "生成地坪涂装方案、基层处理建议和施工交底初稿。", status: "process" },
      ],
      result: {
        summary: "已生成《工业地坪改造方案》初稿：覆盖基层病害识别、涂装体系、施工交底和验收标准，识别 4 项待复核内容。",
        highlights: [
          "基层病害：裂缝、起砂、油污三类问题，给出对应处理工艺。",
          "推荐体系：环氧底漆 + 环氧砂浆中涂 + 聚氨酯面漆。",
          "施工窗口：车间分段施工，单区面积 ≤ 800 m²。",
          "待复核：含水率、抗压强度、油污深度和接缝处理。",
        ],
        attachments: [
          {
            name: "工业地坪改造方案.pptx",
            type: "PPTX",
            version: "V0.9",
            content:
              "幻灯片 1｜封面：华南智能制造园地坪改造方案\n幻灯片 2｜车间现状（裂缝、起砂、油污分布）\n幻灯片 3｜基层病害识别与处理工艺\n幻灯片 4｜推荐涂装体系（环氧底漆 + 砂浆中涂 + 聚氨酯面漆）\n幻灯片 5｜施工工艺与分段计划\n幻灯片 6｜材料用量估算\n幻灯片 7｜质量控制与验收标准",
          },
          {
            name: "施工交底初稿.docx",
            type: "DOCX",
            version: "V0.8",
            content:
              "1. 适用范围：工业厂房车间地坪。\n2. 基层处理：抛丸/打磨至 Sa2.0，裂缝 V 形切槽填补。\n3. 涂装：环氧底漆 1 遍 → 砂浆中涂 1 遍 → 聚氨酯面漆 2 遍。\n4. 验收：抗压 ≥ 50 MPa，拉伸粘结 ≥ 2.0 MPa。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-PRJ3003",
    title: "医院内墙净味翻新方案",
    preview: "按医院内墙净味体系模板生成方案、施工窗口……",
    updatedAt: "2026-05-18 16:30",
    messageCount: 4,
    projectId: "PRJ-3003",
    turns: [{
      id: "HIST-PRJ3003-turn-1",
      question: "基于江北康复医院内墙净味翻新项目生成方案。",
      thinking:
        "项目目标：医院内墙净味体系方案，聚焦净味等级、TVOC 限值和验收标准。已读取医院内墙现状报告、净味产品库和医院净味案例库，按需求解析→资料读取→规则校验→方案生成流水线推进。",
      steps: [
        { title: "需求解析", detail: "识别项目：江北康复医院内墙净味翻新；客户：江北康复医院；模板：医院净味体系方案。", status: "finish" },
        { title: "资料读取", detail: "读取医院内墙现状报告、净味产品库和医院净味案例库。", status: "finish" },
        { title: "规则校验", detail: "匹配净味等级、TVOC 限值、施工窗口和验收规则，全部通过。", status: "finish" },
        { title: "方案生成", detail: "生成净味体系推荐书、施工窗口说明和验收标准。", status: "process" },
      ],
      result: {
        summary: "已生成《医院内墙净味方案》：覆盖净味体系选型、施工窗口和验收标准，待最终交付。",
        highlights: [
          "净味体系：水性无机底漆 + 医院级净味面漆，TVOC 报告 ≤ 10 mg/m³。",
          "施工窗口：分诊区、病房区分段施工，单区封闭 7 天。",
          "验收：按 GB/T 18883-2022 抽样，TVOC ≤ 0.60 mg/m³。",
          "0 项待复核，方案可直接进入交付。",
        ],
        attachments: [
          {
            name: "医院内墙净味方案.pptx",
            type: "PPTX",
            version: "V1.0",
            content:
              "幻灯片 1｜封面：江北康复医院内墙净味方案\n幻灯片 2｜医院内墙现状（候诊区、病房区分区）\n幻灯片 3｜净味体系选型（水性无机 + 医院级净味面漆）\n幻灯片 4｜施工窗口与封闭计划\n幻灯片 5｜TVOC 验收标准与抽样方案\n幻灯片 6｜交付清单与下一步",
          },
          {
            name: "施工窗口说明.pdf",
            type: "PDF",
            version: "V1.0",
            content:
              "1. 分区：候诊区、病房区、医护通道分三段施工。\n2. 封闭：单区施工后封闭 7 天，强制通风 48h。\n3. 检测：面漆完成后 7 天、客户入住前各 1 次 TVOC 抽样。\n4. 限值：TVOC ≤ 0.60 mg/m³，苯 ≤ 0.11 mg/m³。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-003",
    title: "上海富居商业楼翻新推荐书",
    preview: "需要关注的复核项：含水率、TVOC、接茬……",
    updatedAt: "2026-06-05 09:05",
    messageCount: 5,
    projectId: "PRJ-3004",
    turns: [{
      id: "HIST-003-turn-1",
      question: "请基于上海富居商业楼外墙面生成翻新方案 PPT。",
      thinking:
        "项目目标：1.86 万 m² 商业综合体外墙翻新，需输出 10 页商务汇报型 PPT。已读取项目参数、立邦耐候体系 TDS 和现场勘查照片，按「需求解析 → 资料读取 → 规则校验 → PPT 生成 → 审批交付」流水线推进。",
      steps: [
        {
          title: "需求解析",
          detail: "已识别项目：富居商业楼翻新；客户：上海富居置业；场景：商业综合体外墙翻新；模板：商务汇报 10 页。",
          status: "finish",
        },
        {
          title: "资料读取",
          detail: "读取立邦耐候体系 TDS、现场勘查照片、案例库和材料用量估算口径。",
          status: "finish",
        },
        {
          title: "规则校验",
          detail: "匹配体系选型、用量估算、施工边界、质保口径，输出 3 项待复核项。",
          status: "finish",
        },
        {
          title: "PPT 生成",
          detail: "生成 10 页大纲、逐页内容、图表建议和演讲备注。",
          status: "process",
        },
        {
          title: "审批交付",
          detail: "方案工程师 → 质量复核 → 销售负责人，待提交。",
          status: "wait",
        },
      ],
      result: {
        summary: "已生成《上海富居商业楼翻新推荐书》方案 PPT 初稿：共 10 页，引用 4 类知识资料，识别 3 项待复核内容。",
        highlights: [
          "10 页大纲：背景、现状、目标、体系、工艺、用量、计划、质控、风险、交付。",
          "引用资料：立邦耐候体系 TDS、商业楼翻新案例库、用量估算口径、雨季施工限制。",
          "待复核：基层含水率、吊篮验收记录、面漆道数与间距。",
        ],
        attachments: [
          {
            name: "上海富居商业楼翻新推荐书.pptx",
            type: "PPTX",
            version: "V1.0",
            content:
              "幻灯片 1｜封面：上海富居商业楼翻新推荐书\n幻灯片 2｜项目背景与客户诉求\n幻灯片 3｜现场现状诊断（南立面旧涂层粉化、局部裂缝）\n幻灯片 4｜方案目标与设计原则（耐候、抗污、低气味）\n幻灯片 5｜推荐涂装体系（抗碱封闭底漆 + 高耐候面漆 2 遍）\n幻灯片 6｜施工工艺流程\n幻灯片 7｜材料用量估算（18,600 m²）\n幻灯片 8｜分区实施计划（吊篮 3 段）\n幻灯片 9｜质量控制与验收\n幻灯片 10｜风险提示与审批项",
          },
          {
            name: "PPT 引用溯源表.xlsx",
            type: "Excel",
            version: "V1.0",
            content:
              "页码 02｜现场照片.zip｜南立面旧涂层粉化、局部裂缝\n页码 04｜立邦外墙耐候体系 TDS｜底漆、面漆组合与适用基层\n页码 06｜材料用量估算口径｜按 18,600 m²、两遍面涂估算\n页码 09｜施工进度计划.xlsx｜雨季窗口和吊篮分区施工约束",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-PRJ3001-2",
    title: "浦东项目雨季施工排程",
    preview: "近 30 天降水窗口、吊篮分区和接茬风险……",
    updatedAt: "2026-05-28 09:35",
    messageCount: 3,
    projectId: "PRJ-3001",
    turns: [{
      id: "HIST-PRJ3001-2-turn-1",
      question: "浦东项目雨季窗口怎么排？吊篮分区和接茬如何处理？",
      thinking:
        "浦东 6-7 月平均降水 12 天/月，需结合 18,600 m² 体量、吊篮分区和高空作业边界评估可施工窗口。优先识别连续晴窗，再做底涂/面涂间隔和接茬控制。",
      steps: [
        { title: "需求解析", detail: "约束：雨季 12 天/月；规模：18,600 m²；目标：28 天内完成外墙翻新。", status: "finish" },
        { title: "气象数据读取", detail: "读取近 30 天浦东降水概率，识别 4 个 ≥ 4 天连续晴窗。", status: "finish" },
        { title: "排程输出", detail: "按「4 个晴窗 × 3 段吊篮」排程，缓冲 6 天用于阴雨复测。", status: "process" },
      ],
      result: {
        summary: "推荐「4 段晴窗 × 3 段吊篮」排程：底涂 + 2 遍面漆 + 罩光，整体工期 28 天，含 6 天阴雨缓冲。",
        highlights: [
          "耐候性：人工加速老化 1500h 通过，色差 ΔE ≤ 1.5。",
          "底涂：抗碱封闭底漆，单遍干燥 6h，可抢晴窗。",
          "面涂：高耐候弹性面漆 2 遍，间隔 12h，接茬风险低。",
          "雨季预案：阴雨停工备案 ≤ 24h 复测含水率 ≤ 10%。",
        ],
        attachments: [
          {
            name: "浦东项目近 30 天降水数据.csv",
            type: "CSV",
            version: "V1.0",
            content:
              "日期,时段,降水概率(mm/h),适宜施工\n06-01,08-18,0.2,适宜\n06-02,08-18,0.0,适宜\n06-03,08-18,1.4,不适宜\n06-04,08-18,0.6,边缘\n06-05,08-18,0.0,适宜\n…（近 30 天逐小时数据）",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-PRJ3002-2",
    title: "华南项目基层病害识别",
    preview: "裂缝、起砂、油污三类问题处理工艺……",
    updatedAt: "2026-05-25 10:20",
    messageCount: 3,
    projectId: "PRJ-3002",
    turns: [{
      id: "HIST-PRJ3002-2-turn-1",
      question: "华南项目车间基层病害怎么处理？",
      thinking:
        "现场已识别裂缝、起砂、油污三类病害，需要按严重程度分别给出工艺。裂缝按 V 形切槽填补 + 环氧砂浆；起砂按抛丸/打磨至 Sa2.0；油污按专用清洗剂 + 打磨。",
      steps: [
        { title: "需求解析", detail: "识别三类病害：裂缝、起砂、油污；目标：单区处理 ≤ 2 天。", status: "finish" },
        { title: "工艺匹配", detail: "匹配裂缝 V 形切槽 + 环氧砂浆；起砂抛丸 Sa2.0；油污专用清洗剂。", status: "finish" },
        { title: "方案输出", detail: "输出分病害处理工艺表，附 4 项待现场复核项。", status: "process" },
      ],
      result: {
        summary: "已输出三类病害分项处理工艺：裂缝 V 形切槽 + 环氧砂浆；起砂抛丸 Sa2.0；油污专用清洗剂 + 打磨。",
        highlights: [
          "裂缝：V 形切槽至深度 ≥ 5mm，环氧砂浆填补，养护 24h。",
          "起砂：抛丸/打磨至 Sa2.0，含水率 ≤ 8%。",
          "油污：专用清洗剂浸泡 30 min 后打磨至无残留。",
          "待复核：含水率、抗压强度、油污深度和接缝处理。",
        ],
        attachments: [
          {
            name: "基层病害识别报告.pdf",
            type: "PDF",
            version: "V1.0",
            content:
              "1. 裂缝分布：车间 1F 主通道 12 处，单条长度 0.3-1.2 m。\n2. 起砂范围：车间 2F 西区，约 280 m²。\n3. 油污范围：车间 1F 装配区，约 60 m²，深度 ≤ 0.5 mm。\n4. 处理建议：裂缝 V 形切槽 + 环氧砂浆；起砂抛丸 Sa2.0；油污专用清洗剂 + 打磨。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-PRJ3003-2",
    title: "江北医院施工窗口说明",
    preview: "分诊区/病房区分段封闭 7 天，TVOC 抽样……",
    updatedAt: "2026-05-16 14:50",
    messageCount: 3,
    projectId: "PRJ-3003",
    turns: [{
      id: "HIST-PRJ3003-2-turn-1",
      question: "江北医院施工窗口怎么排？TVOC 验收标准是什么？",
      thinking:
        "医院场景需保证施工期间不干扰诊疗，建议按分诊区、病房区、医护通道三段施工，单区封闭 7 天。TVOC 验收按 GB/T 18883-2022 抽样，限值 0.60 mg/m³。",
      steps: [
        { title: "需求解析", detail: "目标：分诊区/病房区分段施工；约束：单区封闭 7 天。", status: "finish" },
        { title: "窗口排程", detail: "三段施工：分诊区 → 病房区 → 医护通道，单区 7 天封闭 + 48h 通风。", status: "finish" },
        { title: "验收对齐", detail: "TVOC ≤ 0.60 mg/m³，苯 ≤ 0.11 mg/m³；面漆完成后 7 天、入住前各抽样 1 次。", status: "process" },
      ],
      result: {
        summary: "已输出分诊区/病房区/医护通道三段施工窗口：单区封闭 7 天 + 48h 通风，TVOC 抽样按 GB/T 18883-2022。",
        highlights: [
          "分诊区：D1-D7，封闭 7 天 + 48h 强制通风。",
          "病房区：D8-D14，封闭 7 天 + 48h 强制通风。",
          "医护通道：D15-D21，封闭 7 天 + 48h 强制通风。",
          "验收：TVOC ≤ 0.60 mg/m³，苯 ≤ 0.11 mg/m³。",
        ],
        attachments: [
          {
            name: "施工窗口说明.pdf",
            type: "PDF",
            version: "V1.0",
            content:
              "1. 分区：候诊区、病房区、医护通道分三段施工。\n2. 封闭：单区施工后封闭 7 天，强制通风 48h。\n3. 检测：面漆完成后 7 天、客户入住前各 1 次 TVOC 抽样。\n4. 限值：TVOC ≤ 0.60 mg/m³，苯 ≤ 0.11 mg/m³。",
          },
        ],
      },
    },
    ],
  },
  {
    id: "HIST-003-2",
    title: "富居夜间施工组织方案",
    preview: "夜间吊篮验收、噪声控制和成品保护……",
    updatedAt: "2026-06-03 22:10",
    messageCount: 3,
    projectId: "PRJ-3004",
    turns: [{
      id: "HIST-003-2-turn-1",
      question: "富居项目夜间施工如何组织？吊篮验收和噪声控制怎么做？",
      thinking:
        "黄浦核心商圈白天车流密集，建议夜间 22:00-次日 05:00 吊篮施工。重点是吊篮验收、噪声控制、成品保护和与物业的联动报备。",
      steps: [
        { title: "需求解析", detail: "约束：夜间 22:00-05:00；规模：18,600 m²；客户：核心商圈物业报备。", status: "finish" },
        { title: "方案对齐", detail: "吊篮验收、夜间照明、噪声 ≤ 55 dB、成品保护膜、物业报备。", status: "finish" },
        { title: "方案输出", detail: "输出夜间施工组织方案，含 3 段吊篮排程和 5 项物业报备要点。", status: "process" },
      ],
      result: {
        summary: "已输出夜间施工组织方案：3 段吊篮、噪声 ≤ 55 dB、成品保护膜、5 项物业报备要点。",
        highlights: [
          "吊篮验收：作业前双人复核，填写吊篮验收记录表。",
          "噪声控制：现场 ≤ 55 dB，避开 22:00 前强噪声工序。",
          "成品保护：地面 + 玻璃贴膜，分段撤场。",
          "物业报备：施工时段、负责人、应急联系 5 项。",
        ],
        attachments: [
          {
            name: "夜间施工组织方案.docx",
            type: "DOCX",
            version: "V0.7",
            content:
              "1. 适用范围：黄浦核心商圈商业体外墙翻新（夜间 22:00-05:00）。\n2. 吊篮验收：作业前双人复核，填写吊篮验收记录表。\n3. 噪声控制：现场 ≤ 55 dB，避开 22:00 前强噪声工序。\n4. 成品保护：地面 + 玻璃贴膜，分段撤场。\n5. 物业报备：施工时段、负责人、应急联系 5 项。",
          },
        ],
      },
    },
    ],
  },
];

export const proposalPipeline = [
  { title: "需求解析", description: "识别场景、客户诉求、页数、语言、风格和交付对象。", status: "finish" },
  { title: "资料读取", description: "读取上传资料、项目档案和知识库条目；外部搜索暂未接入。", status: "finish" },
  { title: "规则校验", description: "匹配体系选型、用量估算、施工边界和质保口径规则。", status: "finish" },
  { title: "PPT 生成", description: "生成大纲、逐页内容、图表建议和演讲备注。", status: "process" },
  { title: "审批交付", description: "待方案工程师复核后进入交付中心。", status: "wait" },
] as const;

export const proposalKnowledgeRows = [
  { key: "1", name: "立邦外墙耐候体系 TDS", type: "产品资料", status: "已引用", owner: "产品技术组" },
  { key: "2", name: "商业综合体外墙翻新案例库", type: "案例", status: "已引用", owner: "解决方案组" },
  { key: "3", name: "涂装方案材料用量估算口径", type: "规则", status: "已命中", owner: "质量复核" },
  { key: "4", name: "上海地区雨季施工限制", type: "项目知识", status: "待现场复核", owner: "项目经理" },
];

export const proposalRuleRows = [
  { key: "1", rule: "基层含水率复核", result: "必须补充", detail: "外墙翻新施工前需完成含水率和粘结强度检测。" },
  { key: "2", rule: "底涂体系匹配", result: "通过", detail: "旧涂层粉化场景匹配抗碱封闭底漆。" },
  { key: "3", rule: "面涂道数", result: "通过", detail: "按两遍面涂核算材料用量和工艺步骤。" },
  { key: "4", rule: "高处作业边界", result: "待审批", detail: "吊篮验收记录需进入最终方案附件。" },
];

export const proposalCitationRows = [
  { key: "1", slide: "02 现状诊断", source: "现场照片.zip", evidence: "南立面旧涂层粉化、局部裂缝" },
  { key: "2", slide: "04 推荐体系", source: "立邦外墙耐候体系 TDS", evidence: "底漆、面漆组合与适用基层" },
  { key: "3", slide: "06 用量估算", source: "材料用量估算口径", evidence: "按 18,600 m2、两遍面涂估算" },
  { key: "4", slide: "09 风险与审批", source: "施工进度计划.xlsx", evidence: "雨季窗口和吊篮分区施工约束" },
];

export const proposalApprovalRows = [
  { key: "1", node: "方案工程师", assignee: "周亦然", status: "待复核", focus: "体系选型、客户表达" },
  { key: "2", node: "质量复核", assignee: "林闻", status: "待复核", focus: "规范条款、风险提示" },
  { key: "3", node: "销售负责人", assignee: "沈嘉", status: "待提交", focus: "报价口径、商务措辞" },
];

export const proposalSlides = [
  { key: "1", title: "项目背景与客户诉求", content: "说明商业综合体外墙翻新的项目范围、客户关注点和汇报目标。" },
  { key: "2", title: "现场现状诊断", content: "呈现旧涂层粉化、开裂、局部保温层复核等关键问题。" },
  { key: "3", title: "方案目标与设计原则", content: "围绕耐候、抗污、低气味和分区施工建立方案原则。" },
  { key: "4", title: "推荐涂装体系", content: "展示底漆、面漆、找平处理和配套材料的组合关系。" },
  { key: "5", title: "施工工艺流程", content: "分解基层处理、裂缝修补、底涂、面涂和验收步骤。" },
  { key: "6", title: "材料用量估算", content: "按 18,600 m2 和两遍面涂核算材料用量，并标注复核条件。" },
  { key: "7", title: "分区实施计划", content: "按主楼南立面、裙楼商业街和坡道场景安排施工策略。" },
  { key: "8", title: "质量控制与验收", content: "列出色差、接茬、阴阳角、分格缝和成品保护控制项。" },
  { key: "9", title: "风险提示与审批项", content: "突出雨季、高处作业、吊篮验收和现场检测待补充事项。" },
  { key: "10", title: "交付清单与下一步", content: "汇总 PPT、方案正文、材料表、审批记录和客户沟通建议。" },
];

export type ProposalProjectGroup = {
  projectId: string;
  title: string;
  customer: string;
  conversations: ProposalHistoryConversation[];
};

export const proposalProjectGroups: ProposalProjectGroup[] = (() => {
  const order: { projectId: string; title: string; customer: string }[] = [
    { projectId: "PRJ-3001", title: "浦东商业综合体外墙翻新", customer: "上海浦东商业管理有限公司" },
    { projectId: "PRJ-3002", title: "华南智能制造园地坪改造", customer: "华南智能制造园" },
    { projectId: "PRJ-3003", title: "医院内墙净味翻新咨询", customer: "江北康复医院" },
    { projectId: "PRJ-3004", title: "上海富居商业楼翻新", customer: "上海富居资产管理有限公司" },
    { projectId: "UNGROUPED", title: "未分组对话", customer: "通用知识检索" },
  ];
  return order
    .map((meta) => {
      const conversations =
        meta.projectId === "UNGROUPED"
          ? proposalHistoryConversations.filter((conversation) => !conversation.projectId)
          : proposalHistoryConversations.filter(
              (conversation) => conversation.projectId === meta.projectId,
            );
      return { ...meta, conversations };
    })
    .filter((group) => group.conversations.length > 0);
})();

export function findProposalConversationById(
  conversationId: string,
): ProposalHistoryConversation | null {
  return (
    proposalHistoryConversations.find((conversation) => conversation.id === conversationId) ?? null
  );
}
