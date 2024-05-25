import { RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { router } from './router';
import { useAcceptInvite, useAccount } from './main';
import { Brand } from './sharedDataModel';

function App() {
  const { me } = useAccount({ root: { brands: [] } });

  useAcceptInvite<Brand>({
    invitedObjectSchema: Brand,
    onAccept: async (brandID) => {
      if (!me) return;
      const brand = await Brand.load(brandID, me, {});

      if (!brand) {
        console.log('Failed to accept invite');
        return;
      }

      me.root.brands?.push(brand);
      router.navigate('/');
    },
  });

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
