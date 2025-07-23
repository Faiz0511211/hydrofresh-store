import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION HERE ---
// Make sure your real keys are pasted below.
// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL1wojiPJ1vRhgydRLl6KvSil05vMjnZw",
  authDomain: "hydro-fresh-store.firebaseapp.com",
  projectId: "hydro-fresh-store",
  storageBucket: "hydro-fresh-store.firebasestorage.app",
  messagingSenderId: "1090699587135",
  appId: "1:1090699587135:web:653e70dd244c5cc9c1928a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// --- Initialize Firebase and Firestore ---
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}


// --- ICONS (using inline SVGs for self-containment) ---
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
    <path d="M11 20a7 7 0 0 0 7-7v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 0-2 2z" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// --- MOCK DATA ---
const initialProducts = [
  { id: 1, name: 'Hydroponic Lettuce', price: 2.50, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Lettuce' },
  { id: 2, name: 'Hydroponic Basil', price: 3.00, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Basil' },
  { id: 3, name: 'Hydroponic Cherry Tomatoes', price: 4.25, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Tomatoes' },
  { id: 4, name: 'Hydroponic Kale', price: 3.50, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Kale' },
  { id: 5, name: 'Hydroponic Mint', price: 2.75, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Mint' },
  { id: 6, name: 'Hydroponic Spinach', price: 3.20, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Spinach' },
  { id: 7, name: 'Hydroponic Bell Peppers', price: 5.00, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Peppers' },
  { id: 8, name: 'Hydroponic Strawberries', price: 6.50, image: 'https://placehold.co/400x300/22c55e/ffffff?text=Strawberries' },
];

// --- CONTEXT FOR STATE MANAGEMENT ---
const AppContext = createContext();

// --- COMPONENTS ---

// Header Component
const Header = ({ onCartClick, onHomeClick }) => {
  const { cart } = useContext(AppContext);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={onHomeClick}
          >
            <LeafIcon />
            <span className="text-2xl font-bold text-gray-800">HydroFresh</span>
          </div>
          <button onClick={onCartClick} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <ShoppingCartIcon />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-6 w-6 bg-green-500 text-white text-xs font-bold rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

// Product Item Component
const ProductItem = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useContext(AppContext);
  const itemInCart = cart.find(item => item.id === product.id);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-xl font-bold text-green-600 mt-1 mb-4">${product.price.toFixed(2)}</p>
        
        <div className="mt-auto">
          {itemInCart ? (
            <div className="flex items-center justify-center w-full bg-gray-100 rounded-lg">
              <button onClick={() => updateQuantity(product.id, itemInCart.quantity - 1)} className="p-3 text-green-600 hover:bg-gray-200 rounded-l-lg">
                <MinusIcon />
              </button>
              <span className="px-4 font-bold text-lg">{itemInCart.quantity}</span>
              <button onClick={() => updateQuantity(product.id, itemInCart.quantity + 1)} className="p-3 text-green-600 hover:bg-gray-200 rounded-r-lg">
                <PlusIcon />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Product List Component
const ProductList = () => {
  const { products } = useContext(AppContext);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};

// Cart View Component
const CartView = ({ onCheckout, onBack }) => {
  const { cart, updateQuantity, removeFromCart } = useContext(AppContext);
  
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Add some fresh greens to get started!</p>
        <button onClick={onBack} className="mt-6 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center space-x-2 text-green-600 font-semibold mb-6 hover:underline">
            <ArrowLeftIcon />
            <span>Back to Products</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-6">
                {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                                <p className="text-gray-500">${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-gray-100 rounded-lg">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg"><MinusIcon /></button>
                                <span className="px-4 font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg"><PlusIcon /></button>
                            </div>
                            <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
            <hr className="my-8" />
            <div className="space-y-3 text-right text-gray-700">
                <p>Subtotal: <span className="font-semibold w-24 inline-block">${subtotal.toFixed(2)}</span></p>
                <p>Tax (5%): <span className="font-semibold w-24 inline-block">${tax.toFixed(2)}</span></p>
                <p className="text-xl font-bold text-gray-800">Total: <span className="w-24 inline-block">${total.toFixed(2)}</span></p>
            </div>
            <div className="mt-8 text-right">
                <button onClick={onCheckout} className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors duration-300 text-lg">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    </div>
  );
};

// Checkout View Component
const CheckoutView = ({ onConfirmOrder, onBack }) => {
    const { cart } = useContext(AppContext);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.address || !formData.phone) {
            setError("Please fill out all fields.");
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            await onConfirmOrder({
                customerDetails: formData,
                items: cart,
                subtotal,
                tax,
                total,
            });
        } catch (err) {
            console.error("Order submission error:", err);
            setError("Could not place order. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center space-x-2 text-green-600 font-semibold mb-6 hover:underline">
                <ArrowLeftIcon />
                <span>Back to Cart</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6">Delivery Information</h2>
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2" required />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2" required></textarea>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2" required />
                        </div>
                    </form>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
                    <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                    <div className="space-y-3 flex-grow">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="my-4" />
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    <button 
                        form="checkout-form"
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 text-lg flex items-center justify-center disabled:bg-green-300"
                    >
                        {isLoading ? <SpinnerIcon /> : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Confirmation View Component
const ConfirmationView = ({ onNewOrder }) => {
    return (
        <div className="text-center py-16 max-w-2xl mx-auto">
            <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="mt-4 text-3xl font-bold text-gray-800">Order Confirmed!</h1>
            <p className="mt-2 text-lg text-gray-600">Thank you for your purchase. Your fresh hydroponic veggies are on their way!</p>
            <button onClick={onNewOrder} className="mt-8 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300">
                Place Another Order
            </button>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [products] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products'); // 'products', 'cart', 'checkout', 'confirmation'
  
  // Cart manipulation functions
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };
  
  // Navigation and Order handling
  const handleConfirmOrder = async (orderData) => {
    if (!db) {
        console.error("Firestore is not initialized!");
        throw new Error("Database connection failed.");
    }
    // Add a timestamp and status to the order
    const fullOrder = {
        ...orderData,
        createdAt: serverTimestamp(),
        status: 'new' // You can use this status to track orders
    };
    
    // Save the order to the 'orders' collection in Firestore
    const docRef = await addDoc(collection(db, "orders"), fullOrder);
    console.log("Order saved with ID: ", docRef.id);

    // If saving is successful, proceed to confirmation
    setView('confirmation');
    clearCart();
  };
  
  const handleNewOrder = () => {
      setView('products');
  };

  const contextValue = {
    products,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
  };

  const renderView = () => {
    switch (view) {
      case 'cart':
        return <CartView onCheckout={() => setView('checkout')} onBack={() => setView('products')} />;
      case 'checkout':
        return <CheckoutView onConfirmOrder={handleConfirmOrder} onBack={() => setView('cart')} />;
      case 'confirmation':
        return <ConfirmationView onNewOrder={handleNewOrder} />;
      case 'products':
      default:
        return <ProductList />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="bg-gray-50 min-h-screen font-sans">
        <Header onCartClick={() => setView('cart')} onHomeClick={() => setView('products')} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderView()}
        </main>
        <footer className="bg-white mt-12 py-6">
            <div className="text-center text-gray-500">
                &copy; {new Date().getFullYear()} HydroFresh Farms. All Rights Reserved.
            </div>
        </footer>
      </div>
    </AppContext.Provider>
  );
}
