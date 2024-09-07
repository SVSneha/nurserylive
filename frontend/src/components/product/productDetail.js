import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProduct } from '../../actions/productsActions';
import Loader from '../layout/Loader';
import { Carousel, Modal } from 'react-bootstrap';
import MetaData from '../layout/MetaData';
import { addCartItem } from "../../actions/cartActions";
import { createReview } from "../../actions/productsActions";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearReviewSubmitted } from "../../slices/productSlice";
import { clearError ,clearProduct} from "../../slices/productSlice";
import ProductReview from "./ProductReview"

export default function ProductDetail() {
    const { loading, product={}, isReviewSubmitted,error } = useSelector((state) => state.productState);
    const {user} = useSelector(state => state.authState);
    const dispatch = useDispatch();
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [show, setShow] = useState(false);
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

   
    const reviewHandler = () => {
        const formData = new FormData();
        formData.append('rating', rating);
        formData.append('comment', comment);
        formData.append('productId', id);
        dispatch(createReview(formData));
    };

    const handleAddToCart = () => {
        dispatch(addCartItem(product._id, quantity));
        toast.success('Item added to cart successfully!', {
            position: "bottom-center",
            theme: "dark",
        });
    };
    
    const increaseQty = () => {
        if (product.stock === 0 || quantity >= product.stock) return;
        setQuantity(prevQty => prevQty + 1);
    };

   
    const decreaseQty = () => {
        if (quantity === 1) return;
        setQuantity(prevQty => prevQty - 1);
    };

    useEffect(() => {
        if (isReviewSubmitted) {
            handleClose();
            toast.success('Review submitted successfully!', {
                position: "bottom-center",
                theme: "dark",
                onOpen: () => dispatch(clearReviewSubmitted())
            });
        }
        if (error) {
            toast.success(error, {
                position: "bottom-center",
                theme: "dark",
                type: "error",
                onOpen: () => dispatch(clearError())
            });
            return;
        }
        if(!product._id || isReviewSubmitted){
            dispatch(getProduct(id));
        }

        return () => {
            dispatch(clearProduct())
        }

    }, [dispatch, id, isReviewSubmitted,error]);

    if (loading) return <Loader />;

    return (
        <Fragment>
            <ToastContainer />
            <MetaData title={product?.name || "Product Details"} />
            <div className="container container-fluid">
                <div className="row f-flex justify-content-around">
                    <div className="col-12 col-lg-5 img-fluid" id="product_image">
                        <Carousel pause="hover">
                            {product?.images?.map(image => (
                                <Carousel.Item key={image._id}>
                                    <img className="d-block w-100" src={image.image} alt={product.name} height="500" width="500" />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>

                    <div className="col-12 col-lg-5 mt-5">
                        <h3>{product?.name}</h3>
                        <p id="product_id">Product # {product?._id}</p>

                        <hr />

                        <div className="rating-outer">
                            <div className="rating-inner" style={{ width: `${(product?.ratings || 0) / 5 * 100}%` }}></div>
                        </div>
                        <span id="no_of_reviews">({product?.numOfReviews || 0}) Reviews</span>

                        <hr />

                        <p id="product_price">${product?.price}</p>
                        <div className="stockCounter d-inline">
                            <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>

                            <input type="number" className="form-control count d-inline" value={quantity} readOnly />

                            <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                        </div>
                        <button type="button" id="cart_btn"
                            disabled={product?.stock === 0}
                            className="btn btn-primary d-inline ml-4"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>

                        <hr />

                        <p>Status: <span className={product?.stock > 0 ? 'greenColor' : 'redColor'} id="stock_status">{product?.stock > 0 ? 'In stock' : 'Out of stock'}</span></p>

                        <hr />

                        <h4 className="mt-2">Description:</h4>
                        <p>{product?.description}</p>
                        <hr />
                        <p id="product_seller" className="mb-3">Sold by: <strong>{product?.seller}</strong></p>

                        {user ?
                        <button onClick={handleShow} id="review_btn" type="button" className="btn btn-primary mt-4">
                            Submit Your Review
                        </button> :
                        <div className="alert alert-danger mt-5"> Login to post Review</div>
}

                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Submit Review</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <ul className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <li
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`star ${star <= rating ? 'orange' : ''}`}
                                            onMouseOver={(e) => e.target.classList.add('yellow')}
                                            onMouseOut={(e) => e.target.classList.remove('yellow')}
                                        >
                                            <i className="fa fa-star"></i>
                                        </li>
                                    ))}
                                </ul>

                                <textarea onChange={(e) => setComment(e.target.value)} name="review" id="review" className="form-control mt-3" />
                                <button disabled={loading} onClick={reviewHandler} aria-label="Close" className="btn my-3 float-right review-btn px-4 text-white">Submit</button>
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
            </div>
            {
                product.reviews && product.reviews.length > 0 ?
                <ProductReview reviews={product.reviews} /> : null
                }
        </Fragment>
    );
}
