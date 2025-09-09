import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext.jsx"

function App() {
  return (
    <AuthProvider>
      <Pages />
      <Toaster />
    </AuthProvider>
  )
}

export default App 