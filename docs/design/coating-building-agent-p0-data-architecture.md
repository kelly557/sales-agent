# 涂料与建筑行业 Agent 数据模型设计

## 1. 模型边界

本设计只定义数据模型，不描述任务链路、SOP 流程、接口契约和端到端数据流。

核心对象分为五类：

| 模型 | 本质 | 生命周期 | 说明 |
| --- | --- | --- | --- |
| 基线模型 | 跨行业通用业务对象 | 平台级长期稳定 | 项目、客户、工程对象、产品、工况、要求、证据、权限 |
| 行业包 | 企业启用行业时导入的行业资产包 | 企业级安装，按版本升级 | 行业字段、枚举、规则、模板、默认 Skill 定义 |
| Skill 定义 | 某类任务的能力说明 | 平台级或行业包内版本化 | 定义输入、输出、所需数据、质量要求，不保存单次任务数据 |
| 场景包 | 单次任务运行时的数据快照 | 任务级临时产物 | 给 Skill 执行时使用，包含已归一、已过滤、带证据的数据 |
| Hermes 记忆 | 客户与项目记忆 | 客户/项目级持续沉淀 | 偏好、反馈、历史确认项、模板习惯、复用标签 |

对象关系：

| 关系 | 说明 |
| --- | --- |
| 行业包扩展基线模型 | 涂料、建筑等行业字段挂在基线对象的行业扩展区，不污染基线对象 |
| Skill 引用行业包 | 行业包可以内置默认 Skill 定义，例如涂料解决方案生成、建筑作业指导书生成 |
| 场景包实例化 Skill 输入 | 场景包是某次任务给 Skill 的运行时输入，不定义流程 |
| Hermes 注入场景包 | Hermes 作为偏好和历史上下文进入场景包，但不覆盖强事实字段 |
| 证据和权限贯穿所有模型 | 关键字段、记忆、知识片段、交付物都必须带来源和权限范围 |

## 2. 基线模型

基线模型承载跨行业共性对象，新增行业时原则上不修改基线对象。

| 对象 | 关键字段 | 业务口径 |
| --- | --- | --- |
| Tenant | `tenant_id`、`tenant_name`、`enabled_industry_packs` | 企业租户和已启用行业包 |
| Customer | `customer_id`、`customer_name`、`customer_type`、`industry_tags` | 客户身份、客户类型和行业标签 |
| Project | `project_id`、`project_name`、`customer_id`、`industry`、`stage`、`location` | 任务必须绑定项目，项目决定行业包和权限范围 |
| EngineeringAsset | `asset_id`、`asset_type`、`project_scope`、`discipline`、`location_ref` | 工程对象，可表示涂装区域、楼栋、楼层、施工部位 |
| Product | `product_id`、`product_name`、`material_family`、`product_params`、`certifications` | 产品、材料、参数、认证和适用范围 |
| WorkCondition | `condition_id`、`substrate`、`environment`、`temperature`、`humidity`、`service_condition` | 施工或使用工况 |
| Requirement | `requirement_id`、`requirement_type`、`content`、`priority`、`source_refs` | 客户需求、图纸要求、合同要求、标准要求 |
| KnowledgeRef | `knowledge_id`、`knowledge_type`、`title`、`source_system`、`source_refs` | 标准条款、案例、FAQ、模板、专家经验的引用 |
| Evidence | `evidence_id`、`source_type`、`source_uri`、`page_or_location`、`updated_at`、`confidence` | 字段和结论的来源证据 |
| PermissionScope | `tenant_id`、`project_id`、`roles`、`file_acl`、`data_scope` | 数据、文件、知识、记忆和交付物的权限边界 |

## 3. 行业包模型

行业包是企业启用某个行业能力时导入/安装的一套行业资产包，不是单次任务数据。

行业包包含：

