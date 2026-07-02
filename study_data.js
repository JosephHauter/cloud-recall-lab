const CONCEPTS = [
  { concept: "Region", hook: "Geographic AWS area" },
  { concept: "Availability Zone", hook: "Isolated data center group inside a Region" },
  { concept: "Edge Location", hook: "Used for CDN/content closer to users" },
  { concept: "High availability", hook: "Keep running when something fails" },
  { concept: "Scalability", hook: "Handle more load" },
  { concept: "Elasticity", hook: "Automatically scale up/down with demand" },
  { concept: "Agility", hook: "Move fast and experiment" },
  { concept: "Pay-as-you-go", hook: "Variable cost instead of large upfront cost" },
  { concept: "Economies of scale", hook: "AWS scale lowers cost for customers" },
  { concept: "Well-Architected", hook: "Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability" }
];

const SHARED_RESPONSIBILITY = [
  { aws: "Security OF the cloud", customer: "Security IN the cloud" },
  { aws: "Physical data centers", customer: "Your data" },
  { aws: "Hardware and global infrastructure", customer: "IAM users, permissions, MFA" },
  { aws: "Managed service infrastructure", customer: "Application security and access choices" },
  { aws: "OS patching for managed services (RDS/Lambda)", customer: "OS patching for EC2 instances" }
];

const RESPONSIBILITY_QAS = [
  { q: "Who patches EC2 operating system?", a: "Customer" },
  { q: "Who patches RDS operating system?", a: "AWS" },
  { q: "Who controls IAM permissions?", a: "Customer" },
  { q: "Who secures physical data centers?", a: "AWS" },
  { q: "Best practice for root account?", a: "Enable MFA and do not use it for daily tasks" }
];

const RESPONS_QAS = RESPONSIBILITY_QAS;

