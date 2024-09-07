import { useElements, useStripe } from "@stripe/react-stripe-js";
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { orderCompleted } from "../../slices/cartSlice";
import { validateShipping } from "./Shipping";
import {createOrder} from '../../actions/orderActions';
import { clearError as clearOrderError } from "../../slices/orderSlice";

export default function Payment() {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [orderInfo, setOrderInfo] = useState(JSON.parse(sessionStorage.getItem('orderInfo')) || {});
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    const { user } = useSelector(state => state.authState);
    const { items: cartItems, shippingInfo } = useSelector(state => state.cartState);
    const {error : orderError} = useSelector(state => state.orderState);

    const paymentData = {
        amount: Math.round((orderInfo.totalPrice || 0) * 100),
        shipping: {
            name: user.name,
            address: {
                city: shippingInfo.city,
                postal_code: shippingInfo.postalCode,
                country: shippingInfo.country,
                state: shippingInfo.state,
                line1: shippingInfo.address
            },
            phone: shippingInfo.phoneNo
        }
    };

    const order = {
        orderItems: cartItems,
        shippingInfo,
        itemsPrice: orderInfo.itemsPrice || 0,
        shippingPrice: orderInfo.shippingPrice || 0,
        taxPrice: orderInfo.taxPrice || 0,
        totalPrice: orderInfo.totalPrice || 0
    };


    useEffect(() => {
        validateShipping(shippingInfo, navigate)
        if(orderError) {
            toast(orderError, {
                position: "bottom-center",
                    theme: "dark",
                    type: 'error',
                onOpen: ()=> { dispatch(clearOrderError()) }
            })
            return
        }

    },[])
    useEffect(() => {
        if (paymentSuccess) {
            navigate('/order/success');
        }
    }, [paymentSuccess, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        document.querySelector('#pay_btn').disabled = true;
        try {
            const { data } = await axios.post('/api/v1/payment/process', paymentData);
            const clientSecret = data.client_secret;
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: user.name,
                        email: user.email
                    }
                }
            });

            console.log('Stripe Result:', result); // Debugging line

            if (result.error) {
                toast(result.error.message, {
                    position: "bottom-center",
                    theme: "dark",
                    type: 'error',
                });
                document.querySelector('#pay_btn').disabled = false;
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                toast('Payment Success!', {
                    position: "bottom-center",
                    theme: "dark",
                    type: 'success',
                });
                order.paymentInfo = {
                    id: result.paymentIntent.id,
                    status: result.paymentIntent.status
                };
                dispatch(orderCompleted()); // Ensure order is passed to the action
                setPaymentSuccess(true); // Set payment success state to trigger redirection
                dispatch(createOrder(order));
            } else {
                toast('Please Try again!', {
                    position: "bottom-center",
                    theme: "dark",
                    type: 'warning',
                });
                document.querySelector('#pay_btn').disabled = false;
            }
        } catch (error) {
            toast('An error occurred while processing the payment. Please try again.', {
                position: "bottom-center",
                theme: "dark",
                type: 'error',
            });
            console.error(error); // Log error for debugging
            document.querySelector('#pay_btn').disabled = false;
        }
    };

    return (
        <div className="row wrapper">
            <div className="col-10 col-lg-5">
                <form onSubmit={submitHandler} className="shadow-lg">
                    <h1 className="mb-4">Card Info</h1>
                    <div className="form-group">
                        <label htmlFor="card_num_field">Card Number</label>
                        <CardNumberElement
                            type="text"
                            id="card_num_field"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="card_exp_field">Card Expiry</label>
                        <CardExpiryElement
                            type="text"
                            id="card_exp_field"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="card_cvc_field">Card CVC</label>
                        <CardCvcElement
                            type="text"
                            id="card_cvc_field"
                            className="form-control"
                        />
                    </div>
                    <button
                        id="pay_btn"
                        type="submit"
                        className="btn btn-block py-3"
                    >
                        Pay - { ` $${orderInfo.totalPrice || 0}` }
                    </button>
                </form>
            </div>
        </div>
    );
}
