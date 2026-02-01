import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { MdSearch, MdTrendingUp, MdLightbulb, MdWarning, MdEdit, MdFileDownload, MdKeyboardArrowDown } from 'react-icons/md'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Import stat card icons
import PointsIcon from '../public/Points_Icon.svg'
import AvgMonthlySpendIcon from '../public/Avg_Monthly_Spend_Icon.svg'
import AvgDailySpendIcon from '../public/Avg_Daily_Spend_Icon.svg'

// Types for data
interface StatCard {
  icon: 'star' | 'calendar' | 'clock'
  label: string
  value: string
  trend: string
  trendUp: boolean
}

interface CategoryData {
  name: string
  color: string
  percentage: number
}

interface InsightCard {
  type: 'positive' | 'opportunity' | 'alert'
  title: string
  description: string
}

interface TrendData {
  month: string
  spending: number
  income: number
}

// Sample data
const statsData: StatCard[] = [
  { icon: 'star', label: 'points earned', value: '15,100', trend: '5.1%', trendUp: true },
  { icon: 'calendar', label: 'avg monthly spend', value: '$ 3,280', trend: '18.2%', trendUp: true },
  { icon: 'clock', label: 'avg daily spend', value: '$ 234', trend: '4.7%', trendUp: true },
]

const categoryData: CategoryData[] = [
  { name: 'dining', color: '#a855f7', percentage: 25 },
  { name: 'entertainment', color: '#ec4899', percentage: 20 },
  { name: 'transportation', color: '#f97316', percentage: 15 },
  { name: 'bills', color: '#22c55e', percentage: 15 },
  { name: 'groceries', color: '#8b5cf6', percentage: 12 },
  { name: 'shopping', color: '#10b981', percentage: 8 },
  { name: 'entertainment', color: '#ef4444', percentage: 5 },
]

const utilizationCategories = [
  { name: 'dining & commute', color: '#ef4444' },
  { name: 'everyday use', color: '#22c55e' },
  { name: 'gas and groceries', color: '#f97316' },
  { name: 'etc', color: '#3b82f6' },
]

const insightsData: InsightCard[] = [
  {
    type: 'positive',
    title: 'positive trend',
    description: 'Your savings rate increased by 5.2% this month compared to last month.',
  },
  {
    type: 'opportunity',
    title: 'optimization opportunity',
    description: 'Switch 40% of your dining spend to Amex gold for an estimated 680 extra points/month.',
  },
  {
    type: 'alert',
    title: 'budget alert',
    description: "You're 15% over budget on shopping this month. Consider reducing by $150.",
  },
]

// Icon component for stat cards - uses imported SVG files
const StatIcon = ({ type }: { type: 'star' | 'calendar' | 'clock' }) => {
  const icons = {
    star: PointsIcon,
    calendar: AvgMonthlySpendIcon,
    clock: AvgDailySpendIcon,
  }

  return (
    <img
      src={icons[type]}
      alt={`${type} icon`}
      style={{
        width: '48px',
        height: '48px',
      }}
    />
  )
}

// Insight icon component
const InsightIcon = ({ type }: { type: 'positive' | 'opportunity' | 'alert' }) => {
  if (type === 'positive') {
    return <MdTrendingUp size={24} color="#22c55e" />
  }
  if (type === 'opportunity') {
    return <MdLightbulb size={24} color="#a855f7" />
  }
  return <MdWarning size={24} color="#ef4444" />
}