const SERVICE_DIRECTORY = {
  "Security Services": [
    { name: "IAM", desc: "Users, groups, roles, policies", triggers: "permissions / least privilege" },
    { name: "IAM Identity Center", desc: "Central workforce sign-in/SSO", triggers: "single sign-on / workforce access" },
    { name: "KMS", desc: "Encryption keys", triggers: "manage keys / encrypt data" },
    { name: "Secrets Manager", desc: "Store and rotate secrets", triggers: "rotate passwords / secrets" },
    { name: "Certificate Manager", desc: "SSL/TLS certificates", triggers: "certificates / HTTPS" },
    { name: "CloudHSM", desc: "Dedicated hardware security module", triggers: "dedicated HSM / compliance" },
    { name: "Cognito", desc: "App user sign-up/sign-in", triggers: "customer login for app" },
    { name: "Directory Service", desc: "Microsoft Active Directory on AWS", triggers: "Active Directory" },
    { name: "WAF", desc: "Web application firewall", triggers: "SQL injection / web attacks" },
    { name: "Shield", desc: "DDoS protection", triggers: "DDoS" },
    { name: "Firewall Manager", desc: "Manage firewall rules across accounts", triggers: "central firewall policy" },
    { name: "GuardDuty", desc: "Threat detection", triggers: "malicious activity / threat" },
    { name: "Inspector", desc: "Vulnerability scanning", triggers: "vulnerabilities / CVEs" },
    { name: "Macie", desc: "Sensitive data discovery in S3", triggers: "PII in S3" },
    { name: "Detective", desc: "Investigate security findings", triggers: "investigate root cause" },
    { name: "Security Hub", desc: "Central security findings", triggers: "single security dashboard" },
    { name: "Artifact", desc: "Compliance reports", triggers: "SOC / PCI / compliance docs" },
    { name: "Audit Manager", desc: "Audit evidence collection", triggers: "audit evidence" },
    { name: "RAM", desc: "Resource sharing across accounts", triggers: "share resources" }
  ],
  "Compute, Containers & Serverless": [
    { name: "EC2", desc: "Virtual servers", triggers: "server / VM" },
    { name: "Lambda", desc: "Serverless functions", triggers: "run code without servers" },
    { name: "Fargate", desc: "Serverless containers", triggers: "containers without managing servers" },
    { name: "Elastic Beanstalk", desc: "Easy app deployment", triggers: "deploy web app easily" },
    { name: "Lightsail", desc: "Simple VPS", triggers: "simple website / predictable VPS" },
    { name: "Batch", desc: "Batch jobs at scale", triggers: "batch processing jobs" },
    { name: "Outposts", desc: "AWS hardware on-premises", triggers: "AWS in your data center" },
    { name: "ECS", desc: "AWS container orchestration", triggers: "Docker containers" },
    { name: "EKS", desc: "Kubernetes on AWS", triggers: "Kubernetes" },
    { name: "ECR", desc: "Container image registry", triggers: "store container images" }
  ],
  "Storage Services": [
    { name: "S3", desc: "Object storage", triggers: "objects / images / static website / unlimited scale" },
    { name: "S3 Glacier", desc: "Archive storage", triggers: "long-term archive / lowest cost" },
    { name: "EBS", desc: "Block storage for EC2", triggers: "EC2 disk / hard drive" },
    { name: "EFS", desc: "Shared Linux file storage", triggers: "shared files across EC2" },
    { name: "FSx", desc: "Managed file systems", triggers: "Windows file server / Lustre / NetApp / OpenZFS" },
    { name: "Storage Gateway", desc: "Hybrid on-prem to AWS storage", triggers: "on-prem storage connect to AWS" },
    { name: "AWS Backup", desc: "Central backup service", triggers: "centralized backups" },
    { name: "Elastic Disaster Recovery", desc: "Disaster recovery for servers", triggers: "DR / recover servers" }
  ],
  "Databases & Analytics": [
    { name: "RDS", desc: "Managed relational SQL database; OLTP", triggers: "SQL app / relational / MySQL/PostgreSQL/etc." },
    { name: "Aurora", desc: "High-performance AWS relational SQL engine", triggers: "faster MySQL/PostgreSQL compatible" },
    { name: "DynamoDB", desc: "Serverless NoSQL database", triggers: "NoSQL / key-value / massive scale" },
    { name: "DocumentDB", desc: "MongoDB-compatible document DB", triggers: "MongoDB / JSON documents" },
    { name: "ElastiCache", desc: "In-memory cache", triggers: "Redis / Memcached / reduce DB load" },
    { name: "Neptune", desc: "Graph database", triggers: "relationships / social / fraud / recommendations" },
    { name: "Athena", desc: "Serverless SQL on S3", triggers: "query S3 with SQL / pay per query" },
    { name: "Redshift", desc: "Data warehouse; OLAP", triggers: "warehouse / reporting / analytics" },
    { name: "Glue", desc: "Serverless ETL + Data Catalog", triggers: "transform / prepare / catalog data" },
    { name: "QuickSight", desc: "Dashboards/BI", triggers: "visualize / dashboard" },
    { name: "EMR", desc: "Hadoop/Spark big data", triggers: "Hadoop / Spark / clusters" },
    { name: "Kinesis", desc: "Real-time streaming", triggers: "streaming / clickstream / real-time" },
    { name: "OpenSearch", desc: "Search and log analytics", triggers: "search / logs / Elasticsearch" }
  ],
  "Networking & Content Delivery": [
    { name: "VPC", desc: "Private network in AWS", triggers: "private network / subnets" },
    { name: "Route 53", desc: "DNS", triggers: "domain name / DNS" },
    { name: "CloudFront", desc: "CDN/global caching", triggers: "cache content globally" },
    { name: "API Gateway", desc: "Create/manage APIs", triggers: "API front door" },
    { name: "Direct Connect", desc: "Dedicated private connection", triggers: "dedicated line from data center" },
    { name: "VPN", desc: "Encrypted tunnel over internet", triggers: "encrypted connection" },
    { name: "Site-to-Site VPN", desc: "Office/data center to AWS VPN", triggers: "connect on-prem network" },
    { name: "Client VPN", desc: "Individual users connect to AWS", triggers: "remote users VPN" },
    { name: "Transit Gateway", desc: "Connect many VPCs/on-prem networks", triggers: "hub for many VPCs" },
    { name: "PrivateLink", desc: "Private service access without public internet", triggers: "private endpoint / no internet" },
    { name: "Global Accelerator", desc: "Improve global app traffic routing", triggers: "global performance / static anycast IPs" }
  ],
  "Management & Governance": [
    { name: "CloudFormation", desc: "Infrastructure as Code", triggers: "template / repeat infrastructure" },
    { name: "CloudWatch", desc: "Metrics, logs, alarms", triggers: "performance metrics / alarms" },
    { name: "CloudTrail", desc: "API activity audit logs", triggers: "who did what / API calls" },
    { name: "Config", desc: "Resource config history/compliance", triggers: "configuration changes / compliance" },
    { name: "Systems Manager", desc: "Manage/patch/run commands", triggers: "patch EC2 / run command fleet" },
    { name: "Organizations", desc: "Manage multiple accounts", triggers: "multi-account / consolidated billing" },
    { name: "Control Tower", desc: "Governed multi-account landing zone", triggers: "landing zone / account governance" },
    { name: "Trusted Advisor", desc: "Best-practice recommendations", triggers: "recommendations / checks" },
    { name: "Health Dashboard", desc: "AWS service/account health", triggers: "service health / account events" },
    { name: "Auto Scaling", desc: "Automatically scale resources", triggers: "scale automatically" },
    { name: "Compute Optimizer", desc: "Rightsizing recommendations", triggers: "right-size EC2/EBS/Lambda" },
    { name: "Service Quotas", desc: "Limits/quotas", triggers: "service limits" },
    { name: "License Manager", desc: "Track software licenses", triggers: "license tracking" },
    { name: "Service Catalog", desc: "Approved IT products/templates", triggers: "approved products for users" },
    { name: "Well-Architected Tool", desc: "Review workloads", triggers: "best-practice framework review" }
  ],
  "Application Integration": [
    { name: "SQS", desc: "Message queue", triggers: "queue / decouple apps" },
    { name: "SNS", desc: "Notifications/pub-sub", triggers: "notify many subscribers" },
    { name: "EventBridge", desc: "Event bus", triggers: "events / event-driven apps" },
    { name: "Step Functions", desc: "Workflow orchestration", triggers: "coordinate workflow steps" }
  ],
  "Migration & Transfer": [
    { name: "DMS", desc: "Database migration", triggers: "move database with minimal downtime" },
    { name: "SCT", desc: "Schema conversion", triggers: "convert Oracle schema to PostgreSQL" },
    { name: "Snow Family", desc: "Physical data transfer", triggers: "too much data for internet" },
    { name: "Application Migration Service", desc: "Lift-and-shift servers", triggers: "move servers to AWS" },
    { name: "Application Discovery Service", desc: "Discover on-prem environment", triggers: "inventory before migration" },
    { name: "Migration Hub", desc: "Track migrations", triggers: "migration progress" },
    { name: "Migration Evaluator", desc: "Migration business case/cost estimate", triggers: "business case / estimate migration" }
  ],
  "Billing, Pricing & Support": [
    { name: "AWS Budgets", desc: "Cost/usage alerts", triggers: "alert when spending passes amount" },
    { name: "Cost Explorer", desc: "Analyze spending", triggers: "past trends / charts" },
    { name: "Cost and Usage Report", desc: "Most detailed billing report", triggers: "detailed usage data" },
    { name: "Pricing Calculator", desc: "Estimate before building", triggers: "estimate cost" },
    { name: "Marketplace", desc: "Buy third-party software", triggers: "third-party AMI/software" },
    { name: "Consolidated billing", desc: "One bill for many accounts", triggers: "Consolidated billing / organizations" },
    { name: "Cost allocation tags", desc: "Track cost by team/project", triggers: "tag costs" },
    { name: "Basic Support", desc: "Free account/billing support", triggers: "free support" },
    { name: "Developer Support", desc: "Business-hours support, one user", triggers: "dev/test support" },
    { name: "Business Support", desc: "24/7 production support", triggers: "production workloads" },
    { name: "Enterprise Support", desc: "TAM for mission critical", triggers: "Technical Account Manager / TAM" }
  ],
  "Pricing Models": [
    { name: "On-Demand", desc: "Flexible, no commitment", triggers: "low cost / flexible / short-term" },
    { name: "Reserved Instances", desc: "Steady predictable EC2/RDS usage", triggers: "1-3 year commitment / steady state" },
    { name: "Savings Plans", desc: "Commit to usage/spend for discount", triggers: "commit to hourly spend / flexible across compute" },
    { name: "Spot Instances", desc: "Cheapest, interruptible workloads", triggers: "spare capacity / up to 90% discount / batch jobs" },
    { name: "Dedicated Hosts", desc: "Physical server for compliance/licensing", triggers: "bring your own license / BYOL / physical server" },
    { name: "Capacity Reservation", desc: "Reserve capacity in a specific AZ", triggers: "reserve capacity / specific AZ / no discount" }
  ],
  "Machine Learning & Small Categories": [
    { name: "Comprehend", desc: "Text understanding/sentiment", triggers: "sentiment analysis" },
    { name: "Kendra", desc: "Enterprise search", triggers: "company document search" },
    { name: "Lex", desc: "Chatbots/voice bots", triggers: "chatbot" },
    { name: "Polly", desc: "Text to speech", triggers: "make text talk" },
    { name: "Rekognition", desc: "Image/video recognition", triggers: "detect faces/objects" },
    { name: "SageMaker AI", desc: "Build/train/deploy ML models", triggers: "custom ML model" },
    { name: "Textract", desc: "Extract text/data from documents", triggers: "forms/scanned docs" },
    { name: "Transcribe", desc: "Speech to text", triggers: "audio to text" },
    { name: "Translate", desc: "Language translation", triggers: "translate languages" },
    { name: "Amazon Q", desc: "Generative AI assistant", triggers: "AI assistant" },
    { name: "Connect", desc: "Cloud contact center", triggers: "call center" },
    { name: "SES", desc: "Send email", triggers: "email sending" },
    { name: "WorkSpaces", desc: "Cloud virtual desktops", triggers: "virtual desktop" },
    { name: "AppStream 2.0", desc: "Stream desktop apps", triggers: "application streaming" },
    { name: "Amplify", desc: "Build/deploy web/mobile apps", triggers: "front-end web/mobile" },
    { name: "AppSync", desc: "Managed GraphQL APIs", triggers: "GraphQL" },
    { name: "IoT Core", desc: "Connect/manage IoT devices", triggers: "IoT devices" }
  ],
  "Developer Tools & Deployment": [
    { name: "AWS CLI", desc: "Manage AWS from command line", triggers: "command line" },
    { name: "CodeBuild", desc: "Build/test/package code", triggers: "compile / unit tests / artifact" },
    { name: "CodePipeline", desc: "CI/CD workflow", triggers: "source to build to deploy" },
    { name: "X-Ray", desc: "Trace/debug app requests", triggers: "trace request / performance" },
    { name: "Elastic Beanstalk", desc: "Easy app deploy", triggers: "deploy web app without manual infra" },
    { name: "CloudFormation", desc: "Infrastructure as Code", triggers: "template / repeat architecture" }
  ]
};

