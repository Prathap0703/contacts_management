import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteContact,
  fetchContactById,
  toggleFavorite,
  updateContact
} from "../services/api";
import ContactForm from "../components/ContactForm";

export default function ContactDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchContactById(id);
        setContact(data);
      } catch {
        setError("Failed to load contact.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      const updated = await updateContact(id, payload);
      setContact(updated);
      setSuccess("Contact updated.");
      setTimeout(() => setSuccess(""), 2000);
    } catch {
      setError("Failed to update contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await deleteContact(id);
      navigate("/contacts"); // ✅ FIXED
    } catch {
      setError("Failed to delete contact.");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const updated = await toggleFavorite(id);
      setContact(updated);
    } catch {
      setError("Failed to update favorite.");
    }
  };

  if (loading) {
    return <div className="contact-details-container muted">Loading...</div>;
  }

  if (!contact) {
    return (
      <div className="contact-details-container">
        <div className="alert alert-error">
          Contact not found.
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/contacts")} // ✅ FIXED
          >
            Back to contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-details-container">
      <div className="contact-details-layout">
        <div className="contact-details-header">
          <div>
            <div className="app-title">{contact.name}</div>
            <div className="muted">View and edit contact details</div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/contacts")} 
            >
              Back to contacts
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleToggleFavorite}
            >
              <span
                className={`favorite-star ${
                  contact.isFavorite ? "active" : ""
                }`}
              >
                ★
              </span>
              {contact.isFavorite ? "Unfavorite" : "Favorite"}
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="contact-meta">
          <span>
            <strong>Phone:</strong> {contact.phone}
          </span>
          <span>
            <strong>Email:</strong> {contact.email}
          </span>

          {contact.tags?.length > 0 && (
            <span>
              <strong>Tags:</strong>{" "}
              {contact.tags.map((t) => (
                <span key={t} className="tag-pill">
                  {t}
                </span>
              ))}
            </span>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            Edit contact
          </strong>
          <ContactForm
            initial={contact}
            onSubmit={handleSave}
            submitting={saving}
          />
        </div>
      </div>
    </div>
  );
}
