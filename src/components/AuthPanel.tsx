import type { Dispatch, SetStateAction } from "react";

type AuthMode = "login" | "register";

type AuthFormState = {
  username: string;
  email: string;
  password: string;
};

type AuthPanelProps = {
  mode: AuthMode;
  form: AuthFormState;
  onModeChange: (mode: AuthMode) => void;
  onFormChange: Dispatch<SetStateAction<AuthFormState>>;
  onSubmit: (form: AuthFormState) => void;
};

export function AuthPanel({
  mode,
  form,
  onModeChange,
  onFormChange,
  onSubmit,
}: AuthPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:self-start">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Access
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            {mode === "login" ? "Login" : "Register"}
          </h2>
        </div>

        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            className={
              mode === "login"
                ? "rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
                : "rounded-full px-3 py-1.5 text-sm text-slate-600"
            }
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={
              mode === "register"
                ? "rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
                : "rounded-full px-3 py-1.5 text-sm text-slate-600"
            }
            onClick={() => onModeChange("register")}
          >
            Register
          </button>
        </div>
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-300"
            value={form.username}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            autoComplete="username"
          />
        </label>

        {mode === "register" ? (
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-300"
              type="email"
              value={form.email}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              autoComplete="email"
            />
          </label>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-300"
            type="password"
            value={form.password}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </section>
  );
}
