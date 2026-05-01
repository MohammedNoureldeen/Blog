import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardBody className="py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign Up
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Registration form coming soon.
          </p>
          <div className="text-center">
            <Link to="/login">
              <Button variant="ghost">Already have an account? Login</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
