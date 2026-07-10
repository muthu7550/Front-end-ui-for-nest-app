"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Card,
  InputGroup,
} from "react-bootstrap";
import EditUserModal from "./EditUserModal";
import { jwtDecode } from "jwt-decode";

export default function UserTable({ triggerGlobalRefresh }) {
  const [userInfo, setuserInfo] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("Filter by role");
  const [selectedStatus, setSelectedStatus] = useState("Filter by status");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });

  // Inside your main page tracking user lists:
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  async function fetchFilteredUsers(updatedFilters) {
    const token = localStorage.getItem("access_token");

    // Format the payload exactly how your backend expects it
    const payload = {
      role: updatedFilters.role || undefined,
      status: updatedFilters.status || undefined,
    };

    try {
      const response = await fetch("https://front-end-ui-for-nest-app.vercel.app//users/filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (response.status === 401) {
        console.warn(
          "Access token expired (401). Triggering token rotation handler...",
        );
        const isRefreshed = await RefreshToken();

        const newToken = localStorage.getItem("access_token");

        const response = await fetch("https://front-end-ui-for-nest-app.vercel.app//users/filter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify(payload),
        });

        const refreshdata = await response.json();

        setuserInfo(refreshdata || []);
        return;

        if (response.ok) {
          if (triggerGlobalRefresh) triggerGlobalRefresh();
        }
      }

      setuserInfo(res || []);

      console.log("Filtered Results:", res);
    } catch (error) {
      console.error("Filter request failed:", error);
    }
  }

  const handleSaveUser = async (updatedData) => {
    console.log(updatedData, "updteddata");
    const token = localStorage.getItem("access_token");
    console.log;

    try {
      const response = await fetch(
        `https://front-end-ui-for-nest-app.vercel.app//users/${updatedData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        },
      );
      const res = await response.json();

      if (response.status === 401) {
        console.warn(
          "Access token expired (401). Triggering token rotation handler...",
        );
        const isRefreshed = await RefreshToken();

        const newToken = localStorage.getItem("access_token");

        const response = await fetch(
          `https://front-end-ui-for-nest-app.vercel.app//users/${updatedData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(updatedData),
          },
        );

        if (triggerGlobalRefresh) triggerGlobalRefresh();
      }

      fetchData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.id; // Extracts the stored MongoDB user _id
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

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    console.log(token);

    try {
      let response = await fetch("https://front-end-ui-for-nest-app.vercel.app//users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await response.json();

      if (response.status === 401) {
        console.warn(
          "Access token expired (401). Triggering token rotation handler...",
        );
        alert("dd");

        const isRefreshed = await RefreshToken();

        if (isRefreshed) {
          const newToken = localStorage.getItem("access_token");

          const response = await fetch("https://front-end-ui-for-nest-app.vercel.app//users", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
          });

      const res = await response.json();

          const safeData = Array.isArray(res) ? res : [];
          console.log(safeData, "dsfdsd");

          setuserInfo(safeData);
        } else {
          localStorage.clear();
          setuserInfo([]);
          alert("Your session has expired. Please log in again.");
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }
      console.log(res, "res");
      const safeData = Array.isArray(res) ? res : [];

      setuserInfo(safeData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusVariant = (status) => {
    if (status === "Active") return "success";
    if (status === "Blocked") return "danger";
    return "warning";
  };

  const handleDelete = async (user) => {
    const token = localStorage.getItem("access_token");

    try {
      let response = await fetch(`https://front-end-ui-for-nest-app.vercel.app//users/${user._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response);

      const res = await response.json();

      if (response.status === 401) {
        console.warn(
          "Access token expired (401). Triggering token rotation handler...",
        );
        const isRefreshed = await RefreshToken();

        const newToken = localStorage.getItem("access_token");

        let response = await fetch(`https://front-end-ui-for-nest-app.vercel.app//users/${user._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        });

        // setuserInfo((prevItems) =>
        //   prevItems.filter((item) => item._id !== user._id),
        // );
      }
      await fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  async function handleRoleChange(e) {
    const newRole = e.target.value;
    console.log(newRole, "selected role");

    const newFilters = { ...filters, role: newRole };
    setFilters(newFilters);
    await fetchFilteredUsers(newFilters);
  }

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    console.log(newStatus, "selected status");

    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    await fetchFilteredUsers(newFilters);
  }

  async function handleSearch(e) {
    const search = e.target.value;

    if (search.length < 3 && search.length !== 0) {
      return;
    }
    const token = localStorage.getItem("access_token");
    console.log("token", token);

    const response = await fetch(
      `https://front-end-ui-for-nest-app.vercel.app//users/search?name=${search}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const res = await response.json();

    if (response.status === 401) {
      console.warn(
        "Access token expired (401). Triggering token rotation handler...",
      );
      const isRefreshed = await RefreshToken();

      const newToken = localStorage.getItem("access_token");

      const response = await fetch(
        `https://front-end-ui-for-nest-app.vercel.app//users/search?name=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        },
      );
      if (response.ok) {
        if (triggerGlobalRefresh) triggerGlobalRefresh();
      }
      const res = await response.json();

      setuserInfo(res);
      return;
    }

    setuserInfo(res);
  }

  const handleResetAll = () => {
    setSearchTerm("");
    setSelectedRole("Filter by role");
    setSelectedStatus("Filter by status");
    fetchData();
  };

  return (
    <>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e);
              }}
            />
          </InputGroup>
        </Col>

        <Col md={3}>
          <Form.Select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              handleRoleChange(e);
            }}
          >
            <option value="">Filter by role</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleStatusChange(e);
            }}
          >
            <option value="">Filter by status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
            <option value="Pending">Pending</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Button
            variant="outline-light"
            className="w-100"
            onClick={handleResetAll}
          >
            Reset
          </Button>
        </Col>
      </Row>

      <Card className="bg-dark border-secondary shadow">
        <Card.Body>
          <Table responsive hover variant="dark" className="align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Address</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody style={{ maxHeight: "100px" }}>
              {userInfo.length === 0 ? (
                <>
                  <tr>
                    <td colSpan="7" className="text-center p-5">
                      No Data Available
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  {userInfo.map((user, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 42, height: 42 }}
                          >
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold">{user.fullName}</div>
                            <small className="text-white-50">
                              User ID #{user.userid ?? 1420 + index}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <Badge bg="primary">{user.role}</Badge>
                      </td>

                      <td>
                        <Badge bg={getStatusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </td>

                      <td>{user.address}</td>

                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-warning"
                          className="me-2"
                          onClick={() => {
                            handleEditClick(user);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            handleDelete(user);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {showModal && (
        <EditUserModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          userToEdit={selectedUser}
          onSave={handleSaveUser}
          triggerGlobalRefresh={triggerGlobalRefresh}
        />
      )}
    </>
  );
}