| 资产 | 说明 |
| --- | --- |
| 行业对象 | 行业特有对象和对象关系 |
| 行业字段 | 行业扩展字段、字段类型、是否必填、单位、枚举 |
| 行业枚举 | 行业术语和标准枚举 |
| 行业规则 | 适用性、合规、质量、安全、字段优先级等规则 |
| 行业模板 | 查询回答模板、解决方案模板、作业指导书模板 |
| 默认 Skill 定义 | 行业默认启用的任务能力定义 |
| 字段映射建议 | 常见客户字段到行业扩展字段的默认映射建议 |

### 3.1 涂料行业包

行业包标识：`industry_pack.coating`

| 扩展对象 | 字段 | 说明 |
| --- | --- | --- |
| CoatingSystem | `system_id`、`primer`、`intermediate`、`topcoat`、`total_dft` | 涂层体系，按底漆、中涂、面漆组织 |
| CoatingProductParams | `theoretical_spreading_rate`、`volume_solid`、`dry_film_thickness`、`mix_ratio`、`pot_life` | 涂料产品技术参数 |
| CoatingWorkCondition | `substrate_type`、`surface_treatment`、`corrosion_level`、`medium`、`exposure_environment` | 涂装工况和适用性条件 |
| CoatingProcedure | `application_method`、`recoat_interval`、`inspection_method`、`safety_notes` | 涂装施工过程字段 |

涂料行业常用枚举：

| 枚举 | 示例 |
| --- | --- |
| 腐蚀等级 | C1、C2、C3、C4、C5 |
| 表面处理 | St2、St3、Sa2、Sa2.5、Sa3 |
| 底材 | 碳钢、镀锌钢、混凝土、铝材 |
| 涂层角色 | 底漆、中涂、面漆、清漆 |

### 3.2 建筑行业包

行业包标识：`industry_pack.building`

| 扩展对象 | 字段 | 说明 |
| --- | --- | --- |
| BuildingScope | `building_no`、`floor`、`room`、`construction_part`、`trade` | 建筑施工范围 |
| BuildingSubstrate | `base_layer`、`surface_condition`、`moisture_condition`、`defect_status` | 基层条件 |
| FinishSchedule | `finish_code`、`practice_description`、`material_layers`、`drawing_ref` | 做法表和图纸引用 |
| BuildingQualityRequirement | `inspection_lot`、`acceptance_standard`、`quality_control_points`、`safety_requirements` | 质量、安全、验收字段 |

建筑行业常用枚举：

| 枚举 | 示例 |
| --- | --- |
| 专业 | 土建、装饰、机电、幕墙、防水 |
| 施工部位 | 墙面、地面、顶棚、外立面、屋面 |
| 基层类型 | 抹灰基层、混凝土基层、石膏板基层、砌体基层 |
| 资料类型 | 图纸、做法表、施工方案、检验批、隐蔽验收 |

## 4. Skill 定义模型

Skill 是任务能力定义，不是单次任务数据，也不是行业字段本身。

Skill 定义包含：

| 字段 | 说明 |
| --- | --- |
| `skill_id` | Skill 唯一标识 |
| `skill_name` | Skill 名称 |
| `task_type` | 查询、解决方案生成、作业指导书生成 |
| `supported_industries` | 支持的行业包 |
| `input_contract` | 所需输入对象、必填字段、可选字段 |
| `output_contract` | 输出物类型、结构、证据要求 |
| `required_knowledge_types` | 需要的知识类型，例如标准、案例、模板、FAQ |
| `required_evidence_policy` | 引用和证据要求 |
| `quality_rules` | 质量规则、合规规则、风险提示规则 |
| `hermes_usage_policy` | Hermes 可影响哪些内容，不可影响哪些内容 |

三类优先 Skill：

| Skill | 输入模型 | 输出模型 | 说明 |
| --- | --- | --- | --- |
| 查询 Skill | 查询场景包 | 答案、引用、相关资料、风险提示 | 用于问答、资料定位、参数查询 |
| 解决方案生成 Skill | 解决方案场景包 | 方案文档、引用计划、风险项、证据包 | 用于涂料方案和建筑施工方案 |
| 作业指导书生成 Skill | 作业指导书场景包 | 作业步骤、质量控制点、安全措施、验收要点 | 用于现场执行文件 |

