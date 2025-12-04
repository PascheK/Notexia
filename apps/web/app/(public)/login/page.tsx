"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setPending(true);
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Card className="border-border/70 bg-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Connexion</CardTitle>
            <CardDescription>Retrouvez vos notes Notexia en mode SaaS dark.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submit}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Pas de compte ?{' '}
            <Link href="/register" className="ml-2 text-primary hover:text-primary-foreground">
              S’inscrire
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
