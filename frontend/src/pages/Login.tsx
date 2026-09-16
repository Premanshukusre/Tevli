import React, { useState } from 'react';
import { useLogin } from '../features/auth/queries';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-700">Tevli</h1>
      </div>
      <Card className="max-w-sm w-full p-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <p className="text-sm text-center text-gray-500 mt-2">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent>
          {loginMutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-100">
              {loginMutation.error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
            />
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-primary-700 font-medium hover:underline">Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
