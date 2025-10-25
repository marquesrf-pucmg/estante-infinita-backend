export function parseNumericId(id: string | null | undefined): number {
  if (id === null || id === undefined) {
    throw new Error("ID não fornecido");
  }

  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    throw new Error("ID inválido");
  }
  return parsed;
}
