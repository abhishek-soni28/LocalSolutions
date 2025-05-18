import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: posts, loading, error } = useApi('/posts');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0
  });

  useEffect(() => {
    if (posts) {
      setStats({
        totalPosts: posts.length,
        totalComments: posts.reduce((acc, post) => acc + post.comments.length, 0),
        totalLikes: posts.reduce((acc, post) => acc + post.likes.length, 0)
      });
    }
  }, [posts]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Container className="mt-4">
      <h2>Welcome, {user?.username}!</h2>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Posts</Card.Title>
              <Card.Text className="display-4">{stats.totalPosts}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Comments</Card.Title>
              <Card.Text className="display-4">{stats.totalComments}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Likes</Card.Title>
              <Card.Text className="display-4">{stats.totalLikes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 