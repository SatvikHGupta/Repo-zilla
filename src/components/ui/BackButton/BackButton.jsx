import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button.jsx';

// goes back inside the app when there is history to go back to, otherwise to the home page (for visitors who landed on this page directly)
export default function BackButton({ fallback = '/', children = 'Back' }) {
  const navigate = useNavigate();
  const { key } = useLocation();
  return <Button variant="ghost" size="sm" icon="arrowLeft" onClick={() => (key !== 'default' ? navigate(-1) : navigate(fallback))}>{children}</Button>;
}
