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

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setPending(true);
      await register(email, password, displayName); // login auto via AuthProvider
    } catch (err: any) {
      setError(err?.message || "Erreur d'inscription");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_35%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Card className="border-border/70 bg-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Créer un compte</CardTitle>
            <CardDescription>Rejoignez Notexia pour écrire sans friction.</CardDescription>
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
                placeholder="Mot de passe (min 8)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Nom affiché (optionnel)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Création...' : 'Créer un compte'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link href="/login" className="ml-2 text-primary hover:text-primary-foreground">
              Se connecter
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
