import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { UserProvider } from './context/UserContext';

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}