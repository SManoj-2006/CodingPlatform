import { useState } from 'react'

import './App.css'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Welcome to App</h1>
      <SignedOut>
      <SignInButton mode='modal' />
      </SignedOut>

    <SignedIn>
      <SignOutButton/>
      <UserButton></UserButton>
    </SignedIn>
     </>
  )
}

export default App;
