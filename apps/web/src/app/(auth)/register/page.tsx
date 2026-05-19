'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@continue/validation'
import { authApi } from '@/lib/api/auth'
import { ApiClientError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    try {
      const result = await authApi.register(data)
      localStorage.setItem('access_token', result.accessToken)
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
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__subtitle">Start your gaming journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
          {serverError && (
            <div className="auth-form__error" role="alert">{serverError}</div>
          )}

          {/* Username */}
          <div className="form-field">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={cn('form-input', errors.username && 'form-input--error')}
              {...register('username')}
            />
            {errors.username && (
              <p className="form-error" role="alert">{errors.username.message}</p>
            )}
          </div>

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
                autoComplete="new-password"
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

          <button type="submit" disabled={isSubmitting} className="auth-form__submit">
            {isSubmitting ? (
              <><Loader2 size={16} className="spin" aria-hidden="true" /> Creating account…</>
            ) : 'Create account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-card__link">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
