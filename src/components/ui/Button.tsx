import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'pill'
  size?: 'sm' | 'md'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const cls = [
      styles.btn,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      className,
    ].filter(Boolean).join(' ')

    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
