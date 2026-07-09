"use client";

import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function EditUserModal({ show, handleClose, userToEdit, onSave, triggerGlobalRefresh }) {
  const [fullName, setName] = useState(userToEdit?.fullName || "");
  const [email, setEmail] = useState(userToEdit?.email || "");
  const [role, setRole] = useState(userToEdit?.role || "User");
  const [status, setStatus] = useState(userToEdit?.status || "Active");
  const [address, setAddress] = useState(userToEdit?.address || "");
  const [phone, setphone] = useState(userToEdit?.phone || "");


  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedUser = {
      id: userToEdit?._id || userToEdit?.id, 
      fullName,
      email,
      role,
      status,
      address,
      phone
    };

    onSave(updatedUser); 
    triggerGlobalRefresh()
    handleClose(); 
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      contentClassName="bg-dark text-white border-secondary shadow"
    >
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title>Edit User Profile</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fullName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="bg-black text-white border-secondary"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-black text-white border-secondary"
                  required
                />
              </Form.Group>

                <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="number"
                  value={phone}
                  onChange={(e) => setphone(e.target.value)}
                  placeholder="6382429830"
                  className="bg-black text-white border-secondary"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-black text-white border-secondary"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-black text-white border-secondary"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Blocked">Blocked</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete current address"
                  className="bg-black text-white border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-secondary">
          <Button variant="outline-light" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="warning" type="submit" className="fw-bold">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
