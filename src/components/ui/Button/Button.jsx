import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import styles from './Button.module.css';

const cls = (...a) => a.filter(Boolean).join(' ');

// variant: primary | secondary | ghost. Renders a <Link> when `to` is set, an <a> when `href` is set, otherwise a <button>.
export const Button = forwardRef(function Button({ variant = 'secondary', size = 'md', icon, iconRight, to, href, className, children, ...rest }, ref) {
  const c = cls(styles.btn, styles[variant], size !== 'md' && styles[size], className);
  const px = size === 'sm' ? 15 : 17;
  const inner = (<>{icon && <Icon name={icon} size={px} />}{children && <span>{children}</span>}{iconRight && <Icon name={iconRight} size={px} />}</>);
  if (to) return <Link ref={ref} className={c} to={to} {...rest}>{inner}</Link>;
  if (href) return <a ref={ref} className={c} href={href} {...rest}>{inner}</a>;
  return <button ref={ref} type="button" className={c} {...rest}>{inner}</button>;
});

// square icon-only control; `label` is required because there is no visible text
export const IconButton = forwardRef(function IconButton({ icon, label, size = 'md', variant = 'ghost', to, href, className, active, ...rest }, ref) {
  const c = cls(styles.iconBtn, styles[variant], size !== 'md' && styles['i' + size], active && styles.active, className);
  const inner = <Icon name={icon} size={size === 'sm' ? 16 : 18} />;
  if (to) return <Link ref={ref} className={c} to={to} aria-label={label} title={label} {...rest}>{inner}</Link>;
  if (href) return <a ref={ref} className={c} href={href} aria-label={label} title={label} {...rest}>{inner}</a>;
  return <button ref={ref} type="button" className={c} aria-label={label} title={label} aria-pressed={active === undefined ? undefined : !!active} {...rest}>{inner}</button>;
});
