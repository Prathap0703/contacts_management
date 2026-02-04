import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchContacts,
  fetchCurrentUser,
  logoutUser,
  createContact,
  toggleFavorite
} from "../services/api";
import ContactForm from "../components/ContactForm";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [me, list] = await Promise.all([
          fetchCurrentUser(),
          fetchContacts()
        ]);
        setUser(me);
        setContacts(list);
      } catch (err) {
        setError("Failed to load contacts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    contacts.forEach((c) => (c.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      const matchesFavorite = !favoriteOnly || c.isFavorite;
      const matchesTag = !tagFilter || (c.tags || []).includes(tagFilter);

      return matchesSearch && matchesFavorite && matchesTag;
    });
  }, [contacts, search, favoriteOnly, tagFilter]);

  const handleAddContact = async (payload) => {
    try {
      setSaving(true);
      const created = await createContact(payload);
      setContacts((prev) => [created, ...prev]);
    } catch (err) {
      alert("Failed to create contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (contact, e) => {
    e.stopPropagation();
    try {
      const updated = await toggleFavorite(contact.id);
      setContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch {
      alert("Failed to update favorite.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <div className="app-title">Dashboard</div>
          <div className="muted">
            Manage your contacts. Each account sees only its own contacts.
          </div>
        </div>
        <div className="top-bar-right">
          {user && (
            <span className="muted">
              Signed in as <strong>{user.email}</strong>
            </span>
          )}
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem"
          }}
        >
          <strong>Add contact</strong>
        </div>
        <ContactForm initial={null} onSubmit={handleAddContact} submitting={saving} />
      </div>

      <div className="card">
        <div className="top-bar">
          <strong>Contacts</strong>
          <div className="contacts-toolbar">
            <input
              type="text"
              placeholder="Search name, phone, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={`chip-toggle ${favoriteOnly ? "active" : ""}`}
              onClick={() => setFavoriteOnly((v) => !v)}
            >
              ★ Favorites only
            </button>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="">All tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="muted">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="muted">No contacts found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Tags</th>
                  <th>Favorite</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contacts/${c.id}`)}
                  >
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>
                      {(c.tags || []).map((t) => (
                        <span key={t} className="tag-pill">
                          {t}
                        </span>
                      ))}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={(e) => handleToggleFavorite(c, e)}
                      >
                        <span
                          className={`favorite-star ${
                            c.isFavorite ? "active" : ""
                          }`}
                        >
                          ★
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