Skill 与行业包关系：

| 关系 | 说明 |
| --- | --- |
| 平台可内置通用 Skill | 查询、生成、审核、导出等通用能力 |
| 行业包可带默认 Skill 配置 | 涂料行业包可带涂料解决方案生成 Skill 默认配置 |
| 企业可覆盖 Skill 配置 | 企业可调整输入字段、模板、质量规则和输出格式 |
| Skill 不保存运行时数据 | 单次任务数据由场景包承载 |

## 5. 场景包模型

场景包是单次任务运行时的数据快照，是 Skill 的运行时输入。

场景包通用结构：

| 区块 | 内容 |
| --- | --- |
| Context | 租户、项目、客户、行业、任务类型、工程对象 |
| IndustryExtension | 涂料或建筑行业扩展字段 |
| Requirements | 客户需求、项目要求、图纸要求、标准要求 |
| KnowledgeRefs | 标准、案例、FAQ、模板、历史方案引用 |
| HermesContext | 客户偏好、项目记忆、历史反馈、模板偏好 |
| EvidenceRefs | 字段和结论可引用的证据 |
| PermissionScope | 当前用户可见的数据范围 |
| DataQuality | 缺失字段、冲突字段、置信度、新鲜度 |

### 5.1 查询场景包

| 字段 | 说明 |
| --- | --- |
| `user_question` | 用户问题 |
| `query_terms` | 结构化后的查询词 |
| `knowledge_scope` | 可检索的知识范围 |
| `project_context` | 当前项目上下文 |
| `permission_scope` | 权限边界 |
| `hermes_ranking_hint` | Hermes 提供的排序偏好 |

### 5.2 解决方案生成场景包

| 字段 | 说明 |
| --- | --- |
| `customer_need` | 客户需求 |
| `project_context` | 项目信息 |
| `asset` | 工程对象 |
| `industry_extensions` | 涂料或建筑扩展字段 |
| `requirements` | 项目、图纸、合同、技术要求 |
| `recommended_products` | 推荐产品或材料 |
| `knowledge_refs` | 标准、案例、模板、FAQ |
| `template_candidates` | 可选模板 |
| `hermes_context` | 客户偏好、历史确认项、修改习惯 |
| `risk_items` | 风险项 |
| `evidence_refs` | 证据引用 |

### 5.3 作业指导书场景包

| 字段 | 说明 |
| --- | --- |
| `asset` | 作业对象 |
| `work_condition` | 施工或作业条件 |
| `procedure_requirements` | 工序要求 |
| `safety_requirements` | 安全要求 |
| `quality_requirements` | 质量要求 |
| `standard_refs` | 标准条款 |
| `inspection_points` | 检验点 |
| `handover_materials` | 交付或验收资料 |
| `hermes_context` | 章节偏好、历史审查意见 |
| `evidence_refs` | 证据引用 |

## 6. Hermes 记忆模型

Hermes 只作为客户和项目上下文，不作为强事实来源。

| 记忆类型 | 字段 | 说明 |
| --- | --- | --- |
| 客户偏好 | `customer_id`、`preferred_template`、`tone`、`content_depth`、`forbidden_phrases` | 影响模板和表达 |
| 项目记忆 | `project_id`、`confirmed_assumptions`、`accepted_options`、`rejected_options` | 复用项目已确认信息 |
| 修改习惯 | `user_id`、`edit_patterns`、`section_preferences` | 影响章节结构和详略 |
| 反馈记录 | `task_id`、`feedback_type`、`feedback_content`、`resolution` | 沉淀交付反馈 |
| 复用标签 | `industry`、`scenario`、`case_tags`、`template_tags` | 影响案例和模板推荐 |

Hermes 使用边界：

