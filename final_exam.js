// =====================================================================
// final_exam.js — original CLF-C02 content pack
//   * MULTI_SELECT_QUESTIONS    (choose-two / choose-three, all with rationale)
//   * COVERAGE_GAP_QUESTIONS    (Sustainability, 6 R's, SCPs, Cost Allocation,
//                                Savings Plans vs RI vs On-Demand, Direct Connect
//                                / VPN / Transit Gateway, Marketplace, AI/ML)
//   * FINAL_PRESSURE_TEST       (50-question realistic, weighted, application-
//                                level scenarios; ~10 multi-select; all with
//                                per-option rationale)
//
// All content is original and aligned to publicly documented CLF-C02 exam
// objectives (AWS exam guide, whitepapers, FAQs). No real exam questions.
//
// On load, the two section-pools are merged into the existing QUESTIONS array
// so they appear in sectioned practice, the random exam pool, wrong-answer
// review, and any future analytics.
// =====================================================================

// ----- MULTI-SELECT QUESTIONS (choose two or three) -----
const MULTI_SELECT_QUESTIONS = [
  // ---- Section 1: Cloud Concepts ----
  {
    id: 2001,
    section: 1,
    isMulti: true,
    multiCount: 2,
    question: "A company wants to deploy a workload that must survive the failure of a single data center in a Region. Which combination of AWS features provides this capability? (Choose two.)",
    options: [
      "Deploying into multiple Availability Zones within the Region",
      "Using Edge Locations for content caching",
      "Using AWS Regions in different geographic areas",
      "Deploying EC2 instances into two or more Availability Zones"
    ],
    answer: "A,D",
    explanation: "Availability Zones (AZs) are isolated data centers within a Region. Distributing across multiple AZs protects against a single data-center failure. Edge Locations are for CDN caching, not workload resilience. Multiple Regions would protect against a regional event but are not the typical scope of a 'single data center' requirement.",
    rationale: [
      "Correct — AZs are isolated data centers; multi-AZ = single-data-center failure tolerance.",
      "Wrong — Edge Locations cache content, they don't run your workload.",
      "Wrong — Multi-Region addresses a different scope (region-level failure).",
      "Correct — Spreading EC2 across AZs achieves high availability within a Region."
    ]
  },
  {
    id: 2002,
    section: 1,
    isMulti: true,
    multiCount: 2,
    question: "Which of the following are benefits of cloud computing according to the AWS Well-Architected Framework? (Choose two.)",
    options: [
      "Trade capital expense for variable expense",
      "Guaranteed zero downtime",
      "Stop guessing capacity",
      "Eliminate all security responsibilities"
    ],
    answer: "A,C",
    explanation: "Trade CAPEX for OPEX and stop guessing capacity are two of the six Well-Architected advantages. AWS does not guarantee zero downtime, and customers retain security responsibility in the cloud (Shared Responsibility).",
    rationale: [
      "Correct — Pay-as-you-go converts fixed costs into variable costs.",
      "Wrong — No cloud provider offers 'guaranteed zero downtime'.",
      "Correct — Auto Scaling and elastic capacity remove the need to forecast peak.",
      "Wrong — Customer always retains some security responsibility (Shared Responsibility)."
    ]
  },
  {
    id: 2003,
    section: 1,
    isMulti: true,
    multiCount: 3,
    question: "Which pillars are part of the AWS Well-Architected Framework? (Choose three.)",
    options: [
      "Operational Excellence",
      "Sustainability",
      "Elasticity",
      "Reliability",
      "Marketplace"
    ],
    answer: "A,B,D",
    explanation: "The six pillars are Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability. Elasticity is a concept (not a pillar) and Marketplace is a catalog service.",
    rationale: [
      "Correct — First pillar of the Well-Architected Framework.",
      "Correct — Added in 2021 as the sixth pillar.",
      "Wrong — Elasticity is a cloud concept, not a framework pillar.",
      "Correct — Third pillar.",
      "Wrong — Marketplace is a service catalog, not a pillar."
    ]
  },

  // ---- Section 2: Security & Compliance ----
  {
    id: 2004,
    section: 2,
    isMulti: true,
    multiCount: 2,
    question: "Under the AWS Shared Responsibility Model, which of the following are the CUSTOMER's responsibility? (Choose two.)",
    options: [
      "Patching the guest operating system on an EC2 instance",
      "Patching the hypervisor that runs EC2",
      "Configuring IAM users, groups, and roles",
      "Maintaining physical security of AWS data centers"
    ],
    answer: "A,C",
    explanation: "Customers are responsible for what they put in the cloud: their data, IAM, and guest OS on EC2. AWS handles physical security and the hypervisor.",
    rationale: [
      "Correct — EC2 is IaaS; you own the guest OS patching.",
      "Wrong — The hypervisor is part of the AWS-managed infrastructure layer.",
      "Correct — IAM is fully customer-controlled.",
      "Wrong — Physical data center security is always AWS's responsibility."
    ]
  },
  {
    id: 2005,
    section: 2,
    isMulti: true,
    multiCount: 2,
    question: "Which services can be used to detect threats or vulnerabilities in an AWS environment? (Choose two.)",
    options: [
      "Amazon GuardDuty",
      "AWS Trusted Advisor",
      "Amazon Inspector",
      "AWS Config"
    ],
    answer: "A,C",
    explanation: "GuardDuty is the threat-detection service (analyzes CloudTrail/VPC/DNS logs for malicious activity). Inspector scans EC2 workloads and container images for vulnerabilities. Trusted Advisor gives best-practice recommendations; Config tracks resource configuration changes — neither is a threat/vulnerability detector.",
    rationale: [
      "Correct — Continuous threat detection across accounts.",
      "Wrong — Trusted Advisor checks cost, security, fault tolerance, etc. — not active threat detection.",
      "Correct — Automated vulnerability scanning for EC2 and containers.",
      "Wrong — Config records configuration changes; doesn't detect threats itself."
    ]
  },
  {
    id: 2006,
    section: 2,
    isMulti: true,
    multiCount: 2,
    question: "A company needs to enforce that no EC2 instance in its accounts can be launched without approved tags. Which AWS services help achieve this? (Choose two.)",
    options: [
      "AWS Config with managed rules",
      "AWS Organizations Service Control Policies (SCPs)",
      "Amazon Macie",
      "AWS Trusted Advisor"
    ],
    answer: "A,B",
    explanation: "SCPs can deny API calls account-wide (e.g., deny RunInstances without required tags). AWS Config with managed rules can detect non-compliant resources and trigger remediation. Macie is for sensitive data in S3; Trusted Advisor is best-practice checks.",
    rationale: [
      "Correct — Config rules can detect and even auto-remediate missing tags.",
      "Correct — SCPs can enforce a tag-on-create policy at the account/OU level.",
      "Wrong — Macie scans S3 for sensitive data, not resource tags.",
      "Wrong — Trusted Advisor does not enforce tags."
    ]
  },
  {
    id: 2007,
    section: 2,
    isMulti: true,
    multiCount: 2,
    question: "Which of the following are valid ways to protect data at rest on Amazon S3? (Choose two.)",
    options: [
      "Enable default server-side encryption with S3-managed keys (SSE-S3)",
      "Configure Amazon CloudFront in front of the bucket",
      "Enable AWS KMS server-side encryption (SSE-KMS)",
      "Enable S3 Versioning only"
    ],
    answer: "A,C",
    explanation: "SSE-S3 and SSE-KMS both encrypt data at rest. CloudFront is a CDN for content delivery. Versioning protects against accidental deletion, not disclosure.",
    rationale: [
      "Correct — SSE-S3 encrypts every object with AES-256 using S3-managed keys.",
      "Wrong — CloudFront delivers content; it doesn't encrypt S3 at rest.",
      "Correct — SSE-KMS uses customer-managed KMS keys for encryption.",
      "Wrong — Versioning preserves object history, it does not encrypt."
    ]
  },
  {
    id: 2008,
    section: 2,
    isMulti: true,
    multiCount: 2,
    question: "Which AWS services help with identity and access management for human users in a multi-account AWS environment? (Choose two.)",
    options: [
      "AWS IAM Identity Center (AWS SSO)",
      "Amazon Cognito",
      "AWS IAM with cross-account roles",
      "AWS WAF"
    ],
    answer: "A,C",
    explanation: "IAM Identity Center is the modern, recommended way to give workforce users access across multiple AWS accounts. IAM users and cross-account roles are the classic, still-valid pattern. Cognito is for app end-user sign-up/sign-in (not workforce). WAF is a web application firewall.",
    rationale: [
      "Correct — Centralized SSO/workforce access across accounts.",
      "Wrong — Cognito manages application end-users, not AWS workforce users.",
      "Correct — Cross-account IAM roles are the standard mechanism for multi-account access.",
      "Wrong — WAF filters HTTP/S attacks at the application layer."
    ]
  },

  // ---- Section 3: Compute, Storage, Networking ----
  {
    id: 2009,
    section: 3,
    isMulti: true,
    multiCount: 2,
    question: "A company wants the lowest-cost compute option for a fault-tolerant, interruptible batch processing workload. Which combination fits best? (Choose two.)",
    options: [
      "Run on Amazon EC2 Spot Instances",
      "Run on EC2 Dedicated Hosts",
      "Run on AWS Batch backed by Spot",
      "Run on Reserved Instances with no upfront"
    ],
    answer: "A,C",
    explanation: "Spot Instances provide the largest discount (up to 90%) and are ideal for fault-tolerant, interruptible workloads. AWS Batch natively schedules Spot for batch jobs. Dedicated Hosts are for licensing/BYOL — most expensive. RIs require commitment and aren't designed to be interrupted.",
    rationale: [
      "Correct — Up to 90% off, can be interrupted — ideal for batch.",
      "Wrong — Dedicated Hosts are the most expensive option; not for cost optimization.",
      "Correct — Batch automatically retries interrupted Spot capacity.",
      "Wrong — RIs are steady-state pricing, not designed for interruptible workloads."
    ]
  },
  {
    id: 2010,
    section: 3,
    isMulti: true,
    multiCount: 2,
    question: "Which storage options are appropriate for a Linux-based workload that needs a shared file system accessible from multiple EC2 instances? (Choose two.)",
    options: [
      "Amazon EBS gp3 volumes attached to each instance",
      "Amazon EFS",
      "Amazon FSx for Lustre",
      "Amazon S3 bucket"
    ],
    answer: "B,C",
    explanation: "EFS provides a shared NFS file system for many EC2 instances. FSx for Lustre provides a high-performance shared parallel file system. EBS is per-instance block storage. S3 is object storage, not a file system.",
    rationale: [
      "Wrong — EBS is per-instance block storage, not shared across instances.",
      "Correct — EFS is a managed NFS file system mountable from many EC2s.",
      "Correct — FSx for Lustre is a shared, high-throughput file system.",
      "Wrong — S3 is object storage accessed over HTTP, not a POSIX file system."
    ]
  },
  {
    id: 2011,
    section: 3,
    isMulti: true,
    multiCount: 2,
    question: "Which AWS services are typically used together to deliver a static website globally with low latency? (Choose two.)",
    options: [
      "Amazon CloudFront",
      "Amazon Route 53",
      "AWS Direct Connect",
      "AWS Storage Gateway"
    ],
    answer: "A,B",
    explanation: "Route 53 routes users to the right endpoint, and CloudFront caches the static content at edge locations for low latency. Direct Connect is a private network connection; Storage Gateway bridges on-prem storage to AWS — neither is for serving a public static site globally.",
    rationale: [
      "Correct — Global CDN with edge caching for static content.",
      "Correct — DNS service that routes users to your CloudFront distribution.",
      "Wrong — Direct Connect is a private line from your data center; not for end-user traffic.",
      "Wrong — Storage Gateway is for hybrid on-prem to AWS storage."
    ]
  },
  {
    id: 2012,
    section: 3,
    isMulti: true,
    multiCount: 2,
    question: "Which services provide private connectivity from an on-premises data center to a VPC? (Choose two.)",
    options: [
      "AWS Direct Connect",
      "AWS Site-to-Site VPN",
      "Amazon CloudFront",
      "AWS Transit Gateway"
    ],
    answer: "A,B",
    explanation: "Direct Connect is a dedicated private fiber line; Site-to-Site VPN is an encrypted tunnel over the public internet. Transit Gateway is a hub for connecting many VPCs/on-prem networks — it pairs with DX or VPN but isn't the connection itself. CloudFront is a CDN, not a private link.",
    rationale: [
      "Correct — Dedicated private network connection to AWS.",
      "Correct — Encrypted IPSec tunnel from on-prem to AWS over the internet.",
      "Wrong — CloudFront delivers cached web content at the edge.",
      "Wrong — Transit Gateway is a hub/router, not a connection type."
    ]
  },

  // ---- Section 4: Databases & Analytics ----
  {
    id: 2013,
    section: 4,
    isMulti: true,
    multiCount: 2,
    question: "A company needs to ingest clickstream events from a website in real time, store them durably, and run ad-hoc SQL analytics on the data lake without managing servers. Which services are the best fit? (Choose two.)",
    options: [
      "Amazon Kinesis Data Streams",
      "Amazon Athena",
      "Amazon Redshift Serverless",
      "AWS Direct Connect"
    ],
    answer: "A,B",
    explanation: "Kinesis Data Streams ingests real-time clickstream events. Athena queries data directly in S3 using serverless SQL — the typical 'data lake' query layer. Redshift Serverless is also serverless, but it's a warehouse engine (not the lightweight ad-hoc SQL-on-S3 answer). Direct Connect is irrelevant.",
    rationale: [
      "Correct — Real-time streaming data ingestion service.",
      "Correct — Serverless SQL directly against data in S3.",
      "Wrong — Redshift Serverless is a warehouse; heavier than the question asks for ad-hoc SQL on a data lake.",
      "Wrong — Direct Connect is a private network link."
    ]
  },
  {
    id: 2014,
    section: 4,
    isMulti: true,
    multiCount: 2,
    question: "Which of the following are valid messaging and integration patterns on AWS? (Choose two.)",
    options: [
      "SQS for asynchronous message queuing between application components",
      "SNS for pub/sub fan-out notifications to many subscribers",
      "EBS for decoupled message delivery",
      "Glue for pub/sub notifications"
    ],
    answer: "A,B",
    explanation: "SQS is a queue (pull/poll); SNS is pub/sub (push). EBS is block storage, not messaging. Glue is serverless ETL, not a pub/sub service.",
    rationale: [
      "Correct — SQS decouples producers and consumers via a queue.",
      "Correct — SNS pushes notifications to many subscribers.",
      "Wrong — EBS is block storage for EC2.",
      "Wrong — Glue is for ETL/data preparation."
    ]
  },

  // ---- Section 5: Billing, Pricing & Support ----
  {
    id: 2015,
    section: 5,
    isMulti: true,
    multiCount: 2,
    question: "A startup wants to minimize costs and only pay for what they use while their workload is small and unpredictable. Which pricing options fit? (Choose two.)",
    options: [
      "On-Demand EC2 Instances",
      "Reserved Instances with 1-year No Upfront",
      "Savings Plans with 3-year All Upfront",
      "AWS Free Tier where applicable"
    ],
    answer: "A,D",
    explanation: "On-Demand has no commitment; Free Tier gives you free usage up to limits. RIs and Savings Plans require commitment in exchange for discount, which contradicts the 'unpredictable' requirement.",
    rationale: [
      "Correct — Pay by the second with no commitment.",
      "Wrong — 1-year commitment doesn't fit 'unpredictable, small'.",
      "Wrong — 3-year all-upfront is the maximum commitment, worst for flexibility.",
      "Correct — Free Tier is ideal for early-stage experimentation."
    ]
  },
  {
    id: 2016,
    section: 5,
    isMulti: true,
    multiCount: 2,
    question: "Which AWS services help a company understand, forecast, or control its AWS spend? (Choose two.)",
    options: [
      "AWS Cost Explorer",
      "AWS Budgets",
      "Amazon Athena",
      "AWS Trusted Advisor (cost optimization checks)"
    ],
    answer: "A,B",
    explanation: "Cost Explorer visualizes past/future spend; Budgets alerts when cost or usage thresholds are crossed. Athena is a SQL query service, not a billing tool. Trusted Advisor can flag cost optimization opportunities but is not a forecasting/control tool like Cost Explorer or Budgets.",
    rationale: [
      "Correct — Visualize and forecast AWS costs.",
      "Correct — Set custom cost/usage alerts.",
      "Wrong — Athena queries S3 data with SQL.",
      "Wrong — Trusted Advisor gives recommendations but isn't a spend-control/forecast service."
    ]
  }
];

