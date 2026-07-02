const SECTIONS = {
  1: { title: "Day 1: Cloud Concepts & Global Infrastructure", desc: "Cloud concepts, global infrastructure, shared responsibility model, and Well-Architected Framework." },
  2: { title: "Day 2: Security, Compliance & Governance", desc: "IAM, security services, encryption, compliance reports, monitoring, logging, and infrastructure-as-code." },
  3: { title: "Day 3: Compute, Storage & Networking", desc: "EC2, Lambda, Fargate, ECS/EKS, S3, EBS, EFS, Glacier, VPC, Route 53, and CloudFront." },
  4: { title: "Day 4: Databases, Analytics & Integration", desc: "RDS, DynamoDB, Redshift, Neptune, DocumentDB, ElastiCache, Athena, Glue, Kinesis, SQS, SNS, and Step Functions." },
  5: { title: "Day 5: Billing, Pricing & Machine Learning", desc: "Budgets, Cost Explorer, Pricing Calculator, Support Plans, and AWS AI/ML services." }
};

const QUESTIONS = [
  // SECTION 1 (Day 1)
  {
    id: 61,
    question: "Under the AWS Shared Responsibility Model, which of the following is a responsibility of the customer?",
    options: [
      "Physical security of data centers",
      "Patching the virtualization hypervisor",
      "Configuring security groups and network access control lists (NACLs)",
      "Disposal of decommissioned storage drives"
    ],
    answer: "C",
    explanation: "Under the Shared Responsibility Model, the customer is responsible for security 'in' the cloud, which includes configuring network security, security groups, and firewall settings.",
    section: 1
  },
  {
    id: 62,
    question: "Which of the following describes the concept of Elasticity in the AWS Cloud?",
    options: [
      "The ability to pay upfront to secure discounted pricing",
      "The ability to scale computing resources up or down automatically based on demand",
      "The ability to deploy applications globally in multiple languages",
      "The ability to prevent unauthorized access by utilizing encryption"
    ],
    answer: "B",
    explanation: "Elasticity is the ability to automatically scale resources (like EC2 instances) up and down to match demand, minimizing cost and ensuring performance.",
    section: 1
  },
  {
    id: 63,
    question: "What is an Availability Zone (AZ) in AWS?",
    options: [
      "A geographical area containing multiple AWS regions",
      "A single edge location used for caching static web content",
      "One or more discrete data centers with redundant power, networking, and connectivity within an AWS Region",
      "A server racks sharing the same physical host"
    ],
    answer: "C",
    explanation: "One or more discrete data centers with redundant power, networking, and connectivity, designed to isolate failures from other AZs.",
    section: 1
  },
  {
    id: 64,
    question: "Which advantage of cloud computing refers to the ability to quickly deploy applications globally to users with minimal latency?",
    options: [
      "Trade capital expense for variable expense",
      "Benefit from massive economies of scale",
      "Stop spending money running and maintaining data centers",
      "Go global in minutes"
    ],
    answer: "D",
    explanation: "The 'Go global in minutes' advantage allows businesses to easily deploy applications in multiple AWS regions around the world, reducing latency for end users.",
    section: 1
  },
  {
    id: 65,
    question: "Under the AWS Shared Responsibility Model, who is responsible for patching the guest operating system on an Amazon EC2 instance?",
    options: [
      "AWS is solely responsible",
      "The customer is solely responsible",
      "It is a shared responsibility between AWS and the customer",
      "The operating system vendor is responsible"
    ],
    answer: "B",
    explanation: "Since the customer has root access and controls the guest OS on an EC2 instance, patching the guest OS is the customer's responsibility.",
    section: 1
  },
  {
    id: 66,
    question: "Which pillar of the AWS Well-Architected Framework focuses on running and monitoring systems to deliver business value, and continually improving processes and procedures?",
    options: [
      "Operational Excellence",
      "Performance Efficiency",
      "Reliability",
      "Security"
    ],
    answer: "A",
    explanation: "The Operational Excellence pillar focuses on running workloads effectively, gaining insight into operations, and continuously improving supporting processes and procedures.",
    section: 1
  },
  {
    id: 67,
    question: "What is the primary benefit of AWS Edge Locations?",
    options: [
      "To run high-performance relational databases closer to users",
      "To cache content (web pages, images, videos) closer to end users to reduce latency",
      "To provide backup power sources for regional data centers",
      "To host isolated virtual private networks"
    ],
    answer: "B",
    explanation: "AWS Edge Locations are used by services like Amazon CloudFront (CDN) to cache web content closer to users globally, resulting in lower latency.",
    section: 1
  },
  {
    id: 68,
    question: "Which of the following is a responsibility of AWS under the Shared Responsibility Model?",
    options: [
      "Managing database users and permissions in Amazon RDS",
      "Encrypting application data stored in an Amazon S3 bucket",
      "Managing physical security and server hardware in AWS data centers",
      "Configuring IAM password policies for organization employees"
    ],
    answer: "C",
    explanation: "AWS is responsible for security 'of' the cloud, which includes the physical security of data centers, hypervisor software, infrastructure networking, and physical host hardware.",
    section: 1
  },
  {
    id: 69,
    question: "Which cloud computing benefit is characterized by trading capital expenses (CapEx) for variable operational expenses (OpEx)?",
    options: [
      "Massive economies of scale",
      "Increased speed and agility",
      "Stop spending money running and maintaining data centers",
      "Pay-as-you-go pricing"
    ],
    answer: "D",
    explanation: "Cloud computing allows you to trade heavy upfront capital expenses (purchasing hardware) for flexible variable operational expenses (paying only for what you consume).",
    section: 1
  },
  {
    id: 70,
    question: "Which AWS Well-Architected Framework pillar refers to the capability of a workload to perform its intended function correctly and consistently when it's expected to?",
    options: [
      "Cost Optimization",
      "Reliability",
      "Security",
      "Performance Efficiency"
    ],
    answer: "B",
    explanation: "The Reliability pillar ensures that a system can recover from service or infrastructure disruptions, dynamically acquire resources to meet demand, and mitigate transient failures.",
    section: 1
  },

  // SECTION 2 (Day 2)
  {
    id: 26,
    question: "A company wants to create repeatable infrastructure using templates. Which service should it use?",
    options: [
      "CloudFormation",
      "CloudWatch",
      "CodePipeline",
      "Config"
    ],
    answer: "A",
    explanation: "CloudFormation = infrastructure as code.",
    section: 2
  },
  {
    id: 27,
    question: "A development team wants to compile code, run unit tests, and create deployment packages. Which service should they use?",
    options: [
      "CodeBuild",
      "CodePipeline",
      "X-Ray",
      "CloudFormation"
    ],
    answer: "A",
    explanation: "CodeBuild = build/test/package.",
    section: 2
  },
  {
    id: 28,
    question: "A company wants to automate the full release process from source to build to deploy. Which service should it use?",
    options: [
      "CodePipeline",
      "CodeBuild",
      "CloudTrail",
      "Systems Manager"
    ],
    answer: "A",
    explanation: "CodePipeline = CI/CD workflow.",
    section: 2
  },
  {
    id: 29,
    question: "A company wants to trace requests through an application to troubleshoot performance. Which service should it use?",
    options: [
      "X-Ray",
      "CloudTrail",
      "Config",
      "Budgets"
    ],
    answer: "A",
    explanation: "X-Ray = application tracing.",
    section: 2
  },
  {
    id: 30,
    question: "A company wants to run commands across many EC2 instances and patch them. Which service should it use?",
    options: [
      "Systems Manager",
      "CloudFormation",
      "CloudTrail",
      "Route 53"
    ],
    answer: "A",
    explanation: "Systems Manager = manage/patch/run commands.",
    section: 2
  },
  {
    id: 31,
    question: "Which service records API activity in an AWS account?",
    options: [
      "CloudTrail",
      "CloudWatch",
      "Config",
      "Trusted Advisor"
    ],
    answer: "A",
    explanation: "CloudTrail = API audit logs.",
    section: 2
  },
  {
    id: 32,
    question: "Which service collects metrics, logs, and alarms?",
    options: [
      "CloudWatch",
      "CloudTrail",
      "Config",
      "Artifact"
    ],
    answer: "A",
    explanation: "CloudWatch = metrics/logs/alarms.",
    section: 2
  },
  {
    id: 33,
    question: "Which service tracks AWS resource configuration changes and compliance?",
    options: [
      "Config",
      "CloudWatch",
      "CloudTrail",
      "Inspector"
    ],
    answer: "A",
    explanation: "Config = configuration history/compliance.",
    section: 2
  },
  {
    id: 34,
    question: "Which service helps manage multiple AWS accounts?",
    options: [
      "AWS Organizations",
      "IAM",
      "CloudFront",
      "SQS"
    ],
    answer: "A",
    explanation: "Organizations = multi-account management.",
    section: 2
  },
  {
    id: 35,
    question: "Which service helps set up and govern a multi-account AWS environment?",
    options: [
      "Control Tower",
      "Route 53",
      "Kinesis",
      "WorkSpaces"
    ],
    answer: "A",
    explanation: "Control Tower = governed landing zone.",
    section: 2
  },
  {
    id: 36,
    question: "Which service provides best-practice recommendations for cost, performance, security, and fault tolerance?",
    options: [
      "Trusted Advisor",
      "CloudTrail",
      "S3",
      "Athena"
    ],
    answer: "A",
    explanation: "Trusted Advisor = recommendations.",
    section: 2
  },
  {
    id: 41,
    question: "Which service manages encryption keys?",
    options: [
      "KMS",
      "Secrets Manager",
      "IAM",
      "WAF"
    ],
    answer: "A",
    explanation: "KMS = encryption keys.",
    section: 2
  },
  {
    id: 42,
    question: "Which service stores and automatically rotates secrets?",
    options: [
      "Secrets Manager",
      "KMS",
      "IAM",
      "CloudTrail"
    ],
    answer: "A",
    explanation: "Secrets Manager = secrets rotation.",
    section: 2
  },
  {
    id: 43,
    question: "Which service protects against DDoS attacks?",
    options: [
      "Shield",
      "WAF",
      "Macie",
      "Inspector"
    ],
    answer: "A",
    explanation: "Shield = DDoS protection.",
    section: 2
  },
  {
    id: 44,
    question: "Which service protects web applications from common web attacks such as SQL injection?",
    options: [
      "WAF",
      "Shield",
      "GuardDuty",
      "KMS"
    ],
    answer: "A",
    explanation: "WAF = web application firewall.",
    section: 2
  },
  {
    id: 45,
    question: "Which service detects threats by analyzing account activity and network events?",
    options: [
      "GuardDuty",
      "Inspector",
      "Macie",
      "Artifact"
    ],
    answer: "A",
    explanation: "GuardDuty = threat detection.",
    section: 2
  },
  {
    id: 46,
    question: "Which service scans workloads for software vulnerabilities?",
    options: [
      "Inspector",
      "GuardDuty",
      "KMS",
      "CloudTrail"
    ],
    answer: "A",
    explanation: "Inspector = vulnerability scanning.",
    section: 2
  },
  {
    id: 47,
    question: "Which service discovers sensitive data in Amazon S3?",
    options: [
      "Macie",
      "Inspector",
      "Shield",
      "CloudWatch"
    ],
    answer: "A",
    explanation: "Macie = sensitive data in S3.",
    section: 2
  },
  {
    id: 48,
    question: "Which service provides access to AWS compliance reports?",
    options: [
      "Artifact",
      "CloudTrail",
      "Config",
      "Trusted Advisor"
    ],
    answer: "A",
    explanation: "Artifact = compliance reports.",
    section: 2
  },

  // SECTION 3 (Day 3)
  {
    id: 11,
    question: "A company wants to store objects such as images, videos, and backups. Which service should they use?",
    options: [
      "S3",
      "EBS",
      "EFS",
      "FSx"
    ],
    answer: "A",
    explanation: "S3 = object storage.",
    section: 3
  },
  {
    id: 12,
    question: "An EC2 instance needs block storage like a hard drive. Which service should be used?",
    options: [
      "EBS",
      "S3",
      "EFS",
      "Glacier"
    ],
    answer: "A",
    explanation: "EBS = EC2 block disk.",
    section: 3
  },
  {
    id: 13,
    question: "Multiple Linux EC2 instances need shared file storage. Which service should be used?",
    options: [
      "EFS",
      "EBS",
      "S3 Glacier",
      "Kinesis"
    ],
    answer: "A",
    explanation: "EFS = shared file system.",
    section: 3
  },
  {
    id: 14,
    question: "A company needs long-term low-cost archive storage. Which service should they use?",
    options: [
      "S3 Glacier",
      "EBS",
      "RDS",
      "CloudFront"
    ],
    answer: "A",
    explanation: "Glacier = archive.",
    section: 3
  },
  {
    id: 15,
    question: "A company wants to cache website content close to users globally. Which service should they use?",
    options: [
      "CloudFront",
      "Route 53",
      "Direct Connect",
      "VPC"
    ],
    answer: "A",
    explanation: "CloudFront = CDN.",
    section: 3
  },
  {
    id: 16,
    question: "Which service provides DNS for domain names?",
    options: [
      "Route 53",
      "CloudFront",
      "API Gateway",
      "Transit Gateway"
    ],
    answer: "A",
    explanation: "Route 53 = DNS.",
    section: 3
  },
  {
    id: 17,
    question: "A company wants a private isolated network in AWS. Which service should it use?",
    options: [
      "VPC",
      "CloudFront",
      "IAM",
      "SQS"
    ],
    answer: "A",
    explanation: "VPC = private AWS network.",
    section: 3
  },
  {
    id: 18,
    question: "A company wants a dedicated private network connection from its data center to AWS. Which service should it use?",
    options: [
      "Direct Connect",
      "VPN",
      "CloudFront",
      "Route 53"
    ],
    answer: "A",
    explanation: "Direct Connect = dedicated private line.",
    section: 3
  },
  {
    id: 19,
    question: "A company wants an encrypted connection over the internet between its office and AWS. Which service should it use?",
    options: [
      "AWS VPN",
      "Direct Connect",
      "CloudFront",
      "WAF"
    ],
    answer: "A",
    explanation: "VPN = encrypted tunnel over internet.",
    section: 3
  },
  {
    id: 21,
    question: "A company wants to run code without provisioning or managing servers. Which service should it use?",
    options: [
      "Lambda",
      "EC2",
      "EBS",
      "RDS"
    ],
    answer: "A",
    explanation: "Lambda = serverless functions.",
    section: 3
  },
  {
    id: 22,
    question: "A company wants to run containers without managing servers. Which service should it use?",
    options: [
      "Fargate",
      "EC2",
      "EBS",
      "Redshift"
    ],
    answer: "A",
    explanation: "Fargate = serverless containers.",
    section: 3
  },
  {
    id: 23,
    question: "A company wants to run Kubernetes on AWS. Which service should it use?",
    options: [
      "EKS",
      "ECS",
      "ECR",
      "Lambda"
    ],
    answer: "A",
    explanation: "EKS = Kubernetes.",
    section: 3
  },
  {
    id: 24,
    question: "A company wants to store container images. Which service should it use?",
    options: [
      "ECR",
      "EKS",
      "ECS",
      "S3 Glacier"
    ],
    answer: "A",
    explanation: "ECR = container registry.",
    section: 3
  },
  {
    id: 25,
    question: "A developer wants to deploy a web application without manually configuring EC2, load balancers, and Auto Scaling. Which service should they use?",
    options: [
      "Elastic Beanstalk",
      "CloudFormation",
      "CodeBuild",
      "X-Ray"
    ],
    answer: "A",
    explanation: "Beanstalk = easy app deployment.",
    section: 3
  },

  // SECTION 4 (Day 4)
  {
    id: 1,
    question: "A company wants to run SQL queries directly on log files stored in Amazon S3 without managing servers. Which service should they use?",
    options: [
      "Redshift",
      "Athena",
      "RDS",
      "QuickSight"
    ],
    answer: "B",
    explanation: "Athena = serverless SQL on S3.",
    section: 4
  },
  {
    id: 2,
    question: "A company wants a managed relational database for a web application. Which service should they use?",
    options: [
      "DynamoDB",
      "RDS",
      "S3",
      "ElastiCache"
    ],
    answer: "B",
    explanation: "RDS = managed relational SQL database.",
    section: 4
  },
  {
    id: 3,
    question: "A company wants a NoSQL database that can scale automatically to handle very large traffic. Which service should they use?",
    options: [
      "DynamoDB",
      "Redshift",
      "Aurora",
      "Neptune"
    ],
    answer: "A",
    explanation: "DynamoDB = serverless NoSQL at scale.",
    section: 4
  },
  {
    id: 4,
    question: "Which AWS service provides a cloud-based data warehouse?",
    options: [
      "Redshift",
      "RDS",
      "Athena",
      "Glue"
    ],
    answer: "A",
    explanation: "Redshift = data warehouse.",
    section: 4
  },
  {
    id: 5,
    question: "A company wants to transform and prepare data before analytics. Which service should they use?",
    options: [
      "Glue",
      "CloudTrail",
      "Macie",
      "Shield"
    ],
    answer: "A",
    explanation: "Glue = ETL.",
    section: 4
  },
  {
    id: 6,
    question: "Which service provides interactive dashboards and business intelligence?",
    options: [
      "QuickSight",
      "CloudWatch",
      "Redshift",
      "Athena"
    ],
    answer: "A",
    explanation: "QuickSight = dashboards.",
    section: 4
  },
  {
    id: 7,
    question: "A company needs a graph database for fraud detection and relationships between accounts. Which service should they use?",
    options: [
      "Neptune",
      "DynamoDB",
      "DocumentDB",
      "ElastiCache"
    ],
    answer: "A",
    explanation: "Neptune = graph relationships.",
    section: 4
  },
  {
    id: 8,
    question: "A company wants MongoDB compatibility on AWS. Which service should they choose?",
    options: [
      "DocumentDB",
      "DynamoDB",
      "Aurora",
      "RDS"
    ],
    answer: "A",
    explanation: "DocumentDB = MongoDB-compatible.",
    section: 4
  },
  {
    id: 9,
    question: "A company needs to reduce database read load using Redis. Which service should they use?",
    options: [
      "ElastiCache",
      "DynamoDB",
      "Athena",
      "EFS"
    ],
    answer: "A",
    explanation: "ElastiCache = Redis/Memcached cache.",
    section: 4
  },
  {
    id: 10,
    question: "An application needs to process real-time clickstream data. Which service should be used?",
    options: [
      "Kinesis",
      "Redshift",
      "RDS",
      "S3 Glacier"
    ],
    answer: "A",
    explanation: "Kinesis = real-time streaming.",
    section: 4
  },
  {
    id: 20,
    question: "A company wants to create and manage APIs for a serverless application. Which service should it use?",
    options: [
      "API Gateway",
      "Route 53",
      "CloudTrail",
      "Config"
    ],
    answer: "A",
    explanation: "API Gateway = API front door.",
    section: 4
  },
  {
    id: 49,
    question: "A company wants to migrate a database to AWS with minimal downtime. Which service should it use?",
    options: [
      "DMS",
      "Glue",
      "DataSync",
      "Redshift"
    ],
    answer: "A",
    explanation: "DMS = database migration.",
    section: 4
  },
  {
    id: 50,
    question: "A company wants to convert a database schema from Oracle to PostgreSQL. Which tool should it use?",
    options: [
      "AWS SCT",
      "AWS DMS",
      "AWS Glue",
      "Amazon Athena"
    ],
    answer: "A",
    explanation: "SCT = schema conversion.",
    section: 4
  },
  {
    id: 51,
    question: "A company has too much data to transfer over the internet. Which AWS option should it use?",
    options: [
      "Snow Family",
      "CloudFront",
      "Route 53",
      "SQS"
    ],
    answer: "A",
    explanation: "Snow Family = physical data transfer.",
    section: 4
  },
  {
    id: 52,
    question: "A company wants to decouple application components using a message queue. Which service should it use?",
    options: [
      "SQS",
      "SNS",
      "EventBridge",
      "Step Functions"
    ],
    answer: "A",
    explanation: "SQS = queue.",
    section: 4
  },
  {
    id: 53,
    question: "A company wants to send notifications to multiple subscribers. Which service should it use?",
    options: [
      "SNS",
      "SQS",
      "EBS",
      "IAM"
    ],
    answer: "A",
    explanation: "SNS = notifications/pub-sub.",
    section: 4
  },
  {
    id: 54,
    question: "A company wants to coordinate multiple steps in a business workflow. Which service should it use?",
    options: [
      "Step Functions",
      "SQS",
      "Route 53",
      "CloudFront"
    ],
    answer: "A",
    explanation: "Step Functions = workflow orchestration.",
    section: 4
  },
  {
    id: 55,
    question: "A company wants to build event-driven applications that respond to AWS service events. Which service should it use?",
    options: [
      "EventBridge",
      "SQS",
      "SNS",
      "EFS"
    ],
    answer: "A",
    explanation: "EventBridge = event bus.",
    section: 4
  },

  // SECTION 5 (Day 5)
  {
    id: 37,
    question: "A company wants to receive an alert when monthly AWS spending exceeds a set amount. Which service should it use?",
    options: [
      "AWS Budgets",
      "Cost Explorer",
      "Pricing Calculator",
      "Cost and Usage Report"
    ],
    answer: "A",
    explanation: "Budgets = alerts.",
    section: 5
  },
  {
    id: 38,
    question: "A company wants to analyze past AWS spending trends. Which service should it use?",
    options: [
      "Cost Explorer",
      "AWS Budgets",
      "Pricing Calculator",
      "Artifact"
    ],
    answer: "A",
    explanation: "Cost Explorer = analyze cost.",
    section: 5
  },
  {
    id: 39,
    question: "A company wants to estimate cost before deploying resources. Which tool should it use?",
    options: [
      "AWS Pricing Calculator",
      "Cost Explorer",
      "CloudTrail",
      "GuardDuty"
    ],
    answer: "A",
    explanation: "Pricing Calculator = estimate before building.",
    section: 5
  },
  {
    id: 40,
    question: "Which report provides the most detailed billing and usage data?",
    options: [
      "Cost and Usage Report",
      "AWS Budgets",
      "AWS Artifact",
      "AWS Shield"
    ],
    answer: "A",
    explanation: "CUR = detailed billing report.",
    section: 5
  },
  {
    id: 56,
    question: "A company wants sentiment analysis on customer reviews. Which service should it use?",
    options: [
      "Comprehend",
      "Polly",
      "Transcribe",
      "Translate"
    ],
    answer: "A",
    explanation: "Comprehend = understand text/sentiment.",
    section: 5
  },
  {
    id: 57,
    question: "A company wants to convert text into lifelike speech. Which service should it use?",
    options: [
      "Polly",
      "Transcribe",
      "Textract",
      "Rekognition"
    ],
    answer: "A",
    explanation: "Polly = text to speech.",
    section: 5
  },
  {
    id: 58,
    question: "A company wants to convert speech audio into text. Which service should it use?",
    options: [
      "Transcribe",
      "Translate",
      "Polly",
      "Lex"
    ],
    answer: "A",
    explanation: "Transcribe = speech to text.",
    section: 5
  },
  {
    id: 59,
    question: "A company wants to extract text and data from scanned documents. Which service should it use?",
    options: [
      "Textract",
      "Transcribe",
      "Kendra",
      "SageMaker AI"
    ],
    answer: "A",
    explanation: "Textract = extract text from documents.",
    section: 5
  },
  {
    id: 60,
    question: "A company wants to identify objects in images. Which service should it use?",
    options: [
      "Rekognition",
      "Comprehend",
      "Translate",
      "Kendra"
    ],
    answer: "A",
    explanation: "Rekognition = image/video recognition.",
    section: 5
  }
];
