import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clinica, ItemPlano } from './modelo';
import { PATIENT, PROFESSIONAL } from './perfis';

export async function loadClinic() {
  const saved = await AsyncStorage.getItem('fc2.v1');
  if (saved) return new Clinica(JSON.parse(saved));
  const clinic = new Clinica();
  const rafaela = await clinic.cadastrar(
    'Rafaela',
    'rafaela@example.test',
    'demo123',
    PROFESSIONAL,
    'FICTÍCIO-01',
  );
  const lucas = await clinic.cadastrar(
    'Lucas',
    'lucas@example.test',
    'demo123',
    PATIENT,
    rafaela.id,
  );
  clinic.usuario = rafaela;
  await clinic.cadastrarExercicio(
    'Fortalecimento de quadríceps',
    'Consulte a demonstração feita na consulta fictícia.',
    'Dosagem ilustrativa para acompanhar o registro.',
  );
  await clinic.cadastrarExercicio(
    'Ponte de glúteos',
    'Consulte o movimento combinado na consulta fictícia.',
    'Exemplo de exercício do catálogo.',
  );
  const items = clinic.d.exercicios.map(
    (e, i) => new ItemPlano(e.id, i ? '2 séries de 10' : '3 séries de 10', '3× por semana'),
  );
  await clinic.publicar(
    lucas.id,
    items,
    'Plano fictício para demonstrar como consultar e registrar a execução.',
    '',
  );
  clinic.usuario = lucas;
  const samples = [
    [6, 4, [items[0].exercicio]],
    [5, 3, items.map((i) => i.exercicio)],
  ];
  for (const [index, [before, after, done]] of samples.entries()) {
    const day = new Date();
    day.setDate(day.getDate() - 4 + index * 2);
    const dayText = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, '0'),
      String(day.getDate()).padStart(2, '0'),
    ].join('-');
    await clinic.registrarSessao(
      dayText,
      before,
      after,
      done,
      'Registro fictício de demonstração.',
    );
  }
  clinic.usuario = null;
  return clinic;
}
