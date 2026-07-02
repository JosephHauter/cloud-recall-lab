// AWS Practice Mock Exams. These are original educational scenarios, not AWS official questions.

const MOCK_EXAM_1 = [
  {
    id: 101,
    question: "An application automatically adds capacity during traffic spikes and removes capacity when traffic drops. Which cloud concept is this?",
    options: ["Durability", "Elasticity", "Global reach", "Loose coupling"],
    answer: "B",
    explanation: "Elasticity is the ability to scale resources up and down as demand changes.",
    section: 1
  },
  {
    id: 102,
    question: "A company wants its architecture to handle growth by adding resources as workload increases. Which cloud benefit is this?",
    options: ["Data sovereignty", "Provisioned billing", "Scalability", "Traceability"],
    answer: "C",
    explanation: "Scalability means an architecture can grow to handle increased demand.",
    section: 1
  },
  {
    id: 103,
    question: "A company deploys an application across multiple Availability Zones so it can keep running if one data center location has a problem. Which design goal is this?",
    options: ["Reserved capacity", "Cost allocation", "High availability", "Edge caching"],
    answer: "C",
    explanation: "High availability uses redundant resources, often across multiple Availability Zones, to reduce downtime.",
    section: 1
  },
  {
    id: 104,
    question: "A workload continues operating even when one component fails because the design has redundant components. Which concept does this best describe?",
    options: ["Vertical scaling", "Manual provisioning", "Single tenancy", "Fault tolerance"],
    answer: "D",
    explanation: "Fault tolerance is the ability to continue operating when part of the system fails.",
    section: 1
  },
  {
    id: 105,
    question: "Which AWS global infrastructure component is a physical location around the world that contains multiple Availability Zones?",
    options: ["Edge location", "VPC subnet", "Local gateway", "Region"],
    answer: "D",
    explanation: "A Region is a separate geographic area made up of multiple Availability Zones.",
    section: 1
  },
  {
    id: 106,
    question: "Which AWS global infrastructure component is one or more discrete data centers with redundant power, networking, and connectivity?",
    options: ["AWS account", "Availability Zone", "IAM role", "Edge cache policy"],
    answer: "B",
    explanation: "An Availability Zone is one or more isolated data centers inside a Region.",
    section: 1
  },
  {
    id: 107,
    question: "A company wants to deliver website content to users with lower latency by caching content close to viewers. Which infrastructure location supports this?",
    options: ["Availability Zone", "Private subnet", "Edge location", "Placement group"],
    answer: "C",
    explanation: "Edge locations support services such as CloudFront by caching content closer to users.",
    section: 1
  },
  {
    id: 108,
    question: "Under the AWS Shared Responsibility Model, who is responsible for securing AWS data centers and the underlying hardware?",
    options: ["The customer", "The customer's end users", "AWS", "A third-party auditor"],
    answer: "C",
    explanation: "AWS is responsible for security of the cloud, including facilities, hardware, and global infrastructure.",
    section: 1
  },
  {
    id: 109,
    question: "Under the AWS Shared Responsibility Model, which task is normally the customer's responsibility?",
    options: ["Replacing failed physical disks", "Securing AWS Regions", "Managing IAM users and permissions", "Maintaining data center power"],
    answer: "C",
    explanation: "Customers are responsible for security in the cloud, including identity, access, data, and configuration choices.",
    section: 1
  },
  {
    id: 110,
    question: "A startup wants to avoid buying servers before it knows how much traffic it will get. Which cloud benefit is most relevant?",
    options: ["Mandatory long-term contracts", "Fixed capital expense", "Manual hardware refresh", "Pay-as-you-go pricing"],
    answer: "D",
    explanation: "Pay-as-you-go pricing helps shift from upfront capital expense to variable operating expense.",
    section: 1
  },
  {
    id: 111,
    question: "A big data team wants Spark/Hadoop processing.",
    options: ["KMS", "EMR", "DMS", "SCT"],
    answer: "B",
    explanation: "EMR = Big data frameworks.",
    section: 4
  },
  {
    id: 112,
    question: "An app needs real-time clickstream ingestion.",
    options: ["Kinesis", "KMS", "Secrets Manager", "Route 53"],
    answer: "A",
    explanation: "Kinesis = Streaming data.",
    section: 4
  },
  {
    id: 113,
    question: "A team needs full-text search and log analytics.",
    options: ["Route 53", "CloudFront", "VPC", "OpenSearch"],
    answer: "D",
    explanation: "OpenSearch = Search/log analytics.",
    section: 4
  },
  {
    id: 114,
    question: "An application needs object storage for images and backups.",
    options: ["CloudFront", "VPC", "S3", "Route 53"],
    answer: "C",
    explanation: "S3 = Object storage.",
    section: 3
  },
  {
    id: 115,
    question: "An EC2 instance needs a block device like a hard drive.",
    options: ["Fargate", "EBS", "VPC", "Lambda"],
    answer: "B",
    explanation: "EBS = Block storage for EC2.",
    section: 3
  },
  {
    id: 116,
    question: "Many Linux EC2 instances need shared file storage.",
    options: ["EFS", "Fargate", "Elastic Beanstalk", "S3"],
    answer: "A",
    explanation: "EFS = Shared file system.",
    section: 3
  },
  {
    id: 117,
    question: "Data must be archived cheaply for years.",
    options: ["S3", "EBS", "EFS", "S3 Glacier"],
    answer: "D",
    explanation: "S3 Glacier = Archive storage.",
    section: 3
  },
  {
    id: 118,
    question: "Users worldwide need cached content close to them.",
    options: ["API Gateway", "Direct Connect", "CloudFront", "Route 53"],
    answer: "C",
    explanation: "CloudFront = CDN.",
    section: 3
  },
  {
    id: 119,
    question: "A company needs DNS for a domain.",
    options: ["Transit Gateway", "Route 53", "Direct Connect", "VPN"],
    answer: "B",
    explanation: "Route 53 = DNS service.",
    section: 3
  },
  {
    id: 120,
    question: "A company wants an isolated private network in AWS.",
    options: ["VPC", "Transit Gateway", "PrivateLink", "Global Accelerator"],
    answer: "A",
    explanation: "VPC = Private AWS network.",
    section: 3
  },
  {
    id: 121,
    question: "The company needs a dedicated private connection to AWS.",
    options: ["Global Accelerator", "CloudWatch", "CloudTrail", "Direct Connect"],
    answer: "D",
    explanation: "Direct Connect = Dedicated private network link.",
    section: 3
  },
  {
    id: 122,
    question: "The company needs an encrypted internet tunnel to AWS.",
    options: ["Config", "RDS", "VPN", "CloudTrail"],
    answer: "C",
    explanation: "VPN = Encrypted tunnel over internet.",
    section: 3
  },
  {
    id: 123,
    question: "The app needs a front door for APIs.",
    options: ["DynamoDB", "API Gateway", "RDS", "Aurora"],
    answer: "B",
    explanation: "API Gateway = API management/front door.",
    section: 4
  },
  {
    id: 124,
    question: "The team wants to decouple components with a queue.",
    options: ["SQS", "Shield", "GuardDuty", "Inspector"],
    answer: "A",
    explanation: "SQS = Message queue.",
    section: 4
  },
  {
    id: 125,
    question: "The team wants to send alerts to many subscribers.",
    options: ["Inspector", "Macie", "DMS", "SNS"],
    answer: "D",
    explanation: "SNS = Notifications/pub-sub.",
    section: 4
  },
  {
    id: 126,
    question: "The app must coordinate a multi-step workflow.",
    options: ["SCT", "KMS", "Step Functions", "DMS"],
    answer: "C",
    explanation: "Step Functions = Workflow orchestration.",
    section: 4
  },
  {
    id: 127,
    question: "An app should react to events from AWS services and SaaS apps.",
    options: ["Route 53", "EventBridge", "KMS", "Secrets Manager"],
    answer: "B",
    explanation: "EventBridge = Event bus.",
    section: 4
  },
  {
    id: 128,
    question: "A developer wants to run code without servers.",
    options: ["Lambda", "Macie", "DMS", "SCT"],
    answer: "A",
    explanation: "Lambda = Serverless functions.",
    section: 3
  },
  {
    id: 129,
    question: "A team wants serverless containers.",
    options: ["SCT", "KMS", "Secrets Manager", "Fargate"],
    answer: "D",
    explanation: "Fargate = Serverless containers.",
    section: 3
  },
  {
    id: 130,
    question: "A team wants Kubernetes on AWS.",
    options: ["Lambda", "Fargate", "EKS", "VPC"],
    answer: "C",
    explanation: "EKS = Managed Kubernetes.",
    section: 3
  },
  {
    id: 131,
    question: "A team needs to store Docker images.",
    options: ["ECS", "ECR", "Fargate", "Elastic Beanstalk"],
    answer: "B",
    explanation: "ECR = Container image registry.",
    section: 3
  },
  {
    id: 132,
    question: "A developer wants easy web app deployment without manually configuring EC2/ELB/ASG.",
    options: ["Elastic Beanstalk", "EC2", "Lambda", "Fargate"],
    answer: "A",
    explanation: "Elastic Beanstalk = PaaS-style app deployment.",
    section: 3
  },
  {
    id: 133,
    question: "A team wants repeatable infrastructure templates.",
    options: ["Shield", "GuardDuty", "Inspector", "CloudFormation"],
    answer: "D",
    explanation: "CloudFormation = Infrastructure as Code.",
    section: 2
  },
  {
    id: 134,
    question: "A dev team needs to compile code, run tests, and create packages.",
    options: ["CloudWatch", "CloudTrail", "CodeBuild", "X-Ray"],
    answer: "C",
    explanation: "CodeBuild = Build/test/package.",
    section: 2
  },
  {
    id: 135,
    question: "A dev team wants to automate source-build-test-deploy.",
    options: ["RDS", "CodePipeline", "CloudTrail", "Config"],
    answer: "B",
    explanation: "CodePipeline = CI/CD workflow.",
    section: 2
  },
  {
    id: 136,
    question: "Developers need to trace requests through a distributed app.",
    options: ["X-Ray", "RDS", "Aurora", "DynamoDB"],
    answer: "A",
    explanation: "X-Ray = Application tracing.",
    section: 2
  },
  {
    id: 137,
    question: "An admin wants to patch and run commands across EC2 fleets.",
    options: ["Route 53", "CloudFront", "VPC", "Systems Manager"],
    answer: "D",
    explanation: "Systems Manager = Manage/patch/run commands.",
    section: 2
  },
  {
    id: 138,
    question: "Security asks who made an API call in the AWS account.",
    options: ["Lambda", "Fargate", "CloudTrail", "VPC"],
    answer: "C",
    explanation: "CloudTrail = API audit logs.",
    section: 2
  },
  {
    id: 139,
    question: "Ops wants metrics, logs, alarms, and dashboards.",
    options: ["CloudTrail", "CloudWatch", "Fargate", "Elastic Beanstalk"],
    answer: "B",
    explanation: "CloudWatch = Observability.",
    section: 2
  },
  {
    id: 140,
    question: "Governance wants resource configuration history and compliance.",
    options: ["Config", "CloudWatch", "CloudTrail", "CloudFormation"],
    answer: "A",
    explanation: "Config = Configuration tracking/compliance.",
    section: 2
  },
  {
    id: 141,
    question: "A company wants to manage many AWS accounts.",
    options: ["Config", "CloudFormation", "Systems Manager", "Organizations"],
    answer: "D",
    explanation: "Organizations = Multi-account management.",
    section: 2
  },
  {
    id: 142,
    question: "A company wants a governed multi-account landing zone.",
    options: ["Organizations", "Trusted Advisor", "Control Tower", "Systems Manager"],
    answer: "C",
    explanation: "Control Tower = Landing zone governance.",
    section: 2
  },
  {
    id: 143,
    question: "A team wants best-practice recommendations for cost/security/performance.",
    options: ["Auto Scaling", "Trusted Advisor", "Control Tower", "Health Dashboard"],
    answer: "B",
    explanation: "Trusted Advisor = Recommendations.",
    section: 2
  },
  {
    id: 144,
    question: "A company wants an alert when monthly spend exceeds a threshold.",
    options: ["Budgets", "Shield", "GuardDuty", "Inspector"],
    answer: "A",
    explanation: "Budgets = Budget alerts.",
    section: 5
  },
  {
    id: 145,
    question: "Finance wants to analyze historical spending trends.",
    options: ["Inspector", "Macie", "DMS", "Cost Explorer"],
    answer: "D",
    explanation: "Cost Explorer = Cost analysis.",
    section: 5
  },
  {
    id: 146,
    question: "A team wants to estimate costs before deploying.",
    options: ["SCT", "KMS", "Pricing Calculator", "DMS"],
    answer: "C",
    explanation: "Pricing Calculator = Cost estimate.",
    section: 5
  },
  {
    id: 147,
    question: "Finance needs the most detailed billing and usage report.",
    options: ["Route 53", "Cost and Usage Report", "KMS", "Secrets Manager"],
    answer: "B",
    explanation: "Cost and Usage Report = Detailed billing report.",
    section: 5
  },
  {
    id: 148,
    question: "A security team needs to manage encryption keys.",
    options: ["KMS", "Security Hub", "Artifact", "Audit Manager"],
    answer: "A",
    explanation: "KMS = Key management.",
    section: 2
  },
  {
    id: 149,
    question: "A database password must be stored and rotated automatically.",
    options: ["Audit Manager", "RAM", "CloudWatch", "Secrets Manager"],
    answer: "D",
    explanation: "Secrets Manager = Secrets storage and rotation.",
    section: 2
  },
  {
    id: 150,
    question: "A public app needs DDoS protection.",
    options: ["CloudTrail", "Config", "Shield", "CloudWatch"],
    answer: "C",
    explanation: "Shield = DDoS protection.",
    section: 2
  }
];

