import { useState, useEffect } from "react";
import "../styles/reminder.css";

export default function InterviewReminder() {
  const [interviews, setInterviews] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [editEmail, setEditEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    date: "",
    email: ""
  });

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email) {
      setUserEmail(user.email);
      setForm((prev) => ({ ...prev, email: user.email }));
    }

    const saved = JSON.parse(localStorage.getItem("interviews")) || [];
    setInterviews(saved);
  }, []);

  /* ================= ADD INTERVIEW ================= */
  const addInterview = async () => {
    if (!form.company || !form.date) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/add-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      console.log("Backend response:", data);

    } catch (error) {
      console.log("Backend not connected or route missing");
    }

    const updated = [...interviews, form];
    setInterviews(updated);
    localStorage.setItem("interviews", JSON.stringify(updated));

    setForm({
      company: "",
      role: "",
      date: "",
      email: userEmail
    });

    setEditEmail(false);
    setLoading(false);
  };

  /* ================= DELETE ================= */
  const deleteInterview = (index) => {
    const updated = interviews.filter((_, i) => i !== index);
    setInterviews(updated);
    localStorage.setItem("interviews", JSON.stringify(updated));
  };

  /* ================= DAYS LEFT ================= */
  const getDaysLeft = (date) => {
    const today = new Date();
    const interviewDate = new Date(date);
    const diffTime = interviewDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="reminder-page">
      <div className="reminder-card-main">
        <h2>📅 Interview Reminder System</h2>

        <div className="form-grid">

          <input
            placeholder="Company Name *"
            value={form.company}
            onChange={(e) =>
              setForm({ ...form, company: e.target.value })
            }
          />

          <input
            placeholder="Role / Position"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />

        </div>

        <div className="email-section">

          {!editEmail ? (
            <>
              <p>
                📧 Reminder will be sent to:
                <strong> {form.email}</strong>
              </p>

              <button
                className="change-email-btn"
                onClick={() => setEditEmail(true)}
              >
                Change Email
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <button
                className="save-email-btn"
                onClick={() => setEditEmail(false)}
              >
                Save Email
              </button>
            </>
          )}

        </div>

        <button
          className="add-btn"
          onClick={addInterview}
          disabled={loading}
        >
          {loading ? "Sending..." : "Add Reminder"}
        </button>

        <div className="reminder-list">
          {interviews.length === 0 && (
            <p className="empty-text">
              No interviews scheduled yet.
            </p>
          )}

          {interviews.map((i, index) => {
            const daysLeft = getDaysLeft(i.date);

            return (
              <div key={index} className="reminder-card">
                <div className="reminder-header">
                  <h4>{i.company}</h4>

                  <span
                    className={`badge ${
                      daysLeft <= 2
                        ? "urgent"
                        : daysLeft <= 7
                        ? "upcoming"
                        : "normal"
                    }`}
                  >
                    {daysLeft >= 0
                      ? `${daysLeft} days left`
                      : "Completed"}
                  </span>
                </div>

                <p className="role-text">{i.role}</p>
                <p className="date-text">
                  📆 Interview Date: {i.date}
                </p>

                <p className="email-text">
                  📧 Reminder sent to: {i.email}
                </p>

                <button
                  className="delete-btn"
                  onClick={() => deleteInterview(index)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}