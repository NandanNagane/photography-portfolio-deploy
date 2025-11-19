import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './layout'
import Home from './pages/Home'
import About from './pages/About'
import Portfolio from './pages/Portpolio'
import Contact from './pages/Contact'
import { NavProvider } from './context/NavProvider'
import { ChatProvider } from './context/ChatContext'
import ChatWidget from './components/ChatWidget'
import { Toaster } from './components/ui/sonner'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
    ],
  },
])

function App() {
  return (
    <NavProvider>
      <ChatProvider>
        <RouterProvider router={router} />
        <ChatWidget />
        <Toaster />
      </ChatProvider>
    </NavProvider>
  );
}

export default App
