import './App.css';
import Footer from './components/Footer';
import Home from './components/Home';
import Header from './components/layout/Header';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import ProductDetail from './components/product/productDetail';
import ProductSearch from './components/product/productSearch';
import Login from './components/user/Login';
import Register from './components/user/Register';
import { useEffect, useState } from 'react';
import store from './store';
import { loadUser } from './actions/userActions';
import Profile from './components/user/Profile';
import ProtectedRoute from './components/route/ProtectedRoute';
import UpdateProfile from './components/user/UpdateProfile';
import UpdatePassword from './components/user/updatePassword';
import ForgotPassword from './components/user/ForgotPassword';
import ResetPassword from './components/user/ResetPassword';
import Cart from './components/cart/Cart';
import Shipping from './components/cart/Shipping';
import ConfirmOrder from './components/cart/ConfirmOrder';
import Payment from './components/cart/Payment';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import OrderSuccess from './components/cart/OrderSuccess';
import UserOrders from './components/order/UserOrders';
import OrderDetail from './components/order/OrderDetail';

function App() {
  const [stripeApiKey, setStripeApiKey] = useState("");

  useEffect(() => {
    store.dispatch(loadUser);
    
    async function getStripeApiKey() {
      try {
        const { data } = await axios.get('/api/v1/stripeapi');
        setStripeApiKey(data.stripeApiKey);
      } catch (error) {
        console.error("Failed to fetch Stripe API key", error);
      }
    }
    
    getStripeApiKey();
  }, []);

  return (
    <Router>
      <div className="App">
        <HelmetProvider>
          <Header />
          <div className='container container-fluid'>
            <ToastContainer />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/product/:id' element={<ProductDetail />} />
              <Route path='/search/:keyword' element={<ProductSearch />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/myprofile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path='/myprofile/update' element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
              <Route path='/myprofile/update/password' element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
              <Route path='/password/forgot' element={<ForgotPassword />} />
              <Route path='/password/reset/:token' element={<ResetPassword />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/shipping' element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
              <Route path='/order/success' element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path='/orders' element={<ProtectedRoute><UserOrders/></ProtectedRoute>} />
              <Route path='/order/confirm' element={<ProtectedRoute><ConfirmOrder /></ProtectedRoute>} />
              <Route path='/order/:id' element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              
              {stripeApiKey && (
                <Route path='/payment' element={
                  <ProtectedRoute>
                    <Elements stripe={loadStripe(stripeApiKey)}>
                      <Payment />
                    </Elements>
                  </ProtectedRoute>
                } />
              )}
            </Routes>
          </div>
          <Footer />
        </HelmetProvider>
      </div>
    </Router>
  );
}

export default App;
