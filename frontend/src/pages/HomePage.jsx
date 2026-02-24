import { SignedIn, SignedOut, SignIn, SignInButton,SignOutButton,UserButton} from '@clerk/clerk-react'
import React from 'react'
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios';

function HomePage() {
    await axiosInstance.get("/session/123")
  return (
    <div>
        <button className="btn btn-secondary" onClick={() => toast.error("Logged in success")}>CLick me</button>
        <SignedOut>
        <SignInButton mode='modal'>
        <button>Login</button>
        </SignInButton>
        </SignedOut>    
        <SignedIn>
        <SignOutButton/>
        </SignedIn>
        <UserButton></UserButton>
    </div>
  );
}

export default HomePage;