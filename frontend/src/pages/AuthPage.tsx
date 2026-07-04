import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Logo } from "../components/Logo";
import { useAuth } from "../auth/useAuth";

type View = "login" | "signup";

export function AuthPage() {
  const [view, setView] = useState<View>("login");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (view === "login" && (!email || !password)) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }
    if (view === "signup" && (!name || !email || !password)) {
      setError("Completa todos los campos para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      if (view === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/");
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && err.response?.data
          ? extractErrorMessage(err.response.data)
          : null;
      setError(detail ?? "No se pudo completar la operación. Verifica tus datos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-form-side">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
              <Logo />
              <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em", color: "#00318B" }}>
                abrhil
              </div>
            </div>

            {view === "login" ? (
              <>
                <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 6, letterSpacing: "-0.01em" }}>
                  Bienvenida de vuelta
                </div>
                <div style={{ fontSize: 14, color: "#5B6B84", marginBottom: 24 }}>
                  Ingresa tus datos para continuar.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 6, letterSpacing: "-0.01em" }}>
                  Crea tu cuenta
                </div>
                <div style={{ fontSize: 14, color: "#5B6B84", marginBottom: 24 }}>
                  Empieza a gestionar tus proyectos con tu equipo.
                </div>
              </>
            )}

            <form className="form-stack" onSubmit={handleSubmit}>
              {view === "signup" && (
                <div>
                  <div className="field-label">Nombre</div>
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
              )}
              <div>
                <div className="field-label">Correo</div>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                />
              </div>
              <div>
                <div className="field-label">Contraseña</div>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="field-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={submitting} style={{ marginTop: 4 }}>
                {submitting
                  ? "Un momento…"
                  : view === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </button>

              <div style={{ fontSize: 12.5, color: "#5B6B84", textAlign: "center", marginTop: 4 }}>
                {view === "login" ? (
                  <>
                    ¿No tienes cuenta?{" "}
                    <span
                      onClick={() => setView("signup")}
                      style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}
                    >
                      Regístrate
                    </span>
                  </>
                ) : (
                  <>
                    ¿Ya tienes cuenta?{" "}
                    <span
                      onClick={() => setView("login")}
                      style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}
                    >
                      Inicia sesión
                    </span>
                  </>
                )}
              </div>
            </form>
          </div>

          <div className="auth-art-side">
            <video
              src="/videos/animacion-inicio.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const firstValue = Object.values(data as Record<string, unknown>)[0];
    if (Array.isArray(firstValue)) return String(firstValue[0]);
    if (typeof firstValue === "string") return firstValue;
  }
  return null;
}
