"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, signup, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      let success: boolean
      if (isSignup) {
        success = await signup(username, password)
        if (!success) {
          setError('Username already exists')
        }
      } else {
        success = await login(username, password)
        if (!success) {
          setError('Invalid username or password')
        }
      }

      if (success) {
        router.push('/dashboard')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px]" />
      
      {/* Back Link */}
      <div className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 glow-green">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignup 
                ? 'Start trading with AI-powered insights' 
                : 'Sign in to access your dashboard'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="space-y-4">
              {/* Test Credentials Notice */}
              {!isSignup && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    Test credentials: <span className="font-mono">admin / 12345</span>
                  </p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 placeholder:text-muted-foreground/50"
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 pr-12 placeholder:text-muted-foreground/50"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 glow-green transition-all duration-300 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isSignup ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </Button>

              {/* Toggle Auth Mode */}
              <p className="text-sm text-muted-foreground text-center pt-2">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup)
                    setError('')
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {isSignup ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