const HIGH_YIELD_TRAPS = [
  { question: "SQL database", answer: "RDS or Aurora" },
  { question: "NoSQL database", answer: "DynamoDB" },
  { question: "MongoDB", answer: "DocumentDB" },
  { question: "Graph relationships", answer: "Neptune" },
  { question: "Cache", answer: "ElastiCache" },
  { question: "DynamoDB-specific cache", answer: "DAX - recognize lightly" },
  { question: "SQL on S3", answer: "Athena" },
  { question: "Data warehouse", answer: "Redshift" },
  { question: "ETL / transform data", answer: "Glue" },
  { question: "Dashboard", answer: "QuickSight" },
  { question: "Streaming data", answer: "Kinesis" },
  { question: "Search/log analytics", answer: "OpenSearch" },
  { question: "Object storage", answer: "S3" },
  { question: "EC2 disk", answer: "EBS" },
  { question: "Shared file system", answer: "EFS" },
  { question: "Archive storage", answer: "S3 Glacier" },
  { question: "CDN/cache globally", answer: "CloudFront" },
  { question: "DNS", answer: "Route 53" },
  { question: "Private network", answer: "VPC" },
  { question: "Dedicated private on-prem connection", answer: "Direct Connect" },
  { question: "Encrypted tunnel over internet", answer: "VPN" },
  { question: "Queue", answer: "SQS" },
  { question: "Notification", answer: "SNS" },
  { question: "Workflow", answer: "Step Functions" },
  { question: "Events", answer: "EventBridge" },
  { question: "API audit logs", answer: "CloudTrail" },
  { question: "Metrics/logs/alarms", answer: "CloudWatch" },
  { question: "Configuration compliance", answer: "Config" },
  { question: "Patch servers", answer: "Systems Manager" },
  { question: "Consolidated billing", answer: "Consolidated billing / Organizations" },
  { question: "Multiple accounts", answer: "Organizations" },
  { question: "Landing zone", answer: "Control Tower" },
  { question: "Cost alert", answer: "Budgets" },
  { question: "Cost analysis", answer: "Cost Explorer" },
  { question: "Cost estimate", answer: "Pricing Calculator" },
  { question: "Best-practice recommendations", answer: "Trusted Advisor" },
  { question: "Encryption keys", answer: "KMS" },
  { question: "Rotate secrets", answer: "Secrets Manager" },
  { question: "DDoS", answer: "Shield" },
  { question: "Web attacks", answer: "WAF" },
  { question: "Threat detection", answer: "GuardDuty" },
  { question: "Vulnerability scan", answer: "Inspector" },
  { question: "Sensitive data in S3", answer: "Macie" },
  { question: "Database migration", answer: "DMS" },
  { question: "Huge offline transfer", answer: "Snow Family" },
  { question: "Serverless function", answer: "Lambda" },
  { question: "Serverless container", answer: "Fargate" },
  { question: "Kubernetes", answer: "EKS" },
  { question: "Container registry", answer: "ECR" }
];