// ----- COVERAGE GAP QUESTIONS (Sustainability, 6 R's, SCPs, Cost Allocation,
//       Savings Plans vs RI vs On-Demand, Direct Connect/VPN/TGW, Marketplace,
//       AI/ML services, AWS Config) -----
const COVERAGE_GAP_QUESTIONS = [
  // Sustainability pillar
  {
    id: 2101,
    section: 1,
    question: "Which AWS Well-Architected pillar focuses on minimizing the environmental impact of cloud workloads?",
    options: [
      "Cost Optimization",
      "Reliability",
      "Sustainability",
      "Performance Efficiency"
    ],
    answer: "C",
    explanation: "Sustainability (added in 2021) is the sixth Well-Architected pillar, focused on reducing the environmental impact of cloud workloads.",
    rationale: [
      "Wrong — Cost Optimization focuses on delivering business value at the lowest price.",
      "Wrong — Reliability focuses on recovering from failures and meeting demand.",
      "Correct — The Sustainability pillar is dedicated to environmental impact.",
      "Wrong — Performance Efficiency focuses on using computing resources efficiently."
    ]
  },
  {
    id: 2102,
    section: 1,
    question: "Which design choice best aligns with the AWS Sustainability pillar?",
    options: [
      "Over-provisioning capacity to handle peak load at all times",
      "Right-sizing instances and shutting down idle resources",
      "Using Reserved Instances even when utilization is low",
      "Storing all data in S3 Glacier regardless of access pattern"
    ],
    answer: "B",
    explanation: "Sustainability favors efficient utilization: right-size, scale down, shut down unused resources. Over-provisioning wastes energy; Glacier for hot data is over-archived.",
    rationale: [
      "Wrong — Wastes energy; opposite of efficiency.",
      "Correct — Right-sizing and turning things off reduce wasted energy.",
      "Wrong — Locked-in capacity at low utilization is wasted.",
      "Wrong — Archive storage for hot data is over-engineered and unnecessary."
    ]
  },

  // 6 R's of Migration
  {
    id: 2103,
    section: 5,
    question: "A company is moving a legacy application to AWS without changing its code or architecture. Which migration strategy is this?",
    options: [
      "Replatform",
      "Refactor",
      "Rehost",
      "Repurchase"
    ],
    answer: "C",
    explanation: "Rehost (aka 'lift and shift') means moving the application as-is to the cloud without changes. Replatform = small optimizations. Refactor = rewrite to be cloud-native. Repurchase = move to a SaaS product.",
    rationale: [
      "Wrong — Replatform involves small changes (e.g., managed database).",
      "Wrong — Refactor is rewriting for cloud-native patterns.",
      "Correct — Rehost = 'lift and shift' with no code change.",
      "Wrong — Repurchase = switch to a SaaS offering."
    ]
  },
  {
    id: 2104,
    section: 5,
    question: "A company moves its on-premises Oracle database to Amazon RDS for Oracle with minimal changes. This is an example of which strategy?",
    options: [
      "Rehost",
      "Replatform",
      "Repurchase",
      "Retire"
    ],
    answer: "B",
    explanation: "Replatform involves making small optimizations during migration (e.g., moving to a managed database engine). It's more than rehost but less than refactor.",
    rationale: [
      "Wrong — Rehost would be moving the existing Oracle install to EC2 as-is.",
      "Correct — Moving to RDS is a managed-service optimization, classic replatform.",
      "Wrong — Repurchase is moving to a SaaS product.",
      "Wrong — Retire means decommissioning the application entirely."
    ]
  },
  {
    id: 2105,
    section: 5,
    question: "An application is rarely used and provides minimal business value. The best migration strategy is:",
    options: [
      "Rehost",
      "Replatform",
      "Retire",
      "Refactor"
    ],
    answer: "C",
    explanation: "Retire means deprecating the application entirely when its value is low. Migrating it would waste effort.",
    rationale: [
      "Wrong — Rehost still incurs migration cost.",
      "Wrong — Replatform adds even more cost.",
      "Correct — Retire eliminates wasted effort and reduces the migration scope.",
      "Wrong — Refactor is the most expensive option."
    ]
  },

  // Service Control Policies
  {
    id: 2106,
    section: 2,
    question: "Which AWS feature lets you centrally restrict which AWS services and actions accounts in an AWS Organization can use?",
    options: [
      "IAM Policies",
      "Service Control Policies (SCPs)",
      "AWS WAF rules",
      "Network ACLs"
    ],
    answer: "B",
    explanation: "SCPs are organization-wide guardrails that limit which actions accounts (or OUs) can perform. They do not grant permissions — IAM policies still do that.",
    rationale: [
      "Wrong — IAM policies are per-identity, not org-wide guardrails.",
      "Correct — SCPs set permission boundaries across an entire AWS Organization.",
      "Wrong — WAF filters web traffic, not API permissions.",
      "Wrong — NACLs are network-level, not IAM-level controls."
    ]
  },

  // Cost Allocation Tags
  {
    id: 2107,
    section: 5,
    question: "A finance team needs to break down the AWS bill by team and project. Which AWS feature is designed for this?",
    options: [
      "AWS Budgets",
      "Cost Allocation Tags",
      "Cost Explorer",
      "Savings Plans"
    ],
    answer: "B",
    explanation: "Cost allocation tags are specifically designed to categorize resources so they appear grouped on the bill. Cost Explorer visualizes spend; Budgets alerts on thresholds; Savings Plans reduce cost.",
    rationale: [
      "Wrong — Budgets sends alerts when you exceed a spend limit.",
      "Correct — Cost allocation tags label resources for cost grouping/chargeback.",
      "Wrong — Cost Explorer visualizes spend but does not categorize by default.",
      "Wrong — Savings Plans are a pricing discount model."
    ]
  },
  {
    id: 2108,
    section: 5,
    question: "For cost allocation tags to appear on the AWS bill, which of the following must be true?",
    options: [
      "The tag key must be activated in the Billing and Cost Management console",
      "The tag must be added to the root account only",
      "Cost allocation tags are automatically applied by AWS",
      "Each resource must have at most one tag"
    ],
    answer: "A",
    explanation: "Tag keys must be activated in Billing Preferences before they show up in cost reports. Otherwise, tags are present on resources but not in the cost data.",
    rationale: [
      "Correct — Activate the tag key under Billing & Cost Management to include it in reports.",
      "Wrong — Tags can be added to any account, but activation is the key step.",
      "Wrong — AWS does not auto-activate tags.",
      "Wrong — Resources can have up to 50 user-defined tags."
    ]
  },

  // Pricing models
  {
    id: 2109,
    section: 5,
    question: "A workload runs 24/7 with very stable utilization and the company wants the largest possible discount. Which pricing model is best?",
    options: [
      "On-Demand Instances",
      "Spot Instances",
      "3-year Reserved Instances or Savings Plans with All Upfront",
      "Dedicated Hosts"
    ],
    answer: "C",
    explanation: "3-year All Upfront RIs or Savings Plans offer the deepest discount (up to ~60–72% off On-Demand) for predictable workloads. Spot is cheapest but can be interrupted. Dedicated Hosts are most expensive.",
    rationale: [
      "Wrong — Most expensive flexible option.",
      "Wrong — Cheap but interruptible, not for stable 24/7 workloads.",
      "Correct — Maximum discount for stable, predictable usage.",
      "Wrong — Most expensive; for BYOL/compliance scenarios."
    ]
  },
  {
    id: 2110,
    section: 5,
    question: "Which pricing model gives the largest discount but can be interrupted with a 2-minute warning?",
    options: [
      "Reserved Instances",
      "Dedicated Hosts",
      "On-Demand",
      "Spot Instances"
    ],
    answer: "D",
    explanation: "Spot Instances use spare AWS capacity at up to 90% off but can be reclaimed with ~2 minutes notice. Ideal for fault-tolerant workloads.",
    rationale: [
      "Wrong — RIs are stable, committed, no interruption.",
      "Wrong — Dedicated Hosts are stable and most expensive.",
      "Wrong — On-Demand is flexible, never interrupted for capacity.",
      "Correct — Spot = cheapest, can be interrupted."
    ]
  },
  {
    id: 2111,
    section: 5,
    question: "A company has a predictable, steady-state compute spend and wants a discount that automatically applies across EC2, Fargate, and Lambda without locking to one instance type. Which model fits?",
    options: [
      "On-Demand",
      "EC2 Instance Savings Plans",
      "Standard Reserved Instances",
      "Spot Instances"
    ],
    answer: "B",
    explanation: "EC2 Instance Savings Plans (a type of Savings Plan) automatically apply across EC2, Fargate, and Lambda, regardless of region or family, as long as instance type and Region are committed. Standard RIs require region/instance family selection.",
    rationale: [
      "Wrong — On-Demand has no discount.",
      "Correct — Savings Plans are the most flexible discount for steady compute spend.",
      "Wrong — Standard RIs are more rigid (region/family).",
      "Wrong — Spot can be interrupted, not steady-state."
    ]
  },

  // Connectivity: DX vs VPN vs TGW
  {
    id: 2112,
    section: 3,
    question: "An enterprise has dozens of VPCs across multiple AWS accounts and several on-premises data centers that all need to communicate. Which AWS service is the recommended central hub?",
    options: [
      "AWS Direct Connect",
      "AWS Site-to-Site VPN",
      "AWS Transit Gateway",
      "Amazon CloudFront"
    ],
    answer: "C",
    explanation: "Transit Gateway is a regional network transit hub that interconnects VPCs and on-prem networks (via DX or VPN) at scale. Direct Connect and VPN are connection types, not hubs.",
    rationale: [
      "Wrong — DX is a private link from a data center, not a hub.",
      "Wrong — VPN is an encrypted tunnel, also not a hub.",
      "Correct — Transit Gateway is the AWS-recommended hub-and-spoke router.",
      "Wrong — CloudFront is a CDN for content delivery."
    ]
  },
  {
    id: 2113,
    section: 3,
    question: "A company needs a consistent, low-latency private connection (not over the public internet) from its data center to AWS. Which service fits?",
    options: [
      "Site-to-Site VPN",
      "AWS Direct Connect",
      "Internet Gateway",
      "Amazon CloudFront"
    ],
    answer: "B",
    explanation: "Direct Connect provides a dedicated private fiber line with consistent latency. VPN runs over the public internet (encrypted but shared).",
    rationale: [
      "Wrong — VPN is encrypted but travels over the public internet.",
      "Correct — Direct Connect is a dedicated private link.",
      "Wrong — Internet Gateway provides VPC-to-internet routing for public traffic.",
      "Wrong — CloudFront is a CDN, not a private link."
    ]
  },

  // Marketplace
  {
    id: 2114,
    section: 5,
    question: "Where can a customer buy third-party software that runs on AWS (e.g., a pre-built AMI, a SaaS subscription, or a software listing) with billing consolidated into the AWS invoice?",
    options: [
      "AWS Service Catalog",
      "AWS Marketplace",
      "AWS Partner Central",
      "AWS Trusted Advisor"
    ],
    answer: "B",
    explanation: "AWS Marketplace is a digital catalog of third-party software with consolidated AWS billing. Service Catalog is internal approved products; Partner Central is for APN partners; Trusted Advisor gives recommendations.",
    rationale: [
      "Wrong — Service Catalog lists approved internal products.",
      "Correct — Marketplace lists third-party software with AWS-billed subscriptions.",
      "Wrong — Partner Central is for AWS Partner Network members.",
      "Wrong — Trusted Advisor is a recommendation engine."
    ]
  },

  // Config vs CloudTrail vs Audit Manager
  {
    id: 2115,
    section: 2,
    question: "Which AWS service records API calls made in an account and who made them?",
    options: [
      "AWS Config",
      "Amazon CloudWatch",
      "AWS CloudTrail",
      "Amazon Macie"
    ],
    answer: "C",
    explanation: "CloudTrail records API activity ('who did what'). Config records resource configuration changes. CloudWatch monitors metrics/logs. Macie scans S3 for sensitive data.",
    rationale: [
      "Wrong — Config records resource configuration history, not API calls.",
      "Wrong — CloudWatch is metrics, logs, and alarms.",
      "Correct — CloudTrail is the API activity log.",
      "Wrong — Macie finds sensitive data in S3."
    ]
  },

  // AI/ML services
  {
    id: 2116,
    section: 4,
    question: "Which AWS service converts text to lifelike speech?",
    options: [
      "Amazon Transcribe",
      "Amazon Polly",
      "Amazon Translate",
      "Amazon Comprehend"
    ],
    answer: "B",
    explanation: "Polly = text-to-speech. Transcribe = speech-to-text. Translate = language translation. Comprehend = NLP/sentiment.",
    rationale: [
      "Wrong — Transcribe is speech-to-text.",
      "Correct — Polly is text-to-speech.",
      "Wrong — Translate handles language translation.",
      "Wrong — Comprehend analyzes text for insights/sentiment."
    ]
  },
  {
    id: 2117,
    section: 4,
    question: "Which AWS service identifies objects and faces in images and video?",
    options: [
      "Amazon Rekognition",
      "Amazon SageMaker",
      "Amazon Comprehend",
      "Amazon Textract"
    ],
    answer: "A",
    explanation: "Rekognition analyzes images/video for objects, faces, and scenes. SageMaker is custom ML. Comprehend is NLP. Textract is document OCR.",
    rationale: [
      "Correct — Rekognition is the managed image/video analysis service.",
      "Wrong — SageMaker is for building custom ML models.",
      "Wrong — Comprehend is NLP/text analysis.",
      "Wrong — Textract extracts text from scanned documents."
    ]
  }
];

