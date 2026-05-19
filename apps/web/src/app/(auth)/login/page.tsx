'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginSchema, type LoginInput } from '@continue/validation'
import { authApi } from '@/lib/api/auth'
import { ApiClientError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    try {
      const result = await authApi.login(data)
      login(result)
      router.push('/')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.body.message as string)
      } else {
        setServerError('Something went wrong. Try again.')
      }
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link href="/" className="auth-card__brand">Continue</Link>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
          {/* Server error */}
          {serverError && (
            <div className="auth-form__error" role="alert">
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={cn('form-input', errors.email && 'form-input--error')}
              {...register('email')}
            />
            {errors.email && (
              <p className="form-error" role="alert">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={cn('form-input form-input--with-icon', errors.password && 'form-input--error')}
                {...register('password')}
              />
              <button
                type="button"
                className="form-input-icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error" role="alert">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-form__submit"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="spin" aria-hidden="true" /> Signing in…</>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          No account?{' '}
          <Link href="/register" className="auth-card__link">Create one</Link>
        </p>
      </div>
    </main>
  )
}
