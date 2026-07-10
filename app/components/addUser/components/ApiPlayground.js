"use client";

import { useState } from "react";
import { Row, Col, Card, Button, Form, Badge } from "react-bootstrap";

export default function ApiPlayground() {
  const [apiResponse, setApiResponse] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [statusText, setStatusText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData) {
    setIsLoading(true);
    setApiResponse(null);
    setStatusCode(null);

    const data = {
      method: formData.get("method"),
      endpoint: formData.get("endpoint"),
      token: formData.getaccess_token,
      requestBody: formData.get("requestBody")
    };

    const token = localStorage.getItem('access_token')

    try {
      const config = {
        method: data.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      };

      if (data.token) {
        config.headers["Authorization"] = `Bearer ${data.token}`;
      }

      if (data.method !== "GET" && data.requestBody) {
        config.body = data.requestBody;
      }

      const response = await fetch(data.endpoint, config);
      
      setStatusCode(response.status);
      setStatusText(response.statusText);

      const resData = await response.json();
      setApiResponse(resData);

    } catch (error) {
      console.error("API Call failed:", error);
      setStatusCode(500);
      setStatusText("Error");
      setApiResponse({ error: error.message || "Failed to establish connection" });
    } finally {
      setIsLoading(false);
    }
  }

  const getBadgeBg = (code) => {
    if (!code) return "secondary";
    if (code >= 200 && code < 300) return "success";
    if (code >= 400 && code < 500) return "danger";
    return "warning";
  };

  return (
    <Row className="g-4">
      <Col lg={5}>
        <Card className="bg-dark border-secondary text-white shadow">
          <Card.Header className="border-secondary">
            <h4 className="mb-0">API Request Tester</h4>
          </Card.Header>

          <Card.Body>
            <Form action={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Method</Form.Label>
                <Form.Select name="method">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Endpoint</Form.Label>
                <Form.Control defaultValue="https://backend-nest-7n6bh4kl7-muthu7550s-projects.vercel.app//users" name="endpoint" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Token</Form.Label>
                <Form.Control placeholder="Bearer token" name="token" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Request Body</Form.Label>
                <Form.Control
                  as="textarea"
                  name="requestBody"
                  rows={8}
                  defaultValue={`{
  "name": "Marimuthu",
  "email": "muthu@gmail.com",
  "password": "123456",
  "role": "admin"
}`}
                />
              </Form.Group>

              <Button variant="warning" className="fw-bold w-100" type="submit" disabled={isLoading}> 
                {isLoading ? "Sending..." : "Send Request"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={7}>
        <Card className="bg-black border-secondary text-white shadow h-100">
          <Card.Header className="border-secondary d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Response Preview</h4>
            {statusCode && (
              <Badge bg={getBadgeBg(statusCode)}>
                {statusCode} {statusText}
              </Badge>
            )}
          </Card.Header>

          <Card.Body>
            <pre className="text-white bg-dark p-4 rounded" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {isLoading ? (
                <span className="text-secondary">Loading api response data...</span>
              ) : apiResponse ? (
                JSON.stringify(apiResponse, null, 2)
              ) : (
                <span className="text-muted">No request executed yet. Click "Send Request" to preview outputs.</span>
              )}
            </pre>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
