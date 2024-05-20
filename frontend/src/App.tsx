import { RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { router } from './router';
import { useAcceptInvite, useAccount } from './main';
import { Brand } from './sharedDataModel';

function App() {
  const { me } = useAccount();
  useAcceptInvite<Brand>({
    invitedObjectSchema: Brand,
    onAccept: async (brandID) => {
      const brand = await Brand.load(brandID, { as: me });

      if (!brand) {
        console.log('Failed to accept invite');
        return;
      }

      const myBrands = await (
        await me._refs.root?.load()
      )?._refs.brands?.load();

      myBrands?.push(brand);
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