const MOCK_EXAM_2 = [
  {
    id: 201,
    question: "A web app needs protection from SQL injection and common web exploits.",
    options: ["ACM", "CloudHSM", "WAF", "Secrets Manager"],
    answer: "C",
    explanation: "WAF = Web application firewall.",
    section: 2
  },
  {
    id: 202,
    question: "Security wants managed threat detection from account/network activity.",
    options: ["WAF", "GuardDuty", "Cognito", "Directory Service"],
    answer: "B",
    explanation: "GuardDuty = Threat detection.",
    section: 2
  },
  {
    id: 203,
    question: "Security wants vulnerability scanning for workloads.",
    options: ["Inspector", "Shield", "Firewall Manager", "GuardDuty"],
    answer: "A",
    explanation: "Inspector = Vulnerability scanning.",
    section: 2
  },
  {
    id: 204,
    question: "Security wants to discover sensitive data in S3.",
    options: ["Inspector", "Detective", "Security Hub", "Macie"],
    answer: "D",
    explanation: "Macie = Sensitive data discovery.",
    section: 2
  },
  {
    id: 205,
    question: "Auditors request AWS compliance reports.",
    options: ["Audit Manager", "RAM", "Artifact", "Security Hub"],
    answer: "C",
    explanation: "Artifact = Compliance reports.",
    section: 2
  },
  {
    id: 206,
    question: "A database must be migrated to AWS with minimal downtime.",
    options: ["SNS", "DMS", "EFS", "SQS"],
    answer: "B",
    explanation: "DMS = Database migration.",
    section: 4
  },
  {
    id: 207,
    question: "An Oracle schema must be converted to PostgreSQL.",
    options: ["SCT", "WAF", "Shield", "GuardDuty"],
    answer: "A",
    explanation: "SCT = Schema conversion.",
    section: 4
  },
  {
    id: 208,
    question: "A company has petabytes to move and internet transfer is too slow.",
    options: ["Inspector", "Macie", "KMS", "Snow Family"],
    answer: "D",
    explanation: "Snow Family = Physical data transfer.",
    section: 4
  },
  {
    id: 209,
    question: "A workload should keep running even when one component fails by sending messages through a queue instead of direct service-to-service calls. Which design principle does this support?",
    options: ["Loose coupling", "Monolithic deployment", "Vertical-only scaling", "Manual recovery"],
    answer: "A",
    explanation: "Loose coupling helps components fail independently and recover more easily.",
    section: 1
  },
  {
    id: 210,
    question: "A production app is deployed across multiple Availability Zones so users can still connect if one Availability Zone has an issue. Which goal does this improve?",
    options: ["Edge caching", "High availability", "Cost allocation", "Single tenancy"],
    answer: "B",
    explanation: "High availability commonly uses multiple Availability Zones to reduce single points of failure.",
    section: 1
  },
  {
    id: 211,
    question: "A team can create development environments in minutes instead of waiting weeks for hardware. Which AWS Cloud benefit is this?",
    options: ["Capital expense", "Manual procurement", "Agility", "Data residency"],
    answer: "C",
    explanation: "Agility means teams can provision resources quickly and experiment faster.",
    section: 1
  },
  {
    id: 212,
    question: "A company wants to deploy closer to customers in different countries without building its own data centers. Which cloud benefit is this?",
    options: ["License mobility", "Dedicated tenancy", "Static capacity", "Global reach"],
    answer: "D",
    explanation: "Global reach lets customers deploy workloads in AWS Regions around the world.",
    section: 1
  },
  {
    id: 213,
    question: "A business wants to pay for compute only while it is used instead of buying servers up front. Which cloud economics concept is this?",
    options: ["On-demand consumption", "Sunk capital expense", "Perpetual licensing only", "Manual capacity planning"],
    answer: "A",
    explanation: "On-demand consumption shifts spending toward variable usage-based costs.",
    section: 1
  },
  {
    id: 214,
    question: "Under the AWS Shared Responsibility Model, who is responsible for patching the guest operating system on an Amazon EC2 instance?",
    options: ["AWS only", "The customer", "AWS Support only", "The hardware vendor"],
    answer: "B",
    explanation: "For EC2, customers manage the guest operating system, applications, and configuration.",
    section: 1
  },
  {
    id: 215,
    question: "Under the AWS Shared Responsibility Model, who manages the physical facilities and underlying infrastructure for Amazon S3?",
    options: ["The customer", "The application user", "AWS", "The DNS registrar"],
    answer: "C",
    explanation: "AWS manages security of the cloud, including the facilities and infrastructure that run managed services.",
    section: 1
  },
  {
    id: 216,
    question: "A team reviews a workload to reduce waste, select right-sized resources, and avoid unnecessary spending. Which Well-Architected pillar is the main focus?",
    options: ["Operational Excellence", "Reliability", "Performance Efficiency", "Cost Optimization"],
    answer: "D",
    explanation: "The Cost Optimization pillar focuses on avoiding unnecessary costs while meeting requirements.",
    section: 1
  },
  {
    id: 217,
    question: "A data science team wants to build/train/deploy ML models.",
    options: ["Aurora", "DynamoDB", "SageMaker AI", "RDS"],
    answer: "C",
    explanation: "SageMaker AI = ML model lifecycle.",
    section: 5
  },
  {
    id: 218,
    question: "A company wants cloud virtual desktops.",
    options: ["Route 53", "WorkSpaces", "KMS", "Secrets Manager"],
    answer: "B",
    explanation: "WorkSpaces = Virtual desktops.",
    section: 5
  },
  {
    id: 219,
    question: "A company wants to stream desktop applications to users.",
    options: ["AppStream 2.0", "CloudFront", "VPC", "Lambda"],
    answer: "A",
    explanation: "AppStream 2.0 = App streaming.",
    section: 5
  },
  {
    id: 220,
    question: "A business wants a cloud contact center.",
    options: ["Fargate", "Elastic Beanstalk", "SES", "Connect"],
    answer: "D",
    explanation: "Connect = Contact center.",
    section: 5
  },
  {
    id: 221,
    question: "An application needs to send emails.",
    options: ["CloudTrail", "Config", "SES", "CloudWatch"],
    answer: "C",
    explanation: "SES = Email service.",
    section: 5
  },
  {
    id: 222,
    question: "A team wants to quickly build and deploy a web/mobile app.",
    options: ["DynamoDB", "Amplify", "RDS", "Aurora"],
    answer: "B",
    explanation: "Amplify = Frontend/mobile app development.",
    section: 5
  },
  {
    id: 223,
    question: "A team wants managed GraphQL APIs.",
    options: ["AppSync", "Redshift", "Athena", "Glue"],
    answer: "A",
    explanation: "AppSync = GraphQL API service.",
    section: 5
  },
  {
    id: 224,
    question: "Devices need to connect securely to AWS.",
    options: ["EFS", "SQS", "SNS", "IoT Core"],
    answer: "D",
    explanation: "IoT Core = IoT connectivity.",
    section: 5
  },
  {
    id: 225,
    question: "A user wants to manage AWS from a terminal.",
    options: ["Athena", "Glue", "AWS CLI", "Redshift"],
    answer: "C",
    explanation: "AWS CLI = Command-line management.",
    section: 2
  },
  {
    id: 226,
    question: "A company needs resource rightsizing recommendations.",
    options: ["CloudWatch", "Compute Optimizer", "Fargate", "Elastic Beanstalk"],
    answer: "B",
    explanation: "Compute Optimizer = Rightsizing.",
    section: 2
  },
  {
    id: 227,
    question: "A team needs to view or request service limits.",
    options: ["Service Quotas", "CloudTrail", "Config", "CloudFormation"],
    answer: "A",
    explanation: "Service Quotas = Service limits.",
    section: 2
  },
  {
    id: 228,
    question: "A company wants central backups across AWS services.",
    options: ["QuickSight", "SQS", "SNS", "AWS Backup"],
    answer: "D",
    explanation: "AWS Backup = Backup management.",
    section: 3
  },
  {
    id: 229,
    question: "A company wants lift-and-shift server migration.",
    options: ["SNS", "WAF", "Application Migration Service", "SQS"],
    answer: "C",
    explanation: "Application Migration Service = Server migration.",
    section: 4
  },
  {
    id: 230,
    question: "A company wants to discover on-prem servers before migrating.",
    options: ["Inspector", "Application Discovery Service", "Shield", "GuardDuty"],
    answer: "B",
    explanation: "Application Discovery Service = Discovery before migration.",
    section: 4
  },
  {
    id: 231,
    question: "A company wants to track migration progress.",
    options: ["Migration Hub", "Macie", "KMS", "Secrets Manager"],
    answer: "A",
    explanation: "Migration Hub = Migration tracking.",
    section: 4
  },
  {
    id: 232,
    question: "A company wants migration cost/business case help.",
    options: ["Route 53", "CloudFront", "VPC", "Migration Evaluator"],
    answer: "D",
    explanation: "Migration Evaluator = Migration business case.",
    section: 4
  },
  {
    id: 233,
    question: "A company wants AWS hardware in its own data center.",
    options: ["Lightsail", "CloudWatch", "Outposts", "Elastic Beanstalk"],
    answer: "C",
    explanation: "Outposts = AWS on-premises.",
    section: 3
  },
  {
    id: 234,
    question: "A beginner wants a simple VPS with predictable pricing.",
    options: ["RDS", "Lightsail", "CloudTrail", "Config"],
    answer: "B",
    explanation: "Lightsail = Simple VPS.",
    section: 3
  },
  {
    id: 235,
    question: "A company wants batch computing jobs at scale.",
    options: ["AWS Batch", "WAF", "Shield", "GuardDuty"],
    answer: "A",
    explanation: "AWS Batch = Batch processing.",
    section: 3
  },
  {
    id: 236,
    question: "A team wants private access to AWS services without using the public internet.",
    options: ["API Gateway", "Direct Connect", "VPN", "PrivateLink"],
    answer: "D",
    explanation: "PrivateLink = Private connectivity to services.",
    section: 3
  },
  {
    id: 237,
    question: "A company wants to improve global application traffic performance.",
    options: ["PrivateLink", "CloudWatch", "Global Accelerator", "Transit Gateway"],
    answer: "C",
    explanation: "Global Accelerator = Global traffic acceleration.",
    section: 3
  },
  {
    id: 238,
    question: "A company needs to connect many VPCs and on-prem networks.",
    options: ["RDS", "Transit Gateway", "CloudTrail", "Config"],
    answer: "B",
    explanation: "Transit Gateway = Network hub.",
    section: 3
  },
  {
    id: 239,
    question: "A workload is designed to recover automatically from failures and meet business continuity goals. Which Well-Architected pillar does this best match?",
    options: ["Sustainability", "Reliability", "Operational Excellence", "Cost Optimization"],
    answer: "B",
    explanation: "The Reliability pillar focuses on recovering from disruptions and meeting availability requirements.",
    section: 1
  },
  {
    id: 240,
    question: "A team reviews encryption, identity controls, detection, and incident response for a workload. Which Well-Architected pillar is the main focus?",
    options: ["Performance Efficiency", "Reliability", "Security", "Sustainability"],
    answer: "C",
    explanation: "The Security pillar focuses on protecting data, systems, and assets.",
    section: 1
  },
  {
    id: 241,
    question: "A company needs a dedicated hardware security module.",
    options: ["IAM Identity Center", "KMS", "CloudHSM", "IAM"],
    answer: "C",
    explanation: "CloudHSM = Dedicated HSM.",
    section: 2
  },
  {
    id: 242,
    question: "A company wants central security findings.",
    options: ["CloudHSM", "Security Hub", "Secrets Manager", "ACM"],
    answer: "B",
    explanation: "Security Hub = Central security posture/findings.",
    section: 2
  },
  {
    id: 243,
    question: "A company wants to investigate security findings.",
    options: ["Detective", "Cognito", "Directory Service", "WAF"],
    answer: "A",
    explanation: "Detective = Security investigation.",
    section: 2
  },
  {
    id: 244,
    question: "A company wants to share resources across AWS accounts.",
    options: ["Shield", "Firewall Manager", "GuardDuty", "RAM"],
    answer: "D",
    explanation: "RAM = Resource sharing.",
    section: 2
  },
  {
    id: 245,
    question: "A company wants audit evidence collection.",
    options: ["Macie", "Detective", "Audit Manager", "Inspector"],
    answer: "C",
    explanation: "Audit Manager = Audit evidence.",
    section: 2
  },
  {
    id: 246,
    question: "A company wants to track software licenses.",
    options: ["DMS", "License Manager", "Inspector", "Macie"],
    answer: "B",
    explanation: "License Manager = License tracking.",
    section: 2
  },
  {
    id: 247,
    question: "A company wants approved templates/products for users to launch.",
    options: ["Service Catalog", "EBS", "EFS", "SQS"],
    answer: "A",
    explanation: "Service Catalog = Approved products.",
    section: 2
  },
  {
    id: 248,
    question: "A company wants to review workloads against AWS best practices.",
    options: ["SNS", "WAF", "Shield", "Well-Architected Tool"],
    answer: "D",
    explanation: "Well-Architected Tool = Workload review.",
    section: 2
  },
  {
    id: 249,
    question: "A company wants AWS service/account health notifications.",
    options: ["Inspector", "Macie", "Health Dashboard", "GuardDuty"],
    answer: "C",
    explanation: "Health Dashboard = Health events.",
    section: 2
  },
  {
    id: 250,
    question: "A team wants to run containers without managing servers or clusters of EC2 instances. Which AWS service or capability should it choose?",
    options: ["AWS Fargate", "Amazon EBS", "Amazon S3 Glacier", "AWS Config"],
    answer: "A",
    explanation: "AWS Fargate is serverless compute for containers, so teams can run containers without managing EC2 hosts.",
    section: 3
  }
];

