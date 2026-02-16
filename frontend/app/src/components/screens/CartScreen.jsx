
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Card,
  Container,
  Form,
  Badge,
} from "react-bootstrap";
import Message from "../Message";
import { addToCart, removeFromCart } from "../../actions/cartActions";
import { listProductDetails } from "../../actions/productAction";
import { useDispatch, useSelector } from "react-redux";
function CartScreen({ params }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { cartItems } = cart;
  const productId = id;
  const qty = location.search ? Number(location.search.split("=")[1]) : 1;

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty]);

  const removeFromCartHadle=(id)=>{
    dispatch(removeFromCart(id));
  }
  return (
    <>
      <Row >
        <Col md={8}>
          <Container className="mt-4">
            {cartItems.length === 0 ? (
              <Message variant="info">
                Your Cart is empty <Link to="/"> Go Back </Link>
              </Message>
            ) : (
              <ListGroup variant="flush">
               
                {cartItems.map((item) => (
                  
                  <ListGroup.Item key={item.product}>
                    <Row>
                      <Col md={2}>
                        <Image src={item.image} fluid rounded alt={item.name} />
                      </Col>
                      <Col md={3}>
                        <Link to={`/Product/${item.product}`}>{item.name}</Link>
                      </Col>
                      <Col md={2}>Rs {item.price}</Col>
                      <Col md={1}>
                        <Badge bg="secondary">Qty: {item.qty}</Badge>
                      </Col>
                      <Col md={1}>
                       <Button
                          type="button"
                          variant="light"
                          onClick={() => dispatch(removeFromCart(item.product))}
                        >
                          <i className="fas fa-trash"></i>
                        </Button></Col>
                    </Row>
                  </ListGroup.Item>
                
                ))}
              </ListGroup>
            )}
          </Container>
        </Col>

        <Col md={4}>
        <Card className="mt-4">
          <ListGroup variant="flush">
          <ListGroup.Item className="mt-4">
            <h6>Total qty: ({cartItems.reduce((acc,item)=> acc+item.qty , 0)})</h6>

          </ListGroup.Item>

          <ListGroup.Item className="mt-4">
            <h6>Total price: ({cartItems.reduce((acc,item)=> acc+item.qty * item.price , 0).toFixed(2)})</h6>

          </ListGroup.Item>

          <ListGroup.Item className="mt-4">
            <Button variant="success" type="button" onClick={removeFromCartHadle}><Link to="/checkout">Checkout</Link></Button>

          </ListGroup.Item>
        </ListGroup>
        </Card>
        </Col>
      </Row>
    </>
  );
}

export default CartScreen;
