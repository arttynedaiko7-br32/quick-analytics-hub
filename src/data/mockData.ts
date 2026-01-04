import { UploadedFile, AnalysisResult, Report, InsightCard, ChartData } from '@/types/analysis';

// Mock file data for demonstration
export const createMockUploadedFile = (fileName: string): UploadedFile => ({
  name: fileName,
  size: 245760, // ~240 KB
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  sheets: [
    {
      name: 'Sales Data',
      rowCount: 1247,
      columnCount: 8,
      headers: ['Date', 'Product', 'Category', 'Revenue', 'Units', 'Region', 'Rep', 'Status'],
      preview: [
        { Date: '2024-01-15', Product: 'Widget Pro', Category: 'Electronics', Revenue: 2450, Units: 35, Region: 'North', Rep: 'Alice', Status: 'Completed' },
        { Date: '2024-01-16', Product: 'Gadget X', Category: 'Electronics', Revenue: 1890, Units: 27, Region: 'South', Rep: 'Bob', Status: 'Completed' },
        { Date: '2024-01-17', Product: 'Tool Set', Category: 'Hardware', Revenue: 3200, Units: 64, Region: 'East', Rep: 'Charlie', Status: 'Pending' },
        { Date: '2024-01-18', Product: 'Widget Pro', Category: 'Electronics', Revenue: 1750, Units: 25, Region: 'West', Rep: 'Diana', Status: 'Completed' },
        { Date: '2024-01-19', Product: 'Gadget X', Category: 'Electronics', Revenue: 2100, Units: 30, Region: 'North', Rep: 'Alice', Status: 'Completed' },
      ],
    },
    {
      name: 'Inventory',
      rowCount: 532,
      columnCount: 5,
      headers: ['SKU', 'Product', 'Stock', 'Reorder Level', 'Supplier'],
      preview: [
        { SKU: 'WP-001', Product: 'Widget Pro', Stock: 450, 'Reorder Level': 100, Supplier: 'SupplyCo' },
        { SKU: 'GX-002', Product: 'Gadget X', Stock: 230, 'Reorder Level': 50, Supplier: 'TechParts' },
        { SKU: 'TS-003', Product: 'Tool Set', Stock: 180, 'Reorder Level': 75, Supplier: 'HardwareHub' },
      ],
    },
    {
      name: 'Customers',
      rowCount: 892,
      columnCount: 6,
      headers: ['Customer ID', 'Name', 'Email', 'Segment', 'Join Date', 'Total Spend'],
      preview: [
        { 'Customer ID': 'C001', Name: 'Acme Corp', Email: 'contact@acme.com', Segment: 'Enterprise', 'Join Date': '2023-03-15', 'Total Spend': 45000 },
        { 'Customer ID': 'C002', Name: 'StartupXYZ', Email: 'hello@startupxyz.io', Segment: 'SMB', 'Join Date': '2023-06-22', 'Total Spend': 12500 },
      ],
    },
  ],
});

export const mockInsights: InsightCard[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$847,320',
    change: 12.5,
    changeLabel: 'vs last period',
    icon: 'trending',
    color: 'primary',
  },
  {
    id: '2',
    title: 'Average Order Value',
    value: '$2,156',
    change: 8.3,
    changeLabel: 'vs last period',
    icon: 'bar',
    color: 'success',
  },
  {
    id: '3',
    title: 'Top Category',
    value: 'Electronics',
    change: 23.1,
    changeLabel: 'of total sales',
    icon: 'pie',
    color: 'chart-3',
  },
  {
    id: '4',
    title: 'Active Customers',
    value: '892',
    change: -2.4,
    changeLabel: 'vs last period',
    icon: 'line',
    color: 'chart-4',
  },
  {
    id: '5',
    title: 'Conversion Rate',
    value: '4.2%',
    change: 0.8,
    changeLabel: 'improvement',
    icon: 'trending',
    color: 'chart-5',
  },
];

