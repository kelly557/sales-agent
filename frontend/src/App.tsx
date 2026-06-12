import { useCallback, useState } from "react";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  const [user, setUser] = useState<string | null>(null);

  const handleAuthenticated = useCallback((username: string) => {
    setUser(username);
  }, []);

  if (!user) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return <DocumentWorkspace />;
}
