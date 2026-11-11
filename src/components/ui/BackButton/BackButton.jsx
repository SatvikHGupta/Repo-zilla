import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button.jsx';

// goes back inside the app when there is history to go back to, otherwise to `fallback` (for visitors who landed on this page directly).
// It is a boxed button (a border and a fill), so it reads as a control on every page.
export default function BackButton({ fallback = '/', children = 'Back' }) {
  const navigate = useNavigate();
  const { key } = useLocation();
  return <Button variant="secondary" size="sm" icon="arrowLeft" onClick={() => (key !== 'default' ? navigate(-1) : navigate(fallback))}>{children}</Button>;
}
