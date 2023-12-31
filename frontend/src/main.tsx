import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/themeProvider.tsx';
import { WithJazz } from 'jazz-react';
import { LocalAuth } from 'jazz-react-auth-local';
import { accountMigration } from './dataModel.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <ThemeProvider>
    <WithJazz
      auth={LocalAuth({ appName: 'succulent' })}
      migration={accountMigration}
    >
      <App />
    </WithJazz>
  </ThemeProvider>
  // </React.StrictMode>
);