// ----- FINAL PRESSURE TEST (50 questions, weighted, application-level) -----
// Distribution (approximating CLF-C02 domain weights):
//   Section 1 (Cloud Concepts):                12
//   Section 2 (Security & Compliance):         15
//   Section 3 (Compute, Storage, Networking):  13
//   Section 4 (DB / Analytics / Integration):  6
//   Section 5 (Billing, Pricing, Support):     4
// Multi-select share: ~20% (10 of 50). All questions have per-option rationale.
const FINAL_PRESSURE_TEST = [
  // ---- Section 1: Cloud Concepts (12) ----
  {
    id: 3001, section: 1,
    question: "A company wants to deploy an application in the Region closest to most of its users in Europe, with the ability to fail over to another Region. Which design principle is this?",
    options: ["High availability","Elasticity","Geographic diversity","Right-sizing"],
    answer: "C",
    explanation: "Deploying in multiple geographic regions provides resilience and lower latency for users in different locations.",
    rationale: [
      "Wrong — HA usually refers to AZ-level resilience, not Regions.",
      "Wrong — Elasticity is matching capacity to demand.",
      "Correct — Multi-Region deployment gives geographic diversity.",
      "Wrong — Right-sizing means matching instance size to workload."
    ]
  },
  {
    id: 3002, section: 1,
    question: "Which of the following best describes the AWS Shared Responsibility Model?",
    options: [
      "AWS is responsible for everything except the customer's data",
      "AWS is responsible for security OF the cloud; the customer is responsible for security IN the cloud",
      "The customer is responsible for all physical security",
      "AWS and the customer share responsibility equally for every layer"
    ],
    answer: "B",
    explanation: "AWS handles the underlying infrastructure (security OF the cloud). The customer is responsible for configuring and securing their own resources (security IN the cloud).",
    rationale: [
      "Wrong — Customers also configure IAM, encryption, network, etc.",
      "Correct — 'OF the cloud' is AWS; 'IN the cloud' is the customer.",
      "Wrong — Physical security is AWS's responsibility.",
      "Wrong — Responsibilities are not 50/50 at every layer — they are layered."
    ]
  },
  {
    id: 3003, section: 1,
    isMulti: true, multiCount: 2,
    question: "Which characteristics describe cloud computing as defined by AWS? (Choose two.)",
    options: [
      "On-demand self-service",
      "Requires long-term capacity planning",
      "Broad network access",
      "Fixed monthly pricing regardless of usage"
    ],
    answer: "A,C",
    explanation: "On-demand self-service and broad network access are two of the six essential characteristics. Cloud computing replaces long planning and fixed pricing with elastic, pay-as-you-go models.",
    rationale: [
      "Correct — Provision resources automatically without human interaction.",
      "Wrong — Cloud reduces (does not require) long-term planning.",
      "Correct — Available over the network through standard mechanisms.",
      "Wrong — Pricing is variable/usage-based, not fixed."
    ]
  },
  {
    id: 3004, section: 1,
    question: "A workload is variable: traffic spikes during the day, low at night. Which cloud benefit most directly addresses this?",
    options: ["Economies of scale","Elasticity","Durability","High availability"],
    answer: "B",
    explanation: "Elasticity means automatically scaling capacity up or down with demand. This is exactly the variable-traffic pattern.",
    rationale: [
      "Wrong — Economies of scale are about AWS's bulk purchasing reducing per-unit cost.",
      "Correct — Elasticity matches capacity to demand, ideal for variable traffic.",
      "Wrong — Durability is data preservation.",
      "Wrong — HA is about surviving failures."
    ]
  },
  {
    id: 3005, section: 1,
    question: "Which of the following is a benefit of the AWS cloud that lowers the customer's unit cost as AWS grows?",
    options: ["Go global in minutes","Trade CAPEX for OPEX","Economies of scale","High availability"],
    answer: "C",
    explanation: "As AWS operates at massive scale, it can pass lower per-unit costs to customers. This is economies of scale.",
    rationale: [
      "Wrong — That's a benefit, but not a unit-cost reduction driver.",
      "Wrong — That's a financial model benefit, not a unit-cost reduction.",
      "Correct — AWS's scale enables lower prices for customers.",
      "Wrong — HA is about resilience, not cost."
    ]
  },
  {
    id: 3006, section: 1,
    question: "An application must keep running even if an entire Availability Zone becomes unavailable. Which deployment strategy achieves this within a single Region?",
    options: [
      "Single EC2 instance in one AZ",
      "Multiple EC2 instances spread across at least two AZs behind a load balancer",
      "Multiple Regions with a single EC2 in each",
      "Use AWS Lambda only — no EC2"
    ],
    answer: "B",
    explanation: "AZ failure tolerance within a Region is achieved by spreading instances across multiple AZs and using a load balancer to route traffic.",
    rationale: [
      "Wrong — Single AZ = single point of failure.",
      "Correct — Multi-AZ deployment with load balancing provides AZ failure tolerance.",
      "Wrong — Multi-Region is for Region-level failures; overkill for AZ scope and more expensive.",
      "Wrong — Lambda doesn't address the question of AZ redundancy."
    ]
  },
  {
    id: 3007, section: 1,
    question: "A company has compliance requirements to keep certain workloads in specific geographic locations. Which AWS concept lets them choose a specific geographic area?",
    options: ["Edge Location","Region","Availability Zone","Local Zone"],
    answer: "B",
    explanation: "Regions are the geographic areas you choose when deploying workloads. AZs are subdivisions within a Region.",
    rationale: [
      "Wrong — Edge Locations are for CloudFront caching, not workload hosting.",
      "Correct — A Region is the geographic area for your resources.",
      "Wrong — AZs are smaller data-center clusters within a Region.",
      "Wrong — Local Zones are extensions of a Region, not the primary geographic unit."
    ]
  },
  {
    id: 3008, section: 1,
    question: "Which option is an AWS-recommended way to limit the blast radius of errors in a workload?",
    options: [
      "Deploying all components in a single large EC2 instance",
      "Designing loosely coupled services that can fail independently",
      "Using the largest available instance type",
      "Disabling CloudWatch alarms"
    ],
    answer: "B",
    explanation: "Loose coupling is a Reliability pillar best practice: services fail independently without cascading failure.",
    rationale: [
      "Wrong — Single-instance is a single point of failure.",
      "Correct — Loose coupling contains failures to one component.",
      "Wrong — Larger instances don't address blast radius.",
      "Wrong — Disabling alarms reduces visibility, increases blast radius."
    ]
  },
  {
    id: 3009, section: 1,
    question: "A company needs its application to be available even if a single data center in a Region fails. How many Availability Zones should the application run in?",
    options: ["One","Two or more","At least ten","All Regions"],
    answer: "B",
    explanation: "Running in two or more AZs in a Region provides tolerance to a single data-center (AZ) failure.",
    rationale: [
      "Wrong — One AZ is a single point of failure.",
      "Correct — Multi-AZ (2+) provides AZ-level failure tolerance.",
      "Wrong — Most Regions have only 3–6 AZs; overkill.",
      "Wrong — Multi-Region addresses a different scope."
    ]
  },
  {
    id: 3010, section: 1,
    isMulti: true, multiCount: 2,
    question: "Which of the following are advantages of using AWS instead of an on-premises data center? (Choose two.)",
    options: [
      "Trade capital expense for variable expense",
      "Stop guessing capacity",
      "Need to procure hardware months in advance",
      "Manually patch the hypervisor in every data center"
    ],
    answer: "A,B",
    explanation: "Trading CAPEX for OPEX and stopping capacity guesswork are core AWS benefits. Hardware procurement and hypervisor patching are on-prem burdens, not AWS benefits.",
    rationale: [
      "Correct — Pay-as-you-go converts fixed cost to variable.",
      "Correct — Scale elastically to actual demand.",
      "Wrong — That's an on-prem limitation, not a benefit.",
      "Wrong — That's a customer responsibility only on EC2 guest OS, not the AWS hypervisor."
    ]
  },
  {
    id: 3011, section: 1,
    question: "Which AWS tool provides architectural guidance based on the Well-Architected Framework?",
    options: [
      "AWS Trusted Advisor",
      "AWS Well-Architected Tool",
      "AWS Config",
      "AWS CloudTrail"
    ],
    answer: "B",
    explanation: "The AWS Well-Architected Tool helps you review workloads against the framework. Trusted Advisor gives best-practice checks, not architectural reviews.",
    rationale: [
      "Wrong — Trusted Advisor gives best-practice checks (cost, security, fault tolerance, performance, service limits).",
      "Correct — Well-Architected Tool is the framework review tool.",
      "Wrong — Config records configuration history.",
      "Wrong — CloudTrail records API activity."
    ]
  },
  {
    id: 3012, section: 1,
    question: "A company wants to deploy a new application globally in minutes instead of weeks. Which AWS benefit supports this?",
    options: ["Pay-as-you-go pricing","Go global in minutes","Economies of scale","High availability"],
    answer: "B",
    explanation: "AWS lets you launch workloads in multiple Regions quickly without building data centers — 'go global in minutes'.",
    rationale: [
      "Wrong — That's about cost model, not geographic rollout speed.",
      "Correct — This benefit specifically addresses fast global deployment.",
      "Wrong — That's about per-unit cost, not rollout speed.",
      "Wrong — HA is about resilience."
    ]
  },

  // ---- Section 2: Security & Compliance (15) ----
  {
    id: 3013, section: 2,
    question: "Which service is the AWS-recommended way to manage access to AWS resources for a single user?",
    options: [
      "Share the root account credentials",
      "Create an IAM user and grant least-privilege permissions",
      "Disable MFA and share access keys",
      "Hardcode credentials in application source code"
    ],
    answer: "B",
    explanation: "Best practice: create IAM users (or use Identity Center), apply least-privilege policies, and enable MFA. Root and hardcoded credentials are anti-patterns.",
    rationale: [
      "Wrong — Root should be locked away; never share credentials.",
      "Correct — IAM users with least-privilege policies is the standard pattern.",
      "Wrong — Disabling MFA weakens security.",
      "Wrong — Hardcoded credentials are a major security risk; use IAM roles instead."
    ]
  },
  {
    id: 3014, section: 2,
    question: "Which AWS service protects web applications from common exploits like SQL injection and cross-site scripting?",
    options: ["AWS Shield","AWS WAF","Amazon GuardDuty","AWS Firewall Manager"],
    answer: "B",
    explanation: "AWS WAF is a web application firewall that filters malicious HTTP/S requests including SQLi/XSS. Shield focuses on DDoS. GuardDuty is threat detection. Firewall Manager centrally manages WAF rules across accounts.",
    rationale: [
      "Wrong — Shield focuses on DDoS protection.",
      "Correct — WAF filters web attacks like SQL injection and XSS.",
      "Wrong — GuardDuty is anomaly/threat detection.",
      "Wrong — Firewall Manager centrally manages WAF/Shield rules, doesn't filter itself."
    ]
  },
  {
    id: 3015, section: 2,
    isMulti: true, multiCount: 2,
    question: "Which services can help protect an AWS environment from DDoS attacks? (Choose two.)",
    options: [
      "AWS Shield Standard",
      "Amazon Route 53",
      "AWS WAF",
      "AWS Glue"
    ],
    answer: "A,C",
    explanation: "Shield Standard (free, automatic) and WAF (with rate-limiting rules) help mitigate DDoS. Route 53 is DNS, not a DDoS service (though it can absorb some traffic). Glue is ETL.",
    rationale: [
      "Correct — Shield Standard provides automatic DDoS protection for all AWS customers.",
      "Wrong — Route 53 is DNS; it isn't a DDoS mitigation service.",
      "Correct — WAF can rate-limit and block attack traffic patterns.",
      "Wrong — Glue is serverless ETL, unrelated to DDoS."
    ]
  },
  {
    id: 3016, section: 2,
    question: "Which service scans Amazon S3 buckets for sensitive data such as personally identifiable information (PII)?",
    options: ["Amazon Macie","Amazon GuardDuty","AWS Config","AWS Trusted Advisor"],
    answer: "A",
    explanation: "Amazon Macie uses machine learning to discover and protect sensitive data (PII, credentials) in S3.",
    rationale: [
      "Correct — Macie discovers and protects sensitive data in S3.",
      "Wrong — GuardDuty is threat detection, not data-classification.",
      "Wrong — Config records configuration changes.",
      "Wrong — Trusted Advisor gives best-practice checks."
    ]
  },
  {
    id: 3017, section: 2,
    question: "An administrator needs to view who terminated an EC2 instance last Tuesday at 3 PM. Which AWS service provides this?",
    options: ["CloudWatch","CloudTrail","Config","Inspector"],
    answer: "B",
    explanation: "CloudTrail logs all API activity, including who made which call when. It answers 'who did what' questions.",
    rationale: [
      "Wrong — CloudWatch is metrics and logs from AWS services; doesn't capture API calls by default.",
      "Correct — CloudTrail records the API call, identity, source IP, and time.",
      "Wrong — Config tracks resource configuration changes, not API identity by default.",
      "Wrong — Inspector is for vulnerability scanning."
    ]
  },
  {
    id: 3018, section: 2,
    question: "Which AWS service provides compliance reports such as SOC and PCI documentation?",
    options: ["AWS Artifact","AWS Audit Manager","AWS Config","AWS Trusted Advisor"],
    answer: "A",
    explanation: "AWS Artifact is the self-service portal for downloading AWS compliance reports (SOC, PCI, ISO, etc.).",
    rationale: [
      "Correct — Artifact provides on-demand access to AWS compliance reports.",
      "Wrong — Audit Manager automates evidence collection for your own audits.",
      "Wrong — Config records configuration compliance rules.",
      "Wrong — Trusted Advisor gives best-practice recommendations."
    ]
  },
  {
    id: 3019, section: 2,
    question: "A company wants to enforce that all EC2 instances in its org block public IP assignment. Which service should it use?",
    options: ["IAM Policy","Service Control Policy (SCP)","Security Group","Network ACL"],
    answer: "B",
    explanation: "SCPs can deny API actions (like RunInstances with public IP) across an entire organization. IAM policies are per-identity. Security groups and NACLs are network-level (and apply to running instances, not creation).",
    rationale: [
      "Wrong — IAM policies apply per identity, not org-wide guardrails.",
      "Correct — SCPs set organization-wide permission boundaries.",
      "Wrong — Security groups control traffic, not instance creation options.",
      "Wrong — NACLs are subnet-level traffic rules."
    ]
  },
  {
    id: 3020, section: 2,
    question: "A company needs a managed hardware security module (HSM) for cryptographic key operations. Which AWS service fits?",
    options: ["AWS KMS","AWS CloudHSM","AWS Secrets Manager","AWS Certificate Manager"],
    answer: "B",
    explanation: "CloudHSM provides a dedicated, FIPS 140-2 Level 3 HSM for cryptographic operations. KMS is a managed key service that uses shared HSMs.",
    rationale: [
      "Wrong — KMS is a managed key service backed by HSMs you don't exclusively control.",
      "Correct — CloudHSM provides a single-tenant HSM for compliance and exclusive key control.",
      "Wrong — Secrets Manager stores/rotates secrets, not cryptographic keys.",
      "Wrong — Certificate Manager issues/renews TLS certificates."
    ]
  },
  {
    id: 3021, section: 2,
    isMulti: true, multiCount: 2,
    question: "Which actions improve the security of the AWS account root user? (Choose two.)",
    options: [
      "Enable MFA for the root account",
      "Use the root account for daily administrative tasks",
      "Lock away root access keys",
      "Share root credentials with all administrators"
    ],
    answer: "A,C",
    explanation: "Enable MFA on root, and do not use access keys with root (or remove them). Use IAM users/roles for daily work.",
    rationale: [
      "Correct — MFA is a must for the root user.",
      "Wrong — Use IAM users/roles for daily tasks; never use root.",
      "Correct — Root access keys should be deleted; if absolutely needed, locked away.",
      "Wrong — Sharing credentials violates least privilege and breaks auditing."
    ]
  },
  {
    id: 3022, section: 2,
    question: "A company needs centralized user sign-in for hundreds of AWS accounts using their corporate directory. Which service is designed for this?",
    options: [
      "AWS IAM",
      "AWS IAM Identity Center (AWS SSO)",
      "Amazon Cognito",
      "AWS Directory Service only"
    ],
    answer: "B",
    explanation: "IAM Identity Center is the modern, recommended way to provide SSO/workforce access across multiple accounts, integrated with your identity source (SAML, AD, etc.).",
    rationale: [
      "Wrong — IAM per-account doesn't scale to hundreds of accounts.",
      "Correct — IAM Identity Center centralizes workforce SSO across accounts.",
      "Wrong — Cognito is for app end-users, not AWS workforce sign-in.",
      "Wrong — AD can be the identity source, but you need Identity Center for AWS account SSO."
    ]
  },
  {
    id: 3023, section: 2,
    question: "A company wants to give an EC2 instance permission to call AWS APIs without storing long-term credentials. Which mechanism fits?",
    options: [
      "IAM user access keys in environment variables",
      "IAM role attached to the EC2 instance",
      "Hardcoded credentials in the application",
      "Sharing the root user's access keys"
    ],
    answer: "B",
    explanation: "IAM roles provide temporary credentials that EC2 (and other services) use automatically. No long-term secrets are stored on the instance.",
    rationale: [
      "Wrong — Access keys are long-lived and risky.",
      "Correct — Instance profile / IAM role gives short-lived credentials automatically.",
      "Wrong — Hardcoded credentials are a major risk.",
      "Wrong — Never use root access keys."
    ]
  },
  {
    id: 3024, section: 2,
    question: "Which service is designed to rotate database credentials, API keys, and other secrets automatically?",
    options: ["AWS KMS","AWS Secrets Manager","AWS CloudHSM","AWS Parameter Store only"],
    answer: "B",
    explanation: "Secrets Manager stores, encrypts, and rotates secrets (DB credentials, API keys) on a schedule. KMS only manages encryption keys.",
    rationale: [
      "Wrong — KMS is for encryption keys, not arbitrary secret rotation.",
      "Correct — Secrets Manager handles secret rotation natively.",
      "Wrong — CloudHSM is a dedicated hardware HSM.",
      "Wrong — Parameter Store can store strings but doesn't auto-rotate like Secrets Manager."
    ]
  },
  {
    id: 3025, section: 2,
    question: "Which AWS service should an organization use to detect unusual API activity like calls from unexpected geographies?",
    options: ["AWS Config","Amazon GuardDuty","AWS WAF","Amazon Inspector"],
    answer: "B",
    explanation: "GuardDuty analyzes CloudTrail, VPC flow logs, and DNS logs for anomalies (compromised credentials, unusual locations, crypto-mining).",
    rationale: [
      "Wrong — Config records resource changes, not behavior analysis.",
      "Correct — GuardDuty is the threat detection service.",
      "Wrong — WAF is a web firewall for HTTP/S attacks.",
      "Wrong — Inspector scans for software vulnerabilities."
    ]
  },
  {
    id: 3026, section: 2,
    question: "Which principle best describes giving a user only the permissions needed to do their job?",
    options: ["Defense in depth","Least privilege","Shared responsibility","Zero trust billing"],
    answer: "B",
    explanation: "Least privilege is the IAM principle of granting only the minimum permissions required.",
    rationale: [
      "Wrong — Defense in depth is layered security controls.",
      "Correct — Least privilege limits blast radius of compromise.",
      "Wrong — Shared Responsibility is the AWS/customer split.",
      "Wrong — Not a real term."
    ]
  },
  {
    id: 3027, section: 2,
    isMulti: true, multiCount: 3,
    question: "Which AWS services help with monitoring, auditing, or compliance in an account? (Choose three.)",
    options: [
      "AWS CloudTrail",
      "AWS Config",
      "Amazon CloudWatch",
      "Amazon S3"
    ],
    answer: "A,B,C",
    explanation: "CloudTrail (API activity), Config (resource configuration compliance), and CloudWatch (metrics/logs/alarms) are the three pillars of AWS monitoring/auditing. S3 is object storage, not a monitoring service.",
    rationale: [
      "Correct — CloudTrail captures API activity logs.",
      "Correct — Config tracks resource configuration and compliance.",
      "Correct — CloudWatch provides metrics, logs, and alarms.",
      "Wrong — S3 is object storage."
    ]
  },

  // ---- Section 3: Compute, Storage, Networking (13) ----
  {
    id: 3028, section: 3,
    question: "A company wants to run code in response to S3 events without managing servers. Which service fits?",
    options: ["Amazon EC2","AWS Lambda","Amazon ECS on EC2","AWS Fargate with EC2 launch type"],
    answer: "B",
    explanation: "Lambda is the serverless function service that runs code in response to events. Fargate + EC2 launch type is contradictory; Fargate is serverless containers.",
    rationale: [
      "Wrong — EC2 requires managing servers.",
      "Correct — Lambda is serverless, event-driven compute.",
      "Wrong — ECS on EC2 requires managing EC2 instances.",
      "Wrong — Fargate is serverless containers, but the option is mislabeled."
    ]
  },
  {
    id: 3029, section: 3,
    question: "A company needs a fully managed Kubernetes service. Which AWS service should it use?",
    options: ["Amazon ECS","Amazon EKS","AWS Fargate","Amazon EC2 Auto Scaling"],
    answer: "B",
    explanation: "Amazon EKS is AWS's managed Kubernetes service. ECS is AWS's own container orchestrator, not Kubernetes.",
    rationale: [
      "Wrong — ECS is AWS-native, not Kubernetes.",
      "Correct — EKS runs upstream Kubernetes.",
      "Wrong — Fargate is a serverless compute engine, not a Kubernetes service.",
      "Wrong — Auto Scaling adjusts EC2 capacity, not Kubernetes."
    ]
  },
  {
    id: 3030, section: 3,
    question: "Which S3 storage class is the most cost-effective for data accessed less than once a quarter, with retrieval times in minutes to hours?",
    options: ["S3 Standard","S3 Standard-IA","S3 Glacier Flexible Retrieval","S3 One Zone-IA"],
    answer: "C",
    explanation: "S3 Glacier Flexible Retrieval is the lowest-cost option for long-term archives accessed a few times per year. Retrieval is minutes-to-hours.",
    rationale: [
      "Wrong — S3 Standard is for frequent access.",
      "Wrong — Standard-IA is for infrequent access but millisecond retrieval.",
      "Correct — Glacier Flexible Retrieval is for archive with minutes-to-hours retrieval.",
      "Wrong — One Zone-IA is for non-critical infrequent data, not deep archive."
    ]
  },
  {
    id: 3031, section: 3,
    question: "A company needs a block storage volume attached to a single EC2 instance for a database. Which service fits?",
    options: ["Amazon S3","Amazon EBS","Amazon EFS","AWS Storage Gateway"],
    answer: "B",
    explanation: "EBS is block storage attached to a single EC2 instance. EFS is shared file storage. S3 is object storage. Storage Gateway is hybrid on-prem to AWS.",
    rationale: [
      "Wrong — S3 is object storage, not attached to EC2 as a disk.",
      "Correct — EBS is the block-storage service for EC2.",
      "Wrong — EFS is a shared file system across many EC2s.",
      "Wrong — Storage Gateway bridges on-prem storage to AWS."
    ]
  },
  {
    id: 3032, section: 3,
    isMulti: true, multiCount: 2,
    question: "Which are features of Amazon S3? (Choose two.)",
    options: [
      "Object storage with 11 9s of durability",
      "Block storage attached to a single EC2 instance",
      "Unlimited scalability",
      "Provides a POSIX-compliant file system for many EC2 instances"
    ],
    answer: "A,C",
    explanation: "S3 provides object storage with 11 nines of durability and effectively unlimited scalability. EBS is block storage, EFS is the shared file system.",
    rationale: [
      "Correct — S3 is designed for 99.999999999% (11 9s) durability.",
      "Wrong — That's EBS.",
      "Correct — S3 scales without provisioning capacity.",
      "Wrong — That's EFS, not S3."
    ]
  },
  {
    id: 3033, section: 3,
    question: "Which AWS service provides a logically isolated virtual network in the cloud?",
    options: ["AWS Direct Connect","Amazon VPC","Amazon Route 53","AWS Transit Gateway"],
    answer: "B",
    explanation: "Amazon VPC (Virtual Private Cloud) is the logically isolated network. Transit Gateway connects many VPCs but isn't itself a VPC.",
    rationale: [
      "Wrong — Direct Connect is a private network link to AWS.",
      "Correct — VPC is the isolated virtual network.",
      "Wrong — Route 53 is DNS.",
      "Wrong — Transit Gateway is a hub for VPCs and on-prem networks."
    ]
  },
  {
    id: 3034, section: 3,
    question: "A company wants to route users to the AWS Region with the lowest latency. Which Route 53 policy fits?",
    options: ["Weighted","Latency-based","Failover","Geolocation"],
    answer: "B",
    explanation: "Latency-based routing directs users to the Region with the lowest measured network latency. Geolocation routes by user location, not latency.",
    rationale: [
      "Wrong — Weighted distributes by percentages you set.",
      "Correct — Latency-based routes to the lowest-latency Region.",
      "Wrong — Failover routes to a backup on health check failure.",
      "Wrong — Geolocation uses user location, not latency."
    ]
  },
  {
    id: 3035, section: 3,
    question: "A company is delivering video content to global users and wants to reduce latency by caching content at the edge. Which service fits?",
    options: ["Amazon CloudFront","AWS Direct Connect","Amazon Route 53","Amazon API Gateway"],
    answer: "A",
    explanation: "CloudFront is the AWS CDN that caches content at Edge Locations worldwide.",
    rationale: [
      "Correct — CloudFront is the global CDN for content caching.",
      "Wrong — Direct Connect is a private network link.",
      "Wrong — Route 53 is DNS.",
      "Wrong — API Gateway is for creating/hosting APIs."
    ]
  },
  {
    id: 3036, section: 3,
    isMulti: true, multiCount: 2,
    question: "Which services are serverless compute options on AWS? (Choose two.)",
    options: [
      "AWS Lambda",
      "AWS Fargate",
      "Amazon EC2 Dedicated Hosts",
      "Amazon EBS"
    ],
    answer: "A,B",
    explanation: "Lambda (functions) and Fargate (containers) are serverless — no server management. Dedicated Hosts are physical servers. EBS is storage.",
    rationale: [
      "Correct — Lambda is serverless function compute.",
      "Correct — Fargate is serverless container compute.",
      "Wrong — Dedicated Hosts are physical servers you manage.",
      "Wrong — EBS is block storage."
    ]
  },
  {
    id: 3037, section: 3,
    question: "A startup wants the simplest way to deploy a web application without managing infrastructure. Which service fits?",
    options: ["Amazon EC2 + manual setup","AWS Elastic Beanstalk","AWS Lambda only","AWS Direct Connect"],
    answer: "B",
    explanation: "Elastic Beanstalk provisions capacity, deploys the app, and handles load balancing — minimal ops. EC2 is more manual; Lambda is event-driven, not always ideal for a long-running web app.",
    rationale: [
      "Wrong — EC2 requires manual setup of capacity, scaling, etc.",
      "Correct — Beanstalk is the PaaS for easy web app deployment.",
      "Wrong — Lambda is event-driven, not always suited for traditional web apps.",
      "Wrong — Direct Connect is a network link, not a deploy service."
    ]
  },
  {
    id: 3038, section: 3,
    question: "Which service lets an application in one VPC privately access a service in another VPC without traversing the public internet?",
    options: ["Internet Gateway","NAT Gateway","AWS PrivateLink","AWS WAF"],
    answer: "C",
    explanation: "PrivateLink provides private connectivity between VPCs or to AWS services, keeping traffic off the public internet.",
    rationale: [
      "Wrong — IGW provides VPC-to-internet routing.",
      "Wrong — NAT allows outbound internet from private subnets.",
      "Correct — PrivateLink provides private, in-network service access.",
      "Wrong — WAF is a web application firewall."
    ]
  },
  {
    id: 3039, section: 3,
    question: "A company has multiple VPCs across many accounts and needs to share a NAT gateway, a transit VPC, and on-prem connectivity through a single hub. Which service fits?",
    options: ["Internet Gateway","AWS Transit Gateway","Amazon Route 53","AWS Direct Connect Gateway"],
    answer: "B",
    explanation: "Transit Gateway is the regional hub that interconnects many VPCs and on-prem networks with transitive routing.",
    rationale: [
      "Wrong — IGW is for public internet access.",
      "Correct — Transit Gateway is the AWS-recommended hub-and-spoke router.",
      "Wrong — Route 53 is DNS.",
      "Wrong — Direct Connect Gateway extends DX globally, not a multi-VPC hub."
    ]
  },
  {
    id: 3040, section: 3,
    question: "A workload needs an extremely cost-optimized, fault-tolerant, interruptible batch processing job. Which compute model is the best fit?",
    options: ["On-Demand EC2","Reserved Instances","Spot Instances","Dedicated Hosts"],
    answer: "C",
    explanation: "Spot Instances offer the largest discount (up to 90%) and are designed for fault-tolerant, interruptible workloads like batch jobs.",
    rationale: [
      "Wrong — On-Demand is the most expensive flexible option.",
      "Wrong — RIs are committed and not designed to be interrupted.",
      "Correct — Spot is the cheapest, interruptible option for fault-tolerant batch.",
      "Wrong — Dedicated Hosts are the most expensive option."
    ]
  },

  // ---- Section 4: DB / Analytics / Integration (6) ----
  {
    id: 3041, section: 4,
    question: "A company needs a managed, serverless NoSQL database with single-digit-millisecond latency at any scale. Which service fits?",
    options: ["Amazon RDS","Amazon Aurora","Amazon DynamoDB","Amazon Redshift"],
    answer: "C",
    explanation: "DynamoDB is a fully managed, serverless NoSQL key-value and document database with consistent low latency at any scale.",
    rationale: [
      "Wrong — RDS is managed relational SQL.",
      "Wrong — Aurora is also relational (MySQL/PostgreSQL compatible).",
      "Correct — DynamoDB is serverless NoSQL at any scale.",
      "Wrong — Redshift is a data warehouse."
    ]
  },
  {
    id: 3042, section: 4,
    question: "A company needs a managed graph database to analyze relationships in a social network. Which service fits?",
    options: ["Amazon Neptune","Amazon DocumentDB","Amazon DynamoDB","Amazon ElastiCache"],
    answer: "A",
    explanation: "Neptune is AWS's managed graph database. DocumentDB is MongoDB-compatible. DynamoDB is key-value/document. ElastiCache is in-memory cache.",
    rationale: [
      "Correct — Neptune is the managed graph database.",
      "Wrong — DocumentDB is document/MongoDB-compatible.",
      "Wrong — DynamoDB is key-value/document NoSQL.",
      "Wrong — ElastiCache is Redis/Memcached."
    ]
  },
  {
    id: 3043, section: 4,
    isMulti: true, multiCount: 2,
    question: "Which AWS services are good fits for an event-driven, decoupled architecture? (Choose two.)",
    options: [
      "Amazon SQS",
      "Amazon SNS",
      "Amazon EBS",
      "AWS Direct Connect"
    ],
    answer: "A,B",
    explanation: "SQS (queue) and SNS (pub/sub) are the core AWS messaging services. EBS is storage; Direct Connect is networking.",
    rationale: [
      "Correct — SQS is a managed message queue.",
      "Correct — SNS is a pub/sub notification service.",
      "Wrong — EBS is block storage.",
      "Wrong — Direct Connect is a private network link."
    ]
  },
  {
    id: 3044, section: 4,
    question: "A company wants to run ad-hoc SQL queries directly against CSV/Parquet files in S3 with no servers to manage. Which service fits?",
    options: ["Amazon Athena","Amazon Redshift","AWS Glue","Amazon EMR"],
    answer: "A",
    explanation: "Athena is serverless SQL directly on data in S3. Redshift is a warehouse. Glue is ETL. EMR is Hadoop/Spark.",
    rationale: [
      "Correct — Athena = serverless SQL on S3.",
      "Wrong — Redshift is a data warehouse requiring provisioned resources.",
      "Wrong — Glue is for ETL/data preparation.",
      "Wrong — EMR is managed Hadoop/Spark."
    ]
  },
  {
    id: 3045, section: 4,
    question: "A company needs a data warehouse for OLAP analytics with columnar storage. Which AWS service fits?",
    options: ["Amazon RDS","Amazon Redshift","Amazon DynamoDB","Amazon DocumentDB"],
    answer: "B",
    explanation: "Redshift is AWS's managed data warehouse, optimized for OLAP workloads with columnar storage and MPP.",
    rationale: [
      "Wrong — RDS is OLTP relational.",
      "Correct — Redshift is the data warehouse service.",
      "Wrong — DynamoDB is NoSQL key-value.",
      "Wrong — DocumentDB is document database."
    ]
  },
  {
    id: 3046, section: 4,
    question: "A company needs to coordinate a multi-step workflow (extract → transform → load → notify) reliably. Which service fits?",
    options: ["Amazon SQS","AWS Step Functions","Amazon SNS","AWS Lambda only"],
    answer: "B",
    explanation: "Step Functions orchestrates multi-step workflows with error handling and state. SQS and SNS are messaging primitives; Lambda is compute only.",
    rationale: [
      "Wrong — SQS is a queue, not a workflow engine.",
      "Correct — Step Functions coordinates multi-step workflows.",
      "Wrong — SNS is pub/sub, not a workflow engine.",
      "Wrong — Lambda runs code, doesn't orchestrate by itself."
    ]
  },

  // ---- Section 5: Billing, Pricing, Support (4) ----
  {
    id: 3047, section: 5,
    question: "Which AWS support plan provides 24/7 phone, email, and chat access to AWS engineers for production workloads, plus Trusted Advisor full checks?",
    options: ["Basic","Developer","Business","Enterprise"],
    answer: "C",
    explanation: "Business support gives 24/7 production support, under-1-hour response for impaired systems, and full Trusted Advisor. Enterprise adds a TAM and other premium features.",
    rationale: [
      "Wrong — Basic is free, account/billing support only.",
      "Wrong — Developer is business-hours only, for dev/test.",
      "Correct — Business = 24/7 production support + full Trusted Advisor.",
      "Wrong — Enterprise = Business + TAM and more."
    ]
  },
  {
    id: 3048, section: 5,
    isMulti: true, multiCount: 2,
    question: "Which of the following are AWS Trusted Advisor cost optimization checks? (Choose two.)",
    options: [
      "Idle EC2 instances",
      "Underutilized EBS volumes",
      "SQL injection patterns in WAF",
      "Suspended IAM users"
    ],
    answer: "A,B",
    explanation: "Trusted Advisor's cost checks flag idle/underutilized resources. WAF SQLi detection is a security feature, not Trusted Advisor. Suspended IAM users is a security check (not cost).",
    rationale: [
      "Correct — Idle EC2 is a Trusted Advisor cost check.",
      "Correct — Underutilized EBS volumes is a Trusted Advisor cost check.",
      "Wrong — That's a WAF feature, not Trusted Advisor.",
      "Wrong — Suspended IAM users is a Trusted Advisor security check, not cost."
    ]
  },
  {
    id: 3049, section: 5,
    question: "A company wants to receive an email alert when its forecasted AWS spend for the month exceeds $10,000. Which service fits?",
    options: ["AWS Cost Explorer","AWS Budgets","Amazon CloudWatch","AWS Trusted Advisor"],
    answer: "B",
    explanation: "AWS Budgets lets you set custom cost/usage thresholds and alert via email or SNS when forecasts or actuals exceed the budget.",
    rationale: [
      "Wrong — Cost Explorer visualizes spend, doesn't alert by default.",
      "Correct — Budgets is the alerting service for cost/usage thresholds.",
      "Wrong — CloudWatch is metrics/logs for AWS services, not AWS spending.",
      "Wrong — Trusted Advisor gives recommendations, not custom cost alerts."
    ]
  },
  {
    id: 3050, section: 5,
    question: "A customer wants a single bill for multiple AWS accounts under one payer. Which AWS feature enables this?",
    options: [
      "AWS Organizations with consolidated billing",
      "AWS Trusted Advisor",
      "AWS Cost Explorer only",
      "AWS Control Tower"
    ],
    answer: "A",
    explanation: "AWS Organizations lets you centrally manage multiple accounts and (when enabled) consolidate billing into a single payer. Control Tower builds on Organizations for governance but is not itself the billing feature.",
    rationale: [
      "Correct — Organizations + consolidated billing gives one bill for many accounts.",
      "Wrong — Trusted Advisor is best-practice checks.",
      "Wrong — Cost Explorer visualizes but doesn't consolidate billing.",
      "Wrong — Control Tower is for landing-zone governance, not direct billing."
    ]
  }
];

