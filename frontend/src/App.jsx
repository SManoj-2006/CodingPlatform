import { useState } from 'react'


import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProblemsPage from './pages/ProblemsPage.jsx';
import { Toaster } from 'react-hot-toast';


function App() {
  const [count, setCount] = useState(0)
  const {isSignedIn} = useUser;
  return (
    <>
    <Routes>
      <Route path = "/" element = {<HomePage />}></Route>
      <Route path="/about" element= {<AboutPage />}></Route>
      <Route path="/problems" element = {isSignedIn ?<ProblemsPage /> : <Navigate to = {"/"}></Navigate>}></Route>
      
     </Routes>
     <Toaster toastOptions={{duration:3000}} />
     </>
  )
}

export default App;