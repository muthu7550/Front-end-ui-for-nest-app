"use client";

import { jwtDecode } from "jwt-decode";
import { Row, Col, Card, Form, Button, Badge } from "react-bootstrap";

export default function UserForm({triggerGlobalRefresh}) {

 async function fetchData(data) {
    const token = localStorage.getItem("access_token");

    const responce = await fetch("https://front-end-ui-for-nest-app.vercel.app//users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if(responce.status === 401){
      const refreshData = await RefreshToken()
      const newtoken = localStorage.getItem("access_token")
      console.log(newtoken)
      if(refreshData){
         const responce = await fetch("https://front-end-ui-for-nest-app.vercel.app//users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newtoken}`,
      },
      body: JSON.stringify(data),
    });
      }
    }
    
    console.log(responce)
 }

   const getUserIdFromToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.id; 
    } catch (err) {
      console.error("Token decoding failed:", err);
      return null;
    }
  };

  // 2. The Core Refresh Token Interceptor Worker
  const RefreshToken = async () => {
    const userId = getUserIdFromToken();
    const refreshToken = localStorage.getItem("refresh_token");
    if (!userId || !refreshToken) {
      console.warn("Session context missing. Force re-authentication.");
      return false;
    }

    try {
      const response = await fetch("https://front-end-ui-for-nest-app.vercel.app//auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          refresh_token: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data,"responcee")

        // Store the brand-new token pairs securely
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        console.log("Tokens rotated successfully.");
        return true;
      } else {
        console.error("Refresh token invalid or expired.");
        return false;
      }
    } catch (error) {
      console.error("Network crash during token exchange:", error);
      return false;
    }
  };
  
  async function handleSubmit(formData) {
    // FIX: Extract fields using their matching name attribute
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      status: formData.get("status"),
      address: formData.get("address"),
    };

    await fetchData(data)
    

    triggerGlobalRefresh()

    console.log(data, "form entries mapped successfully!");

  }

  return (
    <Row className="g-4">
      <Col lg={8}>
        <Card className="bg-dark border-secondary text-white shadow">
          <Card.Header className="border-secondary">
            <h4 className="mb-0">Create User</h4>
          </Card.Header>

          <Card.Body>
            <Form action={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      name="fullName"
                      placeholder="Enter full name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Enter email"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="Enter password"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      name="phone"
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select name="role">
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status">
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Blocked">Blocked</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      name="address"
                      as="textarea"
                      rows={4}
                      placeholder="Enter full address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="warning" className="fw-bold me-2" type="submit">
                Save User
              </Button>

              <Button variant="outline-light" type="reset">
                Clear
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4}>
        <Card className="bg-black border-secondary text-white shadow h-100">
          <Card.Body>
            <Badge bg="warning" text="dark" className="mb-3">
              NestJS Route Mapping
            </Badge>
            <h4>Connect this form with:</h4>
            <div className="mt-3">
              <p>
                <Badge bg="success">POST</Badge> /users
              </p>
              <p>
                <Badge bg="primary">GET</Badge> /users
              </p>
              <p>
                <Badge bg="info">GET</Badge> /users/:id
              </p>
              <p>
                <Badge bg="warning" text="dark">
                  PATCH
                </Badge>{" "}
                /users/:id
              </p>
              <p>
                <Badge bg="danger">DELETE</Badge> /users/:id
              </p>
              <p>
                <Badge bg="success">POST</Badge> /auth/login
              </p>
              <p>
                <Badge bg="primary">GET</Badge> /auth/profile
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
