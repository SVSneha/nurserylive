import { Fragment, useEffect, useState } from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { getProducts } from '../actions/productsActions';
import MetaData from './layout/MetaData';
import Loader from './layout/Loader';
import Product from './product/product';
import Pagination from 'react-js-pagination';


export default function Home() {
    const dispatch=useDispatch();
    const {products, loading, productsCount,resPerPage } = useSelector((state)=> state.productsState)
    const [currentPage, setCurrentPage] = useState(1);
   

    const setCurrentPageNo =(pageNo) =>{

        setCurrentPage(pageNo)
    }


    useEffect(()=> {
    
     dispatch( getProducts(null,null,null,null,currentPage))   
    },[dispatch])
    return (
        <Fragment>
            {loading ? <Loader />:
        <Fragment>
            <MetaData title={'Buy Best Products'} />
            <h1 id="products_heading">Latest Products</h1>

            <section id="products" className="container mt-5">
                <div className="row">
                    {products && products.map(product =>(
                       <Product col={3} key={product._id} product={product}/>
                    ))}
                 

                </div>
            </section>
            {productsCount > 0 && productsCount  >  resPerPage ?
            <div className='d-flex justify-content-center mt-5'>
                <Pagination
                activePage={currentPage}
                onChange={setCurrentPageNo}
                totalItemsCount={productsCount}
                itemsCountPerPage={resPerPage}
                nextPageText={'Next'}
                firstPageText={'First'}
                lastPageText={'Last'}
                itemClass={'page-item'}
                linkClass={'page-link'}
                />
            </div>:null}
        </Fragment>
        }
        </Fragment>
    );
}
