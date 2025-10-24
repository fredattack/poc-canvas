import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { CanvasProvider } from './context/CanvasContext';
import { Header } from './components/Header';
import { ChatPanel } from './components/Chat/ChatPanel';
import { CanvasPanel } from './components/Canvas/CanvasPanel';

/**
 * Main App component
 * Provides all context providers and renders the main layout
 */
function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <CanvasProvider>
          <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
            {/* Header with authentication */}
            <Header />

            {/* Main content area with Chat and Canvas */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Chat panel - Left side on desktop, top on mobile */}
                <div className="h-full border-r border-gray-200 overflow-hidden">
                  <ChatPanel />
                </div>

                {/* Canvas panel - Right side on desktop, bottom on mobile */}
                <div className="h-full overflow-hidden">
                  <CanvasPanel />
                </div>
              </div>
            </main>
          </div>
        </CanvasProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
