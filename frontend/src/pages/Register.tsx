import React, { useState } from 'react';
import { useRegister } from '../features/auth/queries';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-700">Tevli</h1>
      </div>
      <Card className="max-w-sm w-full p-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <p className="text-sm text-center text-gray-500 mt-2">Enter your details below to get started</p>
        </CardHeader>
        <CardContent>
          {registerMutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-100">
              {registerMutation.error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Prem"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating...' : 'Register'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-700 font-medium hover:underline">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
