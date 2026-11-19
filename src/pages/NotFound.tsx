import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="board flex min-h-screen items-center justify-center px-6">
      <div className="note note-tilt-left max-w-sm px-8 py-10 text-center">
        <div className="pin" />
        <h1 className="font-marker mb-3 text-6xl">404</h1>
        <p className="mb-5 text-xl">Oops! Page not found</p>
        <Link to="/" className="chip chip-dark">
          Back to the board
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
