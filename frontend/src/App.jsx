import { useState } from 'react'


import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage.jsx';
import ProblemsPage from './pages/ProblemsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { Toaster } from 'react-hot-toast';
import ProblemPage from '../src/pages/ProblemPage.jsx';

function App() {
  const [count, setCount] = useState(0)
  const {isSignedIn, isLoaded} = useUser();

  //this will get rid off flickering effect
  if(!isLoaded){
    return null;
  }
  return (
    <>
    <Routes>
      <Route path = "/" element = {!isSignedIn ? <HomePage />: <Navigate to = {"/dashboard"}></Navigate>}></Route>
      <Route path = "/dashboard" element = {isSignedIn ? <DashboardPage />: <Navigate to = {"/"}></Navigate>}></Route>
      <Route path="/problems" element = {isSignedIn ?<ProblemsPage /> : <Navigate to = {"/"}></Navigate>}></Route>
      <Route path="/problems/:id" element = {isSignedIn ?<ProblemPage /> : <Navigate to = {"/"}></Navigate>}></Route>
      <Route path="/problem/:id" element = {isSignedIn ?<ProblemPage /> : <Navigate to = {"/"}></Navigate>}></Route>
     </Routes>
     <Toaster toastOptions={{duration:3000}} />
     </>
  )
}

export default App;