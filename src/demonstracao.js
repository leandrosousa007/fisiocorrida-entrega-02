import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clinica, ItemPlano, gerarCredenciais } from './modelo';
import { Fisioterapeuta, Paciente } from './entidades';
import { PATIENT, PROFESSIONAL } from './perfis';

const STORAGE_KEY = 'fc2.v1';
export const SENHA_DEMO = 'senha123';
export const CONTAS_DEMO = [
  { login: 'lucas', nome: 'Lucas', perfil: PATIENT, email: 'lucas@gmail.com' },
  { login: 'rafaela', nome: 'Rafaela', perfil: PROFESSIONAL, email: 'rafaela@gmail.com' },
  { login: 'ana', nome: 'Ana', perfil: PATIENT, email: 'ana@gmail.com' },
  { login: 'marina.demo', nome: 'Marina', perfil: PATIENT, email: 'marina@gmail.com' },
  { login: 'bruno', nome: 'Bruno', perfil: PROFESSIONAL, email: 'bruno@gmail.com' },
];

// Credenciais pré-calculadas apenas para os cinco perfis públicos de demonstração.
const credenciaisDemo = {
  'rafaela': { sal: 'd8bd0fbb-5e56-42f6-803d-22f4ed5f7235', hash: '92.245.34.223.60.250.148.164.131.101.224.131.100.56.26.248.215.86.116.15.61.213.138.21.27.187.16.30.101.24.236.70' },
  'bruno': { sal: 'ad33fa35-4b94-41d4-a8f4-9c2c2eb274ea', hash: '42.79.254.229.20.139.157.51.30.183.114.36.155.48.160.53.41.254.67.157.50.1.59.145.49.237.244.247.74.76.80.252' },
  'lucas': { sal: 'b1149449-f104-40ef-b4c9-a40436e7f7d9', hash: '129.183.142.199.209.47.200.220.169.6.186.247.123.0.217.210.101.65.132.18.87.71.80.172.217.159.108.10.64.72.59.39' },
  'ana': { sal: 'c3cdfcc1-42f9-4d79-a15a-33f00064eb13', hash: '20.37.176.185.24.64.129.104.117.223.56.230.167.58.148.225.116.251.179.164.167.198.28.42.91.101.132.82.50.96.71.64' },
  'marina.demo': { sal: '319f22b1-7283-4370-bb2a-d9074ea877d0', hash: '101.196.206.186.100.250.2.160.203.181.219.224.117.155.253.105.20.237.189.54.78.90.213.187.176.239.33.179.205.47.147.40' },
};

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

  const contaDemoExistente = clinica.d.usuarios.find(
    (usuario) => usuario.demo === login && usuario.papel === perfil,
  );
  if (contaDemoExistente) {
    contaDemoExistente.email = email;
    await clinica.salvar();
    return contaDemoExistente;
  }

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

  const { hash, sal } = credenciaisDemo[login];
  const Tipo = perfil === PATIENT ? Paciente : Fisioterapeuta;
  const nova = new Tipo(nome, email, perfil, hash, sal);
  nova[perfil === PATIENT ? 'profissional' : 'registro'] = vinculo;
  nova.demo = login;
  clinica.d.usuarios.push(nova);
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
  clinica.d.relatos[clinica.d.relatos.length - 1].data = haDias(exemplo.sessoes[0][0] + 3);

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
  if (clinica.d.demonstracaoVersao === 4) return clinica;

  clinica.preparandoDemonstracao = true;
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
  clinica.d.demonstracaoVersao = 4;
  clinica.preparandoDemonstracao = false;
  await clinica.salvar();
  return clinica;
}
