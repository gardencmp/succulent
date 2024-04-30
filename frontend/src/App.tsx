import { RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { router } from './router';
// import { useAcceptInvite, useAccount } from './main';
// import { Brand } from './sharedDataModel';

function App() {
  // const { me } = useAccount();
  // useAcceptInvite({invitedObjectSchema: Brand, onAccept: async (brandID) => {
  //   if (!me.root?.brands) {
  //     console.log('myBrands not available');
  //     return;
  //   }

  //   me.root?.brands.push(brandID);
  //   router.navigate('/');
  // }});

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
