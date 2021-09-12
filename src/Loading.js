import logo from './logo.svg';
import './Loading.css';

function Loading() {
  return (
    <div className="loading">
      <header className="loading-header">
        <img src={logo} className="loading-logo" alt="logo" />
        <p>Loading . . .</p>
      </header>
    </div>
  );
}

export default Loading;
