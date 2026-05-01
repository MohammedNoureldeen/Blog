import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardBody className="py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Login
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Login form coming soon.
          </p>
          <div className="text-center">
            <Link to="/register">
              <Button variant="ghost">Don't have an account? Sign up</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