// ----- ULTIMATE READINESS EXAM (65-question final gate) -----
// Original CLF-C02-style readiness exam. Built as a stricter confidence check:
// 65 questions, 90 minutes, domain-weighted, with multi-select pressure.
const FINAL_READINESS_EXAM = [
  // ---- Section 1: Cloud Concepts & Global Infrastructure (16) ----
  {
    id: 4001, section: 1, isMulti: true, multiCount: 2,
    question: "Which benefits are core advantages of using the AWS Cloud? (Choose two.)",
    options: [
      "Trade upfront capital expense for variable expense",
      "Guarantee that applications will never fail",
      "Stop guessing capacity before deploying workloads",
      "Remove all security responsibilities from the customer"
    ],
    answer: "A,C",
    explanation: "AWS highlights variable expense and no longer guessing capacity as core cloud advantages. Customers still design for resilience and retain security responsibilities in the cloud.",
    rationale: [
      "Correct - AWS lets customers pay for what they use instead of buying infrastructure upfront.",
      "Wrong - AWS provides building blocks for resilience, not a guarantee that every application never fails.",
      "Correct - Elastic capacity lets teams scale to demand instead of overprovisioning.",
      "Wrong - The shared responsibility model still leaves responsibilities with the customer."
    ]
  },
  {
    id: 4002, section: 1,
    question: "A company wants an application to keep running if one data center fails, but it wants to stay in the same geographic Region. What should it use?",
    options: [
      "One Availability Zone with multiple EC2 instance types",
      "Multiple Availability Zones in the same Region",
      "Multiple IAM roles in the same account",
      "One Edge Location near the users"
    ],
    answer: "B",
    explanation: "Availability Zones are isolated locations inside a Region. Deploying across multiple AZs protects against failure of a single data center or AZ.",
    rationale: [
      "Wrong - Multiple instance types do not protect against an AZ failure.",
      "Correct - Multi-AZ architecture is the standard regional high-availability pattern.",
      "Wrong - IAM roles are for permissions, not data center resilience.",
      "Wrong - Edge Locations cache or deliver content; they are not the primary place to run the workload."
    ]
  },
  {
    id: 4003, section: 1,
    question: "A media site serves users around the world and wants lower latency for images and videos. Which AWS service is the best fit?",
    options: ["AWS Direct Connect", "Amazon CloudFront", "AWS Organizations", "Amazon EBS"],
    answer: "B",
    explanation: "CloudFront is AWS's content delivery network. It caches content at edge locations close to users to reduce latency.",
    rationale: [
      "Wrong - Direct Connect is private connectivity from on-premises networks to AWS.",
      "Correct - CloudFront delivers cached content globally from edge locations.",
      "Wrong - Organizations manages accounts and billing, not content delivery.",
      "Wrong - EBS is block storage for EC2 instances."
    ]
  },
  {
    id: 4004, section: 1,
    question: "Which Well-Architected pillar focuses on a workload's ability to recover from failures and meet demand?",
    options: ["Cost Optimization", "Reliability", "Sustainability", "Operational Excellence"],
    answer: "B",
    explanation: "The Reliability pillar focuses on distributed system design, recovery from failures, and dynamically acquiring resources to meet demand.",
    rationale: [
      "Wrong - Cost Optimization focuses on avoiding unnecessary spend.",
      "Correct - Reliability is about recovery, availability, and scaling to meet demand.",
      "Wrong - Sustainability focuses on minimizing environmental impact.",
      "Wrong - Operational Excellence focuses on operating and improving systems."
    ]
  },
  {
    id: 4005, section: 1, isMulti: true, multiCount: 2,
    question: "Which actions best support the Sustainability pillar of the AWS Well-Architected Framework? (Choose two.)",
    options: [
      "Right-size resources so idle capacity is reduced",
      "Keep maximum capacity running at all times to avoid scaling events",
      "Use managed services and efficient instance families when they fit the workload",
      "Store every object forever in the highest-performance storage class"
    ],
    answer: "A,C",
    explanation: "Sustainability rewards efficient resource usage. Right-sizing and using efficient managed services reduce waste, while overprovisioning and unnecessary high-performance storage increase waste.",
    rationale: [
      "Correct - Right-sizing reduces unused compute, storage, and energy consumption.",
      "Wrong - Constant peak capacity is wasteful when demand is variable.",
      "Correct - Managed and efficient services can improve utilization and reduce environmental impact.",
      "Wrong - Keeping all data in the most expensive performance tier is inefficient."
    ]
  },
  {
    id: 4006, section: 1,
    question: "A company needs to place applications close to customers in North America and Europe to reduce latency and meet data residency needs. What AWS global infrastructure concept is most relevant?",
    options: ["Regions", "Security groups", "IAM policies", "Elastic IP addresses"],
    answer: "A",
    explanation: "Regions are separate geographic areas. Choosing Regions close to users or required jurisdictions helps address latency and data residency requirements.",
    rationale: [
      "Correct - Regions are the geographic placement choice for workloads and data.",
      "Wrong - Security groups control network access to resources.",
      "Wrong - IAM policies control permissions.",
      "Wrong - Elastic IP addresses provide static public IPv4 addresses."
    ]
  },
  {
    id: 4007, section: 1,
    question: "Which cloud benefit describes AWS lowering prices by aggregating usage across many customers?",
    options: [
      "High availability",
      "Economies of scale",
      "Loose coupling",
      "Identity federation"
    ],
    answer: "B",
    explanation: "Massive economies of scale let AWS operate at high volume and pass cost efficiencies to customers.",
    rationale: [
      "Wrong - High availability is about keeping systems running.",
      "Correct - Economies of scale come from aggregated cloud provider purchasing and operational efficiency.",
      "Wrong - Loose coupling is an architecture pattern.",
      "Wrong - Federation is about identity integration."
    ]
  },
  {
    id: 4008, section: 1,
    question: "A company migrates an application to AWS by moving the servers with minimal application changes. Which migration strategy is this?",
    options: ["Rehost", "Refactor", "Retire", "Repurchase"],
    answer: "A",
    explanation: "Rehost, often called lift-and-shift, means moving an application to the cloud with little or no modification.",
    rationale: [
      "Correct - Rehost is the lift-and-shift strategy.",
      "Wrong - Refactor means redesigning or rewriting to use cloud-native patterns.",
      "Wrong - Retire means shutting down an application that is no longer needed.",
      "Wrong - Repurchase means moving to a different product, often SaaS."
    ]
  },
  {
    id: 4009, section: 1,
    question: "An order-processing application receives sudden bursts of requests. The company wants to decouple the web tier from backend workers so orders are not lost. Which service best supports this architecture?",
    options: ["Amazon SQS", "AWS Artifact", "Amazon Route 53", "AWS Shield"],
    answer: "A",
    explanation: "SQS is a managed message queue that buffers work between producers and consumers, helping decouple application components.",
    rationale: [
      "Correct - SQS absorbs spikes and lets workers process messages asynchronously.",
      "Wrong - Artifact provides compliance documents.",
      "Wrong - Route 53 is DNS and domain routing.",
      "Wrong - Shield provides DDoS protection."
    ]
  },
  {
    id: 4010, section: 1,
    question: "What does Recovery Point Objective (RPO) define?",
    options: [
      "The maximum acceptable time to restore service",
      "The maximum acceptable amount of data loss measured in time",
      "The number of Availability Zones in a Region",
      "The percentage discount from a Reserved Instance"
    ],
    answer: "B",
    explanation: "RPO defines how much data loss is acceptable, usually expressed as a time window. RTO defines how long restoration can take.",
    rationale: [
      "Wrong - That describes Recovery Time Objective (RTO).",
      "Correct - RPO is the acceptable data-loss window.",
      "Wrong - AZ count is unrelated to RPO.",
      "Wrong - Pricing discounts are unrelated to recovery objectives."
    ]
  },
  {
    id: 4011, section: 1, isMulti: true, multiCount: 3,
    question: "Which are pillars of the AWS Well-Architected Framework? (Choose three.)",
    options: [
      "High Availability",
      "Security",
      "Cost Optimization",
      "Operational Excellence",
      "Data Sovereignty"
    ],
    answer: "B,C,D",
    explanation: "The six Well-Architected pillars are Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.",
    rationale: [
      "Wrong - High availability is part of reliability thinking, but it is not a named pillar.",
      "Correct - Security is a Well-Architected pillar.",
      "Correct - Cost Optimization is a Well-Architected pillar.",
      "Correct - Operational Excellence is a Well-Architected pillar.",
      "Wrong - Data sovereignty is important, but it is not a named Well-Architected pillar."
    ]
  },
  {
    id: 4012, section: 1,
    question: "A team needs a test environment for only two days and wants to stop paying when it is deleted. Which cloud concept is being used?",
    options: ["Reserved capacity", "Pay-as-you-go pricing", "Physical colocation", "Long-term procurement"],
    answer: "B",
    explanation: "Pay-as-you-go pricing lets customers provision temporary resources and stop paying when those resources are no longer running or stored.",
    rationale: [
      "Wrong - Reserved capacity is a commitment model, not a short temporary model.",
      "Correct - Pay-as-you-go fits temporary environments.",
      "Wrong - Physical colocation requires data center contracts and hardware.",
      "Wrong - Long-term procurement is the opposite of temporary cloud usage."
    ]
  },
  {
    id: 4013, section: 1,
    question: "Which cloud benefit lets a development team quickly launch resources, experiment, and tear them down without waiting for hardware procurement?",
    options: ["Agility", "Durability", "Encryption", "Consolidated billing"],
    answer: "A",
    explanation: "Agility is the ability to quickly provision resources and iterate without long procurement cycles.",
    rationale: [
      "Correct - Agility is speed of experimentation and deployment.",
      "Wrong - Durability is about protecting data from loss.",
      "Wrong - Encryption protects data confidentiality.",
      "Wrong - Consolidated billing combines bills across accounts."
    ]
  },
  {
    id: 4014, section: 1,
    question: "What is an AWS Availability Zone?",
    options: [
      "A geographic area containing multiple AWS Regions",
      "One or more isolated data centers inside an AWS Region",
      "A global cache location for CloudFront only",
      "A customer-managed subnet inside a VPC"
    ],
    answer: "B",
    explanation: "An Availability Zone is one or more discrete data centers with redundant power, networking, and connectivity inside an AWS Region.",
    rationale: [
      "Wrong - A Region contains Availability Zones, not the reverse.",
      "Correct - AZs are isolated data center locations inside a Region.",
      "Wrong - Edge Locations are used by services such as CloudFront.",
      "Wrong - A subnet is a customer-defined network range that maps to an AZ."
    ]
  },
  {
    id: 4015, section: 1,
    question: "A company chooses serverless services because it wants AWS to handle infrastructure provisioning and scaling. Which statement is most accurate?",
    options: [
      "The company never pays for usage",
      "The company cannot configure security controls",
      "The company focuses more on code and configuration than server management",
      "The company must patch the physical servers manually"
    ],
    answer: "C",
    explanation: "Serverless reduces operational responsibility for servers. Customers still configure the service securely and pay for usage.",
    rationale: [
      "Wrong - Serverless services still have usage-based costs.",
      "Wrong - Customers still configure permissions, networking, and data controls.",
      "Correct - Serverless shifts server operations to AWS so teams focus more on application logic.",
      "Wrong - AWS handles the underlying physical infrastructure."
    ]
  },
  {
    id: 4016, section: 1, isMulti: true, multiCount: 2,
    question: "Which are parts of the AWS global infrastructure? (Choose two.)",
    options: ["AWS Regions", "IAM users", "Availability Zones", "Security groups"],
    answer: "A,C",
    explanation: "Regions and Availability Zones are core parts of AWS global infrastructure. IAM users and security groups are security constructs.",
    rationale: [
      "Correct - Regions are geographic areas where AWS hosts resources.",
      "Wrong - IAM users are identities, not infrastructure locations.",
      "Correct - Availability Zones are isolated data center locations inside Regions.",
      "Wrong - Security groups are virtual firewalls, not global infrastructure components."
    ]
  },

  // ---- Section 2: Security, Compliance & Governance (20) ----
  {
    id: 4017, section: 2,
    question: "What is the best practice for the AWS account root user after initial account setup?",
    options: [
      "Use it for all daily administrative work",
      "Enable MFA, secure it, and avoid routine use",
      "Share it only with senior developers",
      "Delete it after creating IAM users"
    ],
    answer: "B",
    explanation: "The root user has full account access. AWS best practice is to secure it with MFA and avoid using it for everyday tasks.",
    rationale: [
      "Wrong - Daily admin work should use IAM users or federated roles with least privilege.",
      "Correct - Secure root with MFA and reserve it for tasks that require root.",
      "Wrong - Root credentials should not be shared.",
      "Wrong - The root user cannot be deleted."
    ]
  },
  {
    id: 4018, section: 2,
    question: "An application running on Amazon EC2 needs to read objects from S3. What is the recommended way to grant access without storing long-term access keys on the instance?",
    options: ["Attach an IAM role to the EC2 instance", "Embed an IAM user's keys in the app", "Put the S3 bucket in a public subnet", "Disable encryption on the bucket"],
    answer: "A",
    explanation: "IAM roles provide temporary credentials to AWS services such as EC2, avoiding hard-coded long-term keys.",
    rationale: [
      "Correct - An instance role is the standard secure access pattern.",
      "Wrong - Hard-coded access keys are a security risk.",
      "Wrong - S3 buckets are regional resources, not placed in public subnets.",
      "Wrong - Encryption settings do not grant access."
    ]
  },
  {
    id: 4019, section: 2,
    question: "Which IAM principle says users and workloads should receive only the permissions required to perform their tasks?",
    options: ["Least privilege", "Open access", "Root delegation", "Public trust"],
    answer: "A",
    explanation: "Least privilege means granting only the necessary permissions, no more.",
    rationale: [
      "Correct - Least privilege reduces blast radius.",
      "Wrong - Open access is not a secure IAM principle.",
      "Wrong - Root delegation is not a recommended design principle.",
      "Wrong - Public trust is not an IAM permission model."
    ]
  },
  {
    id: 4020, section: 2, isMulti: true, multiCount: 2,
    question: "Under the AWS shared responsibility model, which tasks are typically customer responsibilities? (Choose two.)",
    options: [
      "Maintaining physical data center access controls",
      "Patching the guest operating system on EC2 instances",
      "Replacing failed hardware in AWS facilities",
      "Configuring S3 bucket policies and IAM permissions"
    ],
    answer: "B,D",
    explanation: "Customers are responsible for security in the cloud, including guest OS patching on EC2 and configuring access controls. AWS handles physical facilities and hardware.",
    rationale: [
      "Wrong - AWS manages physical data center security.",
      "Correct - Customers manage the guest OS on EC2.",
      "Wrong - AWS replaces failed hardware.",
      "Correct - Customers configure IAM and resource policies."
    ]
  },
  {
    id: 4021, section: 2,
    question: "A company wants to centrally prevent member accounts in an AWS Organization from disabling CloudTrail. Which feature should it use?",
    options: ["Service control policy (SCP)", "Security group", "Amazon Macie job", "CloudFront origin access control"],
    answer: "A",
    explanation: "SCPs set permission guardrails across accounts or organizational units in AWS Organizations.",
    rationale: [
      "Correct - SCPs can deny actions across member accounts.",
      "Wrong - Security groups control network traffic.",
      "Wrong - Macie discovers sensitive data in S3.",
      "Wrong - CloudFront origin access control protects origins, not account permissions."
    ]
  },
  {
    id: 4022, section: 2,
    question: "A compliance team needs on-demand access to AWS compliance reports such as SOC reports. Which service should it use?",
    options: ["AWS Artifact", "AWS Config", "AWS Budgets", "Amazon Inspector"],
    answer: "A",
    explanation: "AWS Artifact provides access to AWS security and compliance reports and select online agreements.",
    rationale: [
      "Correct - Artifact is the compliance-report portal.",
      "Wrong - Config records and evaluates resource configurations.",
      "Wrong - Budgets monitors cost and usage thresholds.",
      "Wrong - Inspector scans workloads for vulnerabilities."
    ]
  },
  {
    id: 4023, section: 2,
    question: "Which AWS service records account API calls and user activity for auditing?",
    options: ["AWS CloudTrail", "Amazon CloudWatch", "Amazon Route 53", "AWS Pricing Calculator"],
    answer: "A",
    explanation: "CloudTrail records AWS API calls and account activity events for governance, compliance, and auditing.",
    rationale: [
      "Correct - CloudTrail is the API activity audit trail.",
      "Wrong - CloudWatch collects metrics, logs, and alarms.",
      "Wrong - Route 53 provides DNS.",
      "Wrong - Pricing Calculator estimates costs."
    ]
  },
  {
    id: 4024, section: 2, isMulti: true, multiCount: 2,
    question: "Which AWS services help identify security findings or threats in an AWS environment? (Choose two.)",
    options: ["AWS Shield", "Amazon GuardDuty", "Amazon Inspector", "AWS Budgets"],
    answer: "B,C",
    explanation: "GuardDuty detects threats from logs and signals. Inspector scans workloads for software vulnerabilities and unintended network exposure.",
    rationale: [
      "Wrong - Shield protects against DDoS attacks; it is not the general finding service in this pair.",
      "Correct - GuardDuty is managed threat detection.",
      "Correct - Inspector produces vulnerability findings for supported workloads.",
      "Wrong - Budgets is for cost and usage alerts."
    ]
  },
  {
    id: 4025, section: 2,
    question: "Which AWS service helps create, manage, and use encryption keys for AWS services and applications?",
    options: ["AWS Key Management Service (AWS KMS)", "AWS Trusted Advisor", "AWS Snowball", "Amazon QuickSight"],
    answer: "A",
    explanation: "AWS KMS manages cryptographic keys and integrates with many AWS services for encryption.",
    rationale: [
      "Correct - KMS is the managed encryption key service.",
      "Wrong - Trusted Advisor provides best-practice checks.",
      "Wrong - Snowball is a data transfer device/service.",
      "Wrong - QuickSight is business intelligence."
    ]
  },
  {
    id: 4026, section: 2,
    question: "A database password must be stored securely and rotated automatically. Which AWS service is designed for this?",
    options: ["AWS Secrets Manager", "AWS Artifact", "Amazon SQS", "AWS WAF"],
    answer: "A",
    explanation: "Secrets Manager stores secrets such as database credentials and supports automatic rotation for supported services.",
    rationale: [
      "Correct - Secrets Manager is purpose-built for secret storage and rotation.",
      "Wrong - Artifact stores compliance reports.",
      "Wrong - SQS is a message queue.",
      "Wrong - WAF filters web requests."
    ]
  },
  {
    id: 4027, section: 2,
    question: "A public web application needs protection from common web exploits such as SQL injection and cross-site scripting. Which service should be used?",
    options: ["AWS WAF", "Amazon EFS", "AWS CodeCommit", "AWS Cost Explorer"],
    answer: "A",
    explanation: "AWS WAF is a web application firewall that helps protect web apps and APIs from common Layer 7 attacks.",
    rationale: [
      "Correct - WAF filters HTTP/S requests using rules.",
      "Wrong - EFS is shared file storage.",
      "Wrong - CodeCommit is a source control service.",
      "Wrong - Cost Explorer analyzes spending."
    ]
  },
  {
    id: 4028, section: 2,
    question: "Which AWS service provides managed DDoS protection for applications running on AWS?",
    options: ["AWS Shield", "Amazon Macie", "AWS Glue", "Amazon Athena"],
    answer: "A",
    explanation: "AWS Shield provides managed distributed denial-of-service protection. Shield Standard is included automatically; Shield Advanced adds enhanced protections.",
    rationale: [
      "Correct - Shield is the DDoS protection service.",
      "Wrong - Macie discovers sensitive data in S3.",
      "Wrong - Glue is ETL and data catalog.",
      "Wrong - Athena runs SQL on S3 data."
    ]
  },
  {
    id: 4029, section: 2,
    question: "A company wants to discover personally identifiable information stored in Amazon S3 buckets. Which service should it use?",
    options: ["Amazon Macie", "AWS CloudFormation", "Amazon Redshift", "AWS Direct Connect"],
    answer: "A",
    explanation: "Amazon Macie uses machine learning and pattern matching to discover sensitive data such as PII in S3.",
    rationale: [
      "Correct - Macie is the sensitive-data discovery service for S3.",
      "Wrong - CloudFormation provisions infrastructure.",
      "Wrong - Redshift is a data warehouse.",
      "Wrong - Direct Connect provides private connectivity."
    ]
  },
  {
    id: 4030, section: 2, isMulti: true, multiCount: 2,
    question: "Which are recommended IAM security best practices? (Choose two.)",
    options: [
      "Enable MFA for privileged identities",
      "Share access keys through email for convenience",
      "Use roles and temporary credentials where possible",
      "Grant AdministratorAccess to all developers by default"
    ],
    answer: "A,C",
    explanation: "MFA and temporary credentials reduce account risk. Sharing keys and broad default admin access violate least privilege.",
    rationale: [
      "Correct - MFA adds an extra protection layer.",
      "Wrong - Access keys should not be shared or sent through email.",
      "Correct - Roles issue temporary credentials and avoid long-term key sprawl.",
      "Wrong - Default admin access violates least privilege."
    ]
  },
  {
    id: 4031, section: 2,
    question: "Which AWS service records resource configuration changes and can evaluate resources against compliance rules?",
    options: ["AWS Config", "AWS Lambda", "Amazon SNS", "Amazon CloudFront"],
    answer: "A",
    explanation: "AWS Config tracks configuration history and evaluates resources with managed or custom rules.",
    rationale: [
      "Correct - Config is the resource configuration and compliance service.",
      "Wrong - Lambda runs code.",
      "Wrong - SNS is pub/sub messaging.",
      "Wrong - CloudFront is a CDN."
    ]
  },
  {
    id: 4032, section: 2,
    question: "Which service collects metrics and logs and can create alarms based on thresholds?",
    options: ["Amazon CloudWatch", "AWS Artifact", "AWS Organizations", "Amazon Route 53"],
    answer: "A",
    explanation: "CloudWatch collects metrics, logs, events, and alarms for AWS resources and applications.",
    rationale: [
      "Correct - CloudWatch handles metrics, logs, dashboards, and alarms.",
      "Wrong - Artifact provides compliance documents.",
      "Wrong - Organizations manages multiple accounts.",
      "Wrong - Route 53 is DNS."
    ]
  },
  {
    id: 4033, section: 2,
    question: "A team wants to patch and manage a fleet of EC2 instances without opening inbound SSH or RDP from the internet. Which service can help?",
    options: ["AWS Systems Manager", "Amazon Rekognition", "AWS Marketplace", "Amazon Redshift"],
    answer: "A",
    explanation: "AWS Systems Manager supports fleet management, patching, inventory, and Session Manager access without requiring inbound SSH/RDP.",
    rationale: [
      "Correct - Systems Manager helps manage instances at scale.",
      "Wrong - Rekognition analyzes images and video.",
      "Wrong - Marketplace is a software catalog.",
      "Wrong - Redshift is a data warehouse."
    ]
  },
  {
    id: 4034, section: 2,
    question: "A company wants to set up and govern a secure multi-account AWS environment using a landing zone. Which service is designed for this?",
    options: ["AWS Control Tower", "Amazon S3 Glacier", "Amazon Polly", "AWS CodeBuild"],
    answer: "A",
    explanation: "AWS Control Tower helps set up and govern a multi-account landing zone using AWS Organizations and guardrails.",
    rationale: [
      "Correct - Control Tower is for governed multi-account landing zones.",
      "Wrong - S3 Glacier is archival storage.",
      "Wrong - Polly converts text to speech.",
      "Wrong - CodeBuild builds and tests code."
    ]
  },
  {
    id: 4035, section: 2, isMulti: true, multiCount: 2,
    question: "Which statements about service control policies (SCPs) are correct? (Choose two.)",
    options: [
      "They set maximum available permissions for accounts in an organization",
      "They grant permissions directly to IAM users",
      "They replace the need for IAM policies in member accounts",
      "They can be applied to organizational units"
    ],
    answer: "A,D",
    explanation: "SCPs are guardrails in AWS Organizations. They limit maximum permissions and can be attached to roots, OUs, or accounts, but they do not grant permissions by themselves.",
    rationale: [
      "Correct - SCPs define permission boundaries for affected accounts.",
      "Wrong - SCPs do not grant permissions; IAM policies still grant permissions.",
      "Wrong - IAM policies are still required to allow actions.",
      "Correct - SCPs can be attached at the OU level."
    ]
  },
  {
    id: 4036, section: 2,
    question: "Which responsibility belongs to AWS under the shared responsibility model?",
    options: [
      "Configuring application users",
      "Managing physical security of AWS data centers",
      "Creating least-privilege IAM policies",
      "Encrypting customer application data before upload"
    ],
    answer: "B",
    explanation: "AWS is responsible for security of the cloud, including physical facilities, hardware, networking, and managed infrastructure layers.",
    rationale: [
      "Wrong - Application user configuration is a customer responsibility.",
      "Correct - AWS manages physical data center security.",
      "Wrong - Customers define IAM permissions for their accounts.",
      "Wrong - Customers decide how to protect and classify their data."
    ]
  },

  // ---- Section 3: Compute, Storage & Networking (14) ----
  {
    id: 4037, section: 3,
    question: "A company needs resizable virtual servers and wants full control over the guest operating system. Which AWS service should it use?",
    options: ["Amazon EC2", "AWS Lambda", "Amazon S3", "Amazon RDS"],
    answer: "A",
    explanation: "Amazon EC2 provides virtual machines with customer control over the guest operating system.",
    rationale: [
      "Correct - EC2 is resizable virtual compute.",
      "Wrong - Lambda is serverless functions with no guest OS management.",
      "Wrong - S3 is object storage.",
      "Wrong - RDS is managed relational database."
    ]
  },
  {
    id: 4038, section: 3,
    question: "A developer wants to run code in response to events without provisioning or managing servers. Which service is the best fit?",
    options: ["AWS Lambda", "Amazon EBS", "AWS Direct Connect", "Amazon VPC"],
    answer: "A",
    explanation: "Lambda runs event-driven code without customer-managed servers.",
    rationale: [
      "Correct - Lambda is serverless function compute.",
      "Wrong - EBS is block storage.",
      "Wrong - Direct Connect is private network connectivity.",
      "Wrong - VPC is a virtual network."
    ]
  },
  {
    id: 4039, section: 3,
    question: "A web tier should distribute incoming traffic across healthy EC2 instances and add or remove instances as demand changes. Which combination fits best?",
    options: [
      "Elastic Load Balancing and Auto Scaling",
      "AWS Artifact and AWS Budgets",
      "Amazon Macie and AWS KMS",
      "AWS Snowball and Amazon Athena"
    ],
    answer: "A",
    explanation: "Elastic Load Balancing distributes traffic, while Auto Scaling adjusts capacity based on demand or health.",
    rationale: [
      "Correct - This is the standard scalable web-tier pattern.",
      "Wrong - Artifact and Budgets are compliance and cost services.",
      "Wrong - Macie and KMS are data security services.",
      "Wrong - Snowball transfers data and Athena queries S3."
    ]
  },
  {
    id: 4040, section: 3, isMulti: true, multiCount: 2,
    question: "Which Amazon S3 storage classes are designed for long-term archival data? (Choose two.)",
    options: [
      "S3 Standard",
      "Amazon EFS",
      "S3 Glacier Deep Archive",
      "S3 Glacier Flexible Retrieval"
    ],
    answer: "C,D",
    explanation: "S3 Glacier Flexible Retrieval and S3 Glacier Deep Archive are S3 storage classes for archival data. EFS is not an S3 storage class.",
    rationale: [
      "Wrong - S3 Standard is for frequently accessed data.",
      "Wrong - EFS is a file system service, not an S3 storage class.",
      "Correct - Deep Archive is for lowest-cost long-term archival storage.",
      "Correct - Glacier Flexible Retrieval is an archival S3 storage class."
    ]
  },
  {
    id: 4041, section: 3,
    question: "Which storage service provides persistent block storage volumes for Amazon EC2 instances?",
    options: ["Amazon EBS", "Amazon S3", "Amazon EFS", "Amazon Route 53"],
    answer: "A",
    explanation: "Amazon EBS provides block storage volumes that attach to EC2 instances.",
    rationale: [
      "Correct - EBS is EC2 block storage.",
      "Wrong - S3 is object storage.",
      "Wrong - EFS is shared file storage.",
      "Wrong - Route 53 is DNS."
    ]
  },
  {
    id: 4042, section: 3,
    question: "Several Linux EC2 instances across multiple Availability Zones need to access the same shared file system. Which service should be used?",
    options: ["Amazon EFS", "Amazon EBS", "Amazon S3 Glacier Deep Archive", "AWS CloudTrail"],
    answer: "A",
    explanation: "Amazon EFS provides elastic shared file storage for Linux workloads and can be mounted by multiple instances.",
    rationale: [
      "Correct - EFS is shared file storage for Linux.",
      "Wrong - EBS volumes are generally attached to individual instances and are AZ-scoped.",
      "Wrong - Glacier Deep Archive is archival object storage.",
      "Wrong - CloudTrail records API activity."
    ]
  },
  {
    id: 4043, section: 3,
    question: "Which service is best for highly durable object storage, static website assets, backups, and data lake storage?",
    options: ["Amazon S3", "Amazon EBS", "Amazon ElastiCache", "AWS IAM"],
    answer: "A",
    explanation: "Amazon S3 is highly durable object storage used for static assets, backups, logs, and data lakes.",
    rationale: [
      "Correct - S3 is object storage with high durability.",
      "Wrong - EBS is block storage for EC2.",
      "Wrong - ElastiCache is an in-memory cache.",
      "Wrong - IAM manages access and identities."
    ]
  },
  {
    id: 4044, section: 3,
    question: "Which AWS service lets a customer define a logically isolated virtual network with subnets, route tables, and gateways?",
    options: ["Amazon VPC", "Amazon CloudFront", "AWS CloudFormation", "Amazon Polly"],
    answer: "A",
    explanation: "Amazon VPC lets customers create isolated virtual networks and configure networking components.",
    rationale: [
      "Correct - VPC is the customer-defined virtual network service.",
      "Wrong - CloudFront is a CDN.",
      "Wrong - CloudFormation provisions infrastructure as code.",
      "Wrong - Polly is text-to-speech."
    ]
  },
  {
    id: 4045, section: 3,
    question: "Which statement best describes security groups in Amazon VPC?",
    options: [
      "They are stateless firewalls at the subnet level",
      "They are stateful firewalls attached to resources such as EC2 instances",
      "They translate private IP addresses to public IP addresses",
      "They provide DNS registration for public domains"
    ],
    answer: "B",
    explanation: "Security groups are stateful virtual firewalls associated with resources such as EC2 instances. Network ACLs are stateless and subnet-level.",
    rationale: [
      "Wrong - That describes network ACLs.",
      "Correct - Security groups are stateful and resource-level.",
      "Wrong - NAT gateways translate outbound private traffic.",
      "Wrong - Route 53 provides DNS."
    ]
  },
  {
    id: 4046, section: 3, isMulti: true, multiCount: 2,
    question: "A company needs hybrid connectivity between its data center and AWS. Which services can provide that connectivity? (Choose two.)",
    options: ["AWS Direct Connect", "AWS Site-to-Site VPN", "Amazon CloudFront", "Amazon DynamoDB"],
    answer: "A,B",
    explanation: "Direct Connect provides dedicated private connectivity to AWS. Site-to-Site VPN provides encrypted connectivity over the internet.",
    rationale: [
      "Correct - Direct Connect is dedicated private network connectivity.",
      "Correct - Site-to-Site VPN connects on-premises networks to VPCs over encrypted tunnels.",
      "Wrong - CloudFront is a CDN.",
      "Wrong - DynamoDB is a NoSQL database."
    ]
  },
  {
    id: 4047, section: 3,
    question: "A company needs a managed DNS service to route users to its web application. Which AWS service should it use?",
    options: ["Amazon Route 53", "AWS Config", "Amazon Kinesis", "AWS Secrets Manager"],
    answer: "A",
    explanation: "Amazon Route 53 is AWS's scalable DNS and domain routing service.",
    rationale: [
      "Correct - Route 53 handles DNS routing.",
      "Wrong - Config tracks resource configuration.",
      "Wrong - Kinesis handles streaming data.",
      "Wrong - Secrets Manager stores and rotates secrets."
    ]
  },
  {
    id: 4048, section: 3,
    question: "Which service caches content at edge locations to reduce latency for global users?",
    options: ["Amazon CloudFront", "AWS CloudTrail", "Amazon RDS", "AWS Backup"],
    answer: "A",
    explanation: "CloudFront uses edge locations to cache and deliver content closer to viewers.",
    rationale: [
      "Correct - CloudFront is AWS's CDN.",
      "Wrong - CloudTrail audits API activity.",
      "Wrong - RDS is managed relational database.",
      "Wrong - Backup centralizes backup management."
    ]
  },
  {
    id: 4049, section: 3, isMulti: true, multiCount: 2,
    question: "Which AWS services are used to orchestrate containerized applications? (Choose two.)",
    options: ["Amazon ECS", "AWS Lambda", "Amazon S3", "Amazon EKS"],
    answer: "A,D",
    explanation: "Amazon ECS and Amazon EKS are container orchestration services. Lambda runs functions, and S3 stores objects.",
    rationale: [
      "Correct - ECS is AWS's managed container orchestration service.",
      "Wrong - Lambda is serverless functions, not container orchestration.",
      "Wrong - S3 is object storage.",
      "Correct - EKS is managed Kubernetes for containers."
    ]
  },
  {
    id: 4050, section: 3,
    question: "An application in a private subnet must access Amazon S3 without sending traffic over the public internet. Which VPC feature should be used?",
    options: ["Gateway VPC endpoint for S3", "Internet gateway only", "Elastic IP address", "AWS Artifact"],
    answer: "A",
    explanation: "A gateway VPC endpoint for S3 allows private connectivity from a VPC to S3 without traversing the public internet.",
    rationale: [
      "Correct - Gateway endpoints support private access to S3 and DynamoDB.",
      "Wrong - An internet gateway routes traffic to the public internet.",
      "Wrong - An Elastic IP is a static public IPv4 address.",
      "Wrong - Artifact provides compliance reports."
    ]
  },

  // ---- Section 4: Databases, Analytics & Integration (8) ----
  {
    id: 4051, section: 4,
    question: "A company needs a managed relational database for a traditional SQL application. Which AWS service should it choose?",
    options: ["Amazon RDS", "Amazon DynamoDB", "Amazon S3", "Amazon SNS"],
    answer: "A",
    explanation: "Amazon RDS is a managed relational database service for engines such as MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server.",
    rationale: [
      "Correct - RDS is managed relational SQL.",
      "Wrong - DynamoDB is NoSQL key-value/document database.",
      "Wrong - S3 is object storage.",
      "Wrong - SNS is pub/sub messaging."
    ]
  },
  {
    id: 4052, section: 4,
    question: "A team wants a cloud-optimized relational database that is compatible with MySQL or PostgreSQL and offers high performance. Which service fits?",
    options: ["Amazon Aurora", "Amazon Redshift", "Amazon Neptune", "Amazon DocumentDB"],
    answer: "A",
    explanation: "Amazon Aurora is a cloud-optimized relational database compatible with MySQL and PostgreSQL.",
    rationale: [
      "Correct - Aurora is MySQL/PostgreSQL compatible and cloud optimized.",
      "Wrong - Redshift is a data warehouse.",
      "Wrong - Neptune is a graph database.",
      "Wrong - DocumentDB is MongoDB-compatible document database."
    ]
  },
  {
    id: 4053, section: 4,
    question: "An application needs a serverless NoSQL key-value database with single-digit millisecond performance at scale. Which service should it use?",
    options: ["Amazon DynamoDB", "Amazon RDS", "AWS Glue", "Amazon Athena"],
    answer: "A",
    explanation: "DynamoDB is a serverless NoSQL key-value and document database designed for low-latency access at scale.",
    rationale: [
      "Correct - DynamoDB is the serverless NoSQL choice.",
      "Wrong - RDS is relational SQL.",
      "Wrong - Glue is ETL and data catalog.",
      "Wrong - Athena queries data in S3."
    ]
  },
  {
    id: 4054, section: 4,
    question: "A business intelligence team needs a managed data warehouse for analytics on large structured datasets. Which service should it use?",
    options: ["Amazon Redshift", "Amazon EFS", "AWS KMS", "Amazon SQS"],
    answer: "A",
    explanation: "Amazon Redshift is AWS's managed data warehouse for OLAP analytics.",
    rationale: [
      "Correct - Redshift is the data warehouse service.",
      "Wrong - EFS is file storage.",
      "Wrong - KMS manages encryption keys.",
      "Wrong - SQS is a message queue."
    ]
  },
  {
    id: 4055, section: 4,
    question: "A data analyst wants to run SQL queries directly on log files stored in Amazon S3 without managing servers. Which service is best?",
    options: ["Amazon Athena", "Amazon QuickSight", "AWS DMS", "Amazon ElastiCache"],
    answer: "A",
    explanation: "Athena is a serverless interactive query service that uses SQL to query data in S3.",
    rationale: [
      "Correct - Athena runs SQL directly over S3 data.",
      "Wrong - QuickSight creates BI dashboards.",
      "Wrong - DMS migrates databases.",
      "Wrong - ElastiCache is in-memory caching."
    ]
  },
  {
    id: 4056, section: 4, isMulti: true, multiCount: 2,
    question: "Which AWS services are commonly used to decouple application components? (Choose two.)",
    options: ["Amazon SQS", "Amazon EBS", "Amazon SNS", "AWS Artifact"],
    answer: "A,C",
    explanation: "SQS decouples producers and consumers with queues. SNS decouples publishers and subscribers with pub/sub fan-out.",
    rationale: [
      "Correct - SQS buffers messages between components.",
      "Wrong - EBS is block storage, not messaging.",
      "Correct - SNS publishes messages to multiple subscribers.",
      "Wrong - Artifact is for compliance reports."
    ]
  },
  {
    id: 4057, section: 4,
    question: "A company needs to ingest and process streaming clickstream data in near real time. Which service family is the best fit?",
    options: ["Amazon Kinesis", "AWS Organizations", "Amazon S3 Glacier", "AWS Control Tower"],
    answer: "A",
    explanation: "Amazon Kinesis services are designed for real-time streaming data ingestion and processing.",
    rationale: [
      "Correct - Kinesis handles streaming data use cases.",
      "Wrong - Organizations manages accounts.",
      "Wrong - S3 Glacier is archival storage.",
      "Wrong - Control Tower governs multi-account environments."
    ]
  },
  {
    id: 4058, section: 4,
    question: "A company wants to migrate databases to AWS with minimal downtime and may need to convert schemas between database engines. Which services are relevant?",
    options: [
      "AWS Database Migration Service and AWS Schema Conversion Tool",
      "Amazon CloudFront and AWS WAF",
      "AWS Budgets and Cost Explorer",
      "Amazon Polly and Amazon Translate"
    ],
    answer: "A",
    explanation: "AWS DMS migrates databases, and AWS SCT helps convert schemas when moving between different database engines.",
    rationale: [
      "Correct - DMS handles migration and SCT handles schema conversion.",
      "Wrong - CloudFront and WAF are edge delivery and web protection services.",
      "Wrong - Budgets and Cost Explorer are cost management tools.",
      "Wrong - Polly and Translate are AI language services."
    ]
  },

  // ---- Section 5: Billing, Pricing, Support & AI/ML (7) ----
  {
    id: 4059, section: 5,
    question: "Before migrating, a company wants to estimate the monthly cost of a proposed AWS architecture. Which tool should it use?",
    options: ["AWS Pricing Calculator", "AWS Cost Explorer", "AWS Artifact", "Amazon CloudWatch"],
    answer: "A",
    explanation: "AWS Pricing Calculator estimates costs before resources are deployed.",
    rationale: [
      "Correct - Pricing Calculator is for pre-deployment cost estimates.",
      "Wrong - Cost Explorer analyzes actual and forecasted spend after usage exists.",
      "Wrong - Artifact provides compliance reports.",
      "Wrong - CloudWatch monitors metrics and logs."
    ]
  },
  {
    id: 4060, section: 5,
    question: "A finance team wants to visualize historical AWS spend by service and forecast future monthly costs. Which service should it use?",
    options: ["AWS Cost Explorer", "AWS Secrets Manager", "Amazon GuardDuty", "AWS CloudFormation"],
    answer: "A",
    explanation: "Cost Explorer visualizes historical cost and usage and provides forecasts.",
    rationale: [
      "Correct - Cost Explorer is for cost analysis and forecasting.",
      "Wrong - Secrets Manager stores and rotates secrets.",
      "Wrong - GuardDuty detects threats.",
      "Wrong - CloudFormation provisions infrastructure."
    ]
  },
  {
    id: 4061, section: 5,
    question: "A company wants an email alert when forecasted monthly AWS charges exceed a defined threshold. Which service should it use?",
    options: ["AWS Budgets", "AWS Cost and Usage Report", "Amazon Athena", "Amazon Inspector"],
    answer: "A",
    explanation: "AWS Budgets can alert on actual or forecasted cost and usage thresholds.",
    rationale: [
      "Correct - Budgets sends threshold alerts.",
      "Wrong - Cost and Usage Report provides detailed billing data, but not simple budget alerts by itself.",
      "Wrong - Athena queries data.",
      "Wrong - Inspector scans for vulnerabilities."
    ]
  },
  {
    id: 4062, section: 5,
    question: "Which AWS Support plan includes a Technical Account Manager (TAM) for mission-critical workloads?",
    options: ["Enterprise Support", "Developer Support", "Basic Support", "AWS Free Tier"],
    answer: "A",
    explanation: "Enterprise Support includes a designated Technical Account Manager. Business Support includes 24/7 production support but not a designated TAM.",
    rationale: [
      "Correct - Enterprise Support includes a TAM.",
      "Wrong - Developer Support is for early development and business-hours guidance.",
      "Wrong - Basic Support does not include technical support engineers for workloads.",
      "Wrong - Free Tier is a pricing program, not a support plan."
    ]
  },
  {
    id: 4063, section: 5, isMulti: true, multiCount: 2,
    question: "Which purchasing options can reduce cost for steady-state compute usage when a customer can commit to a term? (Choose two.)",
    options: ["Savings Plans", "Spot Instances", "Reserved Instances", "On-Demand Instances"],
    answer: "A,C",
    explanation: "Savings Plans and Reserved Instances provide discounts for committed usage. Spot is discounted but interruptible and does not require the same steady-state term commitment.",
    rationale: [
      "Correct - Savings Plans discount committed compute usage.",
      "Wrong - Spot is low cost but interruptible and best for flexible workloads.",
      "Correct - Reserved Instances discount committed instance usage.",
      "Wrong - On-Demand has no commitment and no long-term discount."
    ]
  },
  {
    id: 4064, section: 5,
    question: "A company wants to find and subscribe to third-party software, data products, and prebuilt AMIs that run on AWS. Which service should it use?",
    options: ["AWS Marketplace", "AWS Organizations", "AWS CloudTrail", "Amazon EventBridge"],
    answer: "A",
    explanation: "AWS Marketplace is a digital catalog for third-party software, data, services, and AMIs that can be used on AWS.",
    rationale: [
      "Correct - Marketplace is the third-party software and data catalog.",
      "Wrong - Organizations manages multiple AWS accounts.",
      "Wrong - CloudTrail records API activity.",
      "Wrong - EventBridge routes events between services and applications."
    ]
  },
  {
    id: 4065, section: 5,
    question: "A call center wants to convert recorded customer calls into text for analysis. Which AWS AI service should it use?",
    options: ["Amazon Transcribe", "Amazon Translate", "Amazon Rekognition", "Amazon Textract"],
    answer: "A",
    explanation: "Amazon Transcribe converts speech to text. Translate converts text between languages, Rekognition analyzes images/video, and Textract extracts text and data from documents.",
    rationale: [
      "Correct - Transcribe is speech-to-text.",
      "Wrong - Translate translates text between languages.",
      "Wrong - Rekognition analyzes images and video.",
      "Wrong - Textract extracts text, forms, and tables from documents."
    ]
  }
];

// ----- Merge section-pools into QUESTIONS so they appear everywhere -----
// Safe-guard against double-load: if we've already merged, skip.
if (typeof QUESTIONS !== 'undefined' && !QUESTIONS.__finalExamMerged) {
  // Mark so a second eval (e.g., via tooling) won't double-append.
  Object.defineProperty(QUESTIONS, '__finalExamMerged', { value: true, enumerable: false });
  QUESTIONS.push(...MULTI_SELECT_QUESTIONS);
  QUESTIONS.push(...COVERAGE_GAP_QUESTIONS);
}
