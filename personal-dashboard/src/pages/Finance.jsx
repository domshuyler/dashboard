import { useState } from 'react'
import { supabase } from '../supabase'
import './Finance.css'

const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Utilities', 'Education', 'Personal', 'Other']
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']

function Finance({ transactions, setTransactions, budgets, setBudgets, accounts, setAccounts, savingsGoals, setSavingsGoals }) {
  const [view, setView] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showSavingsForm, setShowSavingsForm] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    account: ''
  })

  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    month: currentMonth
  })

  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: ''
  })

  const [newSavingsGoal, setNewSavingsGoal] = useState({
    title: '',
    target: '',
    current: '',
    deadline: ''
  })

  const monthlyTransactions = transactions.filter(t => t.date && t.date.startsWith(selectedMonth))
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense')
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income')
  const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = monthlyIncome.reduce((sum, t) => sum + Number(t.amount), 0)
  const netSavings = totalIncome - totalExpenses
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

  const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
    category: cat,
    spent: monthlyExpenses.filter(t => t.category === cat).reduce((sum, t) => sum + Number(t.amount), 0),
    budget: budgets.find(b => b.category === cat && b.month === selectedMonth)?.limit || 0
  })).filter(c => c.spent > 0 || c.budget > 0)

  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.date) return
    const transaction = {
      id: Date.now(),
      type: newTransaction.type,
      amount: Number(newTransaction.amount),
      category: newTransaction.category,
      description: newTransaction.description,
      date: newTransaction.date,
      account: newTransaction.account
    }
    const { error } = await supabase.from('transactions').insert(transaction)
    if (!error) setTransactions([...transactions, transaction])
    setNewTransaction({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], account: '' })
    setShowTransactionForm(false)
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions(transactions.filter(t => t.id !== id))
  }

  const addBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return
    const existing = budgets.find(b => b.category === newBudget.category && b.month === newBudget.month)
    if (existing) {
      const { error } = await supabase.from('budgets').update({ limit_amount: Number(newBudget.limit) }).eq('id', existing.id)
      if (!error) setBudgets(budgets.map(b => b.id === existing.id ? { ...b, limit: Number(newBudget.limit) } : b))
    } else {
      const budget = { id: Date.now(), category: newBudget.category, limit_amount: Number(newBudget.limit), month: newBudget.month }
      const { error } = await supabase.from('budgets').insert(budget)
      if (!error) setBudgets([...budgets, { id: budget.id, category: budget.category, limit: budget.limit_amount, month: budget.month }])
    }
    setNewBudget({ category: '', limit: '', month: currentMonth })
    setShowBudgetForm(false)
  }

  const addAccount = async () => {
    if (!newAccount.name) return
    const account = { id: Date.now(), name: newAccount.name, type: newAccount.type, balance: Number(newAccount.balance) }
    const { error } = await supabase.from('accounts').insert(account)
    if (!error) setAccounts([...accounts, account])
    setNewAccount({ name: '', type: 'checking', balance: '' })
    setShowAccountForm(false)
  }

  const updateAccountBalance = async (id, balance) => {
    const { error } = await supabase.from('accounts').update({ balance: Number(balance) }).eq('id', id)
    if (!error) setAccounts(accounts.map(a => a.id === id ? { ...a, balance: Number(balance) } : a))
  }

  const deleteAccount = async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (!error) setAccounts(accounts.filter(a => a.id !== id))
  }

  const addSavingsGoal = async () => {
    if (!newSavingsGoal.title || !newSavingsGoal.target) return
    const goal = { id: Date.now(), title: newSavingsGoal.title, target: Number(newSavingsGoal.target), current: Number(newSavingsGoal.current) || 0, deadline: newSavingsGoal.deadline }
    const { error } = await supabase.from('savings_goals').insert(goal)
    if (!error) setSavingsGoals([...savingsGoals, goal])
    setNewSavingsGoal({ title: '', target: '', current: '', deadline: '' })
    setShowSavingsForm(false)
  }

  const updateSavingsProgress = async (id, current) => {
    const { error } = await supabase.from('savings_goals').update({ current: Number(current) }).eq('id', id)
    if (!error) setSavingsGoals(savingsGoals.map(g => g.id === id ? { ...g, current: Number(current) } : g))
  }

  const deleteSavingsGoal = async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (!error) setSavingsGoals(savingsGoals.filter(g => g.id !== id))
  }

  return (
    <div className="page">
      <div className="jh-header">
        <h1>Finance</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="finance-month-picker"
          />
          {view === 'transactions' && <button className="notes-btn-accent" onClick={() => setShowTransactionForm(!showTransactionForm)}>+ Add Transaction</button>}
          {view === 'budgets' && <button className="notes-btn-accent" onClick={() => setShowBudgetForm(!showBudgetForm)}>+ Set Budget</button>}
          {view === 'accounts' && <button className="notes-btn-accent" onClick={() => setShowAccountForm(!showAccountForm)}>+ Add Account</button>}
          {view === 'savings' && <button className="notes-btn-accent" onClick={() => setShowSavingsForm(!showSavingsForm)}>+ Add Goal</button>}
        </div>
      </div>

      <div className="jh-tabs">
        <button className={view === 'dashboard' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('dashboard')}>Dashboard</button>
        <button className={view === 'transactions' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('transactions')}>Transactions</button>
        <button className={view === 'budgets' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('budgets')}>Budgets</button>
        <button className={view === 'accounts' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('accounts')}>Accounts</button>
        <button className={view === 'savings' ? 'jh-tab active' : 'jh-tab'} onClick={() => setView('savings')}>Savings Goals</button>
      </div>

      {view === 'dashboard' && (
        <div className="finance-dashboard">
          <div className="home-stats" style={{ marginBottom: '1rem' }}>
            <div className="stat-card">
              <div className="stat-label">Income</div>
              <div className="stat-value" style={{ color: '#4ade80' }}>${totalIncome.toFixed(2)}</div>
              <div className="stat-sub">this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Expenses</div>
              <div className="stat-value" style={{ color: '#f87171' }}>${totalExpenses.toFixed(2)}</div>
              <div className="stat-sub">this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Net Savings</div>
              <div className="stat-value" style={{ color: netSavings >= 0 ? '#4ade80' : '#f87171' }}>${netSavings.toFixed(2)}</div>
              <div className="stat-sub">this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Balance</div>
              <div className="stat-value">${totalBalance.toFixed(2)}</div>
              <div className="stat-sub">across all accounts</div>
            </div>
          </div>

          <div className="finance-section-title">Spending by Category</div>
          {expensesByCategory.length === 0 && <div className="notes-empty">No transactions this month.</div>}
          {expensesByCategory.map(cat => (
            <div key={cat.category} className="finance-budget-row">
              <div className="finance-budget-info">
                <span className="finance-budget-category">{cat.category}</span>
                <span className="finance-budget-amounts">
                  ${cat.spent.toFixed(2)} {cat.budget > 0 ? `/ $${cat.budget.toFixed(2)}` : ''}
                </span>
              </div>
              {cat.budget > 0 && (
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%`,
                      background: cat.spent > cat.budget ? '#f87171' : 'var(--color-accent)'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'transactions' && (
        <div className="finance-transactions">
          {showTransactionForm && (
            <div className="jh-form">
              <div className="jh-form-grid">
                <select value={newTransaction.type} onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} />
                <select value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}>
                  <option value="">Category</option>
                  {(newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="Description" value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} />
                <input type="date" value={newTransaction.date} onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} />
                <select value={newTransaction.account} onChange={e => setNewTransaction({ ...newTransaction, account: e.target.value })}>
                  <option value="">Account</option>
                  {accounts.map(a => <option key={a.id}>{a.name}</option>)}
                </select>
              </div>
              <button className="notes-btn-accent" onClick={addTransaction}>Save Transaction</button>
            </div>
          )}

          <div className="finance-transaction-list">
            {monthlyTransactions.length === 0 && <div className="notes-empty">No transactions this month.</div>}
            {monthlyTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
              <div key={t.id} className="finance-transaction-row">
                <div className={`finance-transaction-type ${t.type}`} />
                <div className="finance-transaction-info">
                  <div className="finance-transaction-desc">{t.description || t.category || 'No description'}</div>
                  <div className="finance-transaction-meta">{t.category} · {t.date} {t.account && `· ${t.account}`}</div>
                </div>
                <div className={`finance-transaction-amount ${t.type}`}>
                  {t.type === 'expense' ? '-' : '+'}${Number(t.amount).toFixed(2)}
                </div>
                <button className="notes-btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => deleteTransaction(t.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'budgets' && (
        <div className="finance-budgets">
          {showBudgetForm && (
            <div className="jh-form">
              <div className="jh-form-grid">
                <select value={newBudget.category} onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}>
                  <option value="">Category</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Monthly limit" value={newBudget.limit} onChange={e => setNewBudget({ ...newBudget, limit: e.target.value })} />
                <input type="month" value={newBudget.month} onChange={e => setNewBudget({ ...newBudget, month: e.target.value })} />
              </div>
              <button className="notes-btn-accent" onClick={addBudget}>Save Budget</button>
            </div>
          )}

          <div className="finance-budget-list">
            {expensesByCategory.length === 0 && <div className="notes-empty">No budgets or transactions this month.</div>}
            {expensesByCategory.map(cat => (
              <div key={cat.category} className="finance-budget-card">
                <div className="finance-budget-info">
                  <span className="finance-budget-category">{cat.category}</span>
                  <span className="finance-budget-amounts">
                    ${cat.spent.toFixed(2)} {cat.budget > 0 ? `/ $${cat.budget.toFixed(2)}` : '— no budget set'}
                  </span>
                </div>
                {cat.budget > 0 && (
                  <>
                    <div className="progress-bar-track" style={{ marginTop: '0.5rem' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%`,
                          background: cat.spent > cat.budget ? '#f87171' : 'var(--color-accent)'
                        }}
                      />
                    </div>
                    <div className="progress-info">
                      <span>{Math.round((cat.spent / cat.budget) * 100)}% used</span>
                      <span>${(cat.budget - cat.spent).toFixed(2)} remaining</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'accounts' && (
        <div className="finance-accounts">
          {showAccountForm && (
            <div className="jh-form">
              <div className="jh-form-grid">
                <input placeholder="Account name" value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} />
                <select value={newAccount.type} onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="investment">Investment</option>
                  <option value="credit">Credit</option>
                </select>
                <input type="number" placeholder="Current balance" value={newAccount.balance} onChange={e => setNewAccount({ ...newAccount, balance: e.target.value })} />
              </div>
              <button className="notes-btn-accent" onClick={addAccount}>Save Account</button>
            </div>
          )}

          <div className="finance-account-list">
            {accounts.length === 0 && <div className="notes-empty">No accounts added yet.</div>}
            {accounts.map(account => (
              <div key={account.id} className="finance-account-card">
                <div className="finance-account-info">
                  <div className="finance-account-name">{account.name}</div>
                  <div className="finance-account-type">{account.type}</div>
                </div>
                <div className="finance-account-balance-row">
                  <input
                    type="number"
                    defaultValue={account.balance}
                    onBlur={e => updateAccountBalance(account.id, e.target.value)}
                    className="finance-balance-input"
                  />
                  <button className="notes-btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => deleteAccount(account.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'savings' && (
        <div className="finance-savings">
          {showSavingsForm && (
            <div className="jh-form">
              <div className="jh-form-grid">
                <input placeholder="Goal title" value={newSavingsGoal.title} onChange={e => setNewSavingsGoal({ ...newSavingsGoal, title: e.target.value })} />
                <input type="number" placeholder="Target amount" value={newSavingsGoal.target} onChange={e => setNewSavingsGoal({ ...newSavingsGoal, target: e.target.value })} />
                <input type="number" placeholder="Current amount" value={newSavingsGoal.current} onChange={e => setNewSavingsGoal({ ...newSavingsGoal, current: e.target.value })} />
                <input type="date" placeholder="Deadline" value={newSavingsGoal.deadline} onChange={e => setNewSavingsGoal({ ...newSavingsGoal, deadline: e.target.value })} />
              </div>
              <button className="notes-btn-accent" onClick={addSavingsGoal}>Save Goal</button>
            </div>
          )}

          <div className="goal-list">
            {savingsGoals.length === 0 && <div className="notes-empty">No savings goals yet.</div>}
            {savingsGoals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-header">
                  <div className="task-info">
                    <span className="task-title">{goal.title}</span>
                    <div className="task-meta">
                      {goal.deadline && <span className="due-date">Deadline: {goal.deadline}</span>}
                    </div>
                  </div>
                  <button className="notes-btn-danger" onClick={() => deleteSavingsGoal(goal.id)}>Delete</button>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="progress-info">
                    <span>${Number(goal.current).toFixed(2)} / ${Number(goal.target).toFixed(2)}</span>
                    <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Update current amount..."
                    onBlur={e => { updateSavingsProgress(goal.id, e.target.value); e.target.value = '' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Finance