export default function Analytics() {
  const [searchQuery, setSearchQuery] = useState('')
  const [cardFilter, setCardFilter] = useState('all cards')
  const [timeFilter, setTimeFilter] = useState('all time')
  const [trendData, setTrendData] = useState<TrendData[]>([])

  // Fetch spending and income trends on mount
  useEffect(() => {
    const fetchTrends = async () => {
      const API_URL = 'http://localhost:5001/api'
      try {
        const [spendingRes, incomeRes] = await Promise.all([
          fetch(`${API_URL}/spending-trends?months=6`),
          fetch(`${API_URL}/nessie/income-trends?months=6`)
        ])

        const spendingData = await spendingRes.json()
        const incomeData = await incomeRes.json()

        const spendingTrends = spendingData.trends || []
        const incomeTrends = incomeData.trends || []

        // Merge the data by month
        const monthMap: Record<string, TrendData> = {}

        spendingTrends.forEach((item: { month: string; amount: number }) => {
          monthMap[item.month] = {
            month: item.month,
            spending: item.amount,
            income: 0
          }
        })

        incomeTrends.forEach((item: { month: string; amount: number }) => {
          if (monthMap[item.month]) {
            monthMap[item.month].income = item.amount
          } else {
            monthMap[item.month] = {
              month: item.month,
              spending: 0,
              income: item.amount
            }
          }
        })

        // Convert to array and sort by month order
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const mergedData = Object.values(monthMap).sort((a, b) => {
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        })

        setTrendData(mergedData)
      } catch (err) {
        console.error('Failed to fetch trends:', err)
        // Set sample data on error - non-parallel patterns
        setTrendData([
          { month: 'Aug', spending: 2850, income: 4200 },
          { month: 'Sep', spending: 2600, income: 4350 },
          { month: 'Oct', spending: 3100, income: 4400 },
          { month: 'Nov', spending: 3950, income: 5200 },
          { month: 'Dec', spending: 3400, income: 4500 },
          { month: 'Jan', spending: 2900, income: 4650 },
        ])
      }
    }
    fetchTrends()
  }, [])

  // Calculate circumference for donut charts
  const circumference = 2 * Math.PI * 42
  const utilizationPercent = 69

  // Generate category donut segments
  const generateCategorySegments = () => {
    let offset = 0
    return categoryData.map((cat, index) => {
      const segmentLength = (cat.percentage / 100) * circumference
      const segment = (
        <circle
          key={index}
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={cat.color}
          strokeWidth="12"
          strokeDasharray={`${segmentLength} ${circumference}`}
          strokeDashoffset={-offset}
          transform="rotate(-90 50 50)"
        />
      )
      offset += segmentLength
      return segment
    })
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '100px' }}>
      <Header title="analytics" />

      {/* Main scrollable content */}
      <div style={{
        marginTop: '20px',
        overflowY: 'auto',
        paddingRight: '10px',
      }}>
        {/* Subtitle Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily: 'Coolvetica, sans-serif',
            fontSize: '18px',
            fontWeight: '400',
            color: '#888',
            margin: 0,
          }}>
            deep insights into your spending and optimization opportunities
          </h2>

        </div>

        {/* Stats Cards Row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {statsData.map((stat, index) => {
            // Subtle gradient colors - mostly black with hint of color at left edge
            const gradientColors = [
              'linear-gradient(90deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 20, 20, 1) 20%, #1a1a1a 100%)', // teal hint for points
              'linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(20, 20, 20, 1) 20%, #1a1a1a 100%)', // purple hint for monthly
              'linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(20, 20, 20, 1) 20%, #1a1a1a 100%)', // purple hint for daily
            ]
            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  background: gradientColors[index],
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  border: '1px solid #2a2a2a',
                }}
              >
                <StatIcon type={stat.icon} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: '#888',
                    fontSize: '14px',
                    margin: 0,
                    marginBottom: '4px',
                    fontFamily: 'Coolvetica, sans-serif',
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    color: '#fff',
                    fontSize: '28px',
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: 'Coolvetica, sans-serif',
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  backgroundColor: stat.trendUp ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px',
                  color: stat.trendUp ? '#22c55e' : '#ef4444',
                  fontSize: '12px',
                  fontWeight: '500',
                }}>
                  <MdTrendingUp size={14} style={{ transform: stat.trendUp ? 'none' : 'rotate(180deg)' }} />
                  {stat.trend}
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontFamily: 'Coolvetica, sans-serif',
            fontSize: '24px',
            fontWeight: '400',
            color: '#fff',
            margin: 0,
          }}>
            recent activity
          </h2>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <MdSearch
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                }}
              />
              <input
                type="text"
                placeholder="search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '200px',
                  height: '36px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  padding: '0 12px 0 36px',
                  fontSize: '13px',
                  color: '#fff',
                  outline: 'none',
                  fontFamily: 'Coolvetica, sans-serif',
                }}
              />
            </div>

            {/* Card Filter Dropdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#3a3a3a',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              {cardFilter}
              <MdKeyboardArrowDown size={18} />
            </div>

            {/* Time Filter Dropdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#3a3a3a',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              {timeFilter}
              <MdKeyboardArrowDown size={18} />
            </div>

            {/* Edit Button */}
            <button style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <MdEdit size={16} color="#888" />
            </button>
          </div>
        </div>

        {/* Charts Section - Top Row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {/* Spending & Income Trends */}
          <div style={{
            flex: 2,
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #2a2a2a',
          }}>
            <p style={{
              color: '#666',
              fontSize: '16px',
              margin: 0,
              marginBottom: '16px',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              spending & income trends
            </p>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#252525', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="spending"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#2DD4BF"
                    strokeWidth={2}
                    dot={{ fill: '#2DD4BF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By Category Donut */}
          <div style={{
            width: '280px',
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #2a2a2a',
          }}>
            <p style={{
              color: '#666',
              fontSize: '16px',
              margin: 0,
              marginBottom: '16px',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              by category
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#252525" strokeWidth="12" />
                {generateCategorySegments()}
              </svg>
            </div>
            {/* Legend */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '11px',
              color: '#888',
            }}>
              {categoryData.map((cat, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                  }} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section - Bottom Row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {/* Avg Utilization */}
          <div style={{
            flex: 1,
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #2a2a2a',
          }}>
            <p style={{
              color: '#666',
              fontSize: '16px',
              margin: 0,
              marginBottom: '16px',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              avg utilization
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#252525" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(utilizationPercent / 100) * circumference} ${circumference}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            {/* Utilization Legend */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '11px',
              color: '#888',
            }}>
              {utilizationCategories.map((cat, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                  }} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Performance */}
          <div style={{
            flex: 1.5,
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #2a2a2a',
          }}>
            <p style={{
              color: '#666',
              fontSize: '16px',
              margin: 0,
              marginBottom: '16px',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              card performance
            </p>
            <div style={{
              width: '100%',
              height: '180px',
              backgroundColor: '#252525',
              borderRadius: '12px',
            }} />
          </div>

          {/* Daily Spending Pattern */}
          <div style={{
            flex: 1.5,
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #2a2a2a',
          }}>
            <p style={{
              color: '#666',
              fontSize: '16px',
              margin: 0,
              marginBottom: '16px',
              fontFamily: 'Coolvetica, sans-serif',
            }}>
              daily spending pattern
            </p>
            <div style={{
              width: '100%',
              height: '180px',
              backgroundColor: '#252525',
              borderRadius: '12px',
            }} />
          </div>
        </div>

        {/* Insights Section */}
        <div style={{
          display: 'flex',
          gap: '16px',
        }}>
          {insightsData.map((insight, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                backgroundColor: insight.type === 'positive'
                  ? 'rgba(34, 197, 94, 0.08)'
                  : insight.type === 'opportunity'
                    ? 'rgba(168, 85, 247, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${insight.type === 'positive'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : insight.type === 'opportunity'
                    ? 'rgba(168, 85, 247, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'
                  }`,
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <InsightIcon type={insight.type} />
              </div>
              <h3 style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                color: '#fff',
                margin: 0,
                marginBottom: '8px',
              }}>
                {insight.title}
              </h3>
              <p style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '13px',
                color: '#888',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}