const RAPID_DRILLS = [
  { scenario: "Run SQL queries on files in S3 without servers", answer: "Athena", trigger: "SQL on S3" },
  { scenario: "Managed relational SQL database", answer: "RDS", trigger: "relational SQL" },
  { scenario: "High-performance MySQL/PostgreSQL compatible engine", answer: "Aurora", trigger: "faster relational" },
  { scenario: "Serverless NoSQL at massive scale", answer: "DynamoDB", trigger: "NoSQL" },
  { scenario: "MongoDB-compatible database", answer: "DocumentDB", trigger: "MongoDB" },
  { scenario: "Graph database for fraud/social relationships", answer: "Neptune", trigger: "graph relationships" },
  { scenario: "Redis/Memcached cache", answer: "ElastiCache", trigger: "cache" },
  { scenario: "Data warehouse for analytics/reporting", answer: "Redshift", trigger: "warehouse" },
  { scenario: "Transform and prepare data for analytics", answer: "Glue", trigger: "ETL" },
  { scenario: "Interactive dashboards and BI", answer: "QuickSight", trigger: "dashboard" },
  { scenario: "Hadoop/Spark big data processing", answer: "EMR", trigger: "Hadoop/Spark" },
  { scenario: "Real-time clickstream events", answer: "Kinesis", trigger: "streaming" },
  { scenario: "Search and log analytics", answer: "OpenSearch", trigger: "search/logs" },
  { scenario: "Object storage for images/backups", answer: "S3", trigger: "objects" },
  { scenario: "Long-term archive storage", answer: "S3 Glacier", trigger: "archive" },
  { scenario: "Block disk attached to EC2", answer: "EBS", trigger: "EC2 disk" },
  { scenario: "Shared Linux file storage across EC2", answer: "EFS", trigger: "shared files" },
  { scenario: "Managed Windows file system", answer: "FSx", trigger: "Windows file server" },
  { scenario: "Hybrid on-prem storage to AWS", answer: "Storage Gateway", trigger: "hybrid storage" },
  { scenario: "Central backup across AWS", answer: "AWS Backup", trigger: "backup" },
  { scenario: "Virtual server", answer: "EC2", trigger: "VM/server" },
  { scenario: "Run code without managing servers", answer: "Lambda", trigger: "serverless function" },
  { scenario: "Run containers without managing servers", answer: "Fargate", trigger: "serverless containers" },
  { scenario: "Deploy web app easily", answer: "Elastic Beanstalk", trigger: "easy app deploy" },
  { scenario: "Simple VPS with predictable pricing", answer: "Lightsail", trigger: "simple VPS" },
  { scenario: "Batch processing jobs", answer: "AWS Batch", trigger: "batch" },
  { scenario: "AWS hardware in your data center", answer: "Outposts", trigger: "on-prem AWS" },
  { scenario: "Kubernetes on AWS", answer: "EKS", trigger: "Kubernetes" },
  { scenario: "Store container images", answer: "ECR", trigger: "container registry" },
  { scenario: "Private network in AWS", answer: "VPC", trigger: "private network" },
  { scenario: "DNS service", answer: "Route 53", trigger: "DNS" },
  { scenario: "CDN/global caching", answer: "CloudFront", trigger: "CDN" },
  { scenario: "Create/manage APIs", answer: "API Gateway", trigger: "API front door" },
  { scenario: "Dedicated private line from data center", answer: "Direct Connect", trigger: "dedicated connection" },
  { scenario: "Encrypted tunnel over the internet", answer: "VPN", trigger: "encrypted tunnel" },
  { scenario: "Connect many VPCs together", answer: "Transit Gateway", trigger: "network hub" },
  { scenario: "Private service access without public internet", answer: "PrivateLink", trigger: "private endpoint" },
  { scenario: "Improve global app traffic routing", answer: "Global Accelerator", trigger: "global performance" },
  { scenario: "User/role/policy permissions", answer: "IAM", trigger: "access control" },
  { scenario: "Central SSO/workforce access", answer: "IAM Identity Center", trigger: "SSO" },
  { scenario: "Manage encryption keys", answer: "KMS", trigger: "keys" },
  { scenario: "Store and rotate secrets", answer: "Secrets Manager", trigger: "rotation" },
  { scenario: "SSL/TLS certificates", answer: "Certificate Manager", trigger: "certificates" },
  { scenario: "Dedicated HSM", answer: "CloudHSM", trigger: "hardware security" },
  { scenario: "App user sign-up/sign-in", answer: "Cognito", trigger: "app login" },
  { scenario: "DDoS protection", answer: "Shield", trigger: "DDoS" },
  { scenario: "SQL injection/web attacks", answer: "WAF", trigger: "web firewall" },
  { scenario: "Threat detection", answer: "GuardDuty", trigger: "threat" },
  { scenario: "Vulnerability scanning", answer: "Inspector", trigger: "vulnerabilities" },
  { scenario: "Sensitive data in S3", answer: "Macie", trigger: "PII in S3" },
  { scenario: "Compliance reports", answer: "Artifact", trigger: "reports" },
  { scenario: "Central security findings", answer: "Security Hub", trigger: "security dashboard" },
  { scenario: "Investigate security findings", answer: "Detective", trigger: "investigate" },
  { scenario: "Infrastructure as Code template", answer: "CloudFormation", trigger: "IaC" },
  { scenario: "Metrics/logs/alarms", answer: "CloudWatch", trigger: "watch metrics" },
  { scenario: "API activity audit logs", answer: "CloudTrail", trigger: "API trail" },
  { scenario: "Resource configuration changes/compliance", answer: "Config", trigger: "config history" },
  { scenario: "Patch EC2 and run commands across fleet", answer: "Systems Manager", trigger: "patch/run command" },
  { scenario: "Manage multiple AWS accounts", answer: "Organizations", trigger: "multi-account" },
  { scenario: "Governed landing zone", answer: "Control Tower", trigger: "landing zone" },
  { scenario: "Best-practice recommendations", answer: "Trusted Advisor", trigger: "recommendations" },
  { scenario: "AWS service/account health", answer: "Health Dashboard", trigger: "health" },
  { scenario: "Rightsizing recommendations", answer: "Compute Optimizer", trigger: "rightsize" },
  { scenario: "Service limits", answer: "Service Quotas", trigger: "limits" },
  { scenario: "Message queue to decouple apps", answer: "SQS", trigger: "queue" },
  { scenario: "Notifications to subscribers", answer: "SNS", trigger: "notify" },
  { scenario: "Event bus/event-driven apps", answer: "EventBridge", trigger: "events" },
  { scenario: "Coordinate workflow steps", answer: "Step Functions", trigger: "workflow" },
  { scenario: "Move database to AWS", answer: "DMS", trigger: "database migration" },
  { scenario: "Convert database schema", answer: "SCT", trigger: "schema conversion" },
  { scenario: "Too much data to move over internet", answer: "Snow Family", trigger: "physical transfer" },
  { scenario: "Lift and shift servers", answer: "Application Migration Service", trigger: "server migration" },
  { scenario: "Discover on-prem environment", answer: "Application Discovery Service", trigger: "discovery" },
  { scenario: "Track migrations", answer: "Migration Hub", trigger: "track" },
  { scenario: "Cost/usage alerts", answer: "AWS Budgets", trigger: "alerts" },
  { scenario: "Analyze cost trends", answer: "Cost Explorer", trigger: "analyze cost" },
  { scenario: "Detailed billing report", answer: "Cost and Usage Report", trigger: "detailed report" },
  { scenario: "Estimate cost before building", answer: "Pricing Calculator", trigger: "estimate" },
  { scenario: "Buy third-party software", answer: "AWS Marketplace", trigger: "marketplace" },
  { scenario: "Text sentiment analysis", answer: "Comprehend", trigger: "understand text" },
  { scenario: "Enterprise search", answer: "Kendra", trigger: "search" },
  { scenario: "Chatbot", answer: "Lex", trigger: "bot" },
  { scenario: "Text to speech", answer: "Polly", trigger: "talks" },
  { scenario: "Image/video recognition", answer: "Rekognition", trigger: "sees" },
  { scenario: "Build/train/deploy ML models", answer: "SageMaker AI", trigger: "custom ML" },
  { scenario: "Extract text from scanned documents", answer: "Textract", trigger: "reads documents" },
  { scenario: "Speech to text", answer: "Transcribe", trigger: "listens" },
  { scenario: "Language translation", answer: "Translate", trigger: "translates" },
  { scenario: "Cloud contact center", answer: "Amazon Connect", trigger: "call center" },
  { scenario: "Send email", answer: "SES", trigger: "email" },
  { scenario: "Cloud virtual desktop", answer: "WorkSpaces", trigger: "virtual desktop" },
  { scenario: "Stream desktop apps", answer: "AppStream 2.0", trigger: "app streaming" },
  { scenario: "Build/deploy web/mobile apps", answer: "Amplify", trigger: "front-end" },
  { scenario: "GraphQL APIs", answer: "AppSync", trigger: "GraphQL" },
  { scenario: "Connect/manage IoT devices", answer: "IoT Core", trigger: "IoT" }
];