| 可影响 | 不可影响 |
| --- | --- |
| 模板选择 | 产品参数 |
| 表达风格 | 标准条款 |
| 案例排序 | 认证范围 |
| 章节顺序 | 合规规则 |
| 风险提示详略 | 计算和审核强规则 |

## 7. 知识模型

客户已有企业知识库时，优先接入客户知识库；客户没有企业知识库时，使用公司知识中台作为知识资产底座。

| 对象 | 字段 | 说明 |
| --- | --- | --- |
| KnowledgeSource | `source_id`、`source_type`、`source_system`、`owner_tenant` | 知识来源 |
| KnowledgeItem | `knowledge_id`、`knowledge_type`、`title`、`industry`、`tags` | 标准、案例、FAQ、模板、经验 |
| KnowledgeChunk | `chunk_id`、`content`、`page_or_location`、`embedding_ref`、`keywords` | 可检索片段 |
| KnowledgePermission | `knowledge_id`、`project_ids`、`roles`、`file_acl` | 知识权限 |
| KnowledgeEvidence | `knowledge_id`、`source_uri`、`version`、`updated_at` | 知识证据 |

知识类型：

| 类型 | 涂料示例 | 建筑示例 |
| --- | --- | --- |
| 标准条款 | 腐蚀等级标准、施工环境要求 | 验收规范、施工质量标准 |
| 产品资料 | TDS、SDS、检测报告 | 材料说明、产品合格证 |
| 案例 | 钢结构防腐案例 | 墙面施工方案案例 |
| 模板 | 涂料解决方案模板 | 建筑施工方案模板 |
| FAQ | 产品适用性问答 | 做法表和资料问答 |

## 8. 客户配置模型

客户配置层处理企业本地差异，不修改行业包和基线模型。

| 配置类型 | 说明 | 示例 |
| --- | --- | --- |
| 字段别名 | 客户字段到基线/行业字段的映射 | DFT、干膜厚度映射到涂料膜厚字段 |
| 来源优先级 | 多来源冲突时的权威顺序 | 产品主数据 > 认证报告 > 上传文件 > 人工输入 |
| 单位换算 | 单位统一 | mil 转 um，平方米转 m2 |
| 枚举映射 | 客户本地枚举归一 | 碳钢、Q235 归到碳钢 |
| 默认值 | 非关键字段缺失时的默认值 | 默认损耗率、默认章节模板 |
| 人工确认阈值 | 低置信度或冲突时是否阻断 | 面积冲突必须人工确认 |

## 9. 权限与证据模型

### 9.1 权限模型

| 权限对象 | 控制范围 |
| --- | --- |
| TenantPermission | 租户隔离和行业包启用范围 |
| ProjectPermission | 项目上下文、任务记录、交付物 |
| FilePermission | 原始资料、图纸、报告、证据包 |
| FieldPermission | 成本、价格、客户敏感信息、内部审批意见 |
| KnowledgePermission | 标准、案例、模板、FAQ 的可见范围 |
| HermesPermission | 客户记忆、项目记忆、反馈记录 |
| DeliveryPermission | 导出物、分享链接、企业微信通知 |

### 9.2 证据模型

| 证据对象 | 字段 | 说明 |
| --- | --- | --- |
| FieldEvidence | `field_path`、`field_value`、`source_refs`、`confidence` | 字段级证据 |
| KnowledgeEvidence | `knowledge_id`、`source_uri`、`page_or_location`、`version` | 知识级证据 |
| HumanConfirmation | `confirmed_by`、`confirmed_at`、`confirmed_value`、`reason` | 人工确认 |
| TaskEvidence | `task_id`、`input_refs`、`output_refs`、`review_refs` | 任务级证据 |

证据必须回答：

| 问题 | 说明 |
| --- | --- |
| 值从哪里来 | 系统、文件、知识库、人工确认 |
| 依据在哪里 | 文件页码、标准条款、系统记录、知识片段 |
| 什么时候更新 | 来源更新时间、解析时间、确认时间 |
| 谁能看到 | 项目权限、文件权限、字段权限 |

