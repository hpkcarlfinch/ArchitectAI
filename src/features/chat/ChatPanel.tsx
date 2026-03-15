import { useMemo, useState, type FormEvent } from "react";
import { useApp } from "../../hooks/useAppContext";

export const ChatPanel = () => {
  const { currentProject, sendChatMessage, isGenerating } = useApp();
  const [input, setInput] = useState("");

  const disabled = useMemo(() => isGenerating || !input.trim(), [input, isGenerating]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) {
      return;
    }

    setInput("");
    await sendChatMessage(prompt);
  };

  return (
    <section className="card chat-panel">
      <h2>Architect Chat</h2>
      <p className="muted">Describe layout, style, room counts, and constraints. The AI returns structured blueprint JSON.</p>

      <div className="chat-list" aria-live="polite">
        {currentProject.chatHistory.length === 0 ? (
          <p className="muted">Example: Build me a 3-bedroom modern farmhouse with 2 bathrooms and an open kitchen.</p>
        ) : (
          currentProject.chatHistory.map((message) => (
            <article key={message.id} className={`message ${message.role}`}>
              <h4>{message.role === "user" ? "You" : "AI Architect"}</h4>
              <p>{message.content}</p>
            </article>
          ))
        )}
      </div>

      <form className="chat-form" onSubmit={onSubmit}>
        <textarea
          className="input"
          rows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Describe your desired house..."
        />
        <button className="button" type="submit" disabled={disabled}>
          {isGenerating ? "Generating..." : "Send"}
        </button>
      </form>
    </section>
  );
};
