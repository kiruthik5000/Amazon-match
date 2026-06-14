import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ReMatch from './pages/ReMatch';
import ReMatchProductDetails from './pages/ReMatchProductDetails';
import SellProduct from './pages/SellProduct';
import AIEvaluation from './pages/AIEvaluation';
import MyListings from './pages/MyListings';
import GreenCredits from './pages/GreenCredits';
import PricePredictor from './pages/PricePredictor';
import Login from './pages/Login';
import Register from './pages/Register';

const theme = createTheme({
  palette: {
    primary: { main: '#131921' },
    secondary: { main: '#FF9900' },
    warning: { main: '#FF9900' },
  },
  typography: {
    fontFamily: '"Amazon Ember", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
  },
});

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 120px)' }}>{children}</main>
    <Footer />
  </>
);

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

const App = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/orders" element={<P><Orders /></P>} />
              <Route path="/rematch" element={<P><ReMatch /></P>} />
              <Route path="/rematch/product/:id" element={<P><ReMatchProductDetails /></P>} />
              <Route path="/rematch/sell" element={<P><SellProduct /></P>} />
              <Route path="/rematch/evaluation" element={<P><AIEvaluation /></P>} />
              <Route path="/rematch/my-listings" element={<P><MyListings /></P>} />
              <Route path="/green-credits" element={<P><GreenCredits /></P>} />
              <Route path="/rematch/price-predictor" element={<P><PricePredictor /></P>} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
