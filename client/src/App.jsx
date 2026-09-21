import { Routes, Route, Link } from "react-router-dom";
import CollectionList from "./pages/CollectionList.jsx";
import WhiskeyDetail from "./pages/WhiskeyDetail.jsx";
import WhiskeyForm from "./pages/WhiskeyForm.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">
          🥃 WhiskeyApp
        </Link>
        <Link to="/new" className="btn btn-primary">
          + Add Whiskey
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CollectionList />} />
          <Route path="/new" element={<WhiskeyForm mode="create" />} />
          <Route path="/whiskey/:id" element={<WhiskeyDetail />} />
          <Route path="/whiskey/:id/edit" element={<WhiskeyForm mode="edit" />} />
        </Routes>
      </main>
    </div>
  );
}
