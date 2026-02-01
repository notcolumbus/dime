import { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import { MdDownload, MdSearch } from 'react-icons/md'

interface TransactionProduct {
  name?: string
  quantity?: number
  unit_price?: string
}

interface KnotTransaction {
  id?: string
  external_id?: string
  datetime?: string
  order_status?: string
  price?: {
    total?: string
    currency?: string
  }
  products?: TransactionProduct[]
  payment_methods?: Array<{
    type?: string
    brand?: string
    last_four?: string
    transaction_amount?: string
  }>
}

interface MappedTransaction {
  id: string
  merchant: string
  category: string
  card: string
  cardLast4: string
  date: string
  time: string
  points: number
  amount: number
  icon?: string
}

interface Card {
  card_id: string
  card_type: string
  last_four: string
}

const BACKEND_URL = 'http://localhost:5001'

// Merchant configs for fetching
const MERCHANTS = [
  { id: 19, name: 'DoorDash', icon: '🍔', category: 'food delivery' },
  { id: 44, name: 'Amazon', icon: '📦', category: 'shopping' },
  { id: 45, name: 'Walmart', icon: '🛒', category: 'groceries' },
  { id: 29, name: 'Uber', icon: '🚗', category: 'transportation' },
]

export default function Spending() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMerchant, setSelectedMerchant] = useState('all merchants')
  const [selectedCard, setSelectedCard] = useState('all cards')
  const [selectedTime, setSelectedTime] = useState('all time')
  const [transactions, setTransactions] = useState<MappedTransaction[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKnotTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch cards first
      const cardsResponse = await fetch(`${BACKEND_URL}/api/cards?user_id=aman`)
      const cardsData = await cardsResponse.json()
      const fetchedCards = cardsData.cards || []
      setCards(fetchedCards)

      // Fetch transactions from all merchants
      const allTransactions: MappedTransaction[] = []

      for (const merchant of MERCHANTS) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/knot/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: 'aman',
              merchant_id: merchant.id,
              limit: 20
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const knotTransactions: KnotTransaction[] = data.transactions || []

            // Map Knot transactions to our format
            knotTransactions.forEach((tx, index) => {
              const card = fetchedCards.length > 0
                ? fetchedCards[index % fetchedCards.length]
                : { card_type: 'Unknown Card', last_four: '0000' }

              // Parse datetime
              const datetime = tx.datetime ? new Date(tx.datetime) : new Date()
              const date = datetime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const time = `**${card.last_four}`

              // Parse amount
              const amount = tx.price?.total ? parseFloat(tx.price.total) : 0
              const points = Math.floor(amount)

              allTransactions.push({
                id: tx.id || tx.external_id || `${merchant.id}-${index}`,
                merchant: merchant.name,
                category: merchant.category,
                card: card.card_type || 'Unknown Card',
                cardLast4: card.last_four || '0000',
                date,
                time,
                points,
                amount: -Math.abs(amount),
                icon: merchant.icon,
              })
            })
          }
        } catch (err) {
          console.warn(`Failed to fetch from ${merchant.name}:`, err)
        }
      }

      // Sort by date (most recent first)
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })

      setTransactions(allTransactions)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load transactions. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKnotTransactions()

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      console.log('Auto-syncing spending data...')
      fetchKnotTransactions()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchKnotTransactions])

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMerchant = selectedMerchant === 'all merchants' ||
      tx.merchant.toLowerCase() === selectedMerchant.toLowerCase()
    const matchesCard = selectedCard === 'all cards' ||
      tx.card.toLowerCase().includes(selectedCard.toLowerCase())
    return matchesSearch && matchesMerchant && matchesCard
  })

  // Calculate stats
  const stats = {
    totalSpent: filteredTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    totalTransactions: filteredTransactions.length,
    totalEarned: 6271.86, // Placeholder - would come from deposits
    totalDeposits: 13,
    pointsEarned: filteredTransactions.reduce((sum, tx) => sum + tx.points, 0),
  }

  const exportCSV = () => {
    const headers = ['Merchant', 'Category', 'Card', 'Date', 'Points', 'Amount']
    const rows = filteredTransactions.map(tx => [
      tx.merchant,
      tx.category,
      `${tx.card} **${tx.cardLast4}`,
      tx.date,
      tx.points,
      tx.amount.toFixed(2)
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spending_history.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get unique merchants for filter dropdown
  const uniqueMerchants = [...new Set(transactions.map(tx => tx.merchant))]

  return (
    <div style={{ paddingBottom: '80px' }}>
      <Header title="spending history" />

      {/* Subtitle and Export Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          fontFamily: 'Coolvetica, sans-serif',
          fontSize: '18px',
          color: '#888',
        }}>
          complete history across all your credit cards
        </div>

        {/* Export CSV Button */}
        <button
          onClick={exportCSV}
          style={{
            backgroundColor: '#0d9488',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontFamily: 'Coolvetica, sans-serif',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
        >
          <MdDownload size={16} />
          export CSV
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          fontFamily: 'Coolvetica, sans-serif',
          fontSize: '16px',
          color: '#888',
          textAlign: 'center',
          padding: '40px',
        }}>
          Loading transactions from Knot...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          fontFamily: 'Coolvetica, sans-serif',
          fontSize: '16px',
          color: '#ff6b6b',
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#3d1f1f',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* Stats Cards and Recent Activity */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '48px',
          }}>
            {/* Total Spent Card */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #2a2a2a',
            }}>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'lowercase',
              }}>
                total spent
              </div>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '32px',
                color: '#ff6b6b',
                marginBottom: '8px',
                fontWeight: '600',
              }}>
                -$ {stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '12px',
                color: '#555',
              }}>
                {stats.totalTransactions} transactions
              </div>
            </div>

            {/* Total Earned Card */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #2a2a2a',
            }}>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'lowercase',
              }}>
                total earned
              </div>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '32px',
                color: '#4ecca3',
                marginBottom: '8px',
                fontWeight: '600',
              }}>
                +$ {stats.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '12px',
                color: '#555',
              }}>
                {stats.totalDeposits} deposits
              </div>
            </div>

            {/* Points Earned Card */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #2a2a2a',
            }}>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '13px',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'lowercase',
              }}>
                points earned
              </div>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '32px',
                color: '#a78bfa',
                marginBottom: '8px',
                fontWeight: '600',
              }}>
                {stats.pointsEarned.toLocaleString()}
              </div>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '12px',
                color: '#555',
              }}>
                across all cards
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '24px',
                color: '#fff',
              }}>
                recent activity
              </div>

              {/* Filters Row */}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}>
                {/* Search Transactions */}
                <div style={{
                  position: 'relative',
                  width: '200px',
                }}>
                  <MdSearch
                    size={16}
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
                    placeholder="search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '36px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      padding: '0 12px 0 36px',
                      fontSize: '13px',
                      color: '#fff',
                      outline: 'none',
                      fontFamily: 'Coolvetica, sans-serif',
                    }}
                  />
                </div>

                {/* All Merchants Dropdown */}
                <select
                  value={selectedMerchant}
                  onChange={(e) => setSelectedMerchant(e.target.value)}
                  style={{
                    height: '36px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#fff',
                    outline: 'none',
                    fontFamily: 'Coolvetica, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all merchants">all merchants</option>
                  {uniqueMerchants.map(m => (
                    <option key={m} value={m.toLowerCase()}>{m}</option>
                  ))}
                </select>

                {/* All Cards Dropdown */}
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  style={{
                    height: '36px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#fff',
                    outline: 'none',
                    fontFamily: 'Coolvetica, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all cards">all cards</option>
                  {cards.map(c => (
                    <option key={c.card_id} value={c.card_type.toLowerCase()}>
                      {c.card_type} **{c.last_four}
                    </option>
                  ))}
                </select>

                {/* All Time Dropdown */}
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{
                    height: '36px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#fff',
                    outline: 'none',
                    fontFamily: 'Coolvetica, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all time">all time</option>
                  <option value="today">Today</option>
                  <option value="this week">This Week</option>
                  <option value="this month">This Month</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              border: '1px solid #2a2a2a',
              overflow: 'hidden',
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
                gap: '16px',
                padding: '16px 24px',
                borderBottom: '1px solid #2a2a2a',
              }}>
                <div style={{
                  fontFamily: 'Coolvetica, sans-serif',
                  fontSize: '13px',
                  color: '#666',
                  textTransform: 'lowercase',
                }}>
                  transaction
                </div>
                <div style={{
                  fontFamily: 'Coolvetica, sans-serif',
                  fontSize: '13px',
                  color: '#666',
                  textTransform: 'lowercase',
                }}>
                  card used
                </div>
                <div style={{
                  fontFamily: 'Coolvetica, sans-serif',
                  fontSize: '13px',
                  color: '#666',
                  textTransform: 'lowercase',
                }}>
                  date & time
                </div>
                <div style={{
                  fontFamily: 'Coolvetica, sans-serif',
                  fontSize: '13px',
                  color: '#666',
                  textTransform: 'lowercase',
                }}>
                  points
                </div>
                <div style={{
                  fontFamily: 'Coolvetica, sans-serif',
                  fontSize: '13px',
                  color: '#666',
                  textTransform: 'lowercase',
                  textAlign: 'right',
                }}>
                  amount
                </div>
              </div>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: '#666',
                  fontFamily: 'Coolvetica, sans-serif',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <div>No transactions found. Connect merchants to sync your spending.</div>
                </div>
              )}

              {/* Table Rows */}
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
                    gap: '16px',
                    padding: '20px 24px',
                    borderBottom: '1px solid #2a2a2a',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Transaction Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1db954 0%, #191414 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '20px',
                    }}>
                      {transaction.icon || '💳'}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'Coolvetica, sans-serif',
                        fontSize: '15px',
                        color: '#fff',
                        marginBottom: '4px',
                      }}>
                        {transaction.merchant}
                      </div>
                      <div style={{
                        fontFamily: 'Coolvetica, sans-serif',
                        fontSize: '13px',
                        color: '#666',
                      }}>
                        {transaction.category}
                      </div>
                    </div>
                  </div>

                  {/* Card Used */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Coolvetica, sans-serif',
                      fontSize: '15px',
                      color: '#fff',
                      marginBottom: '4px',
                    }}>
                      {transaction.card}
                    </div>
                    <div style={{
                      fontFamily: 'Coolvetica, sans-serif',
                      fontSize: '13px',
                      color: '#666',
                    }}>
                      **{transaction.cardLast4}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Coolvetica, sans-serif',
                      fontSize: '15px',
                      color: '#fff',
                      marginBottom: '4px',
                    }}>
                      {transaction.date}
                    </div>
                    <div style={{
                      fontFamily: 'Coolvetica, sans-serif',
                      fontSize: '13px',
                      color: '#666',
                    }}>
                      {transaction.time}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'Coolvetica, sans-serif',
                      fontSize: '14px',
                      color: '#a78bfa',
                      backgroundColor: '#2d1f4d',
                      padding: '6px 14px',
                      borderRadius: '20px',
                    }}>
                      +{transaction.points}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      fontFamily: 'Coolvetica, sans-serif',
                      fontSize: '14px',
                      color: '#ff6b6b',
                      background: 'linear-gradient(90deg, rgba(61,31,31,0.3) 0%, rgba(61,31,31,0.8) 100%)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                    }}>
                      -$ {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}