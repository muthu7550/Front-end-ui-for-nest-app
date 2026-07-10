"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, ProgressBar } from "react-bootstrap";

export default function StatCards({key}) {
  const [userData, setUserdata] = useState([]);
  const [activeuser, setActiveuser] = useState([]);

  const stats = [
    {
      title: "Total Users",
      value: userData.total,
      text: "All registered users",
      progress: userData.total*10,
      variant: "primary",
    },
    {
      title: "Active Users",
      value: userData.active,
      text: "Currently active accounts",
      progress: userData.active*10,
      variant: "success",
    },
    {
      title: "Admins",
      value: userData.admin,
      text: "Role based access users",
      progress: userData.admin*10,
      variant: "warning",
    },
    {
      title: "Blocked",
      value: userData.blocked,
      text: "Restricted accounts",
      progress: userData.blocked*10,
      variant: "danger",
    },
  ];
  function activeUser() {
    const data = userData.filter((item) => {
      return console.log(item);
    });

    setActiveuser(data);
  }

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("access_token"); 
      try {
        const response = await fetch("https://backend-nest-7n6bh4kl7-muthu7550s-projects.vercel.app/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const res = await response.json();

         const safeData = Array.isArray(res) ? res : [];

          const counts = safeData.reduce(
          (acc, user) => {
            acc.total++;

            if (user.role === "Admin") {
              acc.admin++;
            }

            if (user.status === "Blocked") {
              acc.blocked++;
            }

            if (user.status === "Active") {
              acc.active++;
            }

            return acc;
          },
          { total: 0, admin: 0, blocked: 0, active: 0 },
        );
        setUserdata(counts);

        console.log("Calculated Counts:", counts);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchData();
  }, [key]);

  return (
    <Row className="g-4">
      {stats.map((item, index) => (
        <Col md={6} xl={3} key={index}>
          <Card
            className="border-0 shadow-lg text-white h-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
              backdropFilter: "blur(10px)",
              transform: "translateY(0)",
              transition: "0.3s",
            }}
          >
            <Card.Body>
              <p className="text-white-50 mb-1">{item.title}</p>
              <h2 className="fw-bold">{item.value}</h2>
              <p className="small text-white-50">{item.text}</p>
              <ProgressBar
                now={item.progress}
                variant={item.variant}
                animated
                striped
              />
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
