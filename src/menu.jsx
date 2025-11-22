import { NavLink } from 'react-router-dom';
import './menu.css';

function Menu() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>GMAIL почты</NavLink>
        <NavLink to="/contact">Прокси</NavLink>
      <NavLink to="/about">Резерв почты</NavLink>
      {/* <NavLink to="/check-email">Код Резерв</NavLink> */}
    </nav>
  );
}

export default Menu;