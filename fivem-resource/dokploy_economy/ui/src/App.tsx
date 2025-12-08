


import { VisibilityProvider } from './providers/VisibilityProvider'
import { Layout } from './components/layout/Layout'
import { useAppStore } from './store/useAppStore'

// Views
import { HomeView } from './views/HomeView'
import { CoinsView } from './views/CoinsView'
import { ShopView } from './views/ShopView'
import { ExchangeView } from './views/ExchangeView'
import { MarketplaceView } from './views/MarketplaceView'

import { useNuiEvent } from './hooks/useNuiEvent'

import './index.css'

function App() {
  const { currentTab, setUser } = useAppStore()

  useNuiEvent('updatePlayerData', (data: any) => {
    setUser(data)
  })

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <HomeView />
      case 'coins': return <CoinsView />
      case 'shop': return <ShopView />
      case 'exchange': return <ExchangeView />
      case 'marketplace': return <MarketplaceView />
      default: return <HomeView />
    }
  }

  return (
    <VisibilityProvider>
      <div className="flex h-screen w-screen items-center justify-center font-sans">
        <Layout>
          {renderContent()}
        </Layout>
      </div>
    </VisibilityProvider>
  )
}

export default App