const MINI_MIXED_QUIZ = [
  { id: 1, question: "A company needs to query CloudTrail logs stored in S3 using SQL and no servers.", answer: "Athena" },
  { id: 2, question: "A company needs automatic failover for an RDS database in another AZ.", answer: "RDS Multi-AZ" },
  { id: 3, question: "A company needs to scale read traffic for an RDS database.", answer: "RDS Read Replica" },
  { id: 4, question: "A developer wants to compile code, run tests, and produce a package.", answer: "CodeBuild" },
  { id: 5, question: "A company needs to automate source-to-build-to-deploy release stages.", answer: "CodePipeline" },
  { id: 6, question: "A company needs API audit history for who changed resources.", answer: "CloudTrail" },
  { id: 7, question: "A company needs metrics, logs, and alarms.", answer: "CloudWatch" },
  { id: 8, question: "A company needs to find PII in S3 buckets.", answer: "Macie" },
  { id: 9, question: "A company needs a data warehouse for historical analytics.", answer: "Redshift" },
  { id: 10, question: "A company needs a queue to decouple application components.", answer: "SQS" },
  { id: 11, question: "A company needs DDoS protection.", answer: "Shield" },
  { id: 12, question: "A company needs to estimate monthly cost before deploying.", answer: "Pricing Calculator" },
  { id: 13, question: "A company needs a private dedicated network line to AWS.", answer: "Direct Connect" },
  { id: 14, question: "A company needs DNS for a domain.", answer: "Route 53" },
  { id: 15, question: "A company needs a MongoDB-compatible managed database.", answer: "DocumentDB" },
  { id: 16, question: "A company needs a graph database for recommendations.", answer: "Neptune" },
  { id: 17, question: "A company needs to convert Oracle schema to PostgreSQL.", answer: "SCT" },
  { id: 18, question: "A company needs to transfer huge data without using the internet.", answer: "Snow Family" },
  { id: 19, question: "A company needs text-to-speech.", answer: "Polly" },
  { id: 20, question: "A company needs vulnerability scanning.", answer: "Inspector" }
];

