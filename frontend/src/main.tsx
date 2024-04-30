import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/themeProvider.tsx';
import { JazzReact, PasskeyAuth } from 'jazz-react';
import { SucculentAccount } from './dataModel.ts';

export const Jazz = JazzReact<SucculentAccount>({
  auth: PasskeyAuth<SucculentAccount>({
    appName: 'succulent',
    accountSchema: SucculentAccount,
  }),
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
