/*
  A shell command as text that wraps and is never cut (CP143 upgrade 6). It breaks only at its
  spaces: the component name moves to the next line whole when it fits there (instead of splitting
  at a hyphen), and the harness flag (`--cli claude`) stays on one line. Copy buttons copy the
  command string itself, so the layout never changes what is copied.
*/
export function CommandText({ command }: { command: string }) {
  const flagAt = command.lastIndexOf(" --");
  const head = flagAt > 0 ? command.slice(0, flagAt) : command;
  const flag = flagAt > 0 ? command.slice(flagAt + 1) : "";
  const nameAt = head.lastIndexOf(" ");
  return (
    <>
      {nameAt > 0 ? (
        <>
          {head.slice(0, nameAt)}{" "}
          <span className="inline-block max-w-full break-words">{head.slice(nameAt + 1)}</span>
        </>
      ) : (
        head
      )}
      {flag && (
        <>
          {" "}
          <span className="whitespace-nowrap">{flag}</span>
        </>
      )}
    </>
  );
}
