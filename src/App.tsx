import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { usePermission } from '~/hooks/usePermission';

function Home() {  
  const { can } = usePermission();
  const { hasPermission } = usePermission(
    'read', 
    'page:users/[id]',
    { userId: "455cb998-2cb3-41cd-8c9e-41416db7d4abc" }
  );

  return (
    <div>
      <h1>User Page</h1>
      <p>Permission status: {can('read', 'page:users/[id]', { userId: "foo" }) ? 'Allowed' : 'Denied'}</p>
      <p>Permission status: {hasPermission ? 'Allowed' : 'Denied'}</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 