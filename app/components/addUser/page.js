"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tab,
  Nav,
} from "react-bootstrap";

import StatCards from "./components/StatCards";
import UserTable from "./components/UserTable";
import UserForm from "./components/UserForm";
import ApiPlayground from "./components/ApiPlayground";

export default function AddUserPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
   const [refreshTrigger, setRefreshTrigger] = useState(0); 

    const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container fluid className="min-vh-100 bg-dark text-white py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <Badge bg="warning" text="dark" className="mb-2">
            NestJS Backend Practice
          </Badge>

          <h1 className="fw-bold display-5">
            User Admin Dashboard
          </h1>
        </Col>

      </Row>

      <StatCards key={refreshTrigger} />

      <Card className="border-0 shadow-lg bg-black text-white mt-4">
        <Card.Header className="bg-black border-secondary">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="pills" className="gap-2">
              <Nav.Item>
                <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="create">Create User</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="api">API Playground</Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </Card.Header>

        <Card.Body>
          {activeTab === "dashboard" && <UserTable triggerGlobalRefresh={triggerGlobalRefresh} />}
          {activeTab === "create" && <UserForm  triggerGlobalRefresh={triggerGlobalRefresh} />}
          {activeTab === "api" && <ApiPlayground />}
        </Card.Body>
      </Card>
    </Container>
  );
}