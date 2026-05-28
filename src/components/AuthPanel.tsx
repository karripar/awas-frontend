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
  const modeButtonClass = (isActive: boolean) =>
    isActive
      ? "swiss-focus border border-[#111111] bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
      : "swiss-focus border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-[#111111] hover:text-[#111111]";

  return (
    <section className="w-full border border-neutral-300 bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-neutral-300 pb-5">
        <div>
          <p className="text-sm text-neutral-500">Account</p>
          <h2 className="text-2xl font-bold leading-tight text-[#111111]">
            {mode === "login" ? "Login" : "Register"}
          </h2>
        </div>

        <div className="inline-flex">
          <button
            type="button"
            className={modeButtonClass(mode === "login")}
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={modeButtonClass(mode === "register")}
            onClick={() => onModeChange("register")}
          >
            Register
          </button>
        </div>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <label className="block text-sm font-semibold text-[#111111]">
          Username
          <input
            className="swiss-focus mt-2 w-full border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111]"
            value={form.username}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            
          />
        </label>

        {mode === "register" ? (
          <label className="block text-sm font-semibold text-[#111111]">
            Email
            <input
              className="swiss-focus mt-2 w-full border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111]"
              type="email"
              value={form.email}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
             
            />
          </label>
        ) : null}

        <label className="block text-sm font-semibold text-[#111111]">
          Password
          <input
            className="swiss-focus mt-2 w-full border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111]"
            type="password"
            value={form.password}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            
          />
        </label>

        <button
          type="submit"
          className="swiss-focus w-full border border-[#111111] bg-[#111111] px-3 py-3 text-sm font-semibold text-white hover:bg-[#E4002B]"
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </section>
  );
}
