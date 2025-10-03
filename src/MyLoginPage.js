import React, { useState } from "react";
import { useLogin, useNotify } from "react-admin";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const MyLoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ username: email, password });
    } catch (error) {
      notify("Invalid email or password", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="vh-100 bg-light d-flex align-items-center justify-content-center"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">THE APP</h3>
                <p className="text-muted mb-2">Start your journey</p>
                <h5 className="fw-semibold">Sign in to The App</h5>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="test@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Form>
              <div className="text-center mt-3 pt-3 border-top">
                <p className="text-muted mb-0">
                  Don't have an account?{" "}
                  <a
                    href="#/register"
                    className="text-decoration-none fw-semibold text-primary"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyLoginPage;
