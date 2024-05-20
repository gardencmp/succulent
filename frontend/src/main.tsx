import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/themeProvider.tsx';
import { createJazzReactContext, PasskeyAuth } from 'jazz-react';
import { SucculentAccount } from './dataModel.ts';

export const Jazz = createJazzReactContext<SucculentAccount>({
  auth: PasskeyAuth<SucculentAccount>({
    appName: 'succulent',
    accountSchema: SucculentAccount,
    appHostname: window.location.hostname.endsWith('succulent.jazz.tools')
      ? 'succulent.jazz.tools'
      : undefined,
  }),
  peer: 'wss://mesh.jazz.tools',
});
export const { useCoState, useAccount, useAcceptInvite } = Jazz;

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <ThemeProvider>
    <Jazz.Provider>
      <App />
    </Jazz.Provider>
  </ThemeProvider>
  // </React.StrictMode>
);
