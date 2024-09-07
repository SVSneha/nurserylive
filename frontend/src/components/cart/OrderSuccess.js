import React from 'react';
import { Link } from 'react-router-dom';

export default function OrderSuccess() {
    return (
        <div className="row justify-content-center">
            <div className="col-6 mt-5 text-center">
                <h2>Your Order has been placed successfully.</h2>
                <Link to="/orders" className="btn btn-primary mt-3">Go to Orders</Link>
            </div>
        </div>
    );
}