const EXAM_DAY_STRATEGY = [
  "Read the question and circle the trigger word: SQL, NoSQL, S3, dashboard, cache, DNS, queue, DDoS, cost alert, etc.",
  "Eliminate services from the wrong category first. Example: Dashboard is not Redshift; it is QuickSight.",
  "If two answers seem right, pick the more specific service. Example: S3 + SQL = Athena, not just S3.",
  "For multiple-response questions, count exactly how many answers AWS asks for. Do not over-select.",
  "Never leave a question blank. There is no penalty for guessing."
];

const LAST_PAGE_MEMORY = {
  "Security": "IAM controls access. KMS controls keys. Secrets Manager rotates secrets. CloudTrail records API actions. CloudWatch watches metrics/logs. Config tracks resource changes. GuardDuty detects threats. Inspector scans vulnerabilities. Macie finds sensitive S3 data. WAF blocks web attacks. Shield blocks DDoS.",
  "Compute & Deploy": "EC2 is servers. Lambda is serverless code. Fargate is serverless containers. Beanstalk deploys apps easily. CloudFormation builds infrastructure from templates.",
  "Storage & Networking": "S3 stores objects. EBS is EC2 disk. EFS is shared files. Glacier is archive. CloudFront is CDN. Route 53 is DNS. VPC is private network.",
  "Databases & Analytics": "RDS/Aurora is SQL. DynamoDB is NoSQL. DocumentDB is MongoDB. Neptune is graph. ElastiCache is cache. Athena is SQL on S3. Redshift is warehouse. Glue is ETL. QuickSight is dashboards. Kinesis is streaming. OpenSearch is search/logs.",
  "Management & Billing": "Budgets alerts. Cost Explorer analyzes. Pricing Calculator estimates. Trusted Advisor recommends. DMS moves databases. SCT converts schemas. Snow moves huge data physically."
};

