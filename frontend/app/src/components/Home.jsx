import React ,{useState,useEffect} from "react";
// import products from "../products";
import { Row, Col } from "react-bootstrap";
import ProductScreen from "./screens/ProductScreen";
// import axios from 'axios'
import {useDispatch,useSelector} from 'react-redux'
import { listProducts } from "../actions/productAction";
import Loader from "./Loader";
function Home() {
// const [products,setproducts]=useState([]);
const dispatch=useDispatch();
const productList=useSelector((state)=>state.productList)

const {loading,error,products}=productList
useEffect(()=>{
dispatch(listProducts())
},[dispatch])
  return (
    <div>
      <h1 className="text-center mt-2">Latest Products</h1>

      {
        loading?(
          <Loader/>
        ):error?(
          <h1>Error ocuured while loading data:{error}</h1>
        ):(
          <Row>
        {products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} xl={4}>
            <ProductScreen product={product} />
          </Col>
        ))}
      </Row>
        )

      }
    </div>
  );
}

export default Home;
