import { AccountRoot } from './dataModel';
import { useAcceptInvite, useJazz } from 'jazz-react';
import { Profile } from 'cojson';
import { RouterProvider } from 'react-router-dom';
import { Brand } from './sharedDataModel';
import { Toaster } from './components/ui/toaster';
import { autoSubResolution } from 'jazz-autosub';
import { router } from './router';

function App() {
  const { me, localNode } = useJazz<Profile, AccountRoot>();
  useAcceptInvite<Brand>(async (brandID) => {
    const myBrands = await autoSubResolution(
      me.id,
      (me) => me.root?.brands,
      localNode
    );

    if (!myBrands) {
      console.log('myBrands not available');
      return;
    }

    myBrands.append(brandID);
    router.navigate('/');
  });

  return (
    <div className="flex-col max-h-[100dvh]">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