const CONFUSING_PAIRS = [
  { pair: "CloudWatch vs CloudTrail", hook: "CloudWatch = metrics/logs/alarms. CloudTrail = API audit/who did what." },
  { pair: "Config vs CloudTrail", hook: "Config = resource configuration history/compliance. CloudTrail = API activity." },
  { pair: "RDS vs Redshift", hook: "RDS = transactional app database/OLTP. Redshift = analytics warehouse/OLAP." },
  { pair: "Athena vs Redshift", hook: "Athena = query S3 directly, serverless. Redshift = data warehouse." },
  { pair: "Glue vs Athena", hook: "Glue prepares/transforms/catalogs data. Athena queries data." },
  { pair: "QuickSight vs Redshift", hook: "QuickSight visualizes dashboards. Redshift stores/analyzes warehouse data." },
  { pair: "DMS vs SCT", hook: "DMS moves database data. SCT converts database schema." },
  { pair: "S3 vs EBS vs EFS", hook: "S3 = object storage. EBS = EC2 block disk. EFS = shared file system." },
  { pair: "Direct Connect vs VPN", hook: "Direct Connect = dedicated private line. VPN = encrypted tunnel over internet." },
  { pair: "SQS vs SNS", hook: "SQS = queue/pull. SNS = notification/pub-sub/push." },
  { pair: "WAF vs Shield", hook: "WAF = web attacks like SQL injection. Shield = DDoS." },
  { pair: "GuardDuty vs Inspector", hook: "GuardDuty = threat detection. Inspector = vulnerability scanning." },
  { pair: "Secrets Manager vs KMS", hook: "Secrets Manager stores/rotates secrets. KMS manages encryption keys." },
  { pair: "Organizations vs Control Tower", hook: "Organizations manages accounts. Control Tower sets up/governs landing zone." },
  { pair: "CodeBuild vs CodePipeline", hook: "CodeBuild builds/tests/packages. CodePipeline orchestrates release workflow." }
];

const MUST_KNOW_LIST = [
  "IAM (users, roles, policies, MFA, IAM Identity Center)",
  "Shared Responsibility Model (Security OF vs IN the cloud)",
  "Core compute services (EC2 guest OS patching, Lambda, Fargate, Elastic Beanstalk)",
  "Storage services (S3, EBS, EFS, Glacier, storage options)",
  "Databases (RDS, Aurora, DynamoDB)",
  "Networking services (VPC, Route 53, CloudFront, Direct Connect, VPN)",
  "Management & Monitoring (CloudWatch, CloudTrail, Config, Systems Manager, Organizations, Control Tower, Trusted Advisor)",
  "Billing & Pricing (Budgets, Cost Explorer, Pricing Calculator, Cost and Usage Report)",
  "Security services (KMS, Secrets Manager, WAF, Shield, GuardDuty, Inspector, Macie, Artifact)"
];

const SKIP_LIST = [
  "Developer services: CodeCommit, CodeDeploy, CodeArtifact, CDK (know only CodeBuild and CodePipeline lightly)",
  "Exact database limits and hardware details",
  "Deep IAM JSON policy writing or execution details",
  "Deep VPC routing tables, subnets CIDR block configuration details",
  "Kubernetes config, EKS architecture details (know EKS is managed Kubernetes)",
  "Timestream, Managed Blockchain",
  "Detailed Redshift architecture, detailed replica counts",
  "Exact pricing dollars/numbers",
  "Database/analytics trigger words (Athena, Redshift, Glue, QuickSight, Kinesis, OpenSearch) - know triggers, skip implementation steps, CLI syntax, code examples"
];

const DOMAIN_WEIGHTS = [
  { name: "Cloud Concepts", weight: 24, color: "var(--secondary)" },
  { name: "Security and Compliance", weight: 30, color: "var(--accent-purple)" },
  { name: "Cloud Technology and Services", weight: 34, color: "var(--primary)" },
  { name: "Billing/Pricing/Support", weight: 12, color: "var(--warning)" }
];