const MOCK_EXAM_3 = [
  {
    id: 301,
    question: "A company wants its application to automatically add capacity during high traffic and reduce capacity when demand drops. Which cloud concept is this?",
    options: [
      "Elasticity",
      "Global reach",
      "Durability",
      "Decoupling"
    ],
    answer: "A",
    explanation: "Elasticity means scaling resources up and down with demand.",
    section: 1
  },
  {
    id: 302,
    question: "Which service stores Docker/container images?",
    options: [
      "Amazon ECS",
      "Amazon ECR",
      "Amazon FSx",
      "Amazon EKS"
    ],
    answer: "B",
    explanation: "ECR is a container image registry.",
    section: 3
  },
  {
    id: 303,
    question: "A company needs to convert an Oracle database schema to PostgreSQL before migration. Which tool should it use?",
    options: [
      "AWS Glue Data Catalog",
      "AWS CloudFormation",
      "AWS Schema Conversion Tool",
      "AWS Database Migration Service"
    ],
    answer: "C",
    explanation: "SCT converts database schema between engines.",
    section: 4
  },
  {
    id: 304,
    question: "Which service should be used to run Kubernetes on AWS?",
    options: [
      "Amazon ECS",
      "Amazon ECR",
      "Amazon EKS",
      "AWS Batch"
    ],
    answer: "C",
    explanation: "EKS is managed Kubernetes on AWS.",
    section: 3
  },
  {
    id: 305,
    question: "A company wants managed protection against DDoS attacks. Which service should it use?",
    options: [
      "Amazon GuardDuty",
      "AWS Shield",
      "Amazon Inspector",
      "AWS WAF"
    ],
    answer: "B",
    explanation: "AWS Shield is the managed DDoS protection service.",
    section: 2
  },
  {
    id: 306,
    question: "A company needs the most detailed AWS billing and usage data for analytics. Which billing resource should it use?",
    options: [
      "AWS Marketplace",
      "AWS Support Center",
      "AWS Budgets",
      "AWS Cost and Usage Report"
    ],
    answer: "D",
    explanation: "CUR is the most detailed cost and usage report.",
    section: 5
  },
  {
    id: 307,
    question: "Which service caches content globally to reduce latency for users?",
    options: [
      "AWS VPN",
      "AWS PrivateLink",
      "Amazon CloudFront",
      "Amazon Route 53"
    ],
    answer: "C",
    explanation: "CloudFront is AWS content delivery network/CDN.",
    section: 3
  },
  {
    id: 308,
    question: "Which service records API calls made in an AWS account for auditing?",
    options: [
      "AWS X-Ray",
      "AWS Config",
      "Amazon CloudWatch",
      "AWS CloudTrail"
    ],
    answer: "D",
    explanation: "CloudTrail records account API activity.",
    section: 2
  },
  {
    id: 309,
    question: "A company wants to automate a release process from source to build to deploy. Which service should it use?",
    options: [
      "AWS CodeBuild",
      "Amazon Inspector",
      "AWS X-Ray",
      "AWS CodePipeline"
    ],
    answer: "D",
    explanation: "CodePipeline orchestrates CI/CD workflows.",
    section: 2
  },
  {
    id: 310,
    question: "Which service provides intelligent threat detection by analyzing account activity, network activity, and DNS logs?",
    options: [
      "AWS Audit Manager",
      "Amazon GuardDuty",
      "AWS KMS",
      "AWS Artifact"
    ],
    answer: "B",
    explanation: "GuardDuty is AWS managed threat detection.",
    section: 2
  },
  {
    id: 311,
    question: "A company wants a graph database for social networks, recommendations, and fraud relationships. Which service should it use?",
    options: [
      "Amazon DynamoDB",
      "Amazon Neptune",
      "Amazon ElastiCache",
      "Amazon RDS"
    ],
    answer: "B",
    explanation: "Neptune is a managed graph database.",
    section: 4
  },
  {
    id: 312,
    question: "A web application needs protection from SQL injection and cross-site scripting attacks. Which service should be used?",
    options: [
      "AWS WAF",
      "AWS Shield",
      "Amazon Macie",
      "AWS KMS"
    ],
    answer: "A",
    explanation: "AWS WAF protects web apps from common web exploits.",
    section: 2
  },
  {
    id: 313,
    question: "A company wants to prepare, transform, and catalog data for analytics. Which service should it use?",
    options: [
      "AWS Glue",
      "AWS CloudTrail",
      "Amazon Route 53",
      "Amazon QuickSight"
    ],
    answer: "A",
    explanation: "Glue is serverless ETL and includes the Glue Data Catalog.",
    section: 4
  },
  {
    id: 314,
    question: "Which service provides resizable virtual servers in the cloud?",
    options: [
      "Amazon S3",
      "Amazon EC2",
      "AWS Lambda",
      "AWS Fargate"
    ],
    answer: "B",
    explanation: "EC2 provides virtual machines/servers.",
    section: 3
  },
  {
    id: 315,
    question: "A company wants to move an application to AWS with minimal changes. Which migration strategy is this?",
    options: [
      "Refactor",
      "Retire",
      "Rehost",
      "Repurchase"
    ],
    answer: "C",
    explanation: "Rehost means lift and shift with minimal application changes.",
    section: 1
  },
  {
    id: 316,
    question: "A company needs a MongoDB-compatible managed database. Which service should it use?",
    options: [
      "Amazon DynamoDB",
      "Amazon Aurora",
      "Amazon Neptune",
      "Amazon DocumentDB"
    ],
    answer: "D",
    explanation: "DocumentDB is MongoDB-compatible.",
    section: 4
  },
  {
    id: 317,
    question: "A development team wants to compile source code, run tests, and create deployable packages. Which service should it use?",
    options: [
      "AWS X-Ray",
      "AWS CodeBuild",
      "AWS CloudFormation",
      "AWS CodePipeline"
    ],
    answer: "B",
    explanation: "CodeBuild builds, tests, and packages code.",
    section: 2
  },
  {
    id: 318,
    question: "A company wants to trace requests through a distributed application to troubleshoot latency. Which service should it use?",
    options: [
      "AWS X-Ray",
      "AWS CloudTrail",
      "Amazon Macie",
      "AWS Config"
    ],
    answer: "A",
    explanation: "X-Ray traces requests through applications.",
    section: 2
  },
  {
    id: 319,
    question: "A developer wants to deploy a web application without manually provisioning EC2, load balancers, and Auto Scaling. Which service should be used?",
    options: [
      "AWS CloudFormation",
      "AWS Elastic Beanstalk",
      "AWS CodeBuild",
      "AWS X-Ray"
    ],
    answer: "B",
    explanation: "Elastic Beanstalk is a PaaS-style easy app deployment service.",
    section: 3
  },
  {
    id: 320,
    question: "A company wants to provision the same infrastructure repeatedly using templates. Which service should it use?",
    options: [
      "Amazon CloudWatch",
      "AWS CloudFormation",
      "AWS Elastic Beanstalk",
      "AWS CodeBuild"
    ],
    answer: "B",
    explanation: "CloudFormation is Infrastructure as Code using templates.",
    section: 2
  },
  {
    id: 321,
    question: "A company needs to give an EC2 instance temporary permissions to read objects from an S3 bucket. What should it use?",
    options: [
      "AWS Organizations account",
      "IAM user access keys stored on the instance",
      "Root user credentials",
      "IAM role"
    ],
    answer: "D",
    explanation: "IAM roles provide temporary credentials for AWS services such as EC2.",
    section: 2
  },
  {
    id: 322,
    question: "A company wants to run SQL queries directly on data stored in Amazon S3 without managing infrastructure. Which service should it use?",
    options: [
      "Amazon Redshift",
      "Amazon Athena",
      "Amazon EMR",
      "Amazon RDS"
    ],
    answer: "B",
    explanation: "Athena is serverless SQL on S3.",
    section: 4
  },
  {
    id: 323,
    question: "A company wants to process real-time streaming clickstream data. Which service should it use?",
    options: [
      "Amazon Redshift",
      "Amazon Kinesis",
      "Amazon RDS",
      "AWS DMS"
    ],
    answer: "B",
    explanation: "Kinesis is used for real-time streaming data.",
    section: 4
  },
  {
    id: 324,
    question: "A company wants to create and manage encryption keys used to protect data. Which service should it use?",
    options: [
      "AWS KMS",
      "AWS Artifact",
      "Amazon Cognito",
      "AWS Secrets Manager"
    ],
    answer: "A",
    explanation: "KMS manages cryptographic keys.",
    section: 2
  },
  {
    id: 325,
    question: "Which service scans workloads such as EC2 instances, container images, and Lambda functions for vulnerabilities?",
    options: [
      "Amazon Inspector",
      "Amazon Macie",
      "AWS Shield",
      "Amazon Detective"
    ],
    answer: "A",
    explanation: "Inspector performs vulnerability management/scanning.",
    section: 2
  },
  {
    id: 326,
    question: "A startup wants to stop buying servers in advance and instead pay only for resources when they use them. Which cloud benefit is this?",
    options: [
      "Use physical data centers",
      "Trade fixed expense for variable expense",
      "Increase capital expenditure",
      "Use manual capacity planning"
    ],
    answer: "B",
    explanation: "AWS lets customers replace upfront fixed costs with usage-based variable costs.",
    section: 1
  },
  {
    id: 327,
    question: "Which AWS Well-Architected pillar focuses on protecting data, systems, and assets?",
    options: [
      "Cost Optimization",
      "Reliability",
      "Operational Excellence",
      "Security"
    ],
    answer: "D",
    explanation: "The Security pillar focuses on protecting information and systems.",
    section: 1
  },
  {
    id: 328,
    question: "A company needs a managed search and log analytics service. Which service should it use?",
    options: [
      "AWS Artifact",
      "Amazon OpenSearch Service",
      "Amazon Polly",
      "Amazon CloudFront"
    ],
    answer: "B",
    explanation: "OpenSearch is used for search and log analytics.",
    section: 4
  },
  {
    id: 329,
    question: "Which principle says users should receive only the permissions required to perform their job?",
    options: [
      "Fault tolerance",
      "Horizontal scaling",
      "Least privilege",
      "Loose coupling"
    ],
    answer: "C",
    explanation: "Least privilege limits access to what is necessary.",
    section: 2
  },
  {
    id: 330,
    question: "Which TWO actions are customer responsibilities when using Amazon S3? (Choose TWO.)",
    options: [
      "Patching the S3 service operating system",
      "Replacing failed storage hardware",
      "Classifying and protecting the data stored in buckets",
      "Managing access permissions to buckets",
      "Maintaining physical data center security"
    ],
    answer: "C,D",
    explanation: "Customers control data and access; AWS manages the underlying service infrastructure.",
    section: 2,
    isMulti: true,
    multiCount: 2
  },
  {
    id: 331,
    question: "A company wants to migrate a database to AWS while keeping the source database available during migration. Which service should it use?",
    options: [
      "AWS Database Migration Service",
      "AWS Snowball Edge",
      "AWS Glue",
      "Amazon Athena"
    ],
    answer: "A",
    explanation: "DMS migrates databases with minimal downtime.",
    section: 4
  },
  {
    id: 332,
    question: "Which service is used for DNS and domain name routing?",
    options: [
      "Amazon CloudFront",
      "AWS Direct Connect",
      "Amazon Route 53",
      "AWS Transit Gateway"
    ],
    answer: "C",
    explanation: "Route 53 is AWS DNS.",
    section: 3
  },
  {
    id: 333,
    question: "An EC2 instance needs persistent block storage like a hard drive. Which service should be attached?",
    options: [
      "Amazon S3",
      "Amazon EFS",
      "Amazon EBS",
      "AWS Storage Gateway"
    ],
    answer: "C",
    explanation: "EBS provides block storage for EC2.",
    section: 3
  },
  {
    id: 334,
    question: "Which pricing model is best for predictable, steady-state usage in exchange for a discount?",
    options: [
      "Spot Instances only",
      "Reserved Instances or Savings Plans",
      "On-Demand only",
      "Free Tier only"
    ],
    answer: "B",
    explanation: "Reservations/Savings Plans discount predictable committed usage.",
    section: 5
  },
  {
    id: 335,
    question: "Under the AWS Shared Responsibility Model, which task is the customer responsible for when using Amazon EC2?",
    options: [
      "Replacing physical server hardware",
      "Patching the guest operating system",
      "Maintaining AWS data centers",
      "Managing physical network switches"
    ],
    answer: "B",
    explanation: "With EC2, customers manage the guest OS and application layer.",
    section: 1
  },
  {
    id: 336,
    question: "Under the AWS Shared Responsibility Model, which task is AWS responsible for?",
    options: [
      "Encrypting customer application data",
      "Patching customer code",
      "Security of the physical facilities",
      "Configuring IAM least privilege"
    ],
    answer: "C",
    explanation: "AWS is responsible for security of the cloud, including physical facilities.",
    section: 1
  },
  {
    id: 337,
    question: "A company wants a petabyte-scale data warehouse for analytics and reporting. Which service should it use?",
    options: [
      "Amazon Redshift",
      "Amazon S3 Glacier",
      "Amazon DynamoDB",
      "Amazon RDS"
    ],
    answer: "A",
    explanation: "Redshift is AWS data warehouse service.",
    section: 4
  },
  {
    id: 338,
    question: "Which IAM best practice should be applied to the AWS account root user?",
    options: [
      "Use it for all administrative tasks",
      "Attach inline policies to it for normal use",
      "Share it with senior developers",
      "Enable MFA and avoid using it for daily tasks"
    ],
    answer: "D",
    explanation: "Root should be protected with MFA and used only when required.",
    section: 2
  },
  {
    id: 339,
    question: "A company wants interactive business intelligence dashboards. Which service should it use?",
    options: [
      "Amazon QuickSight",
      "Amazon Kinesis",
      "Amazon Athena",
      "AWS Glue"
    ],
    answer: "A",
    explanation: "QuickSight is AWS BI/dashboard service.",
    section: 4
  },
  {
    id: 340,
    question: "A company wants to serve static website content with low latency to users around the world. Which AWS global infrastructure is closest to users?",
    options: [
      "Availability Zones",
      "Placement groups",
      "Private subnets",
      "Edge locations"
    ],
    answer: "D",
    explanation: "Edge locations are used by CloudFront to cache content near users.",
    section: 1
  },
  {
    id: 341,
    question: "A company needs to create and manage REST APIs for an application. Which service should it use?",
    options: [
      "Amazon API Gateway",
      "AWS Step Functions",
      "Amazon Route 53",
      "Amazon SQS"
    ],
    answer: "A",
    explanation: "API Gateway is the front door for APIs.",
    section: 4
  },
  {
    id: 342,
    question: "Which service tracks resource configuration changes and compliance over time?",
    options: [
      "Amazon CloudWatch",
      "AWS CloudTrail",
      "AWS Budgets",
      "AWS Config"
    ],
    answer: "D",
    explanation: "Config records configuration history and evaluates compliance.",
    section: 2
  },
  {
    id: 343,
    question: "A company needs low-cost long-term archive storage for data that is rarely accessed. Which service should it use?",
    options: [
      "Amazon RDS",
      "Amazon ElastiCache",
      "Amazon EBS",
      "Amazon S3 Glacier"
    ],
    answer: "D",
    explanation: "S3 Glacier storage classes are designed for archive use cases.",
    section: 3
  },
  {
    id: 344,
    question: "Which TWO are benefits of the AWS Cloud? (Choose TWO.)",
    options: [
      "Eliminate all security responsibilities for customers",
      "Manually provision all hardware",
      "Require long-term data center contracts",
      "Trade fixed expense for variable expense",
      "Increase speed and agility"
    ],
    answer: "D,E",
    explanation: "AWS commonly emphasizes agility and usage-based pricing.",
    section: 1,
    isMulti: true,
    multiCount: 2
  },
  {
    id: 345,
    question: "A company needs to store a database password and automatically rotate it. Which service should it use?",
    options: [
      "AWS KMS",
      "AWS Artifact",
      "AWS Certificate Manager",
      "AWS Secrets Manager"
    ],
    answer: "D",
    explanation: "Secrets Manager stores and can rotate secrets.",
    section: 2
  },
  {
    id: 346,
    question: "A company wants to run containers without managing the underlying servers. Which service should it use?",
    options: [
      "Amazon EBS",
      "AWS Fargate",
      "AWS Outposts",
      "Amazon EC2"
    ],
    answer: "B",
    explanation: "Fargate is serverless compute for containers.",
    section: 3
  },
  {
    id: 347,
    question: "Which service manages, patches, and runs commands across EC2 and on-premises servers?",
    options: [
      "AWS X-Ray",
      "AWS Systems Manager",
      "AWS CloudFormation",
      "AWS CloudTrail"
    ],
    answer: "B",
    explanation: "Systems Manager manages fleets of instances and hybrid servers.",
    section: 2
  },
  {
    id: 348,
    question: "A company needs a serverless NoSQL database with single-digit millisecond performance at any scale. Which service should it use?",
    options: [
      "Amazon RDS",
      "Amazon Neptune",
      "Amazon DynamoDB",
      "Amazon Redshift"
    ],
    answer: "C",
    explanation: "DynamoDB is AWS serverless NoSQL database at scale.",
    section: 4
  },
  {
    id: 349,
    question: "A company wants a high-performance MySQL-compatible or PostgreSQL-compatible relational database engine from AWS. Which service should it use?",
    options: [
      "Amazon Aurora",
      "Amazon DocumentDB",
      "Amazon Neptune",
      "Amazon DynamoDB"
    ],
    answer: "A",
    explanation: "Aurora is AWS’s MySQL/PostgreSQL-compatible relational database engine.",
    section: 4
  },
  {
    id: 350,
    question: "A company needs object storage for images, videos, and backups. Which service should be used?",
    options: [
      "Amazon FSx",
      "Amazon EFS",
      "Amazon EBS",
      "Amazon S3"
    ],
    answer: "D",
    explanation: "S3 is object storage.",
    section: 3
  },
  {
    id: 351,
    question: "A company wants to estimate monthly costs before deploying resources. Which tool should it use?",
    options: [
      "AWS CloudTrail",
      "AWS Cost Explorer",
      "AWS Budgets",
      "AWS Pricing Calculator"
    ],
    answer: "D",
    explanation: "Pricing Calculator estimates costs before deployment.",
    section: 5
  },
  {
    id: 352,
    question: "Which pricing option is best for fault-tolerant workloads that can be interrupted and need the lowest EC2 cost?",
    options: [
      "Dedicated Hosts",
      "On-Demand Instances",
      "Spot Instances",
      "Capacity Reservations"
    ],
    answer: "C",
    explanation: "Spot is cheapest but can be interrupted.",
    section: 5
  },
  {
    id: 353,
    question: "Which AWS Well-Architected pillar focuses on recovering from failures and meeting availability requirements?",
    options: [
      "Performance Efficiency",
      "Sustainability",
      "Cost Optimization",
      "Reliability"
    ],
    answer: "D",
    explanation: "Reliability is about workloads performing correctly and recovering from failure.",
    section: 1
  },
  {
    id: 354,
    question: "A company wants a managed relational database for a transactional application. Which service should it use?",
    options: [
      "Amazon DynamoDB",
      "Amazon RDS",
      "Amazon Athena",
      "Amazon Redshift"
    ],
    answer: "B",
    explanation: "RDS is managed relational SQL database for OLTP workloads.",
    section: 4
  },
  {
    id: 355,
    question: "A company needs a dedicated private network connection from its data center to AWS. Which service should it use?",
    options: [
      "Amazon CloudFront",
      "AWS Site-to-Site VPN",
      "Amazon API Gateway",
      "AWS Direct Connect"
    ],
    answer: "D",
    explanation: "Direct Connect is a dedicated network connection to AWS.",
    section: 3
  },
  {
    id: 356,
    question: "Which TWO services are used to decouple application components? (Choose TWO.)",
    options: [
      "Amazon SNS",
      "AWS KMS",
      "Amazon EBS",
      "Amazon SQS",
      "Amazon FSx"
    ],
    answer: "A,D",
    explanation: "SQS queues messages and SNS publishes notifications to subscribers.",
    section: 4,
    isMulti: true,
    multiCount: 2
  },
  {
    id: 357,
    question: "Which AWS global infrastructure component consists of one or more discrete data centers with redundant power, networking, and connectivity?",
    options: [
      "Availability Zone",
      "Subnet",
      "Edge location",
      "VPC"
    ],
    answer: "A",
    explanation: "An Availability Zone is made of one or more isolated data centers inside a Region.",
    section: 1
  },
  {
    id: 358,
    question: "A company wants to analyze AWS spending trends from the last six months. Which service should it use?",
    options: [
      "AWS Artifact",
      "AWS Pricing Calculator",
      "AWS Cost Explorer",
      "AWS Budgets"
    ],
    answer: "C",
    explanation: "Cost Explorer analyzes historical cost and usage.",
    section: 5
  },
  {
    id: 359,
    question: "A company wants a private isolated network in AWS. Which service should it use?",
    options: [
      "AWS WAF",
      "Amazon Route 53",
      "Amazon VPC",
      "Amazon CloudFront"
    ],
    answer: "C",
    explanation: "VPC is a logically isolated virtual network.",
    section: 3
  },
  {
    id: 360,
    question: "Which service collects metrics, logs, and creates alarms?",
    options: [
      "AWS CloudTrail",
      "AWS Artifact",
      "Amazon CloudWatch",
      "AWS Config"
    ],
    answer: "C",
    explanation: "CloudWatch handles metrics, logs, and alarms.",
    section: 2
  },
  {
    id: 361,
    question: "Several Linux EC2 instances need to share the same file system at the same time. Which service should be used?",
    options: [
      "Amazon S3 Glacier",
      "Amazon Route 53",
      "Amazon EFS",
      "Amazon EBS"
    ],
    answer: "C",
    explanation: "EFS is a shared elastic file system for Linux workloads.",
    section: 3
  },
  {
    id: 362,
    question: "A company wants to run code without provisioning or managing servers. Which service should it use?",
    options: [
      "Amazon RDS",
      "AWS Lambda",
      "Amazon EBS",
      "Amazon EC2"
    ],
    answer: "B",
    explanation: "Lambda runs functions without server management.",
    section: 3
  },
  {
    id: 363,
    question: "Which service discovers sensitive data such as personally identifiable information in Amazon S3?",
    options: [
      "AWS Shield",
      "Amazon Macie",
      "Amazon Inspector",
      "AWS Security Hub"
    ],
    answer: "B",
    explanation: "Macie finds sensitive data in S3.",
    section: 2
  },
  {
    id: 364,
    question: "A company wants to receive an alert when monthly AWS spending exceeds $1,000. Which service should it use?",
    options: [
      "AWS Cost Explorer",
      "AWS Cost and Usage Report",
      "AWS Budgets",
      "AWS Pricing Calculator"
    ],
    answer: "C",
    explanation: "Budgets creates cost and usage alerts.",
    section: 5
  },
  {
    id: 365,
    question: "Which AWS Support plan includes a Technical Account Manager for mission-critical workloads?",
    options: [
      "Enterprise Support",
      "Developer Support",
      "Basic Support",
      "Business Support"
    ],
    answer: "A",
    explanation: "Enterprise Support includes a TAM.",
    section: 5
  }
];
