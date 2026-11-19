import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clinica, ItemPlano, gerarCredenciais } from './modelo';
import { PATIENT, PROFESSIONAL } from './perfis';

const STORAGE_KEY = 'fc2.v1';
export const SENHA_DEMO = 'senha123';
export const CONTAS_DEMO = [
  { login: 'lucas', nome: 'Lucas', perfil: PATIENT, email: 'lucas@gmail.com' },
  { login: 'rafaela', nome: 'Rafaela', perfil: PROFESSIONAL, email: 'fisioterapeuta@gmail.com' },
  { login: 'ana', nome: 'Ana', perfil: PATIENT, email: 'ana@gmail.com' },
  { login: 'marina.demo', nome: 'Marina', perfil: PATIENT, email: 'marina@gmail.com' },
  { login: 'bruno', nome: 'Bruno', perfil: PROFESSIONAL, email: 'bruno@gmail.com' },
];

const catalogo = {
  rafaela: [
    [
      'Fortalecimento de quadríceps',
      'Registre a execução do movimento combinado na consulta fictícia.',
    ],
    ['Ponte de glúteos', 'Registre as séries concluídas no plano de acompanhamento.'],
    [
      'Mobilidade de tornozelo',
      'Registre a duração da atividade combinada na consulta fictícia.',
    ],
  ],
  bruno: [
    [
      'Estabilidade de quadril',
      'Registre a execução do movimento combinado na consulta fictícia.',
    ],
    ['Controle de apoio', 'Registre os itens concluídos conforme o plano de demonstração.'],
  ],
};

const pacientes = [
  {
    nome: 'Lucas',
    login: 'lucas',
    profissional: 'rafaela',
    lado: 'Direito',
    modalidade: 'Corrida de rua',
    impacto: 'Reduziu o ritmo nos treinos mais longos.',
    objetivo: 'Acompanhar o retorno aos treinos de rua.',
    sessoes: [
      [12, 6, 5, 1],
      [9, 5, 3, 2],
      [6, 4, 3, 2],
      [3, 3, 2, 3],
    ],
    revisar: true,
  },
  {
    nome: 'Ana',
    login: 'ana',
    profissional: 'rafaela',
    lado: 'Esquerdo',
    modalidade: 'Corrida em esteira',
    impacto: 'Interrompeu o treino antes da distância habitual.',
    objetivo: 'Registrar como o joelho responde entre consultas.',
    sessoes: [
      [10, 5, 4, 1],
      [7, 4, 3, 2],
      [4, 4, 4, 1],
    ],
  },
  {
    nome: 'Marina',
    login: 'marina.demo',
    profissional: 'bruno',
    lado: 'Ambos',
    modalidade: 'Corrida em trilha',
    impacto: 'Passou a fazer percursos mais curtos.',
    objetivo: 'Compartilhar a evolução das sessões com o profissional.',
    sessoes: [
      [8, 6, 5, 1],
      [5, 5, 4, 2],
    ],
  },
];

function haDias(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');
}

async function obterConta(clinica, login, vinculo) {
  const { nome, perfil, email } = CONTAS_DEMO.find((conta) => conta.login === login);
  const atual = clinica.d.usuarios.find((usuario) => usuario.email === email);
  if (atual) return atual.demo === login ? atual : null;

  // Migrar a conta de exemplo mantendo o ID usado pelos planos, relatos e sessões.
  const antigo = clinica.d.usuarios.find(
    (usuario) => usuario.email === login + '@example.test' && usuario.papel === perfil,
  );
  if (antigo) {
    try {
      await clinica.autenticar(antigo.email, 'demo123');
    } catch {
      return null;
    }
    Object.assign(antigo, await gerarCredenciais(SENHA_DEMO), { email, demo: login });
    await clinica.salvar();
    return antigo;
  }

  const nova = await clinica.cadastrar(nome, email, SENHA_DEMO, perfil, vinculo);
  nova.demo = login;
  await clinica.salvar();
  return nova;
}

async function montarHistorico(clinica, paciente, profissional, exemplo) {
  // Planos e sessões que já existiam continuam associados às mesmas versões.
  clinica.usuario = profissional;
  if (clinica.vigente(paciente.id)) return;

  const exercicios = clinica.d.exercicios.filter((item) => item.autor === profissional.id);
  const itens = exercicios.map(
    (item, index) =>
      new ItemPlano(item.id, index === 2 ? '2 minutos' : '2 séries de 10', '3× por semana'),
  );
  await clinica.publicar(paciente.id, itens.slice(0, 2), 'Plano de demonstração.', '');
  clinica.vigente(paciente.id).data = haDias(exemplo.sessoes[0][0] + 2);

  clinica.usuario = paciente;
  await clinica.registrarRelato(
    exemplo.lado,
    exemplo.sessoes[0][1],
    exemplo.impacto,
    exemplo.objetivo,
    exemplo.modalidade,
    'Relato fictício para demonstração.',
  );
  clinica.d.relatos.at(-1).data = haDias(exemplo.sessoes[0][0] + 3);

  for (const [index, [dias, antes, depois, concluidos]] of exemplo.sessoes.entries()) {
    if (exemplo.revisar && index === 2) {
      clinica.usuario = profissional;
      await clinica.publicar(
        paciente.id,
        itens,
        'Plano revisado de demonstração.',
        'Revisão combinada na consulta fictícia.',
      );
      clinica.vigente(paciente.id).data = haDias(dias + 1);
      clinica.usuario = paciente;
    }
    const realizados = clinica.vigente(paciente.id).itens.slice(0, concluidos);
    await clinica.registrarSessao(
      haDias(dias),
      antes,
      depois,
      realizados.map((item) => item.exercicio),
      'Registro fictício de acompanhamento.',
    );
  }
}

export async function loadClinic() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const clinica = new Clinica(saved ? JSON.parse(saved) : undefined);
  if (clinica.d.demonstracaoVersao === 3) return clinica;

  const profissionais = {
    rafaela: await obterConta(clinica, 'rafaela', 'FICTÍCIO-01'),
    bruno: await obterConta(clinica, 'bruno', 'FICTÍCIO-02'),
  };

  for (const [login, profissional] of Object.entries(profissionais)) {
    if (!profissional) continue;
    clinica.usuario = profissional;
    for (const [nome, instrucao] of catalogo[login]) {
      const jaExiste = clinica.d.exercicios.some(
        (item) => item.autor === profissional.id && item.nome === nome,
      );
      if (!jaExiste)
        await clinica.cadastrarExercicio(nome, instrucao, 'Exercício de demonstração.');
    }
  }

  for (const exemplo of pacientes) {
    const profissional = profissionais[exemplo.profissional];
    if (!profissional) continue;
    const paciente = await obterConta(clinica, exemplo.login, profissional.id);
    if (paciente?.profissional === profissional.id) {
      await montarHistorico(clinica, paciente, profissional, exemplo);
    }
  }
  clinica.usuario = null;
  clinica.d.demonstracaoVersao = 3;
  await clinica.salvar();
  return clinica;
}