// ---- 7-Day Battle Plan + Proven "How Real People Passed" Strategies ----
// Synthesized from publicly-shared study approaches (AWS exam candidate
// communities, exam-skills reports, AWS-published study guides). Paraphrased;
// not copied from any single source, and contains no real exam content.
const PASS_PLAN = {
  // Weighted day-by-day plan. Time shown is a realistic daily budget for someone
  // with a day job; scale up if you have more hours. Days assume ~2–3 hrs/day.
  days: [
    { day: 1, focus: "Cloud Concepts & Global Infra", hours: "2–3h",
      do: [
        "Read the Day 1 cheat sheet + Shared Responsibility matrix (Study Guide tab).",
        "Run the Master Memory Trainer (read & flashcards) once.",
        "Do all Day 1 section practice questions. Log every miss."
      ],
      why: "Cloud Concepts is 24% of the exam and sets the vocabulary everything else builds on." },
    { day: 2, focus: "Security & Compliance (heaviest domain)", hours: "3h",
      do: [
        "Read Security service index + Confusing Pairs (WAF/Shield/GuardDuty, Secrets Mgr/KMS).",
        "Do Day 2 section questions + the 16 multi-select security items.",
        "Run Rapid Trigger Drills for security services until 90%+."
      ],
      why: "Security is 30% — the single highest-weighted domain. Time spent here moves your score most." },
    { day: 3, focus: "Compute, Storage, Networking", hours: "3h",
      do: [
        "Read compute/storage/networking index + Confusing Pairs (Direct Connect vs VPN, SQS vs SNS).",
        "Do Day 3 section questions including the multi-select storage/networking items.",
        "Mini Mixed Quiz (20Q) — first timed recall check."
      ],
      why: "Cloud Technology & Services is 34% — the broadest domain. Trigger words are the fastest path." },
    { day: 4, focus: "Databases, Analytics, Integration", hours: "2h",
      do: [
        "Read DB/analytics index + the database trigger traps (SQL→RDS, NoSQL→DynamoDB, SQL on S3→Athena).",
        "Do Day 4 section questions + multi-select messaging items.",
        "Re-do any Day 1–2 wrong answers from the Day 7 pool."
      ],
      why: "These services show up as high-confidence single-answer questions — cheap points once triggers click." },
    { day: 5, focus: "Billing, Pricing, Support + gaps", hours: "2h",
      do: [
        "Read Pricing Models + the coverage-gap questions (Sustainability, 6 R's, SCPs, Cost Allocation Tags).",
        "Do Day 5 section questions.",
        "Take Mock Exam 1 (timed, 50Q). Review every wrong answer — read the 'why wrong' for each option."
      ],
      why: "Pricing is only 12% but the questions are formulaic; cover the gaps that others miss." },
    { day: 6, focus: "Full timed simulation", hours: "2h",
      do: [
        "Take the Final Pressure Test (50Q, 90 min, ~18% multi-select) under exam conditions — no notes, no breaks.",
        "Score it. Review ALL questions, not just the wrong ones.",
        "Re-attack every missed item in the Day 7 wrong-answer pool."
      ],
      why: "Pressure testing under real conditions exposes gaps that untimed practice hides." },
    { day: 7, focus: "Targeted review + exam-day prep", hours: "2h",
      do: [
        "Clear the Day 7 wrong-answer pool (goal: under 5 remaining).",
        "Re-read the Last-Page Memory Cheat Sheet + Highest-Yield Traps.",
        "Take Mock Exam 2 as a final confidence check. Stop studying ~2 hours before bed."
      ],
      why: "Active recall of your own mistakes beats cramming new material. Rest matters more than last-minute panic." }
  ],

  // Concrete tactics people who passed report using. Each is a paraphrased
  // commonly-cited strategy — no proprietary or leaked material.
  strategies: [
    { t: "Master the trigger words first", d: "Most CLF-C02 questions reduce to a trigger phrase (\"SQL on S3\"→Athena, \"DDoS\"→Shield). The Rapid Trigger Drills + Highest-Yield Traps table are the highest-ROI prep in the shortest time." },
    { t: "Practice in the real exam format — including multi-select", d: "Roughly 15–20% of the real exam is choose-two / choose-three. People who only drilled single-answer questions got surprised. The Final Pressure Test mimics this split." },
    { t: "Drill your wrong answers to zero", d: "Every candidate who reports passing fast emphasizes the wrong-answer loop: get a question wrong → understand WHY each distractor is wrong → re-drill it. The 'why wrong' breakdown in this site does exactly that." },
    { t: "Spend the most time on the biggest domains", d: "Security (30%) and Cloud Technology (34%) are ~64% of the exam. Don't over-invest in the 12% Billing domain beyond the formulaic pricing questions." },
    { t: "Use elimination, not inspiration", d: "On the exam, cross out services from the wrong category first (e.g., a dashboard question is never Redshift). Two-pass reading + elimination recovers points on questions you're unsure of." },
    { t: "Simulate test-day conditions", d: "Take at least one full mock in one sitting, no breaks, with the timer. Test-day stamina and time management are a real factor; candidates who skipped this reported running out of time." },
    { t: "Review official exam guide + AWS Skill Builder sample questions", d: "AWS publishes free practice questions and a 20-question official set on Skill Builder. They are the closest legitimate signal to real exam wording. Use them as a final calibration — never braindumps, which risk your certification." },
    { t: "Stop 12–24 hours before, sleep well", d: "Cramming the night before consistently correlates with worse recall. The cheat sheet + a good night's sleep outperforms another 4 hours of panic study." }
  ],

  // Exam-day procedure checklist (what AWS actually requires).
  examDayChecklist: [
    "Confirm your appointment time and Pearson VUE / test center details the day before.",
    "Have government-issued ID ready (name must match your registration exactly).",
    "Arrive 15–30 minutes early; for online proctored, run the system check in advance.",
    "Clear your desk/room — only what the proctor allows. Online proctoring scans your environment.",
    "Budget ~1.2 minutes per question; flag the hard ones and return. Never leave a blank (no penalty).",
    "Use the full time: review flagged questions with any leftover minutes.",
    "Pause before submitting multi-select questions — count the selections against what's asked."
  ]
};
