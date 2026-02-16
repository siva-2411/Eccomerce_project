import React from "react";
import { Navbar, Container, Nav , NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./Loader";
import Message from "./Message";
import { logout } from "../actions/userActions";

function Header() {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const dispatch = useDispatch();


  const handlelogout=()=>{
    dispatch(logout())
  }

  return (
    <Navbar bg="dark" variant="dark" collapseOnSelect>
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Ecommerce Shop</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/cart">
              <Nav.Link>Cart</Nav.Link>
            </LinkContainer>

            {/* Remove checkout if not used */}
            <LinkContainer to="/checkout">
              <Nav.Link>Checkout</Nav.Link>
            </LinkContainer>

            {userInfo ? (
              <LinkContainer to="/">
                
               <NavDropdown
                id="nav-dropdown-dark-example"
                title={userInfo.name} 
                menuVariant="dark"
              >
              
                <NavDropdown.Item href="#action/3.1" onClick={handlelogout}>logout</NavDropdown.Item>
              </NavDropdown>
              </LinkContainer>
             
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/signup">
                  <Nav.Link>SignUp</Nav.Link>
                </LinkContainer>
              </>
            )}
            {userInfo && userInfo.isAdmin &&  (
              <NavDropdown title='Admin' id="adminmenu">
                <LinkContainer to="/admin/userList">
                <NavDropdown.Item>
                  Users
                </NavDropdown.Item>
                </LinkContainer>

                <LinkContainer to="/admin/productList">
                <NavDropdown.Item>
                  Products
                </NavDropdown.Item>
                </LinkContainer>

                <LinkContainer to="/admin/orderList">
                <NavDropdown.Item>
                 Orders
                </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            )} 
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
