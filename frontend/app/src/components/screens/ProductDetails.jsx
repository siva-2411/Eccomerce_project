import React, { useState, useEffect } from "react";
import { Link, useParams , useNavigate} from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card, Form } from "react-bootstrap";
import {useDispatch,useSelector} from 'react-redux'
import {listProductDetails} from "../../actions/productAction";
import Loader from "../Loader";

function ProductDetails({params}) {
  const { id } = useParams();
  const dispatch=useDispatch();
  const productDetails=useSelector((state)=>state.productDetails)
  const {loading ,error , product}=productDetails 
  const navigate = useNavigate();
  
  const [qty,setqty]=useState(1)
  
  useEffect(() => {
    dispatch(listProductDetails(id))
  }, [dispatch,id]);

  

    const addTocarthandler=()=>{
      navigate(`/cart/${id}?qty=${qty}`)
    }

  return (
    <>
      <Link to="/" className="btn btn-dark my-3">
        Go Back
      </Link>

      {
        loading?(
          <Loader/>
        ):error?(
          <h1>Error {error}</h1>
        ):(
          <Row>
        <Col md={6}>
          <Image src={product.image} alt={product.name} fluid />
        </Col>

        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              Rating: {product.rating} ({product.numReviews} reviews)
            </ListGroup.Item>
            <ListGroup.Item>
              Description: {product.description}
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Price: ₹{product.price}</h3>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={3}>
          <Card className="p-4">
            <ListGroup variant="flush">
              <ListGroup.Item>
                Status: {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
              </ListGroup.Item>

              {product.countInStock > 0 && (
                <ListGroup.Item>
                  Qty:
                  <Form.Control 
                  as="select"
                  value={qty}
                  onChange={(e)=>setqty(e.target.value)}
                  >
                    {[...Array(product.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </Form.Control>
                </ListGroup.Item>
              )}
               <ListGroup.Item>
                <h6>Category:{product.category}</h6>
              </ListGroup.Item>
               <ListGroup.Item>
                <h6>Rating ⭐:{product.rating}</h6>
              </ListGroup.Item>
              

              <ListGroup.Item>
                <Button className="btn-success" disabled={product.countInStock === 0}
                onClick={addTocarthandler}
                type="button"
                >
                  Add to Cart
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
        )
      }
    </>
  );
}

export default ProductDetails;
