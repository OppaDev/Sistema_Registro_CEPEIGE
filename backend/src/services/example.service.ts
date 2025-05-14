// En un caso real, este servicio podría interactuar con una base de datos o un servicio externo.
// Por ahora, solo devuelve datos de ejemplo.

interface ExampleData {
  id: number;
  name: string;
}

export const fetchExampleData = async (): Promise<ExampleData[]> => {
  // Simula una operación asíncrona (ej. consulta a DB)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    }, 500);
  });
};