export const mockLineData: ChartData[] = [
  { name: 'Jan', value: 65000 },
  { name: 'Feb', value: 72000 },
  { name: 'Mar', value: 68000 },
  { name: 'Apr', value: 85000 },
  { name: 'May', value: 92000 },
  { name: 'Jun', value: 98000 },
  { name: 'Jul', value: 105000 },
  { name: 'Aug', value: 112000 },
];

export const mockBarData: ChartData[] = [
  { name: 'North', value: 245000 },
  { name: 'South', value: 198000 },
  { name: 'East', value: 215000 },
  { name: 'West', value: 189000 },
];

export const mockPieData: ChartData[] = [
  { name: 'Electronics', value: 45 },
  { name: 'Hardware', value: 25 },
  { name: 'Software', value: 18 },
  { name: 'Services', value: 12 },
];

export const mockAnalysisResult: AnalysisResult = {
  insights: mockInsights,
  lineChartData: mockLineData,
  barChartData: mockBarData,
  pieChartData: mockPieData,
  statistics: {
    totalRows: 1247,
    totalColumns: 8,
    numericColumns: 3,
    dateColumns: 1,
  },
};

export const createMockReport = (): Report => ({
  id: 'rpt-' + Date.now(),
  title: 'Sales Analysis Report',
  createdAt: new Date(),
  sections: [
    {
      id: 'exec-summary',
      title: 'Executive Summary',
      content: `This analysis covers 1,247 sales transactions across 8 data dimensions. Key findings indicate strong revenue growth of 12.5% compared to the previous period, with Electronics emerging as the leading category accounting for 45% of total sales.

The data reveals consistent upward trends in monthly revenue, with a notable acceleration in the second quarter. Regional performance shows balanced distribution, with the North region leading at $245,000 in sales.`,
      editable: true,
    },
    {
      id: 'key-insights',
      title: 'Key Insights',
      content: `1. Revenue Performance: Total revenue reached $847,320, exceeding targets by 8%.

2. Category Analysis: Electronics dominates with 45% market share, followed by Hardware (25%) and Software (18%).

3. Customer Behavior: Average order value increased to $2,156, indicating successful upselling strategies.

4. Regional Trends: North region shows strongest growth, while West region presents opportunities for improvement.

5. Conversion Metrics: The 4.2% conversion rate represents a 0.8% improvement from previous benchmarks.`,
      editable: true,
    },
    {
      id: 'forecast',
      title: 'Forecast & Scenarios',
      content: `Based on current trends and market conditions, we present three scenarios:

OPTIMISTIC SCENARIO:
Continued momentum could push Q4 revenue to $1.2M if Electronics demand sustains and regional expansion succeeds.

BASELINE SCENARIO:
Maintaining current trajectory suggests stable 10-12% quarterly growth, reaching approximately $950K in Q4.

RISK SCENARIO:
Market fluctuations or supply chain issues could reduce growth to 5-7%, with Q4 revenue around $880K.

Key assumptions include stable market conditions, maintained customer acquisition rates, and no major competitive disruptions.`,
      editable: true,
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      content: `1. EXPAND ELECTRONICS LINE: Given the 45% revenue contribution, consider expanding product offerings in this category.

2. WEST REGION FOCUS: Implement targeted campaigns to boost underperforming Western sales territory.

3. CUSTOMER RETENTION: With a slight decline in active customers (-2.4%), invest in loyalty programs.

4. INVENTORY OPTIMIZATION: Align stock levels with demand patterns to reduce holding costs.

5. PRICING STRATEGY: The increased AOV suggests room for strategic price optimization in high-demand products.`,
      editable: true,
    },
    {
      id: 'risks',
      title: 'Risks & Limitations',
      content: `DATA LIMITATIONS:
- Analysis covers a single reporting period
- External market factors not fully captured
- Customer sentiment data not included

METHODOLOGY NOTES:
- Forecasts are scenario-based, not predictive models
- Correlations observed may not imply causation
- Regional comparisons assume similar market conditions

RECOMMENDATIONS:
- Validate insights with domain experts
- Consider additional data sources for deeper analysis
- Monitor assumptions underlying forecast scenarios`,
      editable: true,
    },
  ],
});
