import "./App.css";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton
} from "@clerk/clerk-react";

function App() {
  return (
    <div>
      <h1>Welcome to the app</h1>

      <SignedOut>
        <SignInButton mode="modal" />
        <p>hello</p>
      </SignedOut>

      <SignedIn>
        <UserButton />
        <SignOutButton />
      </SignedIn>
    </div>
  );
}

export